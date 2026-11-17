/**
 * Overview & Purpose: Present ungraded flashcards and spaced typing practice.
 *
 * Architectural Relationships: Uses the registry, recall scheduler, and shared controls.
 *
 * External Resources: None.
 *
 * Notes: Local input resets on deck changes; study history remains independent for each deck and direction.
 */


import { useState } from 'react'
import { categories, categoryIds } from '../data/model'
import type { Category, WordList } from '../data/model'
import { matchesAnswer, matchesEnglishAnswer, recallCard, shuffle } from '../engine/exercises'
import type { RecallDirection } from '../engine/exercises'
import { emptyDeck, finishRecall, markRecallFailure, nextRecall } from '../engine/mastery'
import type { DeckProgress } from '../engine/mastery'
import { AnswerForm, Empty, Icon, Korean, ListSelect, StandalonePronunciationNote, Transform } from './shared'
import type { Save, SelectList } from './shared'

type Mode = 'mental' | 'typing'

/** Display list selection, independent practice modes, and current deck progress. */
export function Recall({ category, setCategory, deck, lists, onSelect, save, progressByDeck }: {
  category: Category; setCategory: (category: Category) => void; deck: WordList; lists: WordList[];
  onSelect: SelectList; save: Save; progressByDeck: Record<string, DeckProgress>
}) {
  const [mode, setMode] = useState<Mode>('mental')
  const [direction, setDirection] = useState<RecallDirection>('en-to-ko')
  const [revision, setRevision] = useState(0)
  const reading = direction === 'ko-to-en'
  const progressKey = reading ? `${deck.id}-ko-to-en` : deck.id
  const progress = progressByDeck[progressKey] ?? emptyDeck
  const sessionKey = `${progressKey}:${revision}:${deck.entries.map(entry => entry.id).join(',')}`
  const mastered = deck.entries.filter(entry => progress.entries[entry.id]?.streak === 4).length
  const activeCount = deck.entries.filter(entry => {
    const info = progress.entries[entry.id]
    return info && info.streak !== 4
  }).length
  const pct = Math.round(mastered * 100 / Math.max(1, deck.entries.length))
  return <>
    <div className="section-heading">
      <div><h1>Vocabulary Recall</h1><p>Practice bringing Korean words and patterns to mind.</p></div>
      <div className="segmented" aria-label="Recall mode">
        <button aria-pressed={mode === 'mental'} onClick={() => setMode('mental')}>Mental Recall</button>
        <button aria-pressed={mode === 'typing'} onClick={() => setMode('typing')}>Typing Practice</button>
      </div>
    </div>
    <div className="study-layout">
      <section className="study-main" aria-label="Flashcard practice">
        <div className="panel deck-controls">
          <label className="field">Category<select aria-label="Category" value={category} onChange={event => setCategory(event.target.value as Category)}>
            {categoryIds.map(id => <option key={id} value={id}>{categories[id]}</option>)}
          </select></label>
          <ListSelect category={category} lists={lists} selected={deck.id} onSelect={onSelect} />
          <div className="segmented recall-direction" role="group" aria-label="Recall direction">
            <button type="button" aria-pressed={!reading} onClick={() => setDirection('en-to-ko')}>English → Korean</button>
            <button type="button" aria-pressed={reading} onClick={() => setDirection('ko-to-en')}>Korean → English</button>
          </div>
        </div>
        {deck.entries.length ? mode === 'mental'
          ? <MentalRecall key={sessionKey} deck={deck} direction={direction} />
          : <TypingRecall key={sessionKey} deck={deck} direction={direction} progressKey={progressKey} progress={progress} save={save} />
          : <Empty title="This list is empty"><p>Add entries from the Vocabulary Library or switch decks.</p></Empty>}
      </section>
      <aside className="study-aside" aria-label="Deck information">
        <div className="panel aside-panel">
          <div className="aside-title"><Icon name="grid" /> <h2>Deck progress</h2></div>
          <div className="mastery-value"><strong>{mastered}<span> / {deck.entries.length}</span></strong><small>mastered</small></div>
          <progress aria-label="Mastery progress" max={100} value={pct} />
          <dl className="stats">
            <div><dt><i className="dot mastered" />Mastered</dt><dd>{mastered}</dd></div>
            <div><dt><i className="dot learning" />In practice</dt><dd>{activeCount}</dd></div>
            <div><dt><i className="dot" />New</dt><dd>{deck.entries.length - mastered - activeCount}</dd></div>
          </dl>
        </div>
        <div className="panel aside-panel note-panel">
          <div className="aside-title"><Icon name="info" /><h2>{mode === 'mental' ? 'How to practice' : 'How mastery works'}</h2></div>
          <p>{mode === 'mental' ? (reading ? 'Read the Korean and recall its English meaning. Flip the card to compare.' : 'Recall the answer in Hangul, then flip the card to compare. Mental recall is ungraded.') : 'Complete three clean recalls with two cards in between, then pass a fourth after four intervening cards.'}</p>
          {mode === 'typing' && deck.entries.length > 0 && <button className="text-button" onClick={async () => {
            if (!window.confirm('Reset this list’s typing progress for the selected direction?')) return
            const ok = await save(state => {
              const recall = { ...state.recall }
              delete recall[progressKey]
              return { ...state, recall }
            })
            if (ok) setRevision(value => value + 1)
          }}>Reset this direction’s progress</button>}
        </div>
      </aside>
    </div>
  </>
}

