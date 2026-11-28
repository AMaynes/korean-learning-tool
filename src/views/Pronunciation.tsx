/**
 * Overview & Purpose: Let the learner recall a sound, listen, then mark their own answer.
 *
 * Architectural Relationships: The tool shell mounts this view with the pronunciation decks.
 *
 * External Resources: Bundled Korean audio clips.
 *
 * Notes: Score is local to the current round.
 */


import { useEffect, useRef, useState } from 'react'
import { shuffle } from '../engine/exercises'
import { hangulAlphabet } from '../engine/pronunciation'
import type { PronunciationCard } from '../engine/pronunciation'
import { Icon, Korean, speakKorean, stopKoreanAudio } from './shared'

const modes = { vowels: 'Vowels', consonants: 'Consonants' } as const
type Mode = keyof typeof modes

/** Offer one interaction flow for the vowel and consonant decks. */
export function Pronunciation() {
  const [mode, setMode] = useState<Mode>('vowels')
  return <>
    <div className="section-heading">
      <div><h1>Pronouncing Hangul</h1>
        <p>Guess the sound in your head, then listen and check yourself.</p></div>
      <div className="segmented" aria-label="Pronunciation practice">
        {Object.entries(modes).map(([id, label]) =>
          <button key={id} aria-pressed={id === mode} onClick={() => setMode(id as Mode)}>{label}</button>)}
      </div>
    </div>
    <SoundPractice key={mode} mode={mode} />
  </>
}

/** Shuffle the deck once per round and expose self-rating after playback. */
function SoundPractice({ mode }: { mode: Mode }) {
  const letters = hangulAlphabet[mode]
  const total = letters.length
  const [order, setOrder] = useState(() => shuffle(Array.from({ length: total }, (_, index) => index)))
  const [position, setPosition] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [rated, setRated] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [heard, setHeard] = useState(false)
  const [audioError, setAudioError] = useState('')
  const playButton = useRef<HTMLButtonElement>(null)
  const index = order[position]
  const card: PronunciationCard | null = index === undefined ? null : letters[index]

  useEffect(() => stopKoreanAudio, [])

  function play(sound: string) {
    setAudioError('')
    setPlaying(true)
    speakKorean(sound, 1, () => {
      setPlaying(false)
      setHeard(true)
    }, () => {
      setPlaying(false)
      setAudioError('Audio unavailable. Retry or show the pronunciation.')
    }, { onCancel: () => setPlaying(false) })
  }

  /** Record the answer and return focus to playback for the next card. */
  function advance(correctAnswer?: boolean) {
    stopKoreanAudio()
    setPlaying(false)
    if (correctAnswer !== undefined) {
      setRated(count => count + 1)
      if (correctAnswer) setCorrect(count => count + 1)
    }
    setPosition(position + 1)
    setHeard(false)
    setAudioError('')
    playButton.current?.focus()
  }

  return <section className="panel recall-panel pronunciation-panel" aria-label={`${modes[mode]} practice`}>
    <div className="card-meta">
      <span>{modes[mode]} · {Math.min(position + 1, total)} / {total.toLocaleString('en-US')}</span>
      <span>{correct} / {rated} correct</span>
    </div>
    {card ? <>
      <div className="recall-face pronunciation-face">
        <h2 className="recall-word"><button type="button" className="spoken-word" lang="ko" title="Play Korean pronunciation" onClick={() => play(card.sound)}>{card.prompt}</button></h2>
      </div>
      <p className="pronunciation-note">{mode === 'consonants'
        ? <>Listen for the consonant in a syllable with <Korean>ㅡ</Korean>.</>
        : 'Pronounce the vowel on the card.'}</p>
      <div className="button-row">
      <button ref={playButton} className="button primary pronunciation-play" onClick={() => play(card.sound)} disabled={playing}>
        <Icon name="sound" />{playing ? 'Playing…' : heard ? 'Replay sound' : 'Play sound'}
      </button>
      <button className="button" onClick={() => advance()}>Next <Icon name="arrow" /></button>
      </div>
      {!heard && <button className="text-button pronunciation-play" onClick={() => {
        stopKoreanAudio()
        setPlaying(false)
        setHeard(true)
        setAudioError('')
      }}>Show pronunciation</button>}
      {audioError && <p className="status-message" role="status">{audioError}</p>}
      {heard && <fieldset className="pronunciation-rating" disabled={playing}>
        <legend>Did you get it correct?</legend>
        <p>{card.silent ? <>Initial <Korean>ㅇ</Korean> is silent. Final <Korean>ㅇ</Korean> sounds like <em>ng</em> in <Korean>응</Korean>.</> : <><Korean>[{card.sound}]</Korean> · <em>{letters[index].romanization}</em></>}</p>
        <div className="button-row">
          <button className="button primary" onClick={() => advance(true)}>Yes</button>
          <button className="button" onClick={() => advance(false)}>No</button>
        </div>
      </fieldset>}
    </> : <>
      <div className="recall-face"><h2>Round complete</h2></div>
      <button className="button primary pronunciation-play" onClick={() => {
        setOrder(shuffle(order))
        setPosition(0)
        setCorrect(0)
        setRated(0)
      }}>Start again</button>
    </>}
  </section>
}
