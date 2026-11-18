/**
 * Overview & Purpose: Let the learner recall a sound, listen, then mark their own answer.
 *
 * Architectural Relationships: The tool shell mounts this view with the pronunciation decks.
 *
 * External Resources: Browser speech synthesis with a Korean voice.
 *
 * Notes: Score is local to the current round.
 */


import { useEffect, useRef, useState } from 'react'
import { shuffle } from '../engine/exercises'
import { batchimCard, batchimCardCount, letterCards } from '../engine/pronunciation'
import { Icon, Korean, speakKorean } from './shared'

const modes = { hangul: 'Hangul', batchim: 'Batchim' } as const
type Mode = keyof typeof modes

/** Offer one interaction flow for individual letters and syllables with final consonants. */
export function Pronunciation() {
  const [mode, setMode] = useState<Mode>('hangul')
  return <>
    <div className="section-heading">
      <div><h1>Pronunciation</h1>
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
  const total = mode === 'hangul' ? letterCards.length : batchimCardCount
  const [order, setOrder] = useState(() => shuffle(Array.from({ length: total }, (_, index) => index)))
  const [position, setPosition] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [heard, setHeard] = useState(false)
  const [audioError, setAudioError] = useState('')
  const playButton = useRef<HTMLButtonElement>(null)
  const index = order[position]
  const card = index === undefined ? null : mode === 'hangul' ? letterCards[index] : batchimCard(index)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  /** Enable self-rating after the voice finishes; leave the current card available on errors. */
  function play(sound: string) {
    setAudioError('')
    const started = speakKorean(sound, 1, () => {
      setPlaying(false)
      setHeard(true)
    }, () => {
      setPlaying(false)
      setAudioError('Playback failed. Try again.')
    })
    setPlaying(started)
    if (!started) setAudioError('A Korean voice is needed to play the sound. Enable one in your device settings, then try again.')
  }

  /** Record the answer and return focus to playback for the next card. */
  function rate(correctAnswer: boolean) {
    setCorrect(count => count + Number(correctAnswer))
    setPosition(position + 1)
    setHeard(false)
    setAudioError('')
    playButton.current?.focus()
  }

  return <section className="panel recall-panel pronunciation-panel" aria-label={`${modes[mode]} practice`}>
    <div className="card-meta">
      <span>{modes[mode]}</span>
      <span>{correct} / {position} correct</span>
    </div>
    {card ? <>
      <div className="recall-face pronunciation-face">
        <h2 className="recall-word"><Korean>{card.prompt}</Korean></h2>
      </div>
      <p className="pronunciation-note">{mode === 'hangul'
        ? <>Consonants are played with <Korean>ㅡ</Korean> to make the starting sound audible.</>
        : <>{total.toLocaleString('en-US')} syllables. Listen to each one on its own, with its final consonant.</>}</p>
      <button ref={playButton} className="button primary pronunciation-play" onClick={() => play(card.sound)} disabled={playing}>
        <Icon name="sound" />{playing ? 'Playing…' : heard ? 'Replay sound' : 'Play sound'}
      </button>
      {audioError && <p className="status-message" role="status">{audioError}</p>}
      {heard && <fieldset className="pronunciation-rating" disabled={playing}>
        <legend>Did you get it correct?</legend>
        <p>{card.silent ? <>Initial <Korean>ㅇ</Korean> is silent. You heard <Korean>으</Korean>.</> : <>You heard <Korean>[{card.sound}]</Korean>.</>}</p>
        <div className="button-row">
          <button className="button primary" onClick={() => rate(true)}>Y</button>
          <button className="button" onClick={() => rate(false)}>N</button>
        </div>
      </fieldset>}
    </> : <>
      <div className="recall-face"><h2>Round complete</h2></div>
      <button className="button primary pronunciation-play" onClick={() => {
        setOrder(shuffle(order))
        setPosition(0)
        setCorrect(0)
      }}>Start again</button>
    </>}
  </section>
}
