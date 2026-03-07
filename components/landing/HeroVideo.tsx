'use client'

import { forwardRef, useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react'

interface AvatarMedia {
  name: string
  type: 'video' | 'image'
  src?: string
  portraitSrc?: string
  landscapeSrc?: string
}

interface Props {
  avatars: AvatarMedia[]
}

const HeroVideo = forwardRef<HTMLVideoElement | null, Props>(({ avatars }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, [])

  const avatar = avatars[activeIndex]

  const cycleAvatar = useCallback(() => {
    if (avatars.length <= 1) return
    setTransitioning(true)
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % avatars.length)
      setTransitioning(false)
    }, 600)
  }, [avatars.length])

  useEffect(() => {
    if (avatars.length <= 1) return
    const interval = setInterval(cycleAvatar, 10000)
    return () => clearInterval(interval)
  }, [cycleAvatar, avatars.length])

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>
      {/* Media */}
      <div
        className="absolute inset-0 transition-opacity duration-600"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {avatar?.type === 'video' ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-[center_30%] sm:object-center"
            key={avatar.name}
          >
            {avatar.portraitSrc && (
              <source src={avatar.portraitSrc} type="video/mp4" media="(orientation: portrait)" />
            )}
            {avatar.landscapeSrc && (
              <source src={avatar.landscapeSrc} type="video/mp4" />
            )}
            {avatar.src && !avatar.portraitSrc && !avatar.landscapeSrc && (
              <source src={avatar.src} type="video/mp4" />
            )}
          </video>
        ) : (
          <div
            className="absolute inset-0 w-full h-full animate-[kenBurns_20s_ease-in-out_infinite_alternate]"
            key={avatar?.name}
          >
            <img
              src={avatar?.src ?? avatar?.landscapeSrc ?? ''}
              alt={avatar?.name ?? ''}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.9) 100%)',
        }}
      />

      {/* Edge fade mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
      />

      {/* Avatar indicator dots */}
      {avatars.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {avatars.map((a, i) => (
            <button
              key={a.name}
              onClick={() => {
                setTransitioning(true)
                setTimeout(() => {
                  setActiveIndex(i)
                  setTransitioning(false)
                }, 600)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'bg-white/90 scale-125' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Show ${a.name}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes kenBurns {
          from {
            transform: scale(1) translate(0, 0);
          }
          to {
            transform: scale(1.1) translate(-2%, -1%);
          }
        }
      `}</style>
    </div>
  )
})

HeroVideo.displayName = 'HeroVideo'

export default HeroVideo
