/**
 * Overview & Purpose: Present ungraded flashcards and spaced typing practice.
 *
 * Architectural Relationships: Uses the registry, recall scheduler, and shared controls.
 *
 * External Resources: None.
 *
 * Notes: Local input resets on deck changes; study history remains independent for each deck and direction.
 */


import { useId, useState } from 'react'
import { categories, categoryIds } from '../data/model'
import type { Category, WordList } from '../data/model'
import { matchesAnswer, matchesEnglishAnswer, recallCard, shuffle } from '../engine/exercises'
import type { RecallDirection } from '../engine/exercises'
import { emptyDeck, recordRecall, nextRecall } from '../engine/mastery'
import type { DeckProgress } from '../engine/mastery'
import { AnswerForm, DirectionSwitch, Empty, Icon, Korean, ListSelect, StandalonePronunciationNote, Transform } from './shared'
import type { Save, SelectList } from './shared'

import { GrammarList } from './GrammarList'
import { pictureCategories, pictureClues } from '../data/pictures'

type RecallPrompt = RecallDirection | 'image-to-ko'
type Mode = 'mental' | 'typing'

/** Display deck selection and the two recall modes. */
export function Recall({ category, setCategory, deck: selectedDeck, lists, onSelect, save, progressByDeck }: {
  category: Category; setCategory: (category: Category) => void; deck: WordList; lists: WordList[];
  onSelect: SelectList; save: Save; progressByDeck: Record<string, DeckProgress>
}) {
  const [mode, setMode] = useState<Mode>('mental')
  const [direction, setDirection] = useState<RecallPrompt>('en-to-ko')
  const pictures = direction === 'image-to-ko'
  const deck = pictures ? { ...selectedDeck, entries: selectedDeck.entries.filter(entry => pictureClues.has(entry.korean)) } : selectedDeck
  const progressKey = direction === 'en-to-ko' ? deck.id : `${deck.id}-${direction}`
  const progress = progressByDeck[progressKey] ?? emptyDeck
  const sessionKey = `${progressKey}:${deck.entries.map(entry => entry.id).join(',')}`
  return <>
    <div className="section-heading">
      <div><h1>Vocabulary Recall</h1><p>Practice bringing Korean words and patterns to mind.</p></div>
      <div className="segmented" aria-label="Recall mode">
        <button aria-pressed={mode === 'mental'} onClick={() => setMode('mental')}>Mental Recall</button>
        <button aria-pressed={mode === 'typing'} onClick={() => setMode('typing')}>Typing Practice</button>
      </div>
    </div>
    <div className="recall-workspace">
      <section className="study-main" aria-label="Flashcard practice">
        <div className="panel deck-controls">
          <label className="field">Category<select aria-label="Category" value={category} onChange={event => setCategory(event.target.value as Category)}>
            {(pictures ? pictureCategories : categoryIds).map(id => <option key={id} value={id}>{categories[id]}</option>)}
          </select></label>
          <ListSelect category={category} lists={lists} selected={deck.id} onSelect={onSelect} />
          <DirectionSwitch direction={direction} onChange={setDirection} label="Recall direction" onImage={() => {
            if (!pictureCategories.includes(category)) setCategory('nouns')
            setDirection('image-to-ko')
          }} />
        </div>
        {deck.entries.length ? mode === 'mental'
          ? <MentalRecall key={sessionKey} deck={deck} direction={direction} />
          : <TypingRecall key={sessionKey} deck={deck} direction={direction} progressKey={progressKey} progress={progress} save={save} />
          : <Empty title={pictures ? 'No pictures in this list' : 'This list is empty'}><p>Choose another vocabulary list to practice.</p></Empty>}
      </section>
    </div>
  </>
}

