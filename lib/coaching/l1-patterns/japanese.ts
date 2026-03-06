import type { L1PatternSet } from './types'

export const japanesePatterns: L1PatternSet = {
  languageCode: 'ja',
  languageName: 'Japanese',
  targetLanguage: 'English',
  commonErrors: [
    { pattern: 'L/R confusion', correction: 'Distinguish /l/ and /r/ sounds', explanation: 'Japanese has one liquid consonant that maps to neither English L nor R' },
    { pattern: 'Article omission', correction: 'Add a/an/the before nouns', explanation: 'Japanese has no articles; speakers often drop them entirely' },
    { pattern: 'Plural marking', correction: 'Add -s/-es for plural nouns', explanation: 'Japanese nouns don\'t inflect for number' },
    { pattern: 'Subject omission', correction: 'Include explicit subjects', explanation: 'Japanese regularly drops subjects; English requires them' },
    { pattern: 'Preposition confusion', correction: 'Match English preposition to context', explanation: 'Japanese particles don\'t map 1:1 to English prepositions' },
    { pattern: 'Tense consistency', correction: 'Maintain consistent tense in narrative', explanation: 'Japanese tense system differs; speakers may shift tenses unexpectedly' },
    { pattern: 'Word order (SOV→SVO)', correction: 'Use Subject-Verb-Object order', explanation: 'Japanese is SOV; speakers may place verbs at the end' },
  ],
  pronunciationNotes: [
    'Vowel insertion after consonant clusters (e.g., "street" → "sutoriito")',
    'Difficulty with /θ/ and /ð/ (th sounds) — often substituted with /s/ or /z/',
    '/v/ sound often replaced with /b/',
    'Stress patterns differ — Japanese is mora-timed, English is stress-timed',
  ],
}
