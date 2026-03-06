import type { L1PatternSet } from './types'

export const koreanPatterns: L1PatternSet = {
  languageCode: 'ko',
  languageName: 'Korean',
  targetLanguage: 'English',
  commonErrors: [
    { pattern: 'Article omission', correction: 'Include a/an/the', explanation: 'Korean has no articles' },
    { pattern: 'Subject/object pronoun confusion', correction: 'Distinguish he/him, she/her', explanation: 'Korean pronouns don\'t change form by case' },
    { pattern: 'Relative clause structure', correction: 'Place relative clauses after the noun', explanation: 'Korean places modifying clauses before the noun' },
    { pattern: 'Verb tense marking', correction: 'Use appropriate English tense forms', explanation: 'Korean tense markers differ; present/past distinction can be unclear' },
    { pattern: 'Plural inconsistency', correction: 'Mark plurals consistently', explanation: 'Korean plural marker -들 is optional' },
    { pattern: 'Preposition errors', correction: 'Use correct English prepositions', explanation: 'Korean postpositions don\'t map directly to English prepositions' },
  ],
  pronunciationNotes: [
    'Difficulty distinguishing /f/ and /p/ — Korean lacks /f/',
    '/z/ often replaced with /j/ — Korean lacks a voiced /z/',
    'Final consonant release — Korean unreleased final stops carry into English',
    'Vowel length distinctions not maintained',
  ],
}
