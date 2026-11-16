/**
 * Overview & Purpose: Persist and validate local study state and portable backups.
 *
 * Architectural Relationships: The app shell owns read/update operations.
 *
 * External Resources: IndexedDB database korean-learning-tool, version 1.
 *
 * Notes: Each read-modify-write is one IndexedDB transaction, serialized across tabs.
 */


import { categoryIds } from '../data/model'
import type { Selection, WordList } from '../data/model'
import type { DeckProgress } from './mastery'
import { allLists, defaultSelection, isList, record, validId } from './registry'

export const practiceModes = ['particles', 'conjugations', 'assembly', 'writing', 'dictation', 'conversation'] as const
export type PracticeMode = typeof practiceModes[number]
export type Difficulty = 'guided' | 'challenge'

/** Independent performance and difficulty for each exercise mode. */
export interface Score {
  attempts: number
  correct: number
  streak: number
  mastered: boolean
}

export interface StudyState {
  version: 1
  customLists: WordList[]
  selected: Selection
  recall: Record<string, DeckProgress>
  scores: Partial<Record<PracticeMode, Record<string, Score>>>
  difficulty: Partial<Record<PracticeMode, Difficulty>>
  theme: 'light' | 'dark' | 'system'
}

/** Create fresh state without sharing mutable records across consumers. */
export function defaults(): StudyState {
  return { version: 1, customLists: [], selected: { ...defaultSelection }, recall: {}, scores: {}, difficulty: {}, theme: 'system' }
}

const storeName = 'study'
const rootKey = 'state'
let openDatabase: Promise<IDBDatabase> | undefined

/** Share one upgrade-aware connection per tab. */
function database() {
  if (openDatabase) return openDatabase
  openDatabase = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('korean-learning-tool', 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Close other study tabs and reload to finish updating storage.'))
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); openDatabase = undefined }
      resolve(request.result)
    }
  }).catch(error => { openDatabase = undefined; throw error })
  return openDatabase
}

/** Load the persisted study state or current app defaults. */
export async function loadState(): Promise<StudyState> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(rootKey)
    request.onsuccess = () => resolve(request.result ?? defaults())
    request.onerror = () => reject(request.error)
  })
}

/** Apply a pure update inside an atomic browser transaction and resolve after commit. */
export async function updateState(change: (state: StudyState) => StudyState): Promise<StudyState> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.get(rootKey)
    let saved: StudyState
    request.onsuccess = () => {
      try {
        saved = change(request.result ?? defaults())
        store.put(saved, rootKey)
      } catch (error) {
        transaction.abort()
        reject(error)
      }
    }
    transaction.oncomplete = () => resolve(saved)
    transaction.onabort = () => reject(transaction.error ?? new Error('The browser could not save your study data.'))
  })
}

/** Record one completed exercise with a per-target streak and durable mastery. */
export function addScore(state: StudyState, mode: PracticeMode, id: string, correct: boolean): StudyState {
  const modeScores = state.scores[mode] ?? {}
  const score = modeScores[id] ?? { attempts: 0, correct: 0, streak: 0, mastered: false }
  const streak = correct ? score.streak + 1 : 0
  return { ...state, scores: { ...state.scores, [mode]: { ...modeScores, [id]: {
    attempts: score.attempts + 1, correct: score.correct + Number(correct), streak,
    mastered: score.mastered || streak >= 3,
  } } } }
}

/** Validate a full backup before allowing replacement of the live state. */
export function importBackup(value: unknown): StudyState {
  if (!record(value) || value.kind !== 'korean-study-backup' || !record(value.state)) throw new Error('Choose a full study backup exported by this tool.')
  const state = value.state
  if (state.version !== 1 || !Array.isArray(state.customLists) || state.customLists.length > 300 ||
    !state.customLists.every(isList) || new Set(state.customLists.map(list => list.id)).size !== state.customLists.length ||
    !record(state.selected) || !record(state.recall) || !record(state.scores) || !record(state.difficulty) ||
    !['light', 'dark', 'system'].includes(state.theme as string)) throw new Error('The backup is damaged or uses an unsupported version.')

  const lists = allLists(state.customLists)
  const invalidSelection = categoryIds.some(category => !lists.some(list => list.category === category && record(state.selected) && list.id === state.selected[category]))
  const invalidOverride = state.customLists.some(list => categoryIds.some(category =>
    list.id.startsWith(category + '-') && list.category !== category))
  const invalidRecall = Object.entries(state.recall).some(([id, deck]) => !validId(id) || !validDeck(deck))
  const invalidScores = Object.entries(state.scores).some(([mode, scores]) =>
    !practiceModes.includes(mode as PracticeMode) || !record(scores) || Object.values(scores).some(score => !validScore(score)))
  const invalidDifficulty = Object.entries(state.difficulty).some(([mode, level]) =>
    !practiceModes.includes(mode as PracticeMode) || (level !== 'guided' && level !== 'challenge'))
  if (invalidSelection || invalidOverride || invalidRecall || invalidScores || invalidDifficulty) throw new Error('The backup contains invalid study records.')
  return state as unknown as StudyState
}

function natural(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) < 1_000_000_000
}

/** Enforce recall invariants so schedules cannot get stuck after importing data. */
function validDeck(value: unknown): boolean {
  if (!record(value) || !natural(value.clock) || !record(value.entries)) return false
  return Object.entries(value.entries).every(([id, progress]) => validId(id) && record(progress) &&
    natural(progress.streak) && progress.streak <= 4 && natural(progress.due) && natural(progress.failures) &&
    Array.isArray(progress.history) && progress.history.length <= 100 && progress.history.every(entry =>
      record(entry) && natural(entry.at) && ['clean', 'corrected', 'review'].includes(entry.outcome as string)))
}

function validScore(value: unknown): boolean {
  return record(value) && natural(value.attempts) && natural(value.correct) && value.correct <= value.attempts &&
    natural(value.streak) && value.streak <= value.correct && typeof value.mastered === 'boolean'
}
