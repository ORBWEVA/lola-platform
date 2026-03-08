'use client'

import { forwardRef } from 'react'

interface Props {
  src: string
  onEnded?: () => void
}

const HeroVideo = forwardRef<HTMLVideoElement, Props>(({ src, onEnded }, ref) => {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100dvh' }}>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onEnded={onEnded}
        className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
      >
        <source src={src} type="video/mp4" />
      </video>

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
    </div>
  )
})

HeroVideo.displayName = 'HeroVideo'

export default HeroVideo