/** Present a local, ungraded deck whose order can be reshuffled independently. */
function MentalRecall({ deck, direction }: { deck: WordList; direction: RecallDirection }) {
  const [order, setOrder] = useState(deck.entries.map(entry => entry.id))
  const [position, setPosition] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const entry = deck.entries.find(candidate => candidate.id === order[position]) ?? deck.entries[0]
  const card = recallCard(deck.category, entry, direction)
  const reading = direction === 'ko-to-en'
  const word = flipped ? card.answer : card.prompt
  const koreanFace = reading ? !flipped : flipped || Boolean(card.transformation)
  const caption = reading
    ? (flipped ? null : 'Recall the English meaning.')
    : flipped ? card.transformation?.meaning ?? entry.english : card.transformation?.originalMeaning ?? 'Recall the Korean word.'
  return <div className="panel recall-panel">
    <div className="card-meta"><span>{categories[deck.category]}</span><span>Card {position + 1} of {order.length}</span></div>
    <div className="recall-face" aria-live="polite">
      <span className="eyebrow">{flipped ? 'Answer' : reading || card.transformation ? card.cue : 'English prompt'}</span>
      <div className="recall-word">{koreanFace ? <Korean>{word}</Korean> : word}</div>
      {koreanFace && <StandalonePronunciationNote word={word} />}
      {caption && <p>{caption}</p>}
    </div>
    {flipped && card.transformation && <Transform example={card.transformation} />}
    {flipped && card.explanation && <p className="inline-note">{card.explanation}</p>}
    <div className="card-actions">
      <button className="button quiet" onClick={() => { setOrder(shuffle(order)); setPosition(0); setFlipped(false) }}><Icon name="shuffle" /> Shuffle</button>
      <div className="button-row">
        <button className="button primary" onClick={() => setFlipped(value => !value)}><Icon name="swap" />{flipped ? 'Show prompt' : 'Flip card'}</button>
        <button className="button" onClick={() => { setPosition((position + 1) % order.length); setFlipped(false) }}>Next <Icon name="arrow" /></button>
      </div>
    </div>
  </div>
}

/** Enforce correction before advancing and persist the scheduling result once. */
function TypingRecall({ deck, direction, progressKey, progress, save }: {
  deck: WordList; direction: RecallDirection; progressKey: string; progress: DeckProgress; save: Save
}) {
  const ids = deck.entries.map(entry => entry.id)
  const [current, setCurrent] = useState(() => nextRecall(ids, progress))
  const [input, setInput] = useState('')
  const [failed, setFailed] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!current) return <Empty title="Deck mastered"><p>Every entry has passed its fourth clean recall.</p></Empty>
  const entry = deck.entries.find(candidate => candidate.id === current.id)!
  const card = recallCard(deck.category, entry, direction)
  const reading = direction === 'ko-to-en'

  /** Store the first failure immediately while keeping the current card open for correction. */
  async function reveal() {
    if (failed || !current) return
    setFailed(true)
    await save(state => ({ ...state, recall: { ...state.recall, [progressKey]: markRecallFailure(state.recall[progressKey] ?? emptyDeck, current.id) } }))
  }

  /** Grade before showing the mastery update and locking the completed input. */
  async function check() {
    if (!current || busy || correct) return
    const accepted = [card.answer, ...card.alternatives ?? []]
    const matches = reading ? matchesEnglishAnswer(input, accepted) : matchesAnswer(input, accepted)
    if (!matches) { await reveal(); return }
    setBusy(true)
    const ok = await save(state => ({ ...state, recall: { ...state.recall,
      [progressKey]: finishRecall(state.recall[progressKey] ?? emptyDeck, current.id, failed, current.review, ids.length),
    } }))
    if (ok) setCorrect(true)
    setBusy(false)
  }

  return <div className="panel recall-panel">
    <div className="card-meta"><span>{categories[deck.category]}</span><span>{current.review ? 'Spacing review' : `Clean recalls ${progress.entries[entry.id]?.streak ?? 0} / 4`}</span></div>
    <div className="recall-face typing-face">
      <span className="eyebrow">{reading || card.transformation ? card.cue : 'English prompt'}</span>
      <div className="recall-word">{reading || card.transformation ? <Korean>{card.prompt}</Korean> : card.prompt}</div>
      {reading && <StandalonePronunciationNote word={card.prompt} />}
      {current.review && <p>{ids.length === 1 ? 'Add cards to this list to complete the spacing requirement.' : 'This review fills a spacing gap without adding mastery credit.'}</p>}
    </div>
    <AnswerForm value={input} onChange={setInput} submit={() => void check()} disabled={correct || busy} language={reading ? 'en' : 'ko'} />
    <div className="feedback" aria-live="polite">
      {correct && <p className="success"><Icon name="check" /> {failed ? 'Correction complete.' : 'Correct.'}</p>}
      {failed && !correct && <p className="retry">Type {reading ? <strong>{card.answer}</strong> : <Korean>{card.answer}</Korean>} correctly to continue.</p>}
      {correct && reading && <p className="inline-note">{card.answer}</p>}
      {(failed || correct) && !reading && <StandalonePronunciationNote word={card.answer} />}
    </div>
    {(failed || correct) && card.transformation && <Transform example={card.transformation} />}
    {(failed || correct) && card.explanation && <p className="inline-note">{card.explanation}</p>}
    <div className="card-actions">
      <button className="button quiet" disabled={failed || correct || busy} onClick={() => void reveal()}>Reveal answer</button>
      <button className="button" disabled={!correct} onClick={() => {
        setCurrent(nextRecall(ids, progress, current.id)); setInput(''); setFailed(false); setCorrect(false)
      }}>Next <Icon name="arrow" /></button>
    </div>
  </div>
}
