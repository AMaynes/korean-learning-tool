/**
 * Overview & Purpose: Configure all decks, themes, backup operations, and scoped resets.
 *
 * Architectural Relationships: Uses shared selectors and the storage backup parser.
 *
 * External Resources: Version 1 full-backup JSON.
 *
 * Notes: Data replacement and destructive resets require deliberate confirmation.
 */


import { useState } from 'react'
import type { Category, WordList } from '../data/model'
import { importBackup } from '../engine/storage'
import type { StudyState } from '../engine/storage'
import { ActiveConfig, downloadJson, ImportButton } from './shared'
import type { Save, SelectList } from './shared'

/** Present global settings separately from day-to-day practice. */
export function Settings({ state, lists, active, onSelect, save, invalidate }: {
  state: StudyState; lists: WordList[]; active: Record<Category, WordList>; onSelect: SelectList; save: Save; invalidate: () => void
}) {
  const [notice, setNotice] = useState('')

  /** Apply a confirmed destructive change and invalidate open practice sessions. */
  async function commit(message: string, change: Parameters<Save>[0]) {
    if (!window.confirm(message)) return
    if (await save(change)) { invalidate(); setNotice('Changes saved.') }
  }

  return <>
    <div className="section-heading"><div><h1>Study settings</h1><p>Manage your active lists, appearance, and study data.</p></div></div>
    <section className="panel settings-panel"><h2>Active vocabulary</h2>
      <p>Every category has its own list. Practice uses the selections shown here.</p>
      <ActiveConfig lists={lists} active={active} onSelect={onSelect} />
    </section>
    <section className="panel settings-panel"><h2>Appearance</h2>
      <div className="segmented" aria-label="Appearance">{(['system', 'light', 'dark'] as const).map(theme =>
        <button key={theme} aria-pressed={state.theme === theme} onClick={() => void save(previous => ({ ...previous, theme }))}>{theme[0].toUpperCase() + theme.slice(1)}</button>)}</div>
    </section>
    <section className="panel settings-panel"><h2>Study data</h2><p>Progress is saved in this browser. Export a backup to move it to another device.</p>
      <div className="button-row">
        <button className="button" onClick={() => downloadJson('korean-study-backup.json', { kind: 'korean-study-backup', state })}>Export backup</button>
        <ImportButton onError={setNotice} onImport={async value => {
          const imported = importBackup(value)
          await commit('Replace your settings and study progress with this backup?', () => imported)
        }}>Import backup</ImportButton>
        <button className="button danger" onClick={() => void commit('Reset all practice progress?', previous =>
          ({ ...previous, recall: {}, scores: {} }))}>Reset all progress</button>

      </div>
      {notice && <p role="status">{notice}</p>}
    </section>
  </>
}
