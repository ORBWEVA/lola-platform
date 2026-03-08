'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ImageCarousel from './ImageCarousel'
import WaveformVisualizer from './WaveformVisualizer'
import SessionTranscript, { type TranscriptEntry } from './SessionTranscript'
import CreditPill from './CreditPill'
import BurgerMenu from './BurgerMenu'
import SessionSummary from './SessionSummary'

interface Props {
  avatarId: string
  avatarName: string
  avatarSlug: string
  userRole: string
}

type SessionState = 'connecting' | 'active' | 'ended'
type ErrorKind = 'mic_denied' | 'no_credits' | 'connection_lost' | 'session_failed' | null

export default function VoiceSession({ avatarId, avatarName, avatarSlug, userRole }: Props) {
  const [state, setState] = useState<SessionState>('connecting')
  const [error, setError] = useState<ErrorKind>(null)
  const [credits, setCredits] = useState(15)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [speaking, setSpeaking] = useState<'user' | 'avatar' | 'idle'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [sceneImages, setSceneImages] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const panelAutoCloseRef = useRef<NodeJS.Timeout | null>(null)
  const hasAutoOpenedRef = useRef(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const creditIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const reconnectAttemptsRef = useRef<number>(0)
  const stateRef = useRef<SessionState>('connecting')
  const sessionIdRef = useRef<string>('')
  const transcriptRef = useRef<TranscriptEntry[]>([])

  // Keep refs in sync with state for use in callbacks/intervals
  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { transcriptRef.current = transcript }, [transcript])

  // Auto-open transcript panel on first message, auto-close after 5s
  useEffect(() => {
    if (transcript.length > 0 && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true
      setPanelOpen(true)
      panelAutoCloseRef.current = setTimeout(() => setPanelOpen(false), 5000)
    }
    // Re-open briefly on each new message if panel is closed
    if (transcript.length > 0 && hasAutoOpenedRef.current && !panelOpen) {
      // Don't auto-reopen after user manually closed
    }
    return () => {
      if (panelAutoCloseRef.current) clearTimeout(panelAutoCloseRef.current)
    }
  }, [transcript.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const endSession = useCallback(async () => {
    if (stateRef.current === 'ended') return
    setState('ended')
    stateRef.current = 'ended'

    // Stop credit deduction
    if (creditIntervalRef.current) clearInterval(creditIntervalRef.current)
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)

    // Close WebRTC and stop all media
    try { dcRef.current?.close() } catch {}
    try { pcRef.current?.close() } catch {}
    try {
      streamRef.current?.getTracks().forEach(t => {
        t.stop()
        t.enabled = false
      })
    } catch {}
    try { audioElRef.current?.pause() } catch {}
    dcRef.current = null
    pcRef.current = null
    streamRef.current = null
    audioElRef.current = null

    // Save session (only if we actually started one)
    const sid = sessionIdRef.current
    if (!sid || !startTimeRef.current) return

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const creditsUsed = Math.max(Math.ceil(elapsed / 60), 1)
    try {
      await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          durationSeconds: elapsed,
          creditsUsed,
          transcript: transcriptRef.current,
        }),
      })
    } catch (e) {
      console.error('Failed to save session:', e)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      try {
        // Request mic permission first
        let stream: MediaStream
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch (micErr: unknown) {
          const name = micErr instanceof DOMException ? micErr.name : ''
          if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
            setError('mic_denied')
          }
          setState('ended')
          return
        }
        streamRef.current = stream

        // Get ephemeral token
        const res = await fetch('/api/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarId }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error('Session init error:', err)
          if (res.status === 402) {
            setError('no_credits')
          } else {
            setError('session_failed')
          }
          setState('ended')
          return
        }

        const data = await res.json()
        if (cancelled) return

        setSessionId(data.sessionId)
        // Filter out broken/expired API URLs, fall back to anchor image
        const validScenes = (data.sceneImages || []).filter((url: string) => url && !url.includes('api.together'))
        const fallback = data.anchorImage ? [data.anchorImage] : []
        setSceneImages(validScenes.length > 0 ? validScenes : fallback)

        // Set up WebRTC
        const pc = new RTCPeerConnection()
        pcRef.current = pc

        // Handle connection state changes for reconnection
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            if (reconnectAttemptsRef.current < 2) {
              reconnectAttemptsRef.current++
              console.warn(`Connection ${pc.connectionState}, attempting reconnect (${reconnectAttemptsRef.current}/2)`)
              // Clean up and retry
              pc.close()
              stream.getTracks().forEach(t => t.stop())
              if (!cancelled) connect()
            } else {
              setError('connection_lost')
              endSession()
            }
          }
        }

        // Audio output
        const audioEl = document.createElement('audio')
        audioEl.autoplay = true
        audioElRef.current = audioEl

        // Analyser for waveform
        const audioCtx = new AudioContext()
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        pc.ontrack = (e) => {
          audioEl.srcObject = e.streams[0]
          const source = audioCtx.createMediaStreamSource(e.streams[0])
          source.connect(analyser)
        }

        // Mic input
        const audioTrack = stream.getAudioTracks()[0]
        pc.addTrack(audioTrack, stream)

        // Data channel for events
        const dc = pc.createDataChannel('oai-events')
        dcRef.current = dc

        dc.onmessage = (e) => {
          try {
            const event = JSON.parse(e.data)

            if (event.type === 'response.audio_transcript.delta') {
              // Avatar speaking
              setSpeaking('avatar')
            }

            if (event.type === 'response.audio_transcript.done') {
              setSpeaking('idle')
              setShowHint(false)
              if (event.transcript) {
                setTranscript(prev => [...prev, { role: 'model', content: event.transcript }])
              }
            }

            if (event.type === 'conversation.item.input_audio_transcription.completed') {
              setSpeaking('idle')
              if (event.transcript) {
                setTranscript(prev => [...prev, { role: 'user', content: event.transcript }])
              }
            }

            if (event.type === 'input_audio_buffer.speech_started') {
              setSpeaking('user')
            }

            if (event.type === 'input_audio_buffer.speech_stopped') {
              setSpeaking('idle')
            }
          } catch {}
        }

        dc.onopen = () => {
          // Configure session
          dc.send(JSON.stringify({
            type: 'session.update',
            session: {
              input_audio_transcription: { model: 'whisper-1' },
            },
          }))

          // Send initial greeting trigger
          dc.send(JSON.stringify({
            type: 'response.create',
            response: {
              modalities: ['audio', 'text'],
            },
          }))
        }

        // Create offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        // Send to OpenAI
        const sdpRes = await fetch(
          `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${data.ephemeralKey}`,
              'Content-Type': 'application/sdp',
            },
            body: offer.sdp,
          }
        )

        if (!sdpRes.ok) {
          console.error('OpenAI SDP exchange failed:', sdpRes.status)
          if (!cancelled) {
            setError('session_failed')
            setState('ended')
          }
          return
        }

        const answerSdp = await sdpRes.text()
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

        if (!cancelled) {
          setState('active')
          startTimeRef.current = Date.now()

          // Credit deduction: 1 credit per minute
          creditIntervalRef.current = setInterval(() => {
            setCredits(prev => {
              const next = prev - 1
              if (next <= 0) {
                // Graceful wrap-up: ask avatar to say goodbye, then end after delay
                if (dcRef.current?.readyState === 'open') {
                  dcRef.current.send(JSON.stringify({
                    type: 'conversation.item.create',
                    item: {
                      type: 'message',
                      role: 'user',
                      content: [{ type: 'input_text', text: '[SYSTEM: The user has run out of session credits. Wrap up the conversation naturally in one short sentence — say goodbye warmly and encourage them to come back.]' }],
                    },
                  }))
                  dcRef.current.send(JSON.stringify({
                    type: 'response.create',
                    response: { modalities: ['audio', 'text'] },
                  }))
                }
                // End session after giving the avatar time to respond
                setTimeout(() => endSession(), 8000)
                if (creditIntervalRef.current) clearInterval(creditIntervalRef.current)
                return 0
              }
              return next
            })
          }, 60000)

          // Duration counter
          durationIntervalRef.current = setInterval(() => {
            setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
          }, 1000)
        }
      } catch (err) {
        console.error('Connection error:', err)
        if (!cancelled) {
          setError('session_failed')
          setState('ended')
        }
      }
    }

    // Load user credits and check before connecting
    const init = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          const userCredits = data.credits ?? 15
          setCredits(userCredits)
          if (userCredits <= 0) {
            setError('no_credits')
            setState('ended')
            return
          }
        }
      } catch {}
      connect()
    }

    init()

    return () => {
      cancelled = true
      if (creditIntervalRef.current) clearInterval(creditIntervalRef.current)
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
      try { streamRef.current?.getTracks().forEach(t => t.stop()) } catch {}
      try { pcRef.current?.close() } catch {}
    }
  }, [avatarId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0]
      track.enabled = !track.enabled
      setIsMuted(!track.enabled)
    }
  }

  if (error === 'mic_denied') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background px-6">
        <div className="glass rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Microphone Access Required</h2>
          <p className="text-sm text-muted">LoLA needs your microphone for voice conversations. Please allow mic access in your browser settings and reload the page.</p>
          <div className="glass rounded-xl p-3 text-xs text-muted text-left space-y-1">
            <p className="font-medium text-foreground">How to enable:</p>
            <p>1. Tap the lock/info icon in your browser address bar</p>
            <p>2. Find &quot;Microphone&quot; and set it to &quot;Allow&quot;</p>
            <p>3. Reload this page</p>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl gradient-btn font-medium">
            Reload Page
          </button>
          <a href={`/avatar/${avatarSlug}`} className="block text-sm text-muted hover:text-foreground transition-colors">
            Back to profile
          </a>
        </div>
      </div>
    )
  }

  if (error === 'no_credits') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background px-6">
        <div className="glass rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">No Credits Remaining</h2>
          <p className="text-sm text-muted">You need credits to start a voice session. Each minute of conversation costs 1 credit.</p>
          <a href="/api/checkout?pack=starter" className="block w-full py-3 rounded-xl gradient-btn font-medium text-center">
            Buy Credits
          </a>
          <a href={`/avatar/${avatarSlug}`} className="block text-sm text-muted hover:text-foreground transition-colors">
            Back to profile
          </a>
        </div>
      </div>
    )
  }

  if (error === 'connection_lost') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background px-6">
        <div className="glass rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Connection Lost</h2>
          <p className="text-sm text-muted">The voice connection dropped after multiple reconnection attempts. This can happen with unstable networks.</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl gradient-btn font-medium">
            Try Again
          </button>
          <a href={`/avatar/${avatarSlug}`} className="block text-sm text-muted hover:text-foreground transition-colors">
            Back to profile
          </a>
        </div>
      </div>
    )
  }

  if (error === 'session_failed') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background px-6">
        <div className="glass rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Session Failed</h2>
          <p className="text-sm text-muted">Something went wrong starting the voice session. Please try again.</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl gradient-btn font-medium">
            Try Again
          </button>
          <a href={`/avatar/${avatarSlug}`} className="block text-sm text-muted hover:text-foreground transition-colors">
            Back to profile
          </a>
        </div>
      </div>
    )
  }

  if (state === 'ended') {
    return (
      <SessionSummary
        avatarName={avatarName}
        avatarSlug={avatarSlug}
        duration={duration}
        creditsUsed={Math.ceil(duration / 60)}
        transcriptCount={transcript.length}
        userRole={userRole}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Full-screen scene carousel background */}
      <div className="absolute inset-0 z-0">
        {state === 'connecting' ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-emerald-900/20">
            <div className="text-center space-y-3 px-8">
              <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/60 text-sm">Connecting to {avatarName}...</p>
              <p className="text-xs text-white/40 mt-2">Just speak naturally — {avatarName} is multilingual and adapts to you.</p>
            </div>
          </div>
        ) : (
          <ImageCarousel images={sceneImages} />
        )}
      </div>

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Top bar — overlaid */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        <div className="relative">
          <BurgerMenu
            onEndSession={endSession}
            onToggleMute={toggleMute}
            isMuted={isMuted}
            avatarName={avatarName}
            avatarSlug={avatarSlug}
          />
        </div>
        <div className="flex items-center gap-2 mx-4 min-w-0">
          {state === 'active' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          )}
          <span className="font-medium text-sm text-white truncate">{avatarName}</span>
          {state === 'active' && (
            <span className="text-xs text-white/60 font-mono flex-shrink-0">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
        <CreditPill credits={credits} />
      </div>

      {/* Hint overlay */}
      {state === 'active' && showHint && transcript.length === 0 && (
        <button
          onClick={() => setShowHint(false)}
          className="absolute z-20 bottom-36 left-6 right-6 backdrop-blur-md bg-black/40 rounded-xl p-3 text-xs text-white/60 text-center animate-pulse border border-white/10"
        >
          Just start talking — {avatarName} will respond. Speak any language. Tap to dismiss.
        </button>
      )}

      {/* Bottom bar: waveform + transcript toggle */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {/* Compact waveform */}
        <div className="flex-1 h-10 max-w-[200px]">
          <WaveformVisualizer analyserNode={analyserRef.current} speaking={speaking} />
        </div>

        {/* Transcript toggle button */}
        <button
          onClick={() => {
            setPanelOpen(prev => !prev)
            if (panelAutoCloseRef.current) clearTimeout(panelAutoCloseRef.current)
          }}
          className="p-3 rounded-full backdrop-blur-md bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          aria-label={panelOpen ? 'Hide transcript' : 'Show transcript'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {transcript.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[10px] flex items-center justify-center text-white font-bold">
              {transcript.length > 9 ? '9+' : transcript.length}
            </span>
          )}
        </button>
      </div>

      {/* Transcript backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setPanelOpen(false)
            if (panelAutoCloseRef.current) clearTimeout(panelAutoCloseRef.current)
          }}
        />
      )}

      {/* Transcript slide panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] backdrop-blur-xl border-l border-white/[0.08] transition-transform duration-300 ease-out flex flex-col ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'rgba(10, 10, 26, 0.92)' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <span className="text-sm font-medium text-white/80">Transcript</span>
          <button
            onClick={() => {
              setPanelOpen(false)
              if (panelAutoCloseRef.current) clearTimeout(panelAutoCloseRef.current)
            }}
            className="p-1.5 text-white/40 hover:text-white transition-colors"
            aria-label="Close transcript"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Transcript content */}
        <div className="flex-1 min-h-0">
          <SessionTranscript entries={transcript} avatarName={avatarName} />
        </div>
      </div>
    </div>
  )
}
