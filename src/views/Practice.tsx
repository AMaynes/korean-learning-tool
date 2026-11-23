/**
 * Overview & Purpose: Run grammar, dictation, and conversation exercises.
 *
 * Architectural Relationships: Uses active-deck generation, answer validation, and mode scores.
 *
 * External Resources: Bundled Korean audio clips.
 *
 * Notes: Unknown open-ended translations receive self-review feedback.
 */


import { useEffect, useMemo, useState } from 'react'
import type { Category, WordList } from '../data/model'
import { generate, matchesAnswer, matchesEnglishAnswer, shuffle, toEnglishPractice, toEnglishTargetPrefix } from '../engine/exercises'
import type { Exercise, RecallDirection } from '../engine/exercises'
import { addScore } from '../engine/storage'
import type { PracticeMode, StudyState } from '../engine/storage'
import { ActiveConfig, AnswerForm, DirectionSwitch, Empty, Icon, Korean, speakKorean, stopKoreanAudio, StandalonePronunciationNote, Transform } from './shared'
import type { Save, SelectList } from './shared'

const grammarModes = ['particles', 'conjugations', 'assembly', 'writing', 'decoding'] as const
const listeningModes = ['dictation', 'conversation'] as const
const labels: Record<PracticeMode, string> = {
  particles: 'Particle Practice', conjugations: 'Conjugation Practice', assembly: 'Sentence Assembly',
  decoding: 'Sentence Decoding', writing: 'Sentence Writing', dictation: 'Listening Dictation', conversation: 'Guided Conversation',
}

const forwardLabels: Partial<Record<PracticeMode, string>> = {
  particles: 'Apply the particle', conjugations: 'Apply the ending',
  dictation: 'Transcribe Korean', conversation: 'Reply in Korean',
}

const modeCategories: Record<PracticeMode, Category[]> = {
  particles: ['nouns', 'pronouns', 'particles'],
  conjugations: ['verbs', 'adjectives', 'conjugations'],
  assembly: ['nouns', 'pronouns', 'verbs', 'adjectives', 'particles', 'conjugations'],
  decoding: ['nouns', 'pronouns', 'verbs', 'adjectives', 'particles', 'conjugations'],
  writing: ['nouns', 'pronouns', 'verbs', 'adjectives', 'particles', 'conjugations'],
  dictation: ['nouns', 'pronouns', 'verbs', 'adjectives', 'particles', 'conjugations', 'sentences'],
  conversation: ['nouns', 'pronouns', 'verbs', 'adjectives', 'particles', 'conjugations'],
}

type Scope = 'both' | 'nouns' | 'pronouns' | 'verbs' | 'adjectives'

