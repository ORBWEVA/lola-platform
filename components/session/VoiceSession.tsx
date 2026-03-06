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
}

type SessionState = 'connecting' | 'active' | 'ended'

export default function VoiceSession({ avatarId, avatarName, avatarSlug }: Props) {
  const [state, setState] = useState<SessionState>('connecting')
  const [credits, setCredits] = useState(15)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [speaking, setSpeaking] = useState<'user' | 'avatar' | 'idle'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [sceneImages, setSceneImages] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [showHint, setShowHint] = useState(true)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const creditIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const endSession = useCallback(async () => {
    if (state === 'ended') return
    setState('ended')

    // Stop credit deduction
    if (creditIntervalRef.current) clearInterval(creditIntervalRef.current)
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)

    // Close WebRTC
    if (dcRef.current) dcRef.current.close()
    if (pcRef.current) pcRef.current.close()
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())

    // Save session
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const creditsUsed = Math.ceil(elapsed / 60)
    try {
      await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          durationSeconds: elapsed,
          creditsUsed,
          transcript,
        }),
      })
    } catch (e) {
      console.error('Failed to save session:', e)
    }
  }, [state, sessionId, transcript])

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      try {
        // Get ephemeral token
        const res = await fetch('/api/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarId }),
        })

        if (!res.ok) {
          const err = await res.json()
          console.error('Session init error:', err)
          setState('ended')
          return
        }

        const data = await res.json()
        if (cancelled) return

        setSessionId(data.sessionId)
        setSceneImages(data.sceneImages || [])

        // Set up WebRTC
        const pc = new RTCPeerConnection()
        pcRef.current = pc

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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
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
                endSession()
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
        if (!cancelled) setState('ended')
      }
    }

    // Load user credits
    const loadCredits = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits ?? 15)
        }
      } catch {}
    }

    loadCredits()
    connect()

    return () => {
      cancelled = true
      if (creditIntervalRef.current) clearInterval(creditIntervalRef.current)
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
    }
  }, [avatarId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0]
      track.enabled = !track.enabled
      setIsMuted(!track.enabled)
    }
  }

  if (state === 'ended') {
    return (
      <SessionSummary
        avatarName={avatarName}
        avatarSlug={avatarSlug}
        duration={duration}
        creditsUsed={Math.ceil(duration / 60)}
        transcriptCount={transcript.length}
      />
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 glass z-10"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        <div className="relative">
          <BurgerMenu
            onEndSession={endSession}
            onToggleMute={toggleMute}
            isMuted={isMuted}
            avatarName={avatarName}
          />
        </div>
        <span className="font-medium text-sm truncate mx-4">{avatarName}</span>
        <CreditPill credits={credits} />
      </div>

      {/* Carousel — 40% */}
      <div className="flex-[4] min-h-0 relative">
        {state === 'connecting' ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-emerald-900/20">
            <div className="text-center space-y-3 px-8">
              <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted text-sm">Connecting to {avatarName}...</p>
              <p className="text-xs text-muted/60 mt-2">Just speak naturally — {avatarName} is multilingual and adapts to you.</p>
            </div>
          </div>
        ) : (
          <>
            <ImageCarousel images={sceneImages} />
            {showHint && transcript.length === 0 && (
              <button
                onClick={() => setShowHint(false)}
                className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 text-xs text-muted text-center animate-pulse z-10"
              >
                Just start talking — {avatarName} will respond. Speak any language. Tap to dismiss.
              </button>
            )}
          </>
        )}
      </div>

      {/* Waveform — 10% */}
      <div className="flex-[1] min-h-0 px-4 py-1">
        <WaveformVisualizer analyserNode={analyserRef.current} speaking={speaking} />
      </div>

      {/* Transcript — 35% */}
      <div className="flex-[3.5] min-h-0 border-t border-glass-border">
        <SessionTranscript entries={transcript} avatarName={avatarName} />
      </div>

      {/* Safe area bottom */}
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  )
}
