'use client'

import type { SubtitleWord } from '@/lib/use-video-subtitles'

interface Props {
  words?: SubtitleWord[]
  visibleCount: number
}

export default function HeroSubtitles({ words, visibleCount }: Props) {
  if (!words || words.length === 0) return null

  // When visibleCount drops to 0, the whole container fades out smoothly
  const allHidden = visibleCount === 0

  return (
    <div
      className="text-center transition-opacity duration-500 ease-out"
      style={{ opacity: allHidden ? 0 : 1 }}
    >
      <p
        className="text-lg md:text-2xl text-white/90 leading-relaxed font-light tracking-wide"
        style={{ fontFamily: 'var(--font-exo2, var(--font-sans))', letterSpacing: '0.2px' }}
      >
        {words.map((w, i) => (
          <span key={i}>
            <span
              className="inline-block transition-all duration-300 ease-out"
              style={{
                opacity: i < visibleCount ? 1 : 0,
                transform: i < visibleCount ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              {w.word}
            </span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </p>
    </div>
  )
}