/** Provide exercise modes and their vocabulary and rule filters. */
export function Practice({ module, active, lists, state, onSelect, save }: {
  module: 'grammar' | 'listening'; active: Record<Category, WordList>; lists: WordList[];
  state: StudyState; onSelect: SelectList; save: Save
}) {
  const modes: readonly PracticeMode[] = module === 'grammar' ? grammarModes : listeningModes
  const [mode, setMode] = useState<PracticeMode>(modes[0])
  const [scope, setScope] = useState<Scope>('both')
  const [ruleFilter, setRuleFilter] = useState('')
  const [revision, setRevision] = useState(0)
  const [direction, setDirection] = useState<RecallDirection>('en-to-ko')
  const reading = mode !== 'decoding' && direction === 'ko-to-en'
  const ruleList = mode === 'particles' || mode === 'conjugations' ? active[mode] : undefined
  const validFilter = ruleList?.entries.some(entry => entry.id === ruleFilter) ? ruleFilter : ''
  const exercises = useMemo(() => {
    const generated = generate(mode, active, scope)
    const filtered = validFilter ? generated.filter(exercise => exercise.target === `${ruleList?.id}:${validFilter}`) : generated
    return reading ? filtered.map(exercise => toEnglishPractice(mode, exercise)) : filtered
  }, [mode, active, scope, validFilter, ruleList, reading])
  const scopeKey = modeCategories[mode].map(category => active[category].id).join(':')
  const exerciseKey = exercises.map(exercise => exercise.id).join(',')
  const targets = new Set(exercises.map(exercise => exercise.target))
  const scores = Object.entries(state.scores[mode] ?? {}).filter(([target]) => targets.has(target)).map(([, score]) => score)
  const correct = scores.reduce((total, score) => total + score.correct, 0)
  const attempts = scores.reduce((total, score) => total + score.attempts, 0)
  const mastered = scores.filter(score => score.mastered).length
  const filters = mode === 'particles' ? ['nouns', 'pronouns'] as const : ['verbs', 'adjectives'] as const

  return <>
    <div className="section-heading"><div><h1>{module === 'grammar' ? 'Grammar Trainer' : 'Listening & Conversation'}</h1>
      <p>{module === 'grammar' ? 'Practice individual rules, then use them to build complete sentences.' : 'Hear Korean, transcribe what you hear, and practice replying.'}</p></div></div>
    <div className="segmented mode-tabs" aria-label={module === 'grammar' ? 'Grammar exercise' : 'Listening exercise'}>
      {modes.map(value => <button key={value} aria-pressed={mode === value} onClick={() => {
        setMode(value); setScope('both'); setRuleFilter('')
      }}>{labels[value]}</button>)}
    </div>
    <div className="study-layout">
      <section className="study-main" aria-label={labels[mode]}>
        <details className="panel practice-selectors">
          <summary>Active vocabulary</summary>
          <ActiveConfig categories={modeCategories[mode]} lists={lists} active={active} onSelect={onSelect} />
        </details>
        {mode !== 'decoding' && <DirectionSwitch direction={direction} onChange={setDirection} forwardLabel={forwardLabels[mode]} />}
        {exercises.length ? <PracticeSession
          key={`${mode}:${direction}:${scopeKey}:${scope}:${validFilter}:${revision}:${exerciseKey}`}
          mode={mode} reading={reading} exercises={exercises} save={save}
        /> : <Empty title="No compatible exercises">
          <p>{ruleList ? 'Choose another vocabulary list, rule, or word category.' :
            'Choose compatible active lists. Generated sentences use the Present Polite ending and words that fit a sentence frame.'}</p>
        </Empty>}
      </section>
      <aside className="study-aside">
        {ruleList && <div className="panel aside-panel practice-options">
          <div className="aside-title"><Icon name="settings" /><h2>Practice options</h2></div>
          <label className="field">Word category<select aria-label="Word category" value={scope} onChange={event => setScope(event.target.value as Scope)}>
            <option value="both">Both active categories</option>
            {filters.map(filter => <option value={filter} key={filter}>{filter[0].toUpperCase() + filter.slice(1)}</option>)}
          </select></label>
          <label className="field">Grammar rule<select aria-label="Grammar rule" value={validFilter} onChange={event => setRuleFilter(event.target.value)}>
            <option value="">All active rules</option>
            {ruleList.entries.map(rule => <option value={rule.id} key={rule.id}>{rule.english}</option>)}
          </select></label>
        </div>}
        <div className="panel aside-panel">
          <div className="aside-title"><Icon name="grid" /><h2>Practice progress</h2></div>
          <dl className="stats">
            <div><dt>Checked</dt><dd>{attempts}</dd></div>
            <div><dt>Accuracy</dt><dd>{attempts ? Math.round(correct / attempts * 100) + '%' : '—'}</dd></div>
            <div><dt>Mastered</dt><dd>{mastered} / {targets.size}</dd></div>
          </dl>
          <p className="inline-note">Three correct checks in a row master a practice item.</p>
          <button className="text-button" onClick={async () => {
            if (!window.confirm(`Reset ${labels[mode]} progress for the selected direction?`)) return
            if (await save(previous => {
              const remaining = Object.entries(previous.scores[mode] ?? {}).filter(([target]) =>
                target.startsWith(toEnglishTargetPrefix) !== reading)
              const next = { ...previous.scores }
              if (remaining.length) next[mode] = Object.fromEntries(remaining)
              else delete next[mode]
              return { ...previous, scores: next }
            })) setRevision(value => value + 1)
          }}>Reset this direction’s progress</button>
        </div>
      </aside>
    </div>
  </>
}

