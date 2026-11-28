import { useEffect, useState } from 'react'
import { classicPalaces, palaceRoute, type PalaceLandmark } from '../data/palaces'
import { sceneMaps } from '../data/sceneMaps'
import { Icon, Korean, speakKorean, stopKoreanAudio, type Save } from './shared'

import type { StudyState } from '../engine/storage'

export function MindPalace({ state, save }: { state: StudyState; save: Save }) {
  const custom = state.customPalaces ?? {}
  const firstMap = sceneMaps[0]
  // Earlier versions left the default Home selection implicit when saving a scene.
  const hasLegacyCues = Object.keys(state.palaceCues ?? {}).some(id => !firstMap.sections.some(section => id.startsWith('stop-' + section.id + '-')))
  const selected = state.activePalace ?? (hasLegacyCues ? 'home' : firstMap.id)
  const route = palaceRoute(selected, custom[selected], state.palaceCues ?? {})

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
      <MapWordList key={selected} route={route} />
    </div>
    <PalaceRoute key={selected} route={route}
      cues={state.palaceCues ?? {}} save={save} />
  </>
}

function PalaceRoute({ route, cues, save }: {
  route: PalaceLandmark[]; cues: Record<string, string>; save: Save
}) {
  const [index, setIndex] = useState(0)
  const [walk, setWalk] = useState(false)
  const {stage, room, place, word: entry, cueId} = route[index % route.length]
  return <article className="panel exercise-panel palace">
    <div className="card-meta"><span>Mind Palace</span><span>Stop {index + 1} of {route.length}</span></div>
    <div className="segmented" aria-label="Palace activity">
      <button aria-pressed={!walk} onClick={() => setWalk(false)}>Place words</button>
      <button aria-pressed={walk} onClick={() => { setWalk(true); setIndex(0) }}>Walk the route</button>
    </div>
    <p className="eyebrow">{stage && stage + ' · '}{room}</p>
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

function MapWordList({ route }: { route: PalaceLandmark[] }) {
  const [showWords, setShowWords] = useState(false)
  const [failedWord, setFailedWord] = useState('')
  useEffect(() => stopKoreanAudio, [])

  function pronounce(word: string) {
    setFailedWord('')
    speakKorean(word, 1, () => {}, () => setFailedWord(word))
  }

  const stages: { name?: string; rooms: PalaceLandmark[][] }[] = []
  for (const stop of route) {
    let stage = stages.at(-1)
    if (!stage || stage.name !== stop.stage) {
      stage = { name: stop.stage, rooms: [] }
      stages.push(stage)
    }
    const room = stage.rooms.at(-1)
    if (room && room[0].room === stop.room) room.push(stop)
    else stage.rooms.push([stop])
  }

  return <details className="palace-reference" onToggle={event => {
    setShowWords(event.currentTarget.open)
    if (!event.currentTarget.open) {
      stopKoreanAudio()
      setFailedWord('')
    }
  }}>
    <summary>Words in this map ({route.length})</summary>
    {showWords && <div className="palace-words">
      {failedWord && <p role="status">Audio couldn’t play. Tap <Korean>{failedWord}</Korean> to try again.</p>}
      {stages.map(stage => <div key={stage.name ?? 'map'} className="palace-word-stage">
        {stage.name && <h3>{stage.name}</h3>}
        {stage.rooms.map(stops => <table key={stops[0].cueId}>
          <caption>{stops[0].room}</caption>
          <tbody>{stops.map(({ cueId, word }) => <tr key={cueId}>
            <th scope="row"><button type="button" className="text-button" title="Play Korean pronunciation"
              onClick={() => pronounce(word.korean)}><Korean>{word.korean}</Korean><Icon name="sound" size={14} /></button></th>
            <td><em>{word.english}</em></td>
          </tr>)}</tbody>
        </table>)}
      </div>)}
    </div>}
  </details>
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
