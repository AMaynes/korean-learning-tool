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
import { sceneMaps } from '../data/sceneMaps'
import { lexicalLists } from '../data/words'

// A form can appear in several scenes. Its recall ID follows the spelling, even if a scene moves.
const topicLists: WordList[] = sceneMaps.map(map => {
  const entries = new Map<string, Entry>()
  for (const section of map.sections) {
    for (const [korean, english] of section.stops) {
      if (entries.has(korean)) continue
      const id = Array.from(korean, char => char.codePointAt(0)!.toString(16)).join('-')
      entries.set(korean, { id, korean, english })
    }
  }
  return { category: 'topics', id: 'topics-' + map.id, name: map.name, entries: [...entries.values()] }
})

export const builtInLists = [...lexicalLists, ...grammarLists, ...topicLists]
export const selectableLists: WordList[] = [...builtInLists, ...categoryIds.map(category => {
  const entries = builtInLists.filter(list => list.category === category).flatMap(list => list.entries)
  return {
    id: category + '-all', category, name: category === 'topics' ? 'Full vocabulary list' : 'All lists',
    entries: [...new Map(entries.map(entry => [entry.id, entry])).values()],
  }
})]
export const defaultSelection = Object.fromEntries(categoryIds.map(category => [category, builtInLists.find(list => list.category === category)!.id])) as Selection

/** Resolve only catalog lists and fall back within each category for obsolete selections. */
export function activeLists(selection: Partial<Record<Category, unknown>>) {
  return Object.fromEntries(categoryIds.map(category => {
    const options = selectableLists.filter(list => list.category === category)
    return [category, options.find(list => list.id === selection[category]) ?? options[0]]
  })) as Record<Category, WordList>
}

/** Look up a rule only in the matching grammatical category. */
export function entryRule(category: Category, entry: Entry) {
  if (!entry.rule) return undefined
  const rules = category === 'particles' ? particleRules : category === 'conjugations' ? conjugationRules : {}
  return Object.hasOwn(rules, entry.rule) ? rules[entry.rule] : undefined
}
