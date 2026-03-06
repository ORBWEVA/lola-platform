export interface L1Error {
  pattern: string
  correction: string
  explanation: string
}

export interface L1PatternSet {
  languageCode: string
  languageName: string
  targetLanguage: string
  commonErrors: L1Error[]
  pronunciationNotes: string[]
}
