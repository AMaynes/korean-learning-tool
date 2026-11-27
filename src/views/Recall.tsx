/**
 * Overview & Purpose: Present ungraded flashcards and spaced typing practice.
 *
 * Architectural Relationships: Uses the registry, recall scheduler, and shared controls.
 *
 * External Resources: None.
 *
 * Notes: Local input resets on deck changes; study history remains independent for each deck and direction.
 */


import { useEffect, useId, useState } from 'react'
import { categories } from '../data/model'
import type { Category, WordList } from '../data/model'
import { matchesAnswer, matchesEnglishAnswer, recallCard, shuffle } from '../engine/exercises'
import type { RecallDirection } from '../engine/exercises'
import { emptyDeck, recordRecall, nextRecall } from '../engine/mastery'
import type { StudyState } from '../engine/storage'
import type { DeckProgress } from '../engine/mastery'
import { AnswerForm, DirectionSwitch, Empty, Icon, Korean, VocabularyCategory, ListSelect, speakKorean, stopKoreanAudio, StandalonePronunciationNote, Transform } from './shared'
import type { Save, SelectList } from './shared'

import { MindPalace } from './MindPalace'
import { GrammarList } from './GrammarList'

type RecallPrompt = RecallDirection | 'sound-to-en'
type Mode = 'mental' | 'typing' | 'palace'

/** Display deck selection and the two recall modes. */
export function Recall({ category, setCategory, deck, lists, onSelect, save, state }: {
  category: Category; setCategory: (category: Category) => void; deck: WordList; lists: WordList[];
  onSelect: SelectList; save: Save; state: StudyState
}) {
  const [mode, setMode] = useState<Mode>('mental')
  const [direction, setDirection] = useState<RecallPrompt>('en-to-ko')
  const progressKey = direction === 'en-to-ko' ? deck.id : `${deck.id}-${direction}`
  const progress = state.recall[progressKey] ?? emptyDeck
  const sessionKey = `${progressKey}:${deck.entries.map(entry => entry.id).join(',')}`
  return <>
    <div className="section-heading">
      <div><h1>Vocabulary Recall</h1><p>Practice bringing Korean words and patterns to mind.</p></div>
      <div className="segmented" aria-label="Recall mode">
        <button aria-pressed={mode === 'mental'} onClick={() => setMode('mental')}>Mental Recall</button>
        <button aria-pressed={mode === 'typing'} onClick={() => setMode('typing')}>Typing Practice</button>
        <button aria-pressed={mode === 'palace'} onClick={() => setMode('palace')}>Mind Palace</button>
      </div>
    </div>
    <div className="recall-workspace">
      <section className="study-main" aria-label="Flashcard practice">
        {mode !== 'palace' && <div className="panel deck-controls">
          <VocabularyCategory category={category} selected={deck.id} onCategory={setCategory} onSelect={onSelect} />
          {category !== 'topics' && <ListSelect category={category} lists={lists} selected={deck.id} onSelect={onSelect} />}
          <DirectionSwitch direction={direction} onChange={setDirection} label="Recall direction" onSound={() => setDirection('sound-to-en')} />
        </div>}
        {mode === 'palace' ? <MindPalace state={state} save={save} /> : deck.entries.length ? mode === 'mental'
          ? <MentalRecall key={sessionKey} deck={deck} direction={direction} />
          : <TypingRecall key={sessionKey} deck={deck} direction={direction} progressKey={progressKey} progress={progress} save={save} />
          : <Empty title="This list is empty"><p>Choose another vocabulary list to practice.</p></Empty>}
      </section>
    </div>
  </>
}

