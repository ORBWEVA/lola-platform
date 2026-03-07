'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'

interface Props {
  avatarName: string
  videoRef?: React.RefObject<HTMLVideoElement | null>
  subtitleKey?: string
}

type LangCode = 'en' | 'ja' | 'ko' | 'es' | 'de' | 'fr'

const avatarSubtitles: Record<string, Record<LangCode, string>> = {
  sara: {
    en: "Hi, I'm Sara. I help you find your creative voice.",
    ja: "\u3053\u3093\u306b\u3061\u306f\u3001\u30b5\u30e9\u3067\u3059\u3002\u3042\u306a\u305f\u306e\u30af\u30ea\u30a8\u30a4\u30c6\u30a3\u30d6\u306a\u58f0\u3092\u898b\u3064\u3051\u308b\u304a\u624b\u4f1d\u3044\u3092\u3057\u307e\u3059\u3002",
    ko: "\uc548\ub155\ud558\uc138\uc694, \uc0ac\ub77c\uc608\uc694. \ucc3d\uc758\uc801\uc778 \ubaa9\uc18c\ub9ac\ub97c \ucc3e\ub294 \uac78 \ub3c4\uc640\ub4dc\ub9b4\uac8c\uc694.",
    es: "Hola, soy Sara. Te ayudo a encontrar tu voz creativa.",
    de: "Hallo, ich bin Sara. Ich helfe dir, deine kreative Stimme zu finden.",
    fr: "Bonjour, je suis Sara. Je vous aide a trouver votre voix creative.",
  },
  sakura: {
    en: "Welcome! I'm Sakura, your language learning companion.",
    ja: "\u3088\u3046\u3053\u305d\uff01\u3055\u304f\u3089\u3067\u3059\u3002\u4e00\u7dd2\u306b\u8a00\u8a9e\u3092\u5b66\u3073\u307e\u3057\u3087\u3046\u3002",
    ko: "\ud658\uc601\ud569\ub2c8\ub2e4! \uc0ac\ucfe0\ub77c\uc608\uc694. \ud568\uaed8 \uc5b8\uc5b4\ub97c \ubc30\uc6cc\uc694.",
    es: "Bienvenido! Soy Sakura, tu companera de idiomas.",
    de: "Willkommen! Ich bin Sakura, deine Sprachlernbegleiterin.",
    fr: "Bienvenue ! Je suis Sakura, votre compagne d'apprentissage.",
  },
}

const defaultSubtitles: Record<LangCode, string> = {
  en: "Hello! Let's have a conversation.",
  ja: "\u3053\u3093\u306b\u3061\u306f\uff01\u304a\u8a71\u3057\u307e\u3057\u3087\u3046\u3002",
  ko: "\uc548\ub155\ud558\uc138\uc694! \ub300\ud654\ud574\uc694.",
  es: "Hola! Vamos a conversar.",
  de: "Hallo! Lass uns reden.",
  fr: "Bonjour ! Parlons ensemble.",
}

// Pre-timed word reveals synced to Sara's 8s video (English)
// Approximate lip-sync timings for "Hi, I'm Sara. I help you find your creative voice."
const saraWordTimings: Record<LangCode, number[]> = {
  en: [0.3, 0.6, 0.9, 1.8, 2.1, 2.4, 2.8, 3.2, 3.7, 4.2],
  // For other languages, spread evenly across 1.0s–5.0s
  ja: [], ko: [], es: [], de: [], fr: [],
}

const supportedLangs: LangCode[] = ['en', 'ja', 'ko', 'es', 'de', 'fr']

function detectLang(): LangCode {
  if (typeof navigator === 'undefined') return 'en'
  const nav = navigator.language.toLowerCase().slice(0, 2)
  return supportedLangs.includes(nav as LangCode) ? (nav as LangCode) : 'en'
}

export default function HeroSubtitles({ avatarName, videoRef, subtitleKey }: Props) {
  const [lang, setLang] = useState<LangCode>('en')
  const [visibleCount, setVisibleCount] = useState(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    setLang(detectLang())
  }, [])

  const text = useMemo(() => {
    if (subtitleKey) return subtitleKey
    const subs = avatarSubtitles[avatarName.toLowerCase()] ?? defaultSubtitles
    return subs[lang] ?? subs.en
  }, [avatarName, subtitleKey, lang])

  // Split into actual words (filter out whitespace-only entries)
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])

  // Get timings for these words
  const timings = useMemo(() => {
    const key = avatarName.toLowerCase()
    const preset = key === 'sara' ? saraWordTimings[lang] : []
    if (preset && preset.length === words.length) return preset
    // Fallback: spread words evenly across 0.5s – 4.5s
    return words.map((_, i) => 0.5 + (i / Math.max(words.length - 1, 1)) * 4.0)
  }, [avatarName, lang, words])

  const syncToVideo = useCallback(() => {
    const video = videoRef?.current
    if (!video) {
      // No video ref — show all words immediately
      setVisibleCount(words.length)
      return
    }

    const t = video.currentTime
    let count = 0
    for (let i = 0; i < timings.length; i++) {
      if (t >= timings[i]) count = i + 1
    }
    setVisibleCount(count)
    animRef.current = requestAnimationFrame(syncToVideo)
  }, [videoRef, timings, words.length])

  useEffect(() => {
    if (!videoRef?.current) {
      setVisibleCount(words.length)
      return
    }
    animRef.current = requestAnimationFrame(syncToVideo)
    return () => cancelAnimationFrame(animRef.current)
  }, [syncToVideo, videoRef, words.length])

  return (
    <div className="text-center">
      <p
        className="text-lg md:text-2xl text-white/90 leading-relaxed"
        style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
      >
        {words.map((word, i) => (
          <span key={i}>
            <span
              className="inline-block transition-all duration-300 ease-out"
              style={{
                opacity: i < visibleCount ? 1 : 0,
                transform: i < visibleCount ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              {word}
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </p>
    </div>
  )
}
