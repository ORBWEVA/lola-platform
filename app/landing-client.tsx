'use client'

import { useRef } from 'react'
import Link from 'next/link'
import HeroVideo from '@/components/landing/HeroVideo'
import HeroWaveform from '@/components/landing/HeroWaveform'
import HeroSubtitles from '@/components/landing/HeroSubtitles'
import SlideMenu from '@/components/SlideMenu'

const avatars = [
  {
    name: 'Sara',
    type: 'video' as const,
    portraitSrc: '/avatars/sara/hero-portrait.mp4',
    landscapeSrc: '/avatars/sara/hero-landscape.mp4',
  },
]

export default function LandingHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Video/Image background layer */}
      <HeroVideo ref={videoRef} avatars={avatars} />

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Logo — top left */}
      <div className="absolute top-0 left-0 z-50 p-4 sm:p-6">
        <span className="text-xl font-bold gradient-text-vivid">LoLA</span>
      </div>

      {/* Plus menu — top right */}
      <div className="absolute top-0 right-0 z-50 p-4 sm:p-6">
        <SlideMenu isLoggedIn={isLoggedIn} />
      </div>

      {/* Subtitles — positioned above waveform */}
      <div className="absolute z-20 left-0 right-0" style={{ top: '52%' }}>
        <div className="flex justify-center px-6">
          <HeroSubtitles avatarName="sara" />
        </div>
      </div>

      {/* Waveform — at 2/3 viewport height */}
      <div className="absolute z-20 left-0 right-0 flex justify-center" style={{ top: '66%' }}>
        <div className="w-[60%] max-w-[400px] sm:w-[50%] sm:max-w-[500px] lg:w-[40%] lg:max-w-[600px] h-16">
          <HeroWaveform videoRef={videoRef} />
        </div>
      </div>

      {/* Bottom CTA + avatar name */}
      <div className="absolute z-30 bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,16px)] px-6 mb-8 sm:mb-12">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-white/50 tracking-widest uppercase font-light">
            Meet Sara
          </p>
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-full gradient-btn-lg text-sm font-medium text-white tracking-wide pulse-glow"
          >
            Start a Conversation
          </Link>
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'LoLA',
          description: 'AI avatars that coach, sell & grow',
          url: 'https://lola-platform.vercel.app',
        }) }}
      />
    </div>
  )
}
