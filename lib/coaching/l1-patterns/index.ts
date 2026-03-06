import type { L1PatternSet } from './types'
import { japanesePatterns } from './japanese'
import { koreanPatterns } from './korean'
import { englishToJapanesePatterns } from './english'

export type { L1PatternSet } from './types'

const PATTERNS: Record<string, L1PatternSet> = {
  ja: japanesePatterns,
  ko: koreanPatterns,
  en: englishToJapanesePatterns,
}

export const getL1Patterns = (languageCode: string): L1PatternSet | null =>
  PATTERNS[languageCode] ?? null

export const getAvailableLanguages = () =>
  Object.entries(PATTERNS).map(([code, p]) => ({
    code,
    name: p.languageName,
    target: p.targetLanguage,
  }))
