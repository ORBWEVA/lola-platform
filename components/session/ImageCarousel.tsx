'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

const DISPLAY_MS = 8000
const FADE_MS = 1200

export default function ImageCarousel({ images }: { images: string[] }) {
  const [activeLayer, setActiveLayer] = useState(0) // 0 = layer A visible, 1 = layer B visible
  const indexA = useRef(0)
  const indexB = useRef(1)
  const [, setRenderKey] = useState(0)

  const advance = useCallback(() => {
    setActiveLayer(prev => {
      const next = prev === 0 ? 1 : 0
      return next
    })
  }, [])

  // After each fade completes, prepare the now-hidden layer with the next image
  useEffect(() => {
    if (images.length <= 1) return
    const prepTimer = setTimeout(() => {
      if (activeLayer === 1) {
        // A is now hidden — load next image into A
        indexA.current = (indexB.current + 1) % images.length
      } else {
        // B is now hidden — load next image into B
        indexB.current = (indexA.current + 1) % images.length
      }
      setRenderKey(n => n + 1)
    }, FADE_MS + 100) // wait for fade to finish before swapping hidden layer

    const advanceTimer = setTimeout(advance, DISPLAY_MS)

    return () => {
      clearTimeout(prepTimer)
      clearTimeout(advanceTimer)
    }
  }, [activeLayer, images.length, advance])

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-900/30 to-emerald-900/30 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-50" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Layer A */}
      <div
        className="absolute inset-0 bg-cover bg-top transition-opacity duration-[1.2s] ease-in-out"
        style={{
          backgroundImage: `url(${images[indexA.current]})`,
          opacity: activeLayer === 0 ? 1 : 0,
        }}
      />
      {/* Layer B */}
      {images.length > 1 && (
        <div
          className="absolute inset-0 bg-cover bg-top transition-opacity duration-[1.2s] ease-in-out"
          style={{
            backgroundImage: `url(${images[indexB.current]})`,
            opacity: activeLayer === 1 ? 1 : 0,
          }}
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
    </div>
  )
}
