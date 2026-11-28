import { Fragment, useId, useState } from 'react'
import { conjugationRules, particleRules } from '../data/grammar'
import { moreExamples, type GlossedEquation } from '../data/grammarListExamples'
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

// Read each particle in the context of the first worked example.
const particleGlosses: Record<string, [string, string]> = {
  topic: ['as for', 'as for home'], subject: ['subject', 'home (subject)'],
  object: ['object', 'food (object)'], possession: ['’s', 'a friend’s'],
  also: ['too', 'a friend too'], only: ['only', 'only water'],
  destination: ['to', 'to school'], actionPlace: ['at', 'at school'],
  direction: ['toward', 'toward home'], start: ['from', 'from today'],
  until: ['as far as', 'as far as school'], recipient: ['to', 'to a friend'],
  colloquialRecipient: ['to', 'to a friend'], honorificRecipient: ['to (respectful)', 'to the teacher'],
  with: ['with', 'with a friend'], colloquialWith: ['and', 'a house and …'],
  writtenWith: ['and', 'a house and …'], comparison: ['than', 'than a friend'],
  like: ['like', 'like a friend'], each: ['every', 'every day'],
  choice: ['or', 'food or …'], onlyNegative: ['except', 'except water'],
  fromPerson: ['from', 'from a friend'], even: ['even', 'even a friend'],
  approx: ['around', 'around three o’clock'], honorificSubject: ['subject (respectful)', 'the teacher (subject)'],
  allInGroup: ['among', 'among friends'],
}

function Gloss({ form, meaning }: { form: string, meaning: string }) {
  return <span className="grammar-gloss"><Korean>{form}</Korean><small lang="en">{meaning}</small></span>
}

function Equation({ parts }: { parts: GlossedEquation }) {
  return <div className="grammar-equation">{parts.map(([form, meaning], i) =>
    <Fragment key={i}>{i > 0 && <span>{i === 1 ? '+' : '='}</span>}<Gloss form={form} meaning={meaning} /></Fragment>
  )}</div>
}

export function GrammarList({ category }: { category?: ListCategory }) {
  const id = useId()
  const [selected, setSelected] = useState<ListCategory>(category ?? 'particles')
  const [expanded, setExpanded] = useState<string | null>(null)
  function select(tab: ListCategory) {
    setSelected(tab)
    setExpanded(null)
  }
  return <>
    {(category ? [category] : tabs).map(tab => <button key={tab} type="button" className="button quiet"
      popoverTarget={id} popoverTargetAction={category ? 'toggle' : 'show'} aria-haspopup="dialog" onClick={() => select(tab)}>
      {category ? 'Hints' : tab === 'particles' ? 'Particle Notes' : 'Conjugation Notes'}
    </button>)}
    <div popover="auto" id={id} role="dialog" aria-label="Grammar list" className="grammar-list">
      <div className="grammar-list-controls">
        <div className="segmented" role="tablist" aria-label="Grammar category">
          {tabs.map(tab => <button key={tab} type="button" role="tab" id={id + tab} aria-selected={selected === tab}
            tabIndex={selected === tab ? 0 : -1} aria-controls={id + '-panel'} onClick={() => select(tab)}
            onKeyDown={event => {
              if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const next = event.key === 'Home' ? 'particles' : event.key === 'End' ? 'conjugations' : tabs.find(option => option !== tab)!
              select(next)
              document.getElementById(id + next)?.focus()
            }}>{tab === 'particles' ? 'Particles' : 'Conjugations'}</button>)}
        </div>
        <button type="button" className="text-button" popoverTarget={id} popoverTargetAction="hide" aria-label="Close list">✕</button>
      </div>
      <div key={selected} id={id + '-panel'} role="tabpanel" aria-labelledby={id + selected} className="grammar-list-scroll" tabIndex={0}>
        <table><thead><tr><th>Form</th><th>Type</th><th>Example</th></tr></thead>
          <tbody>{Object.values(lists[selected]).map(rule => {
            const example = rule.examples[0]
            const ending = selected === 'particles' ? example.applied : exampleEndings[rule.id]
            const [endingMeaning, resultMeaning] = selected === 'particles'
              ? particleGlosses[rule.id]
              : [rule.english, example.meaning]
            const open = expanded === rule.id
            return <Fragment key={rule.id}><tr onClick={() => setExpanded(open ? null : rule.id)}>
              <th scope="row"><button type="button" className="grammar-disclosure" aria-expanded={open}>
                {open ? '▾' : '▸'} <Korean>{rule.korean}</Korean>
              </button></th><td>{rule.english}</td>
              <td><Equation parts={[[example.stem ?? example.original, example.originalMeaning],
                [ending, endingMeaning], [example.result, resultMeaning]]} /></td>
            </tr>{open && <tr><td colSpan={3} className="grammar-detail">
              <p>{rule.note} {selected === 'particles' && !rule.korean.includes('/') && !rule.korean.includes('(')
                && 'Use the same form after a vowel or a consonant.'}</p>
              <ol>{moreExamples(rule).map(parts => <li key={parts[0][0]}><Equation parts={parts} /></li>)}</ol>
            </td></tr>}</Fragment>
          })}</tbody>
        </table>
      </div>
    </div>
  </>
}
