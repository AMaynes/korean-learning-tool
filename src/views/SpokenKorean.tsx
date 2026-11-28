import { Children, useState, type ReactNode } from 'react'
import { speakKorean, spokenForm } from '../engine/koreanAudio'

/** Each space-delimited Korean word gets its own control. Separators stay printable. */
export function SpokenWord({ word, children }: { word: string; children?: ReactNode }) {
  const [failed, setFailed] = useState(false)
  return <><button type="button" className="spoken-word" title="Play Korean pronunciation"
    onClick={event => {
      event.stopPropagation()
      setFailed(false)
      speakKorean(spokenForm(word), 1, () => {}, () => setFailed(true), { fallback: true })
    }}>{children ?? word}</button>{failed && <small role="status"> Audio unavailable. Tap to retry.</small>}</>
}

export function spokenText(text: string) {
  return text.split(/((?:[0-9]+)?[\p{Script=Hangul}]+)/u).map((part, i) =>
    i % 2 ? <SpokenWord key={i} word={part} /> : part)
}

export function Korean({ children, className }: { children: ReactNode; className?: string }) {
  return <span lang="ko" className={className}>{Children.map(children, child =>
    typeof child === 'string' ? spokenText(child) : child)}</span>
}
