/** Weighted vocabulary recall. Existing backup history remains usable across upgrades. */
export interface RecallProgress {
  everClean?: boolean
  history: { at: number; outcome: 'clean' | 'corrected' | 'review' }[]
}

export interface DeckProgress {
  clock: number
  entries: Record<string, RecallProgress>
}

export const emptyDeck: DeckProgress = { clock: 0, entries: {} }

function recalledCleanly(entry?: RecallProgress): boolean {
  return entry?.everClean === true || entry?.history.some(event => event.outcome === 'clean') === true
}

/** Recent misses carry more weight. As other cards are answered, the effect fades. */
export function nextRecall(ids: string[], progress: DeckProgress, lastId?: string, random = Math.random): string | null {
  if (!ids.length) return null
  const learning = ids.find(id => !recalledCleanly(progress.entries[id]))
  if (learning && !progress.entries[learning]?.history.length) return learning
  const available = learning ? ids.filter(id => id === learning || recalledCleanly(progress.entries[id])) : ids
  const pool = available.filter(id => available.length === 1 || id !== lastId)
  const weights = pool.map(id => {
    const latest = progress.entries[id]?.history.filter(event => event.outcome !== 'review').at(-1)
    if (!latest) return 1
    const recency = 1 / (1 + Math.max(0, progress.clock - latest.at - 1) / 8)
    return 1 + (latest.outcome === 'corrected' ? 3 : -0.6) * recency
  })
  let draw = random() * weights.reduce((sum, weight) => sum + weight, 0)
  for (let index = 0; index < pool.length; index++) {
    draw -= weights[index]
    if (draw < 0) return pool[index]
  }
  return pool[pool.length - 1]
}

/** Record the first result so copying a revealed answer does not erase a miss. */
export function recordRecall(progress: DeckProgress, id: string, correct: boolean): DeckProgress {
  const history = progress.entries[id]?.history ?? []
  const outcome = correct ? 'clean' : 'corrected'
  return { clock: progress.clock + 1, entries: { ...progress.entries, [id]: {
    everClean: correct || recalledCleanly(progress.entries[id]),
    history: [...history, { at: progress.clock, outcome } as const].slice(-100),
  } } }
}
