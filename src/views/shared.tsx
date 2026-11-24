/**
 * Overview & Purpose: Share vocabulary selectors, accessible study controls, speech, and file actions.
 *
 * Architectural Relationships: Used by the tool shell and practice views.
 *
 * External Resources: Browser speech synthesis, file input, and download APIs.
 *
 * Notes: User-supplied strings render as React text.
 */


import type { RecallDirection } from '../engine/exercises'
import { useRef } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { categories, categoryIds } from '../data/model'
import type { Category, Transformation, WordList } from '../data/model'
import type { StudyState } from '../engine/storage'

export type Save = (change: (state: StudyState) => StudyState) => Promise<boolean>
export type SelectList = (category: Category, id: string) => void
export type View = 'reading' | 'recall' | 'library' | 'grammar' | 'listening' | 'pronunciation' | 'intro' | 'settings'

const iconPaths = {
  grid: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  book: 'M4 5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 1 0-4h14M4 5v13m4-11h8m-8 4h5',
  cards: 'M6 7h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm2-4h10M8 12h9m-9 4h5',
  grammar: 'M5 6h14M12 6v5m-6 7H4v-5h5v5H6Zm12 0h-2v-5h5v5h-3Zm-12-5v-2h12v2',
  letters: 'M4 8h12M10 4v4m4 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm5-10v16',
  sound: 'M3 9h4l5-4v14l-5-4H3zM16 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12',
  settings: 'M4 7h16M4 17h16M9 4v6m6 4v6',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  swap: 'M4 8h15m-4-4 4 4-4 4m5 4H5m4-4-4 4 4 4',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m9-9h-2M5 12H3m15-6 1-1M5 19l1-1M18 18l1 1M5 5l1 1',
  shuffle: 'M3 6h3c4 0 5 12 9 12h6m-4-4 4 4-4 4M3 18h3c4 0 5-12 9-12h6m-4-4 4 4-4 4',
  check: 'm5 12 5 5 9-10',
  info: 'M12 11v5m0-8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  left: 'm15 18-6-6 6-6',
} as const

