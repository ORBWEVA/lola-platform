import type { L1PatternSet } from './types'

export const englishToJapanesePatterns: L1PatternSet = {
  languageCode: 'en',
  languageName: 'English',
  targetLanguage: 'Japanese',
  commonErrors: [
    { pattern: 'Particle confusion (は vs が)', correction: 'Use は for topic, が for subject/new info', explanation: 'English doesn\'t distinguish topic from subject' },
    { pattern: 'Verb conjugation', correction: 'Conjugate verbs for tense and politeness', explanation: 'English speakers forget Japanese verbs carry politeness level' },
    { pattern: 'Word order (SVO→SOV)', correction: 'Place verb at end of sentence', explanation: 'English SVO habit persists; Japanese requires SOV' },
    { pattern: 'Counter word omission', correction: 'Use appropriate counter words with numbers', explanation: 'English doesn\'t use counters; Japanese requires them' },
    { pattern: 'Keigo (politeness levels)', correction: 'Match formality to social context', explanation: 'English has one register; Japanese has multiple politeness levels' },
    { pattern: 'Dropping pronouns', correction: 'Omit obvious subjects/objects naturally', explanation: 'English speakers over-specify subjects that Japanese omits' },
  ],
  pronunciationNotes: [
    'Maintain mora-timing — don\'t stress-time Japanese words',
    'Long vowels (おう, えい) must be held — shortening changes meaning',
    'Pitch accent matters: 箸 (はし↑) chopsticks vs 橋 (は↑し) bridge',
    'Don\'t reduce unstressed vowels — every mora has equal weight',
  ],
}