/** Freeze one shuffled exercise queue until the learning scope changes. */
function PracticeSession({ mode, reading, exercises, save }: {
  mode: PracticeMode; reading: boolean; exercises: Exercise[]; save: Save
}) {
  const [order, setOrder] = useState(() => shuffle(exercises.map(exercise => exercise.id)))
  const [position, setPosition] = useState(0)
  const [round, setRound] = useState(0)
  const exercise = exercises.find(item => item.id === order[position]) ?? exercises[0]

  /** Shuffle each completed round while avoiding an immediate repeat. */
  function advance() {
    if (position + 1 < order.length) { setPosition(position + 1); return }
    const shuffled = shuffle(order)
    if (shuffled.length > 1 && shuffled[0] === exercise.id) shuffled.push(shuffled.shift()!)
    setRound(value => value + 1)
    setOrder(shuffled)
    setPosition(0)
  }

  if (mode === 'decoding') return <DecodingCard key={round + ':' + exercise.id + ':' + position} exercise={exercise}
    number={position + 1} total={order.length} advance={advance} save={save} />
  return <ExerciseCard key={exercise.id + ':' + position} mode={mode} reading={reading} exercise={exercise}
    number={position + 1} total={order.length} save={save} advance={advance} />
}

function DecodingCard({ exercise, number, total, advance, save }: {
  exercise: Exercise; number: number; total: number; advance: () => void; save: Save
}) {
  const words = exercise.tokens!
  const [answers, setAnswers] = useState(() => words.map(() => ''))
  const [translation, setTranslation] = useState('')
  const [review, setReview] = useState(false)
  const [busy, setBusy] = useState(false)
  async function finish(correct: boolean) {
    if (busy) return
    setBusy(true)
    if (await save(previous => addScore(previous, 'decoding', exercise.target, correct))) advance()
    setBusy(false)
  }
  return <article className="panel exercise-panel">
    <div className="card-meta"><span>Sentence Decoding</span><span>Exercise {number} of {total}</span></div>
    <div className="exercise-prompt"><h2><Korean>{exercise.answer}.</Korean></h2>
      <p>Give each word’s meaning, then translate the full sentence into natural English.</p></div>
    <form className="answer-form" onSubmit={event => { event.preventDefault(); setReview(true) }}>
      <div className="decode-words">{words.map((word, index) => <label className="field" key={index}>
        <Korean>{word}</Korean>
        <input aria-label={word + ' meaning'} value={answers[index]} readOnly={review}
          onChange={event => setAnswers(answers.map((old, i) => i === index ? event.target.value : old))} />
        {review && <em>{exercise.wordMeanings![index]}</em>}
      </label>)}</div>
      <label className="field">Whole sentence meaning<textarea value={translation} readOnly={review}
        onChange={event => setTranslation(event.target.value)} /></label>
      {!review && <button className="button primary" disabled={!translation.trim() || answers.some(value => !value.trim())}>Check meanings</button>}
    </form>
    {review && <div className="feedback"><strong>Example translation</strong><p>{exercise.prompt}</p><p>{exercise.explanation}</p>
      <p>Did you get every word and the full meaning? Equivalent English wording counts.</p>
      <div className="button-row"><button className="button primary" disabled={busy} onClick={() => void finish(true)}>Got it · Next</button>
        <button className="button" disabled={busy} onClick={() => void finish(false)}>Missed something · Next</button></div>
    </div>}
  </article>
}

