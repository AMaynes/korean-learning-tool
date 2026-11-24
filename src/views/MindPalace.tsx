import { useState } from 'react'
import type { WordList } from '../data/model'
import { selectableLists } from '../engine/registry'
import { Korean, type Save } from './shared'

const rooms = [
  ['Entryway', 'Front gate', 'Doorbell', 'Doormat', 'Coat hook', 'Shoe rack'],
  ['Living room', 'Sofa', 'Coffee table', 'Rug', 'Bookshelf', 'Window'],
  ['Kitchen', 'Fridge', 'Counter', 'Sink', 'Stove', 'Spice rack'],
  ['Garden', 'Birdbath', 'Bench', 'Apple tree', 'Pond', 'Greenhouse'],
  ['Bedroom', 'Bed', 'Nightstand', 'Mirror', 'Wardrobe', 'Lamp'],
  ['Study', 'Desk', 'Chair', 'Globe', 'Clock', 'Noticeboard'],
]

export function MindPalace({ deck, cues, save }: { deck: WordList; cues: Record<string, string>; save: Save }) {
  const [index, setIndex] = useState(0)
  const [walk, setWalk] = useState(false)
  const catalog = selectableLists.find(list => list.id === deck.category + '-all')!
  const entry = deck.entries[index]
  if (!entry) return <p>This list has no stops yet.</p>
  const slot = catalog.entries.findIndex(item => item.id === entry.id)
  const roomIndex = Math.floor(slot / 5)
  const [room, ...places] = rooms[roomIndex % rooms.length]
  const place = places[slot % 5]
  const cueId = deck.category + '-' + entry.id
  return <article className="panel exercise-panel palace">
    <div className="card-meta"><span>Mind Palace</span><span>Stop {index + 1} of {deck.entries.length}</span></div>
    <div className="segmented" aria-label="Palace activity">
      <button aria-pressed={!walk} onClick={() => setWalk(false)}>Place words</button>
      <button aria-pressed={walk} onClick={() => { setWalk(true); setIndex(0) }}>Walk the route</button>
    </div>
    <p className="eyebrow">{room}{roomIndex >= rooms.length && ' · Wing ' + (1 + Math.floor(roomIndex / rooms.length))}</p>
    <h2>{place}</h2>
    <PalaceStop key={cueId + walk} korean={entry.korean} english={entry.english} place={place}
      cue={cues[cueId] ?? ''} walk={walk} saveCue={value => save(previous => ({
        ...previous, palaceCues: { ...previous.palaceCues, [cueId]: value },
      }))} />
    <div className="card-actions"><button className="button" disabled={!index} onClick={() => setIndex(index - 1)}>Previous stop</button>
      <button className="button primary" onClick={() => setIndex((index + 1) % deck.entries.length)}>
        {index + 1 === deck.entries.length ? 'Back to first stop' : 'Next stop'}</button></div>
  </article>
}

function PalaceStop({ korean, english, place, cue, walk, saveCue }: {
  korean: string; english: string; place: string; cue: string; walk: boolean; saveCue: (value: string) => Promise<boolean>
}) {
  const [draft, setDraft] = useState(cue)
  const [revealed, setRevealed] = useState(false)
  const [hint, setHint] = useState(false)
  const [busy, setBusy] = useState(false)
  return <>
    {(!walk || revealed) && <p><strong><Korean>{korean}</Korean></strong> · <em>{english}</em></p>}
    {walk ? <>
      <p>Picture the {place.toLowerCase()}. Which Korean word did you leave here, and what does it mean?</p>
      {hint && <p>{cue}</p>}
      <div className="button-row">
        {cue && !hint && <button className="button quiet" onClick={() => setHint(true)}>Show my scene</button>}
        {!revealed && <button className="button" onClick={() => setRevealed(true)}>Reveal word</button>}
      </div>
    </> : <>
      <p>Picture the word coming to life at the {place.toLowerCase()}. Say it in Korean as you imagine the scene.</p>
      <label className="field">My memory scene<textarea value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)}
        placeholder="What happens here that will remind you of this word?" /></label>
      <button className="button" disabled={busy || draft === cue} onClick={async () => {
        setBusy(true)
        await saveCue(draft)
        setBusy(false)
      }}>{draft === cue && cue ? 'Scene saved' : 'Save scene'}</button>
    </>}
  </>
}
