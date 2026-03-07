'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  videoRef?: React.RefObject<HTMLVideoElement | null>
}

// Speech energy envelope for Sara's 8s video loop
// Values 0–1 representing speech intensity at each 0.25s interval
// Higher during speech, lower during pauses
const speechEnvelope = [
  // 0.00–1.00s: "Hi, I'm Sara."
  0.0, 0.6, 0.8, 0.9, 0.7,
  // 1.25–2.00s: brief pause then "I help"
  0.2, 0.1, 0.5, 0.8,
  // 2.25–3.50s: "you find your"
  0.7, 0.9, 0.8, 0.7, 0.9,
  // 3.75–4.75s: "creative voice."
  0.8, 0.95, 0.9, 0.6,
  // 5.00–6.00s: trailing off
  0.3, 0.1, 0.05, 0.02, 0.0, 0.0,
  // 6.50–8.00s: silence before loop
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
]

function getEnvelopeAt(time: number): number {
  const idx = time / 0.25
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  const frac = idx - lo
  const a = speechEnvelope[lo % speechEnvelope.length] ?? 0
  const b = speechEnvelope[hi % speechEnvelope.length] ?? 0
  return a + (b - a) * frac
}

export default function HeroWaveform({ videoRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [muted, setMuted] = useState(true)

  const toggleMute = () => {
    if (videoRef?.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const bars = 48
    const barWidth = width / bars - 2
    const centerY = height / 2

    // Get speech intensity from video time
    const video = videoRef?.current
    const videoTime = video ? video.currentTime : 0
    const envelope = video ? getEnvelopeAt(videoTime) : 0
    const now = Date.now() / 800

    for (let i = 0; i < bars; i++) {
      // Base idle wave
      const idle = 0.05 + Math.sin(now + i * 0.35) * 0.03

      // Speech-driven component: bars near center are taller, edges shorter
      const centerDist = Math.abs(i - bars / 2) / (bars / 2)
      const speechShape = (1 - centerDist * 0.6) * envelope * 0.85

      // Add per-bar variation for organic feel
      const variation = Math.sin(now * 1.5 + i * 0.7) * 0.08 * envelope

      const value = idle + speechShape + variation
      const barHeight = Math.max(value * height, 2)

      // Brighter during speech
      const alpha = 0.15 + envelope * 0.45
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      const x = i * (barWidth + 2) + 1
      ctx.beginPath()
      ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2)
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(draw)
  }, [videoRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [draw])

  return (
    <div className="flex items-center gap-3 w-full">
      <canvas
        ref={canvasRef}
        className="h-12 w-full"
      />
      {videoRef && (
        <button
          onClick={toggleMute}
          className="flex-shrink-0 p-2 rounded-full text-white/60 hover:text-white/90 transition-colors"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