/** Show short instructions when the learner opens the information button. */
function CardHeader({ category, help, counter }: { category: Category; help: string; counter?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return <>
    <div className="card-meta"><span>{categories[category]}</span>
      <div className="button-row">{counter}
        {(category === 'particles' || category === 'conjugations') && <GrammarList category={category} />}
        <button className="text-button recall-info" aria-label="How to practice" aria-expanded={open} aria-controls={id}
          onClick={() => setOpen(value => !value)}><Icon name="info" /></button>
      </div>
    </div>
    <p id={id} hidden={!open} className="inline-note">{help}</p>
  </>
}

/** Load the bundled illustration with a descriptive alternative for screen readers. */
function PicturePrompt({ word }: { word: string }) {
  const clue = pictureClues.get(word)!
  const src = new URL(`../assets/pictures/${clue.asset}.svg`, import.meta.url).href
  return <img className="recall-picture" src={src} alt={clue.description} width={144} height={144} />
}

/** Present a local, ungraded deck whose order can be reshuffled independently. */
function MentalRecall({ deck, direction }: { deck: WordList; direction: RecallPrompt }) {
  const [order, setOrder] = useState(deck.entries.map(entry => entry.id))
  const [position, setPosition] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const entry = deck.entries.find(candidate => candidate.id === order[position]) ?? deck.entries[0]
  const card = recallCard(deck.category, entry, direction === 'image-to-ko' ? 'en-to-ko' : direction)
  const reading = direction === 'ko-to-en'
  const word = flipped ? card.answer : card.prompt
  const koreanFace = reading ? !flipped : flipped || Boolean(card.transformation)
  const caption = reading
    ? null
    : flipped ? card.transformation?.meaning ?? entry.english : card.transformation?.originalMeaning
  return <div className="panel recall-panel">
    <CardHeader category={deck.category} counter={`Card ${position + 1} of ${order.length}`} help={reading ? "Recall the English meaning, then flip to check." : "Recall the Korean word, then flip to check."} />
    <div className="recall-face" aria-live="polite">
      <span className="eyebrow">{flipped ? 'Answer' : direction === 'image-to-ko' ? 'Picture prompt' : reading || card.transformation ? card.cue : 'English prompt'}</span>
      {direction === 'image-to-ko' && !flipped ? <PicturePrompt word={entry.korean} /> :
        <div className="recall-word">{koreanFace ? <Korean>{word}</Korean> : word}</div>}
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

/** Show typed feedback and record the first result for the next draw. */
function TypingRecall({ deck, direction, progressKey, progress, save }: {
  deck: WordList; direction: RecallPrompt; progressKey: string; progress: DeckProgress; save: Save
}) {
  const ids = deck.entries.map(entry => entry.id)
  const [current, setCurrent] = useState(() => nextRecall(ids, progress))
  const [input, setInput] = useState('')
  const [failed, setFailed] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!current) return null
  const entry = deck.entries.find(candidate => candidate.id === current)!
  const card = recallCard(deck.category, entry, direction === 'image-to-ko' ? 'en-to-ko' : direction)
  const reading = direction === 'ko-to-en'

  /** Store the first failure immediately while keeping the current card open for correction. */
  async function reveal() {
    if (failed || busy || !current) return
    setBusy(true)
    const saved = await save(state => ({ ...state, recall: { ...state.recall,
      [progressKey]: recordRecall(state.recall[progressKey] ?? emptyDeck, current, false),
    } }))
    setFailed(saved)
    setBusy(false)
  }

  async function check() {
    if (!current || busy || correct) return
    const accepted = [card.answer, ...card.alternatives ?? []]
    const matches = reading ? matchesEnglishAnswer(input, accepted) : matchesAnswer(input, accepted)
    setWrong(!matches)
    if (!matches) { await reveal(); return }
    if (failed) { setCorrect(true); return }
    setBusy(true)
    const saved = await save(state => ({ ...state, recall: { ...state.recall,
      [progressKey]: recordRecall(state.recall[progressKey] ?? emptyDeck, current, true),
    } }))
    setCorrect(saved)
    setBusy(false)
  }

  return <div className="panel recall-panel" data-grade={correct ? 'correct' : wrong ? 'wrong' : undefined}>
    <CardHeader category={deck.category} help="Recall each new word on your first try to unlock the next. After the whole list is unlocked, missed words come back more often." />
    <div className="recall-face typing-face">
      <span className="eyebrow">{direction === 'image-to-ko' ? 'Picture prompt' : reading || card.transformation ? card.cue : 'English prompt'}</span>
      {direction === 'image-to-ko' ? <PicturePrompt word={entry.korean} /> :
        <div className="recall-word">{reading || card.transformation ? <Korean>{card.prompt}</Korean> : card.prompt}</div>}
      {reading && <StandalonePronunciationNote word={card.prompt} />}
    </div>
    <AnswerForm value={input} onChange={value => { setInput(value); setWrong(false) }} submit={() => void check()} disabled={correct || busy} language={reading ? 'en' : 'ko'} />
    <div className="feedback" aria-live="polite">
      {correct && <p className="success"><Icon name="check" /> {failed ? 'Correction complete.' : 'Correct.'}</p>}
      {failed && !correct && <p className="retry">{wrong ? 'Incorrect.' : 'Answer'} {reading ? <strong>{card.answer}</strong> : <Korean>{card.answer}</Korean>}.</p>}
      {correct && reading && <p className="inline-note">{card.answer}</p>}
      {(failed || correct) && !reading && <StandalonePronunciationNote word={card.answer} />}
    </div>
    {(failed || correct) && card.transformation && <Transform example={card.transformation} />}
    {(failed || correct) && card.explanation && <p className="inline-note">{card.explanation}</p>}
    <div className="card-actions">
      <button className="button quiet" disabled={failed || correct || busy} onClick={() => void reveal()}>Reveal answer</button>
      <button className="button" disabled={busy || (!correct && !failed)} onClick={() => {
        setCurrent(nextRecall(ids, progress, current)); setInput(''); setFailed(false); setWrong(false); setCorrect(false)
      }}>Next <Icon name="arrow" /></button>
    </div>
  </div>
}
