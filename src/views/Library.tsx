/**
 * Overview & Purpose: Display the bundled vocabulary lists in a compact, searchable table.
 *
 * Architectural Relationships: The app owns active selections; the registry supplies grammar examples.
 *
 * External Resources: None.
 *
 * Notes: List contents come from the bundled catalog.
 */


import { useState } from 'react'
import { categories } from '../data/model'
import type { Category, WordList } from '../data/model'
import { entryRule } from '../engine/registry'
import { Icon, Korean, spokenText, VocabularyCategory, ListSelect, StandalonePronunciationNote } from './shared'
import type { SelectList } from './shared'

/** Browse the active list and link directly to its recall deck. */
export function Library({ category, setCategory, lists, active, onSelect }: {
  category: Category; setCategory: (category: Category) => void; lists: WordList[];
  active: WordList; onSelect: SelectList
}) {
  const [query, setQuery] = useState('')
  const isGrammar = category === 'particles' || category === 'conjugations'
  const search = query.normalize('NFC').trim().toLowerCase()
  const rows = active.entries.map(entry => {
    const example = entryRule(category, entry)?.examples[0]
    return { entry, example }
  }).filter(({ entry, example }) =>
    [entry.korean, entry.english, example?.original, example?.result].some(value => value?.toLowerCase().includes(search)))

  return <>
    <div className="section-heading library-heading">
      <h1>Vocabulary Library</h1>
      <a className="button primary" href="#recall">Practice this list <Icon name="arrow" /></a>
    </div>
    <div className={'library-tools' + (category === 'topics' ? ' topic-library-tools' : '')}>
      <VocabularyCategory category={category} selected={active.id} onCategory={value => { setCategory(value); setQuery('') }} onSelect={onSelect} />
          {category !== 'topics' && <ListSelect category={category} lists={lists} selected={active.id} onSelect={onSelect} />}
      <label className="field">Search
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="English or Korean" />
      </label>
    </div>
    <div className="panel vocabulary-table">
      <table aria-label={(category === 'topics' ? active.name : categories[category]) + ' vocabulary'}>
        <thead><tr>
          <th scope="col">{isGrammar ? 'Pattern' : 'Korean'}</th>
          <th scope="col">Meaning</th>
          {isGrammar && <th scope="col">Example</th>}
        </tr></thead>
        <tbody>
          {rows.map(({ entry, example }) => <tr key={entry.id}>
            <th scope="row">
              <Korean>{entry.korean}</Korean>
              <StandalonePronunciationNote word={entry.korean} />
            </th>
            <td>{spokenText(entry.english)}</td>
            {isGrammar && <td>{example && <Korean>
              {example.original}{category === 'particles' && <> + {spokenText(example.applied)}</>} → <strong>{spokenText(example.result)}</strong>
            </Korean>}</td>}
          </tr>)}
          {rows.length === 0 && <tr><td colSpan={isGrammar ? 3 : 2}>No matching entries.</td></tr>}
        </tbody>
      </table>
    </div>
  </>
}
