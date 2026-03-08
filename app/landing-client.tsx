'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import HeroVideo from '@/components/landing/HeroVideo'
import HeroWaveform from '@/components/landing/HeroWaveform'
import HeroSubtitles from '@/components/landing/HeroSubtitles'
import SlideMenu from '@/components/SlideMenu'
import { useVideoSubtitles } from '@/lib/use-video-subtitles'
import type { SubtitleWord, SubtitleData } from '@/lib/use-video-subtitles'

const avatars = [
  {
    name: 'Emma',
    slug: 'emma-lindgren',
    type: 'video' as const,
    src: '/avatars/emma-lindgren/hero-portrait.mp4',
    subtitlesUrl: '/avatars/emma-lindgren/subtitles.json',
    translations: {
      en: "I'm Emma. Strategy, growth, straight talk — in whatever language you think in. Let's go.",
      ja: 'エマです。戦略、成長、率直な対話 — 考える言語で。始めましょう。',
      ko: '엠마입니다. 전략, 성장, 솔직한 대화 — 생각하는 언어로. 시작해요.',
      es: 'Soy Emma. Estrategia, crecimiento, hablar claro — en el idioma en que piensas. Vamos.',
      de: 'Ich bin Emma. Strategie, Wachstum, Klartext — in der Sprache, in der du denkst. Los.',
      fr: 'Je suis Emma. Stratégie, croissance, franchise — dans la langue dans laquelle vous pensez. Allons-y.',
      zh: '我是艾玛。战略、增长、直言不讳——用你思考的语言。开始吧。',
      pt: 'Sou a Emma. Estratégia, crescimento, conversa direta — no idioma em que você pensa. Vamos.',
    },
  },
  {
    name: 'Sakura',
    slug: 'sakura-sensei',
    type: 'video' as const,
    src: '/avatars/sakura-sensei/hero-portrait.mp4',
    subtitlesUrl: '/avatars/sakura-sensei/subtitles.json',
    translations: {
      en: "I'm Sakura. Whether it's Japanese or any language, I'll meet you where you are. Let's begin.",
      ja: 'さくらです。日本語でも何語でも、あなたに合わせます。始めましょう。',
      ko: '사쿠라입니다. 일본어든 어떤 언어든, 맞춰드릴게요. 시작해요.',
      es: 'Soy Sakura. Ya sea japonés o cualquier idioma, me adapto a ti. Comencemos.',
      de: 'Ich bin Sakura. Ob Japanisch oder jede andere Sprache — ich passe mich an. Fangen wir an.',
      fr: 'Je suis Sakura. Que ce soit le japonais ou toute autre langue, je m\'adapte. Commençons.',
      zh: '我是樱花。无论是日语还是其他语言，我都会配合你。开始吧。',
      pt: 'Sou a Sakura. Seja japonês ou qualquer idioma, me adapto a você. Vamos começar.',
    },
  },
  {
    name: 'Marcus',
    slug: 'coach-marcus',
    type: 'video' as const,
    src: '/avatars/coach-marcus/hero-portrait.mp4',
    subtitlesUrl: '/avatars/coach-marcus/subtitles.json',
    translations: {
      en: "I'm Marcus. Your goals, your pace, your language. Let's get to work.",
      ja: 'マーカスです。目標もペースも言語も自分次第。さあ始めよう。',
      ko: '마커스입니다. 목표도 속도도 언어도 자유롭게. 시작하죠.',
      es: 'Soy Marcus. Tus metas, tu ritmo, tu idioma. Manos a la obra.',
      de: 'Ich bin Marcus. Deine Ziele, dein Tempo, deine Sprache. Los geht\'s.',
      fr: 'Je suis Marcus. Vos objectifs, votre rythme, votre langue. Au travail.',
      zh: '我是马库斯。你的目标、你的节奏、你的语言。开始吧。',
      pt: 'Sou o Marcus. Seus objetivos, seu ritmo, seu idioma. Vamos trabalhar.',
    },
  },
  {
    name: 'Alex',
    slug: 'alex-rivera',
    type: 'video' as const,
    src: '/avatars/alex-rivera/hero-portrait.mp4',
    subtitlesUrl: '/avatars/alex-rivera/subtitles.json',
    translations: {
      en: "I'm Alex. I help you find exactly what you need, in any language. Let's figure it out.",
      ja: 'アレックスです。必要なものを見つけるお手伝いをします。どの言語でも。一緒に考えましょう。',
      ko: '알렉스입니다. 필요한 걸 정확히 찾아드릴게요, 어떤 언어로든. 함께 알아봐요.',
      es: 'Soy Alex. Te ayudo a encontrar exactamente lo que necesitas, en cualquier idioma. Vamos a resolverlo.',
      de: 'Ich bin Alex. Ich helfe dir, genau das zu finden, was du brauchst — in jeder Sprache. Lass uns das klären.',
      fr: 'Je suis Alex. Je vous aide à trouver exactement ce qu\'il vous faut, dans n\'importe quelle langue. On s\'y met.',
      zh: '我是亚历克斯。帮你找到你需要的，用任何语言。一起来吧。',
      pt: 'Sou o Alex. Ajudo você a encontrar exatamente o que precisa, em qualquer idioma. Vamos resolver.',
    },
  },
  {
    name: 'Sara',
    slug: 'sara',
    type: 'video' as const,
    src: '/avatars/sara/hero-portrait.mp4',
    subtitlesUrl: '/avatars/sara/subtitles.json',
    translations: {
      en: "I'm Sara. Pick a language, any language — I'll keep up. Let's talk.",
      ja: 'サラです。どの言語でもどうぞ — ついていきます。話しましょう。',
      ko: '사라입니다. 아무 언어나 골라보세요 — 따라갈게요. 이야기해요.',
      es: 'Soy Sara. Elige un idioma, cualquier idioma — te sigo el ritmo. Hablemos.',
      de: 'Ich bin Sara. Wähl eine Sprache, irgendeine — ich halte mit. Lass uns reden.',
      fr: 'Je suis Sara. Choisis une langue, n\'importe laquelle — je suivrai. Parlons.',
      zh: '我是萨拉。选一种语言，任何语言——我都跟得上。聊聊吧。',
      pt: 'Sou a Sara. Escolha um idioma, qualquer um — eu acompanho. Vamos conversar.',
    },
  },
]

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

