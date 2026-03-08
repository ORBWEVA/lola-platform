'use client'

import { forwardRef, useEffect, useRef, useState, useCallback } from 'react'

interface AvatarMedia {
  name: string
  type: 'video' | 'image'
  src: string
}

interface Props {
  avatars: AvatarMedia[]
  activeIndex: number
  onIndexChange: (index: number) => void
  onTransitionStart?: () => void
  onTransitionEnd?: () => void
}

const FADE_MS = 1000

const HeroVideo = forwardRef<HTMLVideoElement | null, Props>(({ avatars, activeIndex, onIndexChange, onTransitionStart, onTransitionEnd }, ref) => {
  const [displayIndex, setDisplayIndex] = useState(activeIndex)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [fading, setFading] = useState(false)
  const currentVideoRef = useRef<HTMLVideoElement | null>(null)
  const nextVideoRef = useRef<HTMLVideoElement | null>(null)

  // Forward the active video ref to parent
  const syncRef = useCallback((el: HTMLVideoElement | null) => {
    if (typeof ref === 'function') ref(el)
    else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el
  }, [ref])

  // Keep parent ref pointed at current video
  useEffect(() => {
    if (!fading) syncRef(currentVideoRef.current)
  }, [fading, displayIndex, syncRef])

  // Begin crossfade: mount next video behind, wait for it to be ready, then fade
  const beginTransition = useCallback((toIndex: number) => {
    if (fading || toIndex === displayIndex) return
    onTransitionStart?.()
    setNextIndex(toIndex)
  }, [fading, displayIndex, onTransitionStart])

  // When next video is canplay, start the crossfade
  const onNextReady = useCallback(() => {
    if (nextVideoRef.current) {
      nextVideoRef.current.play().catch(() => {})
    }
    // Mute outgoing video during fade
    if (currentVideoRef.current) currentVideoRef.current.muted = true
    setFading(true)
  }, [])

  // After fade completes, promote next to current
  useEffect(() => {
    if (!fading) return
    const t = setTimeout(() => {
      if (nextIndex === null) return
      setDisplayIndex(nextIndex)
      setNextIndex(null)
      setFading(false)
      onIndexChange(nextIndex)
      onTransitionEnd?.()
    }, FADE_MS)
    return () => clearTimeout(t)
  }, [fading, nextIndex, onIndexChange, onTransitionEnd])

  // Auto-advance when video ends
  useEffect(() => {
    const video = currentVideoRef.current
    if (!video) return
    const onEnded = () => {
      if (avatars.length > 1) {
        beginTransition((displayIndex + 1) % avatars.length)
      } else {
        video.currentTime = 0
        video.play().catch(() => {})
      }
    }
    video.addEventListener('ended', onEnded)
    return () => video.removeEventListener('ended', onEnded)
  }, [displayIndex, avatars.length, beginTransition])

  const goTo = useCallback((i: number) => {
    if (i === displayIndex || fading) return
    beginTransition(i)
  }, [displayIndex, fading, beginTransition])

  const currentAvatar = avatars[displayIndex]
  const nextAvatar = nextIndex !== null ? avatars[nextIndex] : null

  // When displayIndex changes (after transition completes), play new current from start
  useEffect(() => {
    const video = currentVideoRef.current
    if (!video) return
    video.currentTime = 0
    video.muted = false
    video.play().catch(() => {})
  }, [displayIndex])

  const videoClass = "absolute inset-0 w-full h-full object-cover object-[center_20%]"

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>
      {/* Next video layer — behind current, fades in by current fading out */}
      {nextAvatar?.type === 'video' && (
        <div className="absolute inset-0">
          <video
            ref={nextVideoRef}
            muted
            playsInline
            className={videoClass}
            key={`next-${nextIndex}`}
            onCanPlay={onNextReady}
          >
            <source src={nextAvatar.src} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Current video layer — fades out to reveal next */}
      <div
        className="absolute inset-0"
        style={{
          opacity: fading ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
        }}
      >
        {currentAvatar?.type === 'video' ? (
          <video
            ref={currentVideoRef}
            autoPlay
            muted
            playsInline
            className={videoClass}
            key={`video-${displayIndex}`}
          >
            <source src={currentAvatar.src} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 w-full h-full animate-[kenBurns_20s_ease-in-out_infinite_alternate]"
            key={currentAvatar?.name}
          >
            <img
              src={currentAvatar?.src ?? ''}
              alt={currentAvatar?.name ?? ''}
              className="w-full h-full object-cover object-top"
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
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === (nextIndex ?? displayIndex) ? 'bg-white/90 scale-125' : 'bg-white/40 hover:bg-white/60'
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
