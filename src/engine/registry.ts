/**
 * Overview & Purpose: Resolve active vocabulary and preserve stable identities across edits.
 *
 * Architectural Relationships: All exercise modes and settings consume this registry.
 *
 * External Resources: Authored lexical and grammar catalogs.
 *
 * Notes: Edited built-in lists shadow fresh defaults by ID.
 */


import { conjugationRules, grammarLists, particleRules } from '../data/grammar'
import { categories, categoryIds } from '../data/model'
import type { Category, Entry, Selection, WordList } from '../data/model'
import { lexicalLists } from '../data/words'

export const builtInLists = [...lexicalLists, ...grammarLists]
export const defaultSelection = Object.fromEntries(categoryIds.map(category => [category, category + '-1'])) as Selection

/** Merge list overrides and custom lists while retaining built-in display order. */
export function allLists(custom: WordList[]) {
  return Array.from(new Map([...builtInLists, ...custom].map(list => [list.id, list])).values())
}

/** Return the selected list in each category, with a category-local fallback for obsolete IDs. */
export function activeLists(lists: WordList[], selection: Selection) {
  return Object.fromEntries(categoryIds.map(category => {
    const options = lists.filter(list => list.category === category)
    return [category, options.find(list => list.id === selection[category]) ?? options[0]]
  })) as Record<Category, WordList>
}

/** Look up a rule only in the matching grammatical category. */
export function entryRule(category: Category, entry: Entry) {
  if (!entry.rule) return undefined
  const rules = category === 'particles' ? particleRules : category === 'conjugations' ? conjugationRules : {}
  return Object.hasOwn(rules, entry.rule) ? rules[entry.rule] : undefined
}

/** Package one deck independently from an entire learning backup. */
export function exportList(list: WordList) {
  return { kind: 'korean-study-list', version: 1, list }
}

/** Validate the list envelope and return an independent copy with a new list identity. */
export function importList(value: unknown, newId: string): WordList {
  if (!record(value) || value.kind !== 'korean-study-list' || value.version !== 1 || !isList(value.list)) {
    throw new Error('Choose a vocabulary list exported by this tool, using the version 1 list format.')
  }
  return { ...value.list, id: newId }
}

/** Recognize a safe plain JSON record. */
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Constrain user-facing content and reject malformed IDs, fields, and grammar references. */
export function isList(value: unknown): value is WordList {
  if (!record(value) || typeof value.category !== 'string' || !Object.hasOwn(categories, value.category)) return false
  if (!validId(value.id) || !shortText(value.name) || !Array.isArray(value.entries) || value.entries.length > 1000) return false
  const ids = new Set<string>()
  return value.entries.every(entry => {
    if (!record(entry) || !validId(entry.id) || ids.has(entry.id) || !shortText(entry.korean) ||
      !shortText(entry.english) || !/[가-힣]/.test(entry.korean)) return false
    ids.add(entry.id)
    if (entry.irregular !== undefined && !['b', 'd', 'reu', 's', 'h'].includes(entry.irregular as string)) return false
    if (['tags', 'alternatives'].some(key => entry[key] !== undefined &&
      (!Array.isArray(entry[key]) || entry[key].length > 40 || !entry[key].every(shortText)))) return false
    if (['note', 'example'].some(key => entry[key] !== undefined &&
      (typeof entry[key] !== 'string' || entry[key].length > 2000))) return false
    if (value.category === 'particles' || value.category === 'conjugations') {
      if (typeof entry.rule !== 'string') return false
      const rule = entryRule(value.category, entry as unknown as Entry)
      return Boolean(rule && rule.korean === entry.korean && rule.english === entry.english)
    }
    return entry.rule === undefined
  })
}

/** Exclude magic object property names and bound the length of persistent keys. */
export function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,99}$/.test(value) && !Object.hasOwn(Object.prototype, value)
}

function shortText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 400
}
