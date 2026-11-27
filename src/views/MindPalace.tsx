import { useState } from 'react'
import { classicPalaces, palaceNames, palaceRoute, type PalaceLandmark, type Theme } from '../data/palaces'
import { sceneMaps } from '../data/sceneMaps'
import { Korean, type Save } from './shared'

import type { StudyState } from '../engine/storage'

export function MindPalace({ state, save }: { state: StudyState; save: Save }) {
  const [creating, setCreating] = useState(false)
  const [theme, setTheme] = useState<Theme>('home')
  const [name, setName] = useState('')
  const [landmarks, setLandmarks] = useState('')
  const [busy, setBusy] = useState(false)
  const custom = state.customPalaces ?? {}
  const firstMap = sceneMaps[0].id
  // Earlier versions left the default Home selection implicit when saving a scene.
  const hasLegacyCues = Object.keys(state.palaceCues ?? {}).some(id => !id.startsWith('stop-' + firstMap + '-'))
  const selected = state.activePalace ?? (hasLegacyCues ? 'home' : firstMap)
  const palace = custom[selected]
  const stops = landmarks.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const names: Record<string, string> = {...palaceNames}
  for (const [id, item] of Object.entries(custom)) names[id] = item.name
  const duplicate = Object.values(names).some(value => value.toLowerCase() === name.trim().toLowerCase())

  return <>
    <div className="panel exercise-panel palace">
      <label className="field">Choose a palace<select value={selected} onChange={event => {
        const activePalace = event.target.value
        void save(previous => ({ ...previous, activePalace }))
      }}>
        {(['Daily life', 'Conversations'] as const).map(group => <optgroup key={group} label={group}>
          {sceneMaps.filter(map => map.group === group).map(map => <option key={map.id} value={map.id}>{map.name}</option>)}
        </optgroup>)}
        <optgroup label="Classic palaces">{Object.entries(classicPalaces).map(([id, label]) =>
          <option key={id} value={id}>{label}</option>)}</optgroup>
        {Object.keys(custom).length > 0 && <optgroup label="My palaces">{Object.entries(custom).map(([id, item]) =>
          <option key={id} value={id}>{item.name}</option>)}</optgroup>}
      </select></label>
      <button className="button quiet" aria-expanded={creating} onClick={() => setCreating(!creating)}>{creating ? 'Cancel' : 'Create palace'}</button>
      {creating && <form className="palace" onSubmit={async event => {
        event.preventDefault()
        if (busy || duplicate || !name.trim() || !stops.length) return
        setBusy(true)
        const id = 'route-' + crypto.getRandomValues(new Uint32Array(2)).join('-')
        const item = {name: name.trim(), stops, theme}
        if (await save(previous => ({ ...previous, activePalace: id, customPalaces: { ...previous.customPalaces, [id]: item } }))) {
          setCreating(false); setName(''); setLandmarks('')
        }
        setBusy(false)
      }}>
        <label className="field">Palace name<input value={name} maxLength={80} onChange={e => setName(e.target.value)} /></label>
        <label className="field">Vocabulary theme<select value={theme} onChange={e => setTheme(e.target.value as Theme)}>
          {Object.entries(classicPalaces).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        {duplicate && <small>Choose a different name for this palace.</small>}
        <label className="field">Landmarks in walking order (one per line)<textarea value={landmarks} maxLength={8000}
          placeholder={'Front steps\nHall mirror\nKitchen sink'} onChange={e => setLandmarks(e.target.value)} /></label>
        <button className="button primary" disabled={busy || duplicate || !name.trim() || !stops.length}>Save palace</button>
      </form>}
    </div>
    <PalaceRoute key={selected} route={palaceRoute(selected, palace, state.palaceCues ?? {})}
      cues={state.palaceCues ?? {}} save={save} />
  </>
}

function PalaceRoute({ route, cues, save }: {
  route: PalaceLandmark[]; cues: Record<string, string>; save: Save
}) {
  const [index, setIndex] = useState(0)
  const [showWords, setShowWords] = useState(false)
  const [walk, setWalk] = useState(false)
  const {room, place, word: entry, cueId} = route[index % route.length]
  return <article className="panel exercise-panel palace">
    <div className="card-meta"><span>Mind Palace</span><span>Stop {index + 1} of {route.length}</span></div>
    <div className="segmented" aria-label="Palace activity">
      <button aria-pressed={!walk} onClick={() => setWalk(false)}>Place words</button>
      <button aria-pressed={walk} onClick={() => { setWalk(true); setIndex(0) }}>Walk the route</button>
    </div>
    <details onToggle={event => setShowWords(event.currentTarget.open)}>
      <summary>Words in this map ({route.length})</summary>
      {showWords && <ol className="palace-words">{route.map(stop =>
        <li key={stop.cueId}><Korean>{stop.word.korean}</Korean> · <em>{stop.word.english}</em></li>)}</ol>}
    </details>
    <p className="eyebrow">{room}</p>
    <h2>{place}</h2>
    <PalaceStop key={cueId + walk} korean={entry.korean} english={entry.english}
      cue={cues[cueId] ?? ''} walk={walk} saveCue={value => save(previous => ({
        ...previous, palaceCues: { ...previous.palaceCues, [cueId]: value },
      }))} />
    <div className="card-actions"><button className="button" disabled={!index} onClick={() => setIndex(index - 1)}>Previous stop</button>
      <button className="button primary" onClick={() => setIndex((index + 1) % route.length)}>
        {index + 1 === route.length ? 'Back to first stop' : 'Next stop'}</button></div>
  </article>
}

function PalaceStop({ korean, english, cue, walk, saveCue }: {
  korean: string; english: string; cue: string; walk: boolean; saveCue: (value: string) => Promise<boolean>
}) {
  const [draft, setDraft] = useState(cue)
  const [revealed, setRevealed] = useState(false)
  const [hint, setHint] = useState(false)
  const [busy, setBusy] = useState(false)
  return <>
    {(!walk || revealed) && <p><strong><Korean>{korean}</Korean></strong> · <em>{english}</em></p>}
    {walk ? <>
      <p>Picture this stop. What would you say in Korean?</p>
      {hint && <p>{cue}</p>}
      <div className="button-row">
        {cue && !hint && <button className="button quiet" onClick={() => setHint(true)}>Show my scene</button>}
        {!revealed && <button className="button" onClick={() => setRevealed(true)}>Reveal word</button>}
      </div>
    </> : <>
      <p>Picture this moment and say the Korean aloud.</p>
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
