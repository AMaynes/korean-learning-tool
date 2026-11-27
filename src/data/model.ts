/**
 * Overview & Purpose: Define vocabulary and grammar records shared by practice and persistence.
 *
 * Architectural Relationships: Consumed by the catalog, engines, and study views.
 *
 * External Resources: None.
 *
 * Notes: List and entry IDs remain stable across edits and sessions.
 */


export const categories = {
  topics: 'Daily life & conversations',
  nouns: 'Nouns', pronouns: 'Pronouns', verbs: 'Verbs', adjectives: 'Adjectives',
  sentences: 'Common Sentences', independent: 'Independent Words',
  particles: 'Particles', conjugations: 'Conjugations',
} as const

export type Category = keyof typeof categories
export const categoryIds = Object.keys(categories) as Category[]
export type WordClass = 'verb' | 'adjective'
export type Irregular = 'b' | 'd' | 'reu' | 's' | 'h'

/** An independent vocabulary item with optional morphology and sentence-template metadata. */
export interface Entry {
  id: string
  korean: string
  english: string
  tags?: string[]
  irregular?: Irregular
  rule?: string
  note?: string
  example?: string
  alternatives?: string[]
}

/** A single selectable deck in one category. */
export interface WordList {
  id: string
  category: Category
  name: string
  entries: Entry[]
}

export type Selection = Record<Category, string>

/** A study example that preserves the original form and the visible transformation. */
export interface Transformation {
  original: string
  originalMeaning: string
  applied: string
  result: string
  meaning: string
  stem?: string
  context?: string
}
