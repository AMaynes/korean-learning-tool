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
import { categories, categoryIds } from '../data/model'
import type { Category, WordList } from '../data/model'
import { entryRule } from '../engine/registry'
import { Icon, Korean, ListSelect } from './shared'
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
    <div className="library-tools">
      <label className="field">Category
        <select aria-label="Category" value={category} onChange={event => {
          setCategory(event.target.value as Category)
          setQuery('')
        }}>
          {categoryIds.map(id => <option key={id} value={id}>{categories[id]}</option>)}
        </select>
      </label>
      <ListSelect category={category} lists={lists} selected={active.id} onSelect={onSelect} />
      <label className="field">Search
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="English or Korean" />
      </label>
    </div>
    <div className="panel vocabulary-table">
      <table aria-label={categories[category] + ' vocabulary'}>
        <thead><tr>
          <th scope="col">{isGrammar ? 'Pattern' : 'Korean'}</th>
          <th scope="col">Meaning</th>
          {isGrammar && <th scope="col">Example</th>}
        </tr></thead>
        <tbody>
          {rows.map(({ entry, example }) => <tr key={entry.id}>
            <th scope="row"><Korean>{entry.korean}</Korean></th>
            <td>{entry.english}</td>
            {isGrammar && <td>{example && <Korean>
              {example.original}{category === 'particles' && <> + {example.applied}</>} → <strong>{example.result}</strong>
            </Korean>}</td>}
          </tr>)}
          {rows.length === 0 && <tr><td colSpan={isGrammar ? 3 : 2}>No matching entries.</td></tr>}
        </tbody>
      </table>
    </div>
  </>
}