/** Show short instructions when the learner opens the information button. */
function CardHeader({ category, name, help, counter }: { category: Category; name: string; help: string; counter?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return <>
    <div className="card-meta"><span>{category === 'topics' ? name : categories[category]}</span>
      <div className="button-row">{counter}
        {(category === 'particles' || category === 'conjugations') && <GrammarList category={category} />}
        <button className="text-button recall-info" aria-label="How to practice" aria-expanded={open} aria-controls={id}
          onClick={() => setOpen(value => !value)}><Icon name="info" /></button>
      </div>
    </div>
    <p id={id} hidden={!open} className="inline-note">{help}</p>
  </>
}

function SoundPrompt({ text }: { text: string }) {
  const [blocked, setBlocked] = useState(false)
  function play() {
    setBlocked(false)
    speakKorean(text, 1, () => {}, () => setBlocked(true))
  }
  useEffect(() => {
    play()
    return stopKoreanAudio
  }, [text])
  return <div>
    <button className="button" onClick={play}><Icon name="sound" /> Play sound</button>
    {blocked && <p role="status">Tap Play sound to try again.</p>}
  </div>
}

/** Present a local, ungraded deck whose order can be reshuffled independently. */
function MentalRecall({ deck, direction }: { deck: WordList; direction: RecallPrompt }) {
  const [order, setOrder] = useState(deck.entries.map(entry => entry.id))
  const [position, setPosition] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const entry = deck.entries.find(candidate => candidate.id === order[position]) ?? deck.entries[0]
  const sound = direction === 'sound-to-en'
  const reading = sound || direction === 'ko-to-en'
  const card = recallCard(deck.category, entry, reading ? 'ko-to-en' : 'en-to-ko')
  const word = flipped ? card.answer : card.prompt
  const koreanFace = reading ? !flipped : flipped || Boolean(card.transformation)
  const caption = reading
    ? null
    : flipped ? card.transformation?.meaning ?? entry.english : card.transformation?.originalMeaning
  return <div className="panel recall-panel">
    <CardHeader category={deck.category} name={deck.name} counter={`Card ${position + 1} of ${order.length}`} help={reading ? "Recall the English meaning, then flip to check." : "Recall the Korean word, then flip to check."} />
    <div className="recall-face" aria-live="polite">
      <span className="eyebrow">{flipped ? 'Answer' : sound ? 'Listen for the meaning' : reading || card.transformation ? card.cue : 'English prompt'}</span>
      {sound && !flipped ? <SoundPrompt key={entry.id} text={card.prompt} /> :
        <div className="recall-word">{koreanFace ? <Korean>{word}</Korean> : word}</div>}
      {sound && flipped && <Korean>{card.prompt}</Korean>}
      {!sound && koreanFace && <StandalonePronunciationNote word={word} />}
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
  const [draw, setDraw] = useState(0)
  const [current, setCurrent] = useState(() => nextRecall(ids, progress))
  const [input, setInput] = useState('')
  const [failed, setFailed] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [busy, setBusy] = useState(false)
  if (!current) return null
  const entry = deck.entries.find(candidate => candidate.id === current)!
  const sound = direction === 'sound-to-en'
  const reading = sound || direction === 'ko-to-en'
  const card = recallCard(deck.category, entry, reading ? 'ko-to-en' : 'en-to-ko')

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
    <CardHeader category={deck.category} name={deck.name} help="Recall each new word on your first try to unlock the next. After the whole list is unlocked, missed words come back more often." />
    <div className="recall-face typing-face">
      <span className="eyebrow">{sound ? 'Listen for the meaning' : reading || card.transformation ? card.cue : 'English prompt'}</span>
      {sound ? <SoundPrompt key={draw} text={card.prompt} /> :
        <div className="recall-word">{reading || card.transformation ? <Korean>{card.prompt}</Korean> : card.prompt}</div>}
      {!sound && reading && <StandalonePronunciationNote word={card.prompt} />}
    </div>
    <AnswerForm value={input} onChange={value => { setInput(value); setWrong(false) }} submit={() => void check()} disabled={correct || busy} language={reading ? 'en' : 'ko'} />
    <div className="feedback" aria-live="polite">
      {correct && <p className="success"><Icon name="check" /> {failed ? 'Correction complete.' : 'Correct.'}</p>}
      {failed && !correct && <p className="retry">{wrong ? 'Incorrect.' : 'Answer'} {reading ? <strong>{card.answer}</strong> : <Korean>{card.answer}</Korean>}.</p>}
      {sound && (correct || failed) && <Korean>{card.prompt}</Korean>}
      {correct && reading && <p className="inline-note">{card.answer}</p>}
      {(failed || correct) && !reading && <StandalonePronunciationNote word={card.answer} />}
    </div>
    {(failed || correct) && card.transformation && <Transform example={card.transformation} />}
    {(failed || correct) && card.explanation && <p className="inline-note">{card.explanation}</p>}
    <div className="card-actions">
      <button className="button quiet" disabled={failed || correct || busy} onClick={() => void reveal()}>Reveal answer</button>
      <button className="button" disabled={busy || (!correct && !failed)} onClick={() => {
        setDraw(value => value + 1); setCurrent(nextRecall(ids, progress, current)); setInput(''); setFailed(false); setWrong(false); setCorrect(false)
      }}>Next <Icon name="arrow" /></button>
    </div>
  </div>
}
