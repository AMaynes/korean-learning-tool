import { useEffect, useRef, useState } from 'react'
import { readingChunks, readingSentences, translateReading } from '../engine/reading'
import { Icon, Korean } from './shared'

export function Reading() {
  const [text, setText] = useState('')
  const [sentences, setSentences] = useState<string[]>([])
  return <>
    <div className="section-heading"><div><h1>Reading Trainer</h1>
      <p>Tap a word to hear it. Add any meanings you know, then submit to compare.</p></div></div>
    {sentences.length ? <ReadingSheet sentences={sentences} edit={() => setSentences([])} /> :
      <form className="panel exercise-panel answer-form" onSubmit={event => {
        event.preventDefault()
        setSentences(readingSentences(text))
      }}>
        <label className="field">Korean text<textarea lang="ko" rows={7} value={text}
          onChange={event => setText(event.target.value)} /></label>
        <button className="button primary" disabled={!text.trim()}>Start reading</button>
      </form>}
    <p className="inline-note">Audio and translations use Google Translate online. Playing audio sends the selected text. Submitting sends the Korean passage.</p>
  </>
}

function ReadingSheet({ sentences, edit }: { sentences: string[]; edit: () => void }) {
  const [meanings, setMeanings] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [soundError, setSoundError] = useState(false)
  const request = useRef<AbortController | null>(null)
  const player = useRef<HTMLAudioElement | null>(null)
  useEffect(() => () => {
    request.current?.abort()
    player.current?.pause()
    player.current = null
  }, [])

  function play(text: string) {
    player.current?.pause()
    setSoundError(false)
    const audio = new Audio()
    player.current = audio
    const chunks = readingChunks(text, 180)
    function next() {
      if (player.current !== audio || !chunks.length) return
      const params = new URLSearchParams({ client: 'tw-ob', tl: 'ko', q: chunks.shift()! })
      audio.src = 'https://translate.google.com/translate_tts?' + params
      void audio.play().catch(() => { if (player.current === audio) setSoundError(true) })
    }
    audio.onended = next
    audio.onerror = () => { if (player.current === audio) setSoundError(true) }
    next()
  }

  async function submit() {
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setSubmitted(true)
    setBusy(true)
    setFailed(false)
    const pending = new Set(sentences.flatMap(sentence => [sentence, ...sentence.split(/\s+/u)]))
    for (const text of pending) {
      if (Object.hasOwn(meanings, text)) continue
      try {
        const value = await translateReading(text, controller.signal)
        if (controller.signal.aborted) return
        setMeanings(old => ({ ...old, [text]: value }))
      } catch {
        if (controller.signal.aborted) return
        setFailed(true)
        break
      }
    }
    request.current = null
    setBusy(false)
  }

  return <form className="reading-sheet" onSubmit={event => { event.preventDefault(); void submit() }}>
    <button className="text-button" type="button" onClick={edit}>Edit passage</button>
    {sentences.map((sentence, i) => <section className="panel exercise-panel" key={i} aria-label={'Sentence ' + (i + 1)}>
      <div className="reading-line">{sentence.split(/\s+/u).map((word, j) => <div className="reading-word" key={j}>
        <button type="button" className="text-button" onClick={() => play(word)}><strong><Korean>{word}</Korean></strong></button>
        <input aria-label={word + ' meaning'} placeholder="Your guess" />
        {submitted && Object.hasOwn(meanings, word) && <small>{meanings[word]}</small>}
      </div>)}
        <button className="button quiet" type="button" aria-label={'Hear sentence ' + (i + 1)} onClick={() => play(sentence)}><Icon name="sound" /></button>
      </div>
      <label className="field reading-sentence-guess">Your sentence translation
        <input lang="en" placeholder="What does the whole sentence mean in English?" />
      </label>
      {submitted && Object.hasOwn(meanings, sentence) && <p className="reading-translation"><strong>Translation</strong> <em>{meanings[sentence]}</em></p>}
    </section>)}
    {soundError && <p role="status">Audio couldn’t play. Tap the word or speaker to retry.</p>}
    {failed && <p role="status">Translation was interrupted. Retry to finish the passage.</p>}
    <button className="button primary" disabled={busy || (submitted && !failed)}>
      {busy ? 'Translating…' : failed ? 'Retry translations' : submitted ? 'Translations shown' : 'Submit'}
    </button>
  </form>
}
