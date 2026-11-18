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
import { hangulAlphabet, syllableCard, syllableCardCount } from '../engine/pronunciation'
import type { PronunciationCard } from '../engine/pronunciation'
import { Icon, Korean, speakKorean } from './shared'

const modes = { vowels: 'Vowels', consonants: 'Consonants', syllables: 'Syllables' } as const
type Mode = keyof typeof modes

/** Offer one interaction flow for individual letters and syllables with final consonants. */
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
  const letters = mode === 'syllables' ? undefined : hangulAlphabet[mode]
  const total = letters?.length ?? syllableCardCount
  const [order, setOrder] = useState(() => shuffle(Array.from({ length: total }, (_, index) => index)))
  const [position, setPosition] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [heard, setHeard] = useState(false)
  const [audioError, setAudioError] = useState('')
  const playButton = useRef<HTMLButtonElement>(null)
  const index = order[position]
  const card: PronunciationCard | null = index === undefined ? null : letters ? letters[index] : syllableCard(index)

  const stopPlayback = useRef<() => void>(() => {})
  useEffect(() => () => stopPlayback.current(), [])

  /** Enable self-rating after the voice finishes; leave the current card available on errors. */
  function play(sound: string) {
    setAudioError('')
    stopPlayback.current()
    setPlaying(true)
    let active = true
    let clip: HTMLAudioElement | undefined
    // A missing end event must not strand the flashcard in the playing state.
    let timer = window.setTimeout(playClip, 2500)
    function finish(success: boolean) {
      if (!active) return
      active = false
      window.clearTimeout(timer)
      setPlaying(false)
      if (success) setHeard(true)
      else setAudioError('Audio unavailable. Retry or show the pronunciation.')
    }
    function playClip() {
      if (!active || clip) return
      window.clearTimeout(timer)
      clip = new Audio(`./assets/hangul-${sound.charCodeAt(0).toString(16)}.wav`)
      window.speechSynthesis?.cancel()
      clip.onended = () => finish(true)
      clip.onerror = () => finish(false)
      timer = window.setTimeout(() => { clip?.pause(); finish(false) }, 8000)
      void clip.play().catch(() => finish(false))
    }
    stopPlayback.current = () => {
      active = false
      window.clearTimeout(timer)
      clip?.pause()
      window.speechSynthesis?.cancel()
    }
    try {
      if (!speakKorean(sound, 1, () => { if (!clip) finish(true) }, playClip)) playClip()
    } catch { playClip() }
  }

  /** Record the answer and return focus to playback for the next card. */
  function rate(correctAnswer: boolean) {
    stopPlayback.current()
    setPlaying(false)
    setCorrect(count => count + Number(correctAnswer))
    setPosition(position + 1)
    setHeard(false)
    setAudioError('')
    playButton.current?.focus()
  }

  return <section className="panel recall-panel pronunciation-panel" aria-label={`${modes[mode]} practice`}>
    <div className="card-meta">
      <span>{modes[mode]} · {Math.min(position + 1, total)} / {total.toLocaleString('en-US')}</span>
      <span>{correct} / {position} correct</span>
    </div>
    {card ? <>
      <div className="recall-face pronunciation-face">
        <h2 className="recall-word"><Korean>{card.prompt}</Korean></h2>
      </div>
      <p className="pronunciation-note">{mode === 'consonants'
        ? <>Listen for the consonant in a syllable with <Korean>ㅡ</Korean>.</>
        : mode === 'syllables' ? 'Pronounce the whole block, including any final consonant.' : 'Pronounce the vowel on the card.'}</p>
      <button ref={playButton} className="button primary pronunciation-play" onClick={() => play(card.sound)} disabled={playing}>
        <Icon name="sound" />{playing ? 'Playing…' : heard ? 'Replay sound' : 'Play sound'}
      </button>
      {!heard && <button className="text-button pronunciation-play" onClick={() => {
        stopPlayback.current()
        setPlaying(false)
        setHeard(true)
        setAudioError('')
      }}>Show pronunciation</button>}
      {audioError && <p className="status-message" role="status">{audioError}</p>}
      {heard && <fieldset className="pronunciation-rating" disabled={playing}>
        <legend>Did you get it correct?</legend>
        <p>{card.silent ? <>Initial <Korean>ㅇ</Korean> is silent. Final <Korean>ㅇ</Korean> sounds like <em>ng</em> in <Korean>응</Korean>.</> : <><Korean>[{card.sound}]</Korean>{letters && <> · <em>{letters[index].romanization}</em></>}</>}</p>
        <div className="button-row">
          <button className="button primary" onClick={() => rate(true)}>Yes</button>
          <button className="button" onClick={() => rate(false)}>No</button>
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
