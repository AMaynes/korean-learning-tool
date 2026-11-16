/**
 * Overview & Purpose: Resolve the active vocabulary lists and their grammar rules.
 *
 * Architectural Relationships: All exercise modes and settings consume this registry.
 *
 * External Resources: Authored lexical and grammar catalogs.
 *
 * Notes: Stable list IDs connect bundled content with saved progress.
 */


import { conjugationRules, grammarLists, particleRules } from '../data/grammar'
import { categoryIds } from '../data/model'
import type { Category, Entry, Selection, WordList } from '../data/model'
import { lexicalLists } from '../data/words'

export const builtInLists = [...lexicalLists, ...grammarLists]
export const defaultSelection = Object.fromEntries(categoryIds.map(category => [category, category + '-1'])) as Selection

/** Resolve only catalog lists and fall back within each category for obsolete selections. */
export function activeLists(selection: Partial<Record<Category, unknown>>) {
  return Object.fromEntries(categoryIds.map(category => {
    const options = builtInLists.filter(list => list.category === category)
    return [category, options.find(list => list.id === selection[category]) ?? options[0]]
  })) as Record<Category, WordList>
}

/** Look up a rule only in the matching grammatical category. */
export function entryRule(category: Category, entry: Entry) {
  if (!entry.rule) return undefined
  const rules = category === 'particles' ? particleRules : category === 'conjugations' ? conjugationRules : {}
  return Object.hasOwn(rules, entry.rule) ? rules[entry.rule] : undefined
}
