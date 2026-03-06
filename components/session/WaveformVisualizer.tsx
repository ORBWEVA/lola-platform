'use client'

import { useEffect, useRef } from 'react'

interface Props {
  analyserNode: AnalyserNode | null
  speaking: 'user' | 'avatar' | 'idle'
}

export default function WaveformVisualizer({ analyserNode, speaking }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const bars = 48
      const barWidth = width / bars - 2
      const centerY = height / 2

      if (analyserNode) {
        const data = new Uint8Array(analyserNode.frequencyBinCount)
        analyserNode.getByteFrequencyData(data)

        for (let i = 0; i < bars; i++) {
          const dataIndex = Math.floor((i / bars) * data.length)
          const value = data[dataIndex] / 255
          const barHeight = Math.max(value * height * 0.8, 2)

          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2)
          if (speaking === 'avatar') {
            gradient.addColorStop(0, 'rgba(129, 140, 248, 0.8)')
            gradient.addColorStop(1, 'rgba(129, 140, 248, 0.3)')
          } else if (speaking === 'user') {
            gradient.addColorStop(0, 'rgba(52, 211, 153, 0.8)')
            gradient.addColorStop(1, 'rgba(52, 211, 153, 0.3)')
          } else {
            gradient.addColorStop(0, 'rgba(156, 163, 175, 0.4)')
            gradient.addColorStop(1, 'rgba(156, 163, 175, 0.1)')
          }

          ctx.fillStyle = gradient
          const x = i * (barWidth + 2) + 1
          ctx.beginPath()
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2)
          ctx.fill()
        }
      } else {
        // Idle animation
        for (let i = 0; i < bars; i++) {
          const value = 0.05 + Math.sin(Date.now() / 500 + i * 0.3) * 0.03
          const barHeight = Math.max(value * height, 2)
          ctx.fillStyle = 'rgba(156, 163, 175, 0.2)'
          const x = i * (barWidth + 2) + 1
          ctx.beginPath()
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2)
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [analyserNode, speaking])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  )
}
