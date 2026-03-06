'use client'

import { useEffect, useState } from 'react'

export default function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % images.length)
        setNextIndex(prev => (prev + 1) % images.length)
        setTransitioning(false)
      }, 1000) // crossfade duration
    }, 8000) // time per image

    return () => clearInterval(interval)
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-900/30 to-emerald-900/30 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-50" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Current image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          opacity: transitioning ? 0 : 1,
          transform: 'scale(1.05)',
          animation: 'kenburns 16s ease-in-out infinite alternate',
        }}
      />
      {/* Next image (crossfade) */}
      {images.length > 1 && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${images[nextIndex]})`,
            opacity: transitioning ? 1 : 0,
          }}
        />
      )}
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      <style jsx>{`
        @keyframes kenburns {
          from { transform: scale(1.0); }
          to { transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
