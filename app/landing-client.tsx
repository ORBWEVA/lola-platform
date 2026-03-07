'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import HeroVideo from '@/components/landing/HeroVideo'
import HeroWaveform from '@/components/landing/HeroWaveform'
import HeroSubtitles from '@/components/landing/HeroSubtitles'
import SlideMenu from '@/components/SlideMenu'
import { useVideoSubtitles } from '@/lib/use-video-subtitles'
import type { SubtitleWord } from '@/lib/use-video-subtitles'

const avatars = [
  {
    name: 'Sara',
    type: 'video' as const,
    src: '/avatars/sara/hero-landscape.mp4',
    subtitlesUrl: '/avatars/sara/subtitles.json',
  },
]

const translations: Record<string, string> = {
  en: 'Sara is my name, your multilingual educator. Let\'s talk.',
  ja: 'サラです。あなたの多言語教育者です。話しましょう。',
  ko: '사라입니다. 다국어 교육자입니다. 이야기해요.',
  es: 'Sara es mi nombre, tu educadora multilingüe. Hablemos.',
  de: 'Sara ist mein Name, deine mehrsprachige Ausbilderin. Lass uns reden.',
  fr: 'Sara est mon nom, votre éducatrice multilingue. Parlons.',
  zh: '我叫萨拉，您的多语言教育者。我们聊聊吧。',
  pt: 'Sara é meu nome, sua educadora multilíngue. Vamos conversar.',
}

function makeEvenWords(text: string, duration: number): SubtitleWord[] {
  const words = text.split(/\s+/)
  const speakEnd = duration * 0.6
  const interval = speakEnd / words.length
  return words.map((word, i) => ({
    word,
    start: i * interval,
    end: (i + 1) * interval,
  }))
}

export default function LandingHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const avatar = avatars[0]
  const { data, visibleCount, speaking, energy, loopCount } = useVideoSubtitles(
    videoRef,
    avatar.subtitlesUrl
  )

  const [browserLang, setBrowserLang] = useState('en')
  useEffect(() => {
    const lang = navigator.language.split('-')[0]
    setBrowserLang(lang)
  }, [])

  const isTranslatedLoop = loopCount % 2 === 1 && browserLang !== 'en'
  const translatedWords = useMemo(() => {
    const text = translations[browserLang] || translations.en
    return makeEvenWords(text, data?.duration ?? 6.2)
  }, [browserLang, data?.duration])

  const displayWords = isTranslatedLoop ? translatedWords : data?.words

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Video/Image background layer */}
      <HeroVideo ref={videoRef} avatars={avatars} />

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Logo */}
      <div className="absolute top-0 left-0 z-50 p-4 sm:p-6">
        <span className="text-xl font-bold gradient-text" style={{ fontFamily: 'var(--font-exo2)', fontWeight: 700 }}>LoLA</span>
      </div>

      {/* Menu */}
      <div className="absolute top-0 right-0 z-50 p-4 sm:p-6">
        <SlideMenu isLoggedIn={isLoggedIn} />
      </div>

      {/* Subtitles — synced to video */}
      <div className="absolute z-20 left-0 right-0" style={{ top: '52%' }}>
        <div className="flex justify-center px-6">
          <HeroSubtitles words={displayWords} visibleCount={visibleCount} />
        </div>
      </div>

      {/* Waveform — synced to video */}
      <div className="absolute z-20 left-0 right-0 flex justify-center" style={{ top: '66%' }}>
        <div className="w-[60%] max-w-[400px] sm:w-[50%] sm:max-w-[500px] lg:w-[40%] lg:max-w-[600px] h-16">
          <HeroWaveform videoRef={videoRef} speaking={speaking} energy={energy} />
        </div>
      </div>

      {/* CTA */}
      <div className="absolute z-30 bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,16px)] px-6 mb-8 sm:mb-12">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-white/50 tracking-widest uppercase font-light">
            Meet {avatar.name}
          </p>
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-full gradient-btn-lg text-sm font-medium text-white tracking-wide pulse-glow"
          >
            Start a Conversation
          </Link>
        </div>
      </div>

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
