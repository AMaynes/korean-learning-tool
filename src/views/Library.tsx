/**
 * Overview & Purpose: Browse active and inactive study decks and manage custom content.
 *
 * Architectural Relationships: Uses grammar definitions, the vocabulary registry, and shared controls.
 *
 * External Resources: Version 1 vocabulary-list JSON.
 *
 * Notes: Editing built-ins creates a local override. New IDs preserve separate progress on import.
 */


import { useState } from 'react'
import { conjugationRules, particleRules } from '../data/grammar'
import { categories, categoryIds } from '../data/model'
import type { Category, Entry, Irregular, WordList } from '../data/model'
import { builtInLists, defaultSelection, entryRule, exportList, importList, isList } from '../engine/registry'
import type { StudyState } from '../engine/storage'
import { downloadJson, Empty, Icon, ImportButton, Korean, Transform } from './shared'
import type { Save, SelectList } from './shared'

type Editor = { kind: 'new' | 'rename' } | { kind: 'entry'; entry?: Entry }

/** Filter the browsed list while allowing explicit activation and local edits. */
export function Library({ category, setCategory, lists, active, onSelect, save, openRecall, state }: {
  category: Category; setCategory: (category: Category) => void; lists: WordList[]; active: WordList;
  onSelect: SelectList; save: Save; openRecall: () => void; state: StudyState
}) {
  const [browseId, setBrowseId] = useState('')
  const [query, setQuery] = useState('')
  const [masteryFilter, setMasteryFilter] = useState('all')
  const [editor, setEditor] = useState<Editor>()
  const [notice, setNotice] = useState('')
  const options = lists.filter(list => list.category === category)
  const deck = options.find(list => list.id === browseId) ?? active
  const builtIn = builtInLists.some(list => list.id === deck.id)
  const search = query.normalize('NFC').trim().toLowerCase()
  const masteredIds = state.recall[deck.id]?.entries ?? {}
  const entries = deck.entries.filter(entry => {
    const rule = entryRule(category, entry)
    const searchable = [entry.english, entry.korean, entry.note, entry.example, ...entry.tags ?? [],
      rule?.note, ...rule?.examples.flatMap(example => [example.original, example.result, example.originalMeaning]) ?? [],
    ].filter(Boolean).join(' ').toLowerCase()
    return (!search || searchable.includes(search)) && (masteryFilter === 'all' ||
      (masteryFilter === 'mastered') === (masteredIds[entry.id]?.streak === 4))
  })

  /** Save an override or new custom deck by stable identity. */
  async function saveDeck(next: WordList, makeActive = false) {
    if (!isList(next)) { setNotice('Enter a list name and valid Hangul and English fields.'); return false }
    const ok = await save(previous => ({ ...previous,
      customLists: [...previous.customLists.filter(list => list.id !== next.id), next],
      selected: makeActive ? { ...previous.selected, [next.category]: next.id } : previous.selected,
    }))
    if (ok) { setEditor(undefined); setNotice('List saved.') }
    return ok
  }

  /** Delete custom decks and restore a category-local default selection. */
  async function removeDeck() {
    if (builtIn || !window.confirm(`Delete “${deck.name}” and its recall progress?`)) return
    if (await save(previous => {
      const recall = { ...previous.recall }
      delete recall[deck.id]
      return { ...previous, recall, customLists: previous.customLists.filter(list => list.id !== deck.id),
        selected: previous.selected[category] === deck.id ? { ...previous.selected, [category]: defaultSelection[category] } : previous.selected }
    })) { setBrowseId(''); setNotice('List deleted.') }
  }

  return <>
    <div className="section-heading"><div><h1>Vocabulary Library</h1><p>Browse Korean words, particles, and conjugations by list.</p></div>
      <button className="button primary" onClick={() => { onSelect(category, deck.id); openRecall() }}>Practice this list <Icon name="arrow" /></button>
    </div>
    <div className="panel library-tools">
      <div className="config-grid">
        <label className="field">Category<select aria-label="Category" value={category} onChange={event => {
          setCategory(event.target.value as Category); setBrowseId(''); setQuery(''); setEditor(undefined); setNotice('')
        }}>{categoryIds.map(id => <option key={id} value={id}>{categories[id]}</option>)}</select></label>
        <label className="field">Browse list<select aria-label="Browse list" value={deck.id} onChange={event => {
          setBrowseId(event.target.value); setEditor(undefined); setNotice('')
        }}>{options.map(list => <option key={list.id} value={list.id}>{list.name}{list.id === active.id ? ' (active)' : ''}</option>)}</select></label>
        <label className="field">Search entries<div className="search-field"><Icon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="English or Korean" /></div></label>
        <label className="field">Mastery filter<select aria-label="Mastery filter" value={masteryFilter} onChange={event => setMasteryFilter(event.target.value)}>
          <option value="all">All entries</option><option value="mastered">Mastered</option><option value="pending">Learning / new</option>
        </select></label>
      </div>
      <div className="button-row library-actions">
        {deck.id !== active.id && <button className="button primary" onClick={() => onSelect(category, deck.id)}>Set as active</button>}
        <button className="button" onClick={() => { setEditor({ kind: 'new' }); setNotice('') }}>New list</button>
        <button className="button" onClick={() => setEditor({ kind: 'rename' })}>Rename list</button>
        <button className="button" onClick={() => setEditor({ kind: 'entry' })}>Add entry</button>
        <button className="button" onClick={() => downloadJson(deck.id + '.json', exportList(deck))}>Export list</button>
        <ImportButton onError={setNotice} onImport={async value => {
          const next = importList(value, 'custom-' + crypto.randomUUID())
          if (await saveDeck(next)) { setCategory(next.category); setBrowseId(next.id); setQuery('') }
        }}>Import list</ImportButton>
        {!builtIn && <button className="button danger" onClick={() => void removeDeck()}>Delete list</button>}
      </div>
    </div>
    {notice && <p className="status-message" role="status">{notice}</p>}
    {editor && <ListEditor key={editor.kind === 'entry' ? editor.entry?.id ?? 'add' : editor.kind} editor={editor} deck={deck}
      nextNumber={options.reduce((max, list) => Math.max(max, Number(/^List (\d+)/.exec(list.name)?.[1] ?? 0)), 0) + 1}
      onCancel={() => setEditor(undefined)} onSave={async next => {
        if (await saveDeck(next, editor.kind === 'new')) setBrowseId(next.id)
      }} />}
    <div className="list-heading"><h2>{deck.name}</h2><span>{entries.length} of {deck.entries.length} entries · {deck.id === active.id ? 'Active' : 'Inactive'}</span></div>
    {entries.length === 0 && <Empty title={deck.entries.length ? 'No matching entries' : 'This list is empty'}><p>{deck.entries.length ? 'Try a different search or mastery filter.' : 'Add entries above or import a vocabulary list.'}</p></Empty>}
    <div className="library-entries">{entries.map(entry => {
      const rule = entryRule(category, entry)
      return <article className="panel entry-panel" key={entry.id}>
        <div className="entry-heading"><div><h3><Korean>{entry.korean}</Korean></h3><p>{entry.english}</p></div>
          {masteredIds[entry.id]?.streak === 4 && <span className="status-pill"><Icon name="check" size={14} /> Mastered</span>}
          <button className="button quiet" aria-label={`Edit ${entry.korean}`} onClick={() => setEditor({ kind: 'entry', entry })}>Edit</button>
        </div>
        {rule && <>
          <Transform example={rule.examples[0]} />
          <details><summary>Usage{rule.examples.length > 1 ? ' and more examples' : ''}</summary>
            <p className="inline-note">{rule.type} · {rule.note}</p>
            {rule.examples.slice(1).map(example => <Transform key={example.result} example={example} />)}
          </details>
        </>}
        {!rule && (entry.note || entry.example || entry.tags?.length) && <details><summary>Usage notes</summary>
          {entry.note && <p>{entry.note}</p>}{entry.example && <p><Korean>{entry.example}</Korean></p>}
          {!!entry.tags?.length && <p>{entry.tags.join(' · ')}</p>}
        </details>}
        <button className="text-button danger" onClick={() => {
          if (window.confirm(`Remove “${entry.korean}” from this list?`)) void saveDeck({ ...deck, entries: deck.entries.filter(word => word.id !== entry.id) })
        }}>Remove entry</button>
      </article>
    })}</div>
  </>
}

