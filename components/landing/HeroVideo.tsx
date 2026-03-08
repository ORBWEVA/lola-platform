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

const FADE_MS = 1800
const OVERLAP_MS = 600 // Start next video slightly before fade begins

const HeroVideo = forwardRef<HTMLVideoElement | null, Props>(({ avatars, activeIndex, onIndexChange, onTransitionStart, onTransitionEnd }, ref) => {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const [pendingIdx, setPendingIdx] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const readyFlags = useRef<boolean[]>(avatars.map(() => false))
  const fadingRef = useRef(false)

  // Forward the active video ref to parent
  const syncRef = useCallback((el: HTMLVideoElement | null) => {
    if (typeof ref === 'function') ref(el)
    else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el
  }, [ref])

  // Always keep parent ref pointed at current playing video
  useEffect(() => {
    if (!fading) syncRef(videoRefs.current[currentIdx])
  }, [fading, currentIdx, syncRef])

  // On mount: preload all videos. First one autoplays, rest pause at 0.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      video.load()
      if (i === 0) {
        video.play().catch(() => {})
      }
    })
  }, [])

  // Transition logic
  const beginTransition = useCallback((toIdx: number) => {
    if (fadingRef.current || toIdx === currentIdx) return
    fadingRef.current = true

    const nextVideo = videoRefs.current[toIdx]
    if (!nextVideo) return

    onTransitionStart?.()
    setPendingIdx(toIdx)

    // Pre-roll the next video slightly before we start fading
    nextVideo.currentTime = 0
    nextVideo.muted = true
    nextVideo.play().catch(() => {})

    // Small delay to let the next video decode a frame, then start crossfade
    setTimeout(() => {
      setFading(true)
    }, OVERLAP_MS)

    // After fade completes, promote
    setTimeout(() => {
      // Mute old, unmute new
      const oldVideo = videoRefs.current[currentIdx]
      if (oldVideo) {
        oldVideo.muted = true
        oldVideo.pause()
      }
      nextVideo.muted = false

      setCurrentIdx(toIdx)
      setPendingIdx(null)
      setFading(false)
      fadingRef.current = false
      onIndexChange(toIdx)
      onTransitionEnd?.()
    }, OVERLAP_MS + FADE_MS)
  }, [currentIdx, onIndexChange, onTransitionStart, onTransitionEnd])

  // Auto-advance when current video ends
  useEffect(() => {
    const video = videoRefs.current[currentIdx]
    if (!video) return

    const onEnded = () => {
      if (avatars.length > 1) {
        beginTransition((currentIdx + 1) % avatars.length)
      } else {
        video.currentTime = 0
        video.play().catch(() => {})
      }
    }

    // Also handle timeupdate to trigger transition a bit before end
    // This eliminates the gap between videos
    const onTimeUpdate = () => {
      if (fadingRef.current) return
      const remaining = video.duration - video.currentTime
      // Start transition 2.4s before end (OVERLAP_MS + FADE_MS)
      if (remaining > 0 && remaining < (OVERLAP_MS + FADE_MS) / 1000 && avatars.length > 1) {
        beginTransition((currentIdx + 1) % avatars.length)
      }
    }

    video.addEventListener('ended', onEnded)
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [currentIdx, avatars.length, beginTransition])

  const goTo = useCallback((i: number) => {
    if (i === currentIdx || fadingRef.current) return
    beginTransition(i)
  }, [currentIdx, beginTransition])

  // When currentIdx changes (after transition), ensure new video is playing
  useEffect(() => {
    const video = videoRefs.current[currentIdx]
    if (!video) return
    // If it was paused (e.g. on initial mount for non-first videos), play it
    if (video.paused) {
      video.currentTime = 0
      video.play().catch(() => {})
    }
    video.muted = false
  }, [currentIdx])

  const visibleIdx = pendingIdx ?? currentIdx

  const videoClass = "absolute inset-0 w-full h-full object-cover object-[center_20%]"

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>
      {/* All videos rendered persistently — only opacity changes */}
      {avatars.map((avatar, i) => (
        <div
          key={avatar.name}
          className="absolute inset-0"
          style={{
            // Current sits on top and fades out; next sits below at full opacity
            opacity: fading
              ? (i === currentIdx ? 0 : i === pendingIdx ? 1 : 0)
              : (i === currentIdx ? 1 : 0),
            transition: (fading && (i === currentIdx || i === pendingIdx))
              ? `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : 'none',
            zIndex: i === currentIdx ? 2 : i === pendingIdx ? 1 : 0,
            pointerEvents: i === currentIdx ? 'auto' : 'none',
          }}
        >
          {avatar.type === 'video' ? (
            <video
              ref={el => { videoRefs.current[i] = el }}
              playsInline
              preload="auto"
              className={videoClass}
            >
              <source src={avatar.src} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 w-full h-full animate-[kenBurns_20s_ease-in-out_infinite_alternate]">
              <img
                src={avatar.src}
                alt={avatar.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}
        </div>
      ))}

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
                i === visibleIdx ? 'bg-white/90 scale-125' : 'bg-white/40 hover:bg-white/60'
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
