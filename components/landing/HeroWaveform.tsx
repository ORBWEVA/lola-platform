'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  videoRef?: React.RefObject<HTMLVideoElement | null>
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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const bars = 48
      const barWidth = width / bars - 2
      const centerY = height / 2

      for (let i = 0; i < bars; i++) {
        const time = prefersReducedMotion ? 0 : Date.now() / 800
        const value = 0.06 + Math.sin(time + i * 0.35) * 0.04 + Math.sin(time * 0.7 + i * 0.2) * 0.02
        const barHeight = Math.max(value * height, 2)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
        const x = i * (barWidth + 2) + 1
        ctx.beginPath()
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2)
        ctx.fill()
      }

      if (!prefersReducedMotion) {
        animRef.current = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="flex items-center gap-3 w-full">
      <canvas
        ref={canvasRef}
        className="h-10 w-full"
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
