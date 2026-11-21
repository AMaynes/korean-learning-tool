import { useId, useState } from 'react'
import { conjugationRules, particleRules } from '../data/grammar'
import { Korean } from './shared'

const lists = { particles: particleRules, conjugations: conjugationRules }
type ListCategory = keyof typeof lists
const tabs = ['particles', 'conjugations'] as const

// The second operand shows the ending used by the catalog's worked example.
const exampleEndings: Record<string, string> = {
  present: '어요', past: '었어요', future: 'ㄹ 거예요', casual: '아', formal: 'ㅂ니다',
  request: '으세요', wish: '고 싶어요', ongoing: '고 있어요', ability: 'ㄹ 수 있어요',
  must: '여야 해요', negative: '지 않아요', and: '고', but: '지만', if: '으면',
  because: '어서', while: '으면서', presentModifier: '는', nModifier: 'ㄴ',
  futureModifier: '을', nominal: '기', try: '어 봐요', plan: '려고 해요',
  before: '기 전', after: 'ㄴ 후', seems: 'ㄹ 것 같아요', background: '은데',
}

export function GrammarList({ category }: { category: ListCategory }) {
  const id = useId()
  const [selected, setSelected] = useState(category)
  return <>
    <button className="button quiet" popoverTarget={id} onClick={() => setSelected(category)}>List</button>
    <div popover="auto" id={id} role="dialog" aria-label="Grammar list" className="grammar-list">
      <div className="grammar-list-controls">
        <div className="segmented" role="tablist" aria-label="Grammar category">
          {tabs.map(tab => <button key={tab} role="tab" id={id + tab} aria-selected={selected === tab}
            tabIndex={selected === tab ? 0 : -1} aria-controls={id + '-panel'} onClick={() => setSelected(tab)}
            onKeyDown={event => {
              if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const next = event.key === 'Home' ? 'particles' : event.key === 'End' ? 'conjugations' : tabs.find(option => option !== tab)!
              setSelected(next)
              document.getElementById(id + next)?.focus()
            }}>{tab === 'particles' ? 'Particles' : 'Conjugations'}</button>)}
        </div>
        <button className="text-button" popoverTarget={id} popoverTargetAction="hide" aria-label="Close list">✕</button>
      </div>
      <div key={selected} id={id + '-panel'} role="tabpanel" aria-labelledby={id + selected} className="grammar-list-scroll" tabIndex={0}>
        <table><thead><tr><th>Form</th><th>Type</th><th>Example</th></tr></thead>
          <tbody>{Object.values(lists[selected]).map(rule => {
            const example = rule.examples[0]
            const ending = selected === 'particles' ? example.applied : exampleEndings[rule.id]
            return <tr key={rule.id}>
              <th scope="row"><Korean>{rule.korean}</Korean></th><td>{rule.english}</td>
              <td><Korean>{example.stem ?? example.original} + {ending} = {example.result}</Korean></td>
            </tr>
          })}</tbody>
        </table>
      </div>
    </div>
  </>
}
