/**
 * Overview & Purpose: Schedule typed recall with clean streaks and intervening cards.
 *
 * Architectural Relationships: Used by Recall and validated by storage imports.
 *
 * External Resources: None.
 *
 * Notes: Each list owns an independent clock that advances after a completed card.
 */


/** Persisted history for an entry, including due-card clock and total failures. */
export interface RecallProgress {
  streak: number
  due: number
  failures: number
  history: { at: number; outcome: 'clean' | 'corrected' | 'review' }[]
}

export interface DeckProgress {
  clock: number
  entries: Record<string, RecallProgress>
}

export const emptyDeck: DeckProgress = { clock: 0, entries: {} }

/** Prefer due cards, then failures. An early review can fill a spacing gap without earning credit. */
export function nextRecall(ids: string[], progress: DeckProgress, lastId?: string) {
  const progressFor = (id: string) => progress.entries[id]
  const pending = ids.filter(id => (progressFor(id)?.streak ?? 0) < 4)
  if (!pending.length) return null
  const due = pending.filter(id => (progressFor(id)?.due ?? 0) <= progress.clock)
  if (due.length) {
    const candidates = due.filter(id => id !== lastId)
    const deck = candidates.length ? candidates : due
    deck.sort((left, right) =>
      (progressFor(right)?.failures ?? 0) - (progressFor(left)?.failures ?? 0) ||
      (progressFor(left)?.due ?? 0) - (progressFor(right)?.due ?? 0))
    return { id: deck[0], review: false }
  }

  const reviewIds = ids.filter(id => id !== lastId)
  if (ids.length === 1 || !reviewIds.length) return { id: pending[0], review: true }
  reviewIds.sort((left, right) => (progressFor(left)?.history.at(-1)?.at ?? -1) - (progressFor(right)?.history.at(-1)?.at ?? -1))
  return { id: reviewIds[0], review: true }
}

/** Progress counts completed cards. Single-card decks can practice but require other cards for mastery. */
export function finishRecall(progress: DeckProgress, id: string, failed: boolean, review: boolean, deckSize: number): DeckProgress {
  const previous = progress.entries[id] ?? { streak: 0, due: 0, failures: 0, history: [] }
  const clock = progress.clock + Number(!review || deckSize > 1)
  const streak = failed ? 0 : review ? previous.streak : Math.min(4, previous.streak + 1)
  const due = failed ? clock + Math.min(1, deckSize - 1) : review ? previous.due : clock + (streak === 3 ? 4 : 2)
  const outcome: RecallProgress['history'][number]['outcome'] = failed ? 'corrected' : review ? 'review' : 'clean'
  return {
    clock,
    entries: { ...progress.entries, [id]: {
      streak, due, failures: previous.failures,
      history: [...previous.history, { at: progress.clock, outcome }].slice(-100),
    } },
  }
}

/** Mark a failed attempt immediately so refreshing after a reveal does not preserve the streak. */
export function markRecallFailure(progress: DeckProgress, id: string): DeckProgress {
  const previous = progress.entries[id] ?? { streak: 0, due: 0, failures: 0, history: [] }
  return { ...progress, entries: { ...progress.entries, [id]: { ...previous, streak: 0, failures: previous.failures + 1 } } }
}