type Result = 'correct' | 'different' | 'incorrect' | 'revealed'

/** Display a single attempt, with exact grading for constrained prompts and review for open writing. */
function ExerciseCard({ mode, reading, exercise, number, total, save, advance }: {
  mode: PracticeMode; reading: boolean; exercise: Exercise; number: number; total: number;
  save: Save; advance: () => void
}) {
  const [input, setInput] = useState('')
  const [choice, setChoice] = useState<number[]>([])
  const [tokens] = useState(() => {
    const source = exercise.tokens ?? []
    const order = shuffle(source)
    return order.length > 1 && order.every((token, index) => token === source[index]) ? [...order.slice(1), order[0]] : order
  })
  const [result, setResult] = useState<Result>()
  const [busy, setBusy] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [manualReview, setManualReview] = useState(false)
  const dictation = mode === 'dictation'
  const conversation = mode === 'conversation'
  const assembly = mode === 'assembly'
  const audio = dictation || conversation
  const sentenceWriting = mode === 'writing' || conversation
  const examples = conversation && !reading ? exercise.responses ?? [exercise.answer] : [exercise.answer, ...exercise.alternatives ?? []]
  const prompt = dictation
    ? reading ? 'Listen and give the English meaning' : 'Listen and type what you hear'
    : (reading || conversation || exercise.transformation) ? <Korean>{exercise.prompt}</Korean> : exercise.prompt

  /** Score one attempt, deferring non-matching open-ended answers to learner review. */
  async function grade(answer: string, reveal = false) {
    if (busy || result) return
    const correct = !reveal && (reading ? matchesEnglishAnswer(answer, examples) : matchesAnswer(answer, examples))
    if (!correct && !reveal && (sentenceWriting || (reading && !assembly))) { setResult('different'); return }
    setBusy(true)
    const ok = await save(previous => addScore(previous, mode, exercise.target, correct))
    if (ok) setResult(reveal ? 'revealed' : correct ? 'correct' : 'incorrect')
    setBusy(false)
  }

  /** Save the learner’s explicit review as a practice attempt. */
  async function finishReview(correct: boolean) {
    if (busy || manualReview) return
    setBusy(true)
    if (await save(previous => addScore(previous, mode, exercise.target, correct))) setManualReview(true)
    setBusy(false)
  }

  const feedbackText: Record<Result, string> = {
    correct: 'Correct.', incorrect: 'Compare your answer with the example.', revealed: 'Answer revealed.',
    different: 'Your wording differs from the examples. Use them to review your response.',
  }
  return <article className="panel exercise-panel">
    <div className="card-meta"><span>{labels[mode]}</span><span>Exercise {number} of {total}</span></div>
    <div className="exercise-prompt">
      <span className="eyebrow">{exercise.cue}</span>
      <h2>{prompt}</h2>
      {exercise.transformation && !reading && <>
        <StandalonePronunciationNote word={exercise.prompt} />
        <p>{exercise.transformation.originalMeaning}</p>
      </>}
      {assembly && <p>{reading ? 'Put the English words in order.' : 'Find the polite predicate first. It usually goes at the end.'}</p>}
      {dictation && <p>Use Slow to hear each part, then replay at normal speed.</p>}
      {mode === 'writing' && !reading && <p>Use a polite ending. You can leave out an obvious subject.</p>}
      {audio && exercise.audio && <AudioControls key={exercise.audio} phrase={exercise.audio} />}
      {conversation && !reading && <button className="text-button" onClick={() => setShowTranslation(value => !value)}>{showTranslation ? 'Hide English' : 'Show English'}</button>}
      {conversation && !reading && showTranslation && <p>{exercise.translation}</p>}
      {conversation && !reading && <p>Reply with a short polite sentence. You can say your answer aloud before comparing it.</p>}
    </div>
    {assembly ? <>
      <div className="token-answer" aria-label="Your sentence">
        {choice.length ? choice.map(index => <button className="token selected" key={index} disabled={!!result} onClick={() =>
          setChoice(choice.filter(item => item !== index))}>{reading ? tokens[index] : <Korean>{tokens[index]}</Korean>}</button>) : <span>Add words here in sentence order.</span>}
      </div>
      <div className="token-bank" aria-label="Available words">{tokens.map((token, index) => <button className="token" key={index}
        disabled={choice.includes(index) || !!result} onClick={() => setChoice([...choice, index])}>{reading ? token : <Korean>{token}</Korean>}</button>)}</div>
      <div className="button-row"><button className="button" disabled={!choice.length || !!result} onClick={() => setChoice([])}>Clear</button>
        <button className="button primary" disabled={choice.length !== tokens.length || busy || !!result}
          onClick={() => void grade(choice.map(index => tokens[index]).join(' '))}>Check answer</button></div>
    </> : <AnswerForm value={input} onChange={setInput} submit={() => void grade(input)} multiline={sentenceWriting}
      language={reading ? 'en' : 'ko'} label={reading ? 'English meaning' : conversation ? 'Your response' : dictation ? 'Your transcription' : 'Your answer'} disabled={busy || !!result} />}
    <div className="feedback" aria-live="polite">
      {result && <>
        <p className={result === 'correct' ? 'success' : 'retry'}>{result === 'correct' && <Icon name="check" />}{feedbackText[result]}</p>
        {reading && <>
          <div className="model-answer"><small>English meaning</small><strong>{exercise.answer}</strong></div>
          {dictation && <p>Transcript <Korean>{exercise.prompt}</Korean></p>}
        </>}
        {exercise.transformation && <Transform example={exercise.transformation} />}
        {!reading && !exercise.transformation && <>
          <div className="model-answer"><small>{conversation ? 'Suggested responses' : 'Example answer'}</small>
            {[...new Set(examples)].slice(0, conversation ? 3 : 2).map(answer => <strong key={answer}><Korean>{answer}</Korean></strong>)}
          </div>
          {dictation && <p>{exercise.translation ?? exercise.prompt}</p>}
        </>}
        <p className="inline-note">{exercise.explanation}</p>
      </>}
    </div>
    {result === 'different' && !manualReview && <div className="button-row">
      <button className="button" disabled={busy} onClick={() => void finishReview(true)}>My answer works</button>
      <button className="button" disabled={busy} onClick={() => void finishReview(false)}>Needs practice</button>
    </div>}
    <div className="card-actions">
      <button className="button quiet" disabled={busy || !!result} onClick={() => void grade('', true)}>
        {reading ? 'Reveal meaning' : dictation ? 'Reveal transcript' : conversation ? 'Show responses' : 'Reveal answer'}
      </button>
      <button className="button" disabled={busy} onClick={advance}>{result ? 'Next' : 'Skip'} <Icon name="arrow" /></button>
    </div>
  </article>
}

/** Speak only with an installed Korean voice, with a visible transcript fallback when unavailable. */
function AudioControls({ phrase }: { phrase: string }) {
  const [rate, setRate] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [audioError, setAudioError] = useState('')
  useEffect(() => stopKoreanAudio, [])

  function speak() {
    setPlaying(true)
    setAudioError('')
    speakKorean(phrase, rate, () => setPlaying(false), () => {
      setPlaying(false)
      setAudioError('Playback failed. Try again or use the transcript.')
    })
  }

  return <div className="audio-controls">
    <div className="button-row">
      <button className="button primary" onClick={speak}><Icon name="sound" /> {playing ? 'Replay audio' : 'Play audio'}</button>
      <div className="segmented" aria-label="Playback speed">
        <button aria-pressed={rate === 1} onClick={() => setRate(1)}>Normal</button>
        <button aria-pressed={rate < 1} onClick={() => setRate(.85)}>Slow</button>
      </div>
    </div>
    {audioError && <p className="inline-note" role="status">{audioError}</p>}
  </div>
}
