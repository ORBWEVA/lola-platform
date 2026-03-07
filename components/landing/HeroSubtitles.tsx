'use client'

import { useEffect, useState, useMemo } from 'react'

interface Props {
  avatarName: string
  subtitleKey?: string
}

type LangCode = 'en' | 'ja' | 'ko' | 'es' | 'de' | 'fr'

const avatarSubtitles: Record<string, Record<LangCode, string>> = {
  sara: {
    en: "Hi, I'm Sara. I help you find your creative voice.",
    ja: "こんにちは、サラです。あなたのクリエイティブな声を見つけるお手伝いをします。",
    ko: "안녕하세요, 사라예요. 창의적인 목소리를 찾는 걸 도와드릴게요.",
    es: "Hola, soy Sara. Te ayudo a encontrar tu voz creativa.",
    de: "Hallo, ich bin Sara. Ich helfe dir, deine kreative Stimme zu finden.",
    fr: "Bonjour, je suis Sara. Je vous aide a trouver votre voix creative.",
  },
  sakura: {
    en: "Welcome! I'm Sakura, your language learning companion.",
    ja: "ようこそ！さくらです。一緒に言語を学びましょう。",
    ko: "환영합니다! 사쿠라예요. 함께 언어를 배워요.",
    es: "Bienvenido! Soy Sakura, tu companera de idiomas.",
    de: "Willkommen! Ich bin Sakura, deine Sprachlernbegleiterin.",
    fr: "Bienvenue ! Je suis Sakura, votre compagne d'apprentissage.",
  },
}

const defaultSubtitles: Record<LangCode, string> = {
  en: "Hello! Let's have a conversation.",
  ja: "こんにちは！お話しましょう。",
  ko: "안녕하세요! 대화해요.",
  es: "Hola! Vamos a conversar.",
  de: "Hallo! Lass uns reden.",
  fr: "Bonjour ! Parlons ensemble.",
}

const supportedLangs: LangCode[] = ['en', 'ja', 'ko', 'es', 'de', 'fr']

function detectLang(): LangCode {
  if (typeof navigator === 'undefined') return 'en'
  const nav = navigator.language.toLowerCase().slice(0, 2)
  return supportedLangs.includes(nav as LangCode) ? (nav as LangCode) : 'en'
}

export default function HeroSubtitles({ avatarName, subtitleKey }: Props) {
  const [lang, setLang] = useState<LangCode>('en')

  useEffect(() => {
    setLang(detectLang())
  }, [])

  const text = useMemo(() => {
    if (subtitleKey) return subtitleKey
    const subs = avatarSubtitles[avatarName.toLowerCase()] ?? defaultSubtitles
    return subs[lang] ?? subs.en
  }, [avatarName, subtitleKey, lang])

  const words = text.split(/(\s+)/)

  return (
    <div className="text-center">
      <p
        className="text-lg md:text-2xl text-white/80 leading-relaxed"
        style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
      >
        {words.map((word, i) =>
          /^\s+$/.test(word) ? (
            <span key={i}>{word}</span>
          ) : (
            <span
              key={i}
              className="inline-block animate-[subtitleWord_0.5s_ease-out_both]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {word}
            </span>
          )
        )}
      </p>
      <style jsx>{`
        @keyframes subtitleWord {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
