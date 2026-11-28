import { readingChunks } from './reading'
import { hangulAlphabet } from './pronunciation'

const letterSounds = new Map([...hangulAlphabet.vowels, ...hangulAlphabet.consonants]
  .map(letter => [letter.prompt, letter.sound]))
export const spokenForm = (word: string) => letterSounds.get(word) ?? word.normalize('NFC')

let cancelPlayback: (() => void) | undefined

export function stopKoreanAudio() {
  const cancel = cancelPlayback
  cancelPlayback = undefined
  cancel?.()
}

/** One owner for bundled clips, remote audio and device speech, including retries. */
export function speakKorean(text: string, rate: number, onEnd: () => void, onError: () => void,
  options: { fallback?: boolean; clip?: string | null; onCancel?: () => void } = {}) {
  stopKoreanAudio()
  let player: HTMLAudioElement
  let speech: SpeechSynthesisUtterance | undefined
  function cancel() {
    player?.pause()
    if (speech) window.speechSynthesis?.cancel()
    options.onCancel?.()
  }
  cancelPlayback = cancel
  function finish(callback: () => void) {
    if (cancelPlayback !== cancel) return
    cancelPlayback = undefined
    callback()
  }
  function playUrl(url: string, next: () => void, fail: () => void) {
    const audio = new Audio(url)
    player = audio
    audio.playbackRate = rate
    let done = false
    function once(callback: () => void) {
      if (done || cancelPlayback !== cancel || player !== audio) return
      done = true
      callback()
    }
    audio.onended = () => once(next)
    audio.onerror = () => once(fail)
    void audio.play().catch(() => once(fail))
  }
  const ended = () => finish(onEnd)
  const failed = () => finish(onError)
  function online() {
    const chunks = readingChunks(text, 180)
    function next() {
      if (cancelPlayback !== cancel) return
      const chunk = chunks.shift()
      if (!chunk) { ended(); return }
      const params = new URLSearchParams({ client: 'tw-ob', tl: 'ko', q: chunk })
      playUrl('https://translate.google.com/translate_tts?' + params, next, () => {
        const synth = window.speechSynthesis
        const voice = synth?.getVoices().find(v => /^ko(?:-|_|$)/i.test(v.lang) &&
          /yuna|yu-na|sora|sunhi|heami|heera|jina|유나|여성|female|google 한국/i.test(v.name))
        if (!voice) { failed(); return }
        speech = new SpeechSynthesisUtterance(chunk)
        speech.voice = voice
        speech.lang = 'ko-KR'
        speech.rate = rate
        speech.onend = next
        speech.onerror = failed
        synth.speak(speech)
      })
    }
    next()
  }
  if (options.clip === null) { online(); return }
  const key = Array.from(options.clip ?? text, char => char.codePointAt(0)!.toString(16)).join('-')
  playUrl('./assets/ko-f1-' + key + '.mp3', ended, options.fallback ? online : failed)
}