/** Keep interface icons consistent and hidden from assistive technology. */
export function Icon({ name, size = 18 }: { name: keyof typeof iconPaths; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>
}

/** Render genuine language tags for pronunciation and screen readers. */
export function Korean({ children, className }: { children: ReactNode; className?: string }) {
  return <span lang="ko" className={className}>{children}</span>
}

const finalTPronunciations = new Map([
  ['무엇', '무얻'],
  ['이것', '이걷'],
  ['그것', '그걷'],
  ['저것', '저걷'],
])

/** Explain the standalone pronunciation on the Korean side of a word. */
export function StandalonePronunciationNote({ word }: { word: string }) {
  const pronunciation = finalTPronunciations.get(word)
  if (!pronunciation) return null

  return <small className="inline-note pronunciation-note">
    Said on its own, final <Korean>ㅅ</Korean> (S) sounds like a flat, unreleased T. <Korean>[{pronunciation}]</Korean>
  </small>
}

let currentAudio: HTMLAudioElement | undefined

/** Stop the previous card and ignore events from superseded playback. */
export function stopKoreanAudio() {
  const audio = currentAudio
  currentAudio = undefined
  audio?.pause()
}

/** Every prompt uses the same bundled Korean female voice on every device. */
export function speakKorean(text: string, rate: number, onEnd: () => void, onError: () => void) {
  stopKoreanAudio()
  const key = Array.from(text, char => char.codePointAt(0)!.toString(16)).join('-')
  const audio = new Audio('./assets/ko-f1-' + key + '.mp3')
  currentAudio = audio
  audio.playbackRate = rate
  function finish(callback: () => void) {
    if (currentAudio !== audio) return
    currentAudio = undefined
    callback()
  }
  audio.onended = () => finish(onEnd)
  audio.onerror = () => finish(onError)
  void audio.play().catch(() => finish(onError))
}

/** Select an active deck within one category. */
export function ListSelect({ category, lists, selected, onSelect, label = 'Vocabulary list' }: {
  category: Category; lists: WordList[]; selected: string; onSelect: SelectList; label?: string
}) {
  return <label className="field">{label}
    <select aria-label={label} value={selected} onChange={event => onSelect(category, event.target.value)}>
      {lists.filter(list => list.category === category).map(list => <option value={list.id} key={list.id}>{list.name}</option>)}
    </select>
  </label>
}

/** Switch the target language for a recall or practice session. */
export function DirectionSwitch({ direction, onChange, label = 'Practice direction', forwardLabel = 'English → Korean', onImage, onSound }: {
  direction: RecallDirection | 'image-to-ko' | 'sound-to-en'; onChange: (direction: RecallDirection) => void; label?: string; forwardLabel?: string; onImage?: () => void; onSound?: () => void
}) {
  return <div className="segmented direction-switch" role="group" aria-label={label}>
    <button type="button" aria-pressed={direction === 'en-to-ko'} onClick={() => onChange('en-to-ko')}>{forwardLabel}</button>
    <button type="button" aria-pressed={direction === 'ko-to-en'} onClick={() => onChange('ko-to-en')}>Korean → English</button>
    {onSound && <button type="button" aria-pressed={direction === 'sound-to-en'} onClick={onSound}>Korean Sound → English</button>}
    {onImage && <button type="button" aria-pressed={direction === 'image-to-ko'} onClick={onImage}>Image → Korean</button>}
  </div>
}

/** Render source, operation, and result as a single study example. */
export function Transform({ example }: { example: Transformation }) {
  return <div className="transform" aria-label="Worked transformation">
    <div><small>Original</small><strong><Korean>{example.original}</Korean></strong><span>{example.originalMeaning}</span>
      {example.stem && <span>Stem <Korean>{example.stem}</Korean></span>}</div>
    <div><small>{example.stem ? 'Pattern' : 'Applied particle'}</small><strong><Korean>{example.applied}</Korean></strong></div>
    <div><small>Result</small><strong><Korean>{example.result}</Korean></strong><span>{example.meaning}</span>
      {example.context && <span><Korean>{example.context}</Korean></span>}</div>
  </div>
}

/** Provide an IME-safe answer form in the expected language. */
export function AnswerForm({ value, onChange, submit, label = 'Your answer', action = 'Check answer', disabled = false, multiline = false, language = 'ko' }: {
  value: string; onChange: (value: string) => void; submit: () => void; label?: string; action?: string; disabled?: boolean; multiline?: boolean; language?: 'ko' | 'en'
}) {
  const props = {
    lang: language, value, autoComplete: 'off', spellCheck: false, disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) event.preventDefault()
    },
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (value.trim() && !disabled) submit()
  }
  return <form onSubmit={handleSubmit} className="answer-form">
    <label className="field">{label}{multiline ? <textarea {...props} rows={3} /> : <input {...props} placeholder={language === 'ko' ? 'Type in Hangul…' : 'Type the English meaning…'} />}</label>
    <button type="submit" className="button primary" disabled={disabled || !value.trim()}>{action}</button>
  </form>
}

/** Let the learner change related deck selections without leaving practice. */
export function ActiveConfig({ categories: shown = categoryIds, lists, active, onSelect }: {
  categories?: Category[]; lists: WordList[]; active: Record<Category, WordList>; onSelect: SelectList
}) {
  return <div className="config-grid">{shown.map(category => <ListSelect key={category} category={category}
    lists={lists} selected={active[category].id} onSelect={onSelect} label={categories[category]} />)}</div>
}

/** Download JSON through a temporary same-origin blob URL. */
export function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Read a bounded JSON document and report import failures where the input was triggered. */
export function ImportButton({ children, onImport, onError }: {
  children: ReactNode; onImport: (value: unknown) => Promise<void>; onError: (message: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  return <>
    <button className="button" onClick={() => input.current?.click()}>{children}</button>
    <input type="file" ref={input} accept=".json,application/json" hidden onChange={async event => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      try {
        if (file.size > 10_000_000) throw new Error('Choose a JSON file smaller than 10 MB.')
        await onImport(JSON.parse(await file.text()))
      } catch (error) {
        onError(error instanceof SyntaxError ? 'This file is not valid JSON.' : error instanceof Error ? error.message : 'Import failed.')
      }
    }} />
  </>
}

/** Render consistent empty-state messaging without hiding the relevant vocabulary controls. */
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="panel empty"><Icon name="cards" size={26} /><h2>{title}</h2>{children}</div>
}
