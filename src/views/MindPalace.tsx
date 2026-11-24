import { useState } from 'react'
import type { WordList } from '../data/model'
import { selectableLists } from '../engine/registry'
import { Korean, type Save } from './shared'

import type { StudyState } from '../engine/storage'

const homeRooms = [
  ['Entryway', 'Front gate', 'Doorbell', 'Doormat', 'Coat hook', 'Shoe rack'],
  ['Living room', 'Sofa', 'Coffee table', 'Rug', 'Bookshelf', 'Window'],
  ['Kitchen', 'Fridge', 'Counter', 'Sink', 'Stove', 'Spice rack'],
  ['Garden', 'Birdbath', 'Bench', 'Apple tree', 'Pond', 'Greenhouse'],
  ['Bedroom', 'Bed', 'Nightstand', 'Mirror', 'Wardrobe', 'Lamp'],
  ['Study', 'Desk', 'Chair', 'Globe', 'Clock', 'Noticeboard'],
]

const presetRooms = {
  home: homeRooms,
  park: [
    ['Park entrance', 'Iron gate', 'Trail map', 'Bicycle rack', 'Ticket booth', 'Stone arch'],
    ['Playground', 'Slide', 'Swing', 'Sandbox', 'Climbing frame', 'Seesaw'],
    ['Lakeside', 'Footbridge', 'Boat dock', 'Reed bed', 'Fishing pier', 'Waterfall'],
  ],
  cafe: [
    ['Café entrance', 'Striped awning', 'Chalkboard', 'Glass door', 'Umbrella stand', 'Menu board'],
    ['Coffee bar', 'Bean grinder', 'Espresso machine', 'Milk pitcher', 'Pastry case', 'Register'],
    ['Seating area', 'Window seat', 'Reading lamp', 'Corner booth', 'Bar stool', 'Patio table'],
  ],
}

export function MindPalace({ deck, state, save }: { deck: WordList; state: StudyState; save: Save }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [landmarks, setLandmarks] = useState('')
  const [busy, setBusy] = useState(false)
  const custom = state.customPalaces ?? {}
  const selected = state.activePalace ?? 'home'
  const palace = custom[selected]
  const stops = landmarks.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const names: Record<string, string> = {home: 'Home', park: 'Park', cafe: 'Café'}
  for (const [id, item] of Object.entries(custom)) names[id] = item.name
  const duplicate = Object.values(names).some(value => value.toLowerCase() === name.trim().toLowerCase())

  return <>
    <div className="panel exercise-panel palace">
      <label className="field">Choose a palace<select value={selected} onChange={event => {
        const activePalace = event.target.value
        void save(previous => ({ ...previous, activePalace }))
      }}>{Object.entries(names).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <button className="button quiet" aria-expanded={creating} onClick={() => setCreating(!creating)}>{creating ? 'Cancel' : 'Create palace'}</button>
      {creating && <form className="palace" onSubmit={async event => {
        event.preventDefault()
        if (busy || duplicate || !name.trim() || !stops.length) return
        setBusy(true)
        const id = 'route-' + crypto.getRandomValues(new Uint32Array(2)).join('-')
        const item = {name: name.trim(), stops}
        if (await save(previous => ({ ...previous, activePalace: id, customPalaces: { ...previous.customPalaces, [id]: item } }))) {
          setCreating(false); setName(''); setLandmarks('')
        }
        setBusy(false)
      }}>
        <label className="field">Palace name<input value={name} maxLength={80} onChange={e => setName(e.target.value)} /></label>
        {duplicate && <small>Choose a different name for this palace.</small>}
        <label className="field">Landmarks in walking order (one per line)<textarea value={landmarks} maxLength={8000}
          placeholder={'Front steps\nHall mirror\nKitchen sink'} onChange={e => setLandmarks(e.target.value)} /></label>
        <button className="button primary" disabled={busy || duplicate || !name.trim() || !stops.length}>Save palace</button>
      </form>}
    </div>
    <PalaceRoute key={selected} deck={deck} cues={state.palaceCues ?? {}} save={save} palaceId={selected}
      rooms={palace ? [[palace.name, ...palace.stops]] : presetRooms[selected as keyof typeof presetRooms] ?? homeRooms} />
  </>
}

function PalaceRoute({ deck, cues, save, palaceId, rooms }: {
  deck: WordList; cues: Record<string, string>; save: Save; palaceId: string; rooms: string[][]
}) {
  const [index, setIndex] = useState(0)
  const [walk, setWalk] = useState(false)
  const catalog = selectableLists.find(list => list.id === deck.category + '-all')!
  const entry = deck.entries[index]
  if (!entry) return <p>This list has no stops yet.</p>
  const slot = catalog.entries.findIndex(item => item.id === entry.id)
  const stopsPerRoom = rooms[0].length - 1
  const roomIndex = Math.floor(slot / stopsPerRoom)
  const [room, ...places] = rooms[roomIndex % rooms.length]
  const place = places[slot % stopsPerRoom]
  const cueId = (palaceId === 'home' ? '' : palaceId + '-') + deck.category + '-' + entry.id
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