interface UserInfo {
  name: string
  role: string
}

export default function LandingHero({ isLoggedIn, userInfo }: { isLoggedIn: boolean; userInfo: UserInfo | null }) {
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const avatar = avatars[activeIndex]

  // Preload all subtitle data + videos at mount so switches are instant
  const [preloaded, setPreloaded] = useState<Record<string, SubtitleData>>({})
  useEffect(() => {
    avatars.forEach(a => {
      fetch(a.subtitlesUrl)
        .then(r => r.json())
        .then((d: SubtitleData) => setPreloaded(prev => ({ ...prev, [a.subtitlesUrl]: d })))
        .catch(() => {})
      // Preload video into browser cache
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'video'
      link.href = a.src
      document.head.appendChild(link)
    })
  }, [])

  const subtitleData = preloaded[avatar.subtitlesUrl] ?? undefined
  const { data, visibleCount, speaking, energy, loopCount } = useVideoSubtitles(
    videoRef,
    subtitleData
  )

  const [browserLang, setBrowserLang] = useState('en')
  useEffect(() => {
    const lang = navigator.language.split('-')[0]
    setBrowserLang(lang)
  }, [])

  const isTranslatedLoop = loopCount % 2 === 1 && browserLang !== 'en'
  const translatedWords = useMemo(() => {
    const text = (avatar.translations as Record<string, string>)[browserLang] || avatar.translations.en
    return makeEvenWords(text, data?.duration ?? 5)
  }, [browserLang, data?.duration, avatar.translations])

  const displayWords = isTranslatedLoop ? translatedWords : data?.words
  // During transition, force subtitles to fade out
  const effectiveVisibleCount = transitioning ? 0 : visibleCount

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Video/Image background layer */}
      <HeroVideo ref={videoRef} avatars={avatars} activeIndex={activeIndex} onIndexChange={setActiveIndex} onTransitionStart={() => setTransitioning(true)} onTransitionEnd={() => setTransitioning(false)} />

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Logo */}
      <div className="absolute top-0 left-0 z-50 p-4 sm:p-6">
        <span className="text-xl font-bold gradient-text" style={{ fontFamily: 'var(--font-exo2)', fontWeight: 700 }}>LoLA</span>
      </div>

      {/* Welcome nudge for logged-in users */}
      {userInfo && !nudgeDismissed && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 mt-4 sm:mt-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/10 text-sm text-white/80 animate-[fadeIn_0.5s_ease-out]">
            <span>Welcome back, {userInfo.name}</span>
            <Link
              href={userInfo.role === 'creator' ? '/creator' : '/dashboard'}
              className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              {userInfo.role === 'creator' ? 'Creator Studio' : 'My Dashboard'}
            </Link>
            <button
              onClick={() => setNudgeDismissed(true)}
              className="text-white/40 hover:text-white/70 transition-colors"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="absolute top-0 right-0 z-50 p-4 sm:p-6">
        <SlideMenu isLoggedIn={isLoggedIn} />
      </div>

      {/* Subtitles — synced to video */}
      <div className="absolute z-20 left-0 right-0" style={{ top: '52%' }}>
        <div className="flex justify-center px-6">
          <HeroSubtitles words={displayWords} visibleCount={effectiveVisibleCount} />
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
            Build yours in minutes
          </p>
          <Link
            href="/creator/avatars/new"
            className="px-10 py-3.5 rounded-full gradient-btn-lg text-sm font-medium text-white tracking-wide pulse-glow"
          >
            Create Your Own
          </Link>
          <Link
            href={`/avatar/${avatar.slug}`}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            or talk to {avatar.name}
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
