export interface L1Error {
  pattern: string
  correction: string
  explanation: string
}

export interface L1PatternSet {
  languageName: string
  targetLanguage: string
  commonErrors: L1Error[]
  pronunciationNotes: string[]
}

const patterns: Record<string, L1PatternSet> = {
  japanese: {
    languageName: 'Japanese',
    targetLanguage: 'English',
    commonErrors: [
      { pattern: 'L/R confusion', correction: 'Distinguish /l/ and /r/ sounds', explanation: 'Japanese has a single liquid consonant that falls between English L and R' },
      { pattern: 'Article omission', correction: 'Use a/an/the appropriately', explanation: 'Japanese has no articles; learners often drop them' },
      { pattern: 'Plural omission', correction: 'Add -s/-es for plural nouns', explanation: 'Japanese nouns do not inflect for number' },
      { pattern: 'Subject pronoun dropping', correction: 'Include subject pronouns', explanation: 'Japanese is a pro-drop language' },
      { pattern: 'Preposition confusion', correction: 'Match English preposition usage', explanation: 'Japanese particles do not map 1:1 to English prepositions' },
    ],
    pronunciationNotes: [
      'Vowel insertion after consonant clusters (e.g., "strike" -> "sutoraiku")',
      'Difficulty with /v/, /f/, and /th/ sounds',
      'Tendency toward syllable-timed rhythm instead of stress-timed',
    ],
  },
  korean: {
    languageName: 'Korean',
    targetLanguage: 'English',
    commonErrors: [
      { pattern: 'Article omission', correction: 'Use a/an/the', explanation: 'Korean has no articles' },
      { pattern: 'Subject-verb agreement', correction: 'Match verb to subject number', explanation: 'Korean verbs do not conjugate for person/number' },
      { pattern: 'Tense consistency', correction: 'Maintain tense throughout', explanation: 'Korean tense system differs from English' },
    ],
    pronunciationNotes: [
      'Difficulty distinguishing /r/ and /l/',
      '/f/ and /p/ confusion',
      'Final consonant devoicing',
    ],
  },
  spanish: {
    languageName: 'Spanish',
    targetLanguage: 'English',
    commonErrors: [
      { pattern: 'False cognates', correction: 'Verify meaning of similar-looking words', explanation: 'Many Spanish-English cognates have shifted meanings' },
      { pattern: 'Adjective placement', correction: 'Place adjectives before nouns in English', explanation: 'Spanish typically places adjectives after nouns' },
      { pattern: 'Double negatives', correction: 'Use single negation in standard English', explanation: 'Spanish uses double negatives grammatically' },
    ],
    pronunciationNotes: [
      'Vowel reduction is uncommon in Spanish; English has many reduced vowels (schwa)',
      'Initial /s/ clusters often get a preceding /e/ sound',
      'Difficulty with /v/ vs /b/ distinction',
    ],
  },
  german: {
    languageName: 'German',
    targetLanguage: 'English',
    commonErrors: [
      { pattern: 'Word order in subclauses', correction: 'Keep SVO order in English subclauses', explanation: 'German sends verbs to the end of subordinate clauses' },
      { pattern: 'False friends', correction: 'Verify meaning of similar words', explanation: 'German-English false cognates are common' },
      { pattern: 'Present perfect overuse', correction: 'Use simple past for completed actions', explanation: 'German uses present perfect more broadly than English' },
    ],
    pronunciationNotes: [
      'W/V confusion (German W = English V sound)',
      'Difficulty with /th/ sounds (voiced and voiceless)',
      'Final consonant devoicing',
    ],
  },
}

export const getL1Patterns = (nativeLanguage: string): L1PatternSet | null => {
  const key = nativeLanguage.toLowerCase().trim()
  return patterns[key] ?? null
}