/** Create and edit an entry or deck using stable IDs and curated grammar definitions. */
function ListEditor({ editor, deck, nextNumber, onSave, onCancel }: {
  editor: Editor; deck: WordList; nextNumber: number; onSave: (deck: WordList) => Promise<void>; onCancel: () => void
}) {
  const entry = editor.kind === 'entry' ? editor.entry : undefined
  const [name, setName] = useState(editor.kind === 'new' ? `List ${nextNumber} · ` : deck.name)
  const [korean, setKorean] = useState(entry?.korean ?? '')
  const [english, setEnglish] = useState(entry?.english ?? '')
  const [note, setNote] = useState(entry?.note ?? '')
  const [example, setExample] = useState(entry?.example ?? '')
  const [tags, setTags] = useState(entry?.tags?.join(', ') ?? '')
  const [alternatives, setAlternatives] = useState(entry?.alternatives?.join(', ') ?? '')
  const [irregular, setIrregular] = useState<Irregular | ''>(entry?.irregular ?? '')
  const [ruleId, setRuleId] = useState(entry?.rule ?? '')
  const rules = deck.category === 'particles' ? particleRules : deck.category === 'conjugations' ? conjugationRules : undefined
  const isEntry = editor.kind === 'entry'
  return <form className="panel editor" onSubmit={event => {
    event.preventDefault()
    if (!isEntry) {
      const next = editor.kind === 'new' ? { id: 'custom-' + crypto.randomUUID(), category: deck.category, entries: [] } : deck
      void onSave({ ...next, name: name.trim() }); return
    }
    const rule = rules?.[ruleId]
    const next: Entry = { id: entry?.id ?? 'entry-' + crypto.randomUUID(), korean: rule?.korean ?? korean.trim().normalize('NFC'),
      english: rule?.english ?? english.trim(), rule: rule?.id, irregular: irregular || undefined,
      note: note.trim() || undefined, example: example.trim() || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      alternatives: alternatives.split(',').map(answer => answer.trim()).filter(Boolean),
    }
    void onSave({ ...deck, entries: entry ? deck.entries.map(word => word.id === entry.id ? next : word) : [...deck.entries, next] })
  }}>
    <h2>{isEntry ? entry ? 'Edit entry' : 'Add an entry' : editor.kind === 'new' ? 'Create a list' : 'Rename list'}</h2>
    {!isEntry ? <label className="field">List name<input required autoFocus value={name} onChange={event => setName(event.target.value)} maxLength={100} /></label> :
      rules ? <label className="field">Grammar rule<select aria-label="Grammar rule" required value={ruleId} onChange={event => setRuleId(event.target.value)}>
        <option value="">Choose a rule</option>{Object.values(rules).filter(rule =>
          rule.id === entry?.rule || !deck.entries.some(word => word.rule === rule.id)
        ).map(rule => <option key={rule.id} value={rule.id}>{rule.korean} · {rule.english}</option>)}
      </select></label> : <div className="config-grid">
        <label className="field">Hangul<input required lang="ko" value={korean} maxLength={400} onChange={event => setKorean(event.target.value)} /></label>
        <label className="field">English meaning<input required value={english} maxLength={400} onChange={event => setEnglish(event.target.value)} /></label>
        <label className="field">Usage notes <small>Optional</small><input value={note} maxLength={2000} onChange={event => setNote(event.target.value)} /></label>
        <label className="field">Example <small>Optional</small><input lang="ko" value={example} maxLength={2000} onChange={event => setExample(event.target.value)} /></label>
        <label className="field">Tags <small>Comma-separated</small><input value={tags} onChange={event => setTags(event.target.value)} /></label>
        <label className="field">Accepted Hangul alternatives <small>Comma-separated</small><input lang="ko" value={alternatives} onChange={event => setAlternatives(event.target.value)} /></label>
        {(deck.category === 'verbs' || deck.category === 'adjectives') && <label className="field">Irregular class<select aria-label="Irregular class" value={irregular} onChange={event => setIrregular(event.target.value as Irregular | '')}>
          <option value="">Regular / unmarked</option>{([['b', 'ㅂ'], ['d', 'ㄷ'], ['reu', '르'], ['s', 'ㅅ'], ['h', 'ㅎ']] as const).map(([id, label]) =>
            <option key={id} value={id}>{label} irregular</option>)}
        </select></label>}
      </div>}
    <div className="button-row"><button className="button primary" type="submit">Save {isEntry ? 'entry' : 'list'}</button><button type="button" className="button" onClick={onCancel}>Cancel</button></div>
  </form>
}
