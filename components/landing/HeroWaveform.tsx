'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  videoRef?: React.RefObject<HTMLVideoElement | null>
  speaking: boolean
  energy: number
}

export default function HeroWaveform({ videoRef, speaking, energy }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const energyRef = useRef(0)
  const [muted, setMuted] = useState(true)

  // Keep energy in a ref so the draw loop always has the latest value
  energyRef.current = energy

  // Ensure video muted state stays in sync (handles carousel swaps)
  useEffect(() => {
    const check = () => {
      const video = videoRef?.current
      if (video && video.muted !== muted) {
        video.muted = muted
      }
    }
    check()
    // Re-check shortly after render to catch new video elements
    const t = setTimeout(check, 100)
    return () => clearTimeout(t)
  })

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    if (videoRef?.current) {
      videoRef.current.muted = next
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
    const now = Date.now() / 800
    const e = energyRef.current

    for (let i = 0; i < bars; i++) {
      // Base idle wave
      const idle = 0.05 + Math.sin(now + i * 0.35) * 0.03

      // Speech-driven: center bars taller, edges shorter
      const centerDist = Math.abs(i - bars / 2) / (bars / 2)
      const speechShape = (1 - centerDist * 0.6) * e * 0.85

      // Per-bar variation for organic feel
      const variation = Math.sin(now * 1.5 + i * 0.7) * 0.08 * e

      const value = idle + speechShape + variation
      const barHeight = Math.max(value * height, 2)

      // LoLA brand gradient: Indigo → Sky per bar
      const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2)
      const alpha = 0.3 + e * 0.55
      gradient.addColorStop(0, `rgba(67, 97, 238, ${alpha})`)   // --lola-indigo
      gradient.addColorStop(1, `rgba(76, 201, 240, ${alpha})`)  // --lola-sky
      ctx.fillStyle = gradient
      const x = i * (barWidth + 2) + 1
      ctx.beginPath()
      ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2)
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(draw)
  }, [])

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
      <canvas ref={canvasRef} className="h-12 w-full" />
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
