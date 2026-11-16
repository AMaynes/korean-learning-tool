/**
 * Overview & Purpose: Teach the Korean language system through diagrams and worked examples.
 *
 * Architectural Relationships: Linked from the tool shell and back to practice modules.
 *
 * External Resources: HRD Korea Hangeul textbook and National Institute of Korean Language.
 *
 * Notes: Hangul diagrams distinguish written letters from speech sounds.
 */


import type { ReactNode } from 'react'
import { Icon, Korean } from './shared'

const sections = [
  ['writing-system', 'Hangul and sound'], ['sentence', 'Sentence structure'],
  ['nominals', 'Nominals and particles'], ['predicates', 'Predicates and endings'],
  ['modifiers', 'Modifiers and clauses'], ['conversation', 'Everyday usage'],
]

/** The letters occupying the initial, vowel, and optional final slots of a block. */
type Syllable = readonly [initial: string, vowel: string, result: string, endings?: readonly string[]]

const syllablePatterns = [
  { pattern: 'CV', ending: 'No coda', right: ['ㄱ', 'ㅏ', '가'], below: ['ㄱ', 'ㅗ', '고'] },
  { pattern: 'CVC', ending: 'Coda with one consonant', right: ['ㄱ', 'ㅏ', '감', ['ㅁ']], below: ['ㄱ', 'ㅗ', '곰', ['ㅁ']] },
  { pattern: 'CVCC', ending: 'Coda with two consonants', right: ['ㄱ', 'ㅏ', '값', ['ㅂ', 'ㅅ']], below: ['ㅁ', 'ㅗ', '몫', ['ㄱ', 'ㅅ']] },
] as const satisfies readonly { pattern: string; ending: string; right: Syllable; below: Syllable }[]

const coreParticles = [
  { role: 'Topic', pattern: '은 / 는', meaning: 'What you’re talking about', consonant: '밥 + 은 → 밥은', vowel: '저 + 는 → 저는' },
  { role: 'Subject', pattern: '이 / 가', meaning: 'Who or what does or is something', consonant: '집 + 이 → 집이', vowel: '친구 + 가 → 친구가' },
  { role: 'Object', pattern: '을 / 를', meaning: 'What the action affects', consonant: '책 + 을 → 책을', vowel: '커피 + 를 → 커피를' },
] as const

/** Teach the system from syllable construction through conversational usage. */
export function Intro() {
  return <div className="intro">
    <div className="section-heading"><div>
      <h1>How Korean works</h1>
      <p>Build a syllable, then see how words fit together in a sentence.</p>
    </div><a className="button primary" href="#recall">Go to practice <Icon name="arrow" /></a></div>

    <div className="intro-layout">
      <aside className="panel intro-index" aria-label="On this page">
        <h2>On this page</h2>
        {sections.map(([id, label]) => <button key={id} className="text-button" onClick={() => {
          const heading = document.getElementById(id)
          heading?.focus({ preventScroll: true })
          heading?.scrollIntoView({ block: 'start' })
        }}>{label}</button>)}
      </aside>

      <div className="intro-content">
        <article className="panel intro-panel">
          <h2 id="writing-system" tabIndex={-1}>Hangul and sound</h2>
          <div className="syllable-legend">
            <span><strong>C</strong> Consonant letter</span>
            <span><strong>V</strong> Vowel letter</span>
          </div>
          <p>Each Hangul block is one syllable. Any final consonant letters, called batchim (<Korean>받침</Korean>), go in the coda at the bottom.</p>

          <div className="syllable-matrix">
            <div className="syllable-pair syllable-columns">
              <div>Vertical vowel <Korean>ㅏ</Korean><small>Goes on the right</small></div>
              <div>Horizontal vowel <Korean>ㅗ</Korean><small>Goes below</small></div>
            </div>
            {syllablePatterns.map(({ pattern, ending, right, below }) => <section key={pattern} className="syllable-pattern">
              <h3><strong>{pattern}</strong> <span>{ending}{pattern === 'CVCC' && <> · Double batchim (<Korean>겹받침</Korean>)</>}</span></h3>
              <div className="syllable-pair">
                <SyllableBlock letters={right} position="right" />
                <SyllableBlock letters={below} position="below" />
              </div>
            </section>)}
          </div>

          <h3>How the spelling sounds</h3>
          <div className="table-wrap intro-table hangul-sounds"><table aria-label="Hangul spelling and sound examples">
            <thead><tr><th scope="col">Example</th><th scope="col">What to notice</th></tr></thead>
            <tbody>
              <tr><th scope="row"><Korean>ㅇ + ㅏ → 아</Korean></th><td>Initial <Korean>ㅇ</Korean> is silent. Final <Korean>ㅇ</Korean> sounds like “ng,” as in <Korean>공</Korean>.</td></tr>
              <tr><th scope="row"><Korean>ㄱ + ㅘ → 과</Korean></th><td><Korean>ㅘ</Korean> is one vowel that extends below and to the right.</td></tr>
              <tr>
                <th scope="row"><Korean>값 → [갑]</Korean><small>Coda <Korean>ㅂ + ㅅ → ㅂ</Korean></small></th>
                <td>Both letters share one coda. Said on its own, <Korean>값</Korean> has only the <Korean>ㅂ</Korean> sound at the end.</td>
              </tr>
              <tr>
                <th scope="row"><Korean>밥을 → [바블]</Korean><small>Coda <Korean>ㅂ</Korean> in <Korean>밥</Korean></small></th>
                <td>The <Korean>ㅂ</Korean> sound moves to the start of the next syllable.</td>
              </tr>
              <tr>
                <th scope="row"><Korean>사람 / 물</Korean><small>Coda <Korean>ㄹ</Korean> in <Korean>물</Korean></small></th>
                <td><Korean>ㄹ</Korean> taps between vowels in <Korean>사람</Korean> and sounds closer to “l” at the end of <Korean>물</Korean>.</td>
              </tr>
            </tbody>
          </table></div>
          <a className="text-button" href="#pronunciation">Practice Hangul and batchim <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="sentence" tabIndex={-1}>Sentence structure</h2>
          <ExampleParts parts={[['Topic', '저는', 'I'], ['Object', '음식을', 'food'], ['Predicate', '먹어요.', 'eat']]} meaning="I eat food." />
          <ExampleParts parts={[['Time', '오늘', 'today'], ['Topic', '저는', 'I'], ['Place', '집에서', 'at home'], ['Object', '밥을', 'rice / a meal'], ['Predicate', '먹어요.', 'eat']]} meaning="Today I’m eating at home." />
          <p>The predicate usually comes last. The earlier parts can move or be left out when context supplies them.</p>
          <div className="intro-pairs">
            <ExampleParts parts={[['Object', '음식을', 'food'], ['Predicate', '먹어요.', 'eat']]} meaning="I eat food. The speaker is understood." />
            <ExampleParts parts={[['Subject', '음식이', 'food'], ['Description', '맛있어요.', 'is delicious']]} meaning="The food is delicious." />
          </div>
          <a className="text-button" href="#grammar">Practice sentence structure <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="nominals" tabIndex={-1}>Nominals and particles</h2>
          <ExampleParts parts={[['Noun', '책'], ['Object particle', '을'], ['Result', '책을']]} meaning={<><Korean>책</Korean> means “book.” <Korean>을</Korean> marks it as the object.</>} />
          <p>Particles attach to nouns or pronouns. Check the last block for a final consonant before choosing the particle form.</p>
          <div className="table-wrap intro-table"><table aria-label="Particle forms after consonants and vowels">
            <thead><tr><th scope="col">Role</th><th scope="col">After consonant</th><th scope="col">After vowel</th></tr></thead>
            <tbody>{coreParticles.map(({ role, pattern, meaning, consonant, vowel }) => <tr key={role}>
              <th scope="row">{role} <Korean>{pattern}</Korean><small>{meaning}</small></th>
              <td><Korean>{consonant}</Korean></td>
              <td><Korean>{vowel}</Korean></td>
            </tr>)}</tbody>
          </table></div>
          <div className="table-wrap intro-table"><table aria-label="Particles for place, time, and possession">
            <thead><tr><th scope="col">Use</th><th scope="col">Example</th><th scope="col">Meaning</th></tr></thead>
            <tbody>
              <tr><th scope="row">Destination <Korean>에</Korean></th><td><Korean>학교에 가요.</Korean></td><td>I’m going to school.</td></tr>
              <tr><th scope="row">Action location <Korean>에서</Korean></th><td><Korean>학교에서 공부해요.</Korean></td><td>I study at school.</td></tr>
              <tr><th scope="row">Time <Korean>에</Korean></th><td><Korean>세 시에 만나요.</Korean></td><td>Let’s meet at three.</td></tr>
              <tr><th scope="row">Possession <Korean>의</Korean></th><td><Korean>친구의 집</Korean></td><td>A friend’s house.</td></tr>
            </tbody>
          </table></div>
          <p>Some pronouns change with <Korean>가</Korean>. <Korean>저 + 가 → 제가</Korean> and <Korean>누구 + 가 → 누가</Korean>.</p>
          <a className="text-button" href="#grammar">Practice particles <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="predicates" tabIndex={-1}>Predicates and endings</h2>
          <ExampleParts parts={[['Dictionary form', '먹다'], ['Stem', '먹'], ['Stem + ending', '먹어요']]} meaning={<>Remove <Korean>다</Korean> to find the stem. <Korean>먹 + 어요</Korean> makes the polite present.</>} />
          <div className="table-wrap intro-table"><table aria-label="Predicate ending examples">
            <thead><tr><th scope="col">Change</th><th scope="col">Example</th><th scope="col">Meaning</th></tr></thead>
            <tbody>
              <tr><th scope="row">Past ending</th><td><Korean>먹 + 었어요 → 먹었어요</Korean></td><td>Ate.</td></tr>
              <tr><th scope="row">Vowel contraction</th><td><Korean>가 + 아요 → 가요</Korean></td><td>Go.</td></tr>
              <tr><th scope="row">Irregular stem</th><td><Korean>어렵다 → 어려워요</Korean></td><td>It’s difficult.</td></tr>
              <tr><th scope="row">Auxiliary</th><td><Korean>먹 + 고 싶어요 → 먹고 싶어요</Korean></td><td>I want to eat.</td></tr>
            </tbody>
          </table></div>
          <div className="intro-pairs">
            <ExampleParts parts={[['Consonant ending', '학생이에요.'], ['Vowel ending', '친구예요.']]} meaning="“Is a student” and “is a friend.”" />
            <ExampleParts parts={[['Exists / have', '물이 있어요.'], ['Missing / don’t have', '물이 없어요.']]} meaning="“There’s water” and “there’s no water.”" />
          </div>
        </article>

        <article className="panel intro-panel">
          <h2 id="modifiers" tabIndex={-1}>Modifiers and clauses</h2>
          <div className="intro-pairs">
            <ExampleParts parts={[['Description', '예쁜'], ['Noun', '집']]} meaning={<>A pretty house. <Korean>예쁘다 → 예쁜</Korean> before a noun.</>} />
            <ExampleParts parts={[['Action clause', '먹는'], ['Noun', '사람']]} meaning={<>A person eating. <Korean>먹다 → 먹는</Korean> before a noun.</>} />
            <ExampleParts parts={[['Manner', '빨리'], ['Action', '먹어요.']]} meaning="Eat quickly. The adverb comes before the action." />
            <ExampleParts parts={[['Linked action', '먹고'], ['Final action', '가요.']]} meaning={<>Eat and then go. <Korean>-고</Korean> links the two actions.</>} />
          </div>
          <p><Korean>먹다 → 먹기 → 먹기 전에</Korean> means “eat → eating → before eating.” <Korean>-기</Korean> lets an action work like a noun.</p>
        </article>

        <article className="panel intro-panel">
          <h2 id="conversation" tabIndex={-1}>Everyday usage</h2>
          <div className="table-wrap intro-table"><table aria-label="Speech style examples">
            <thead><tr><th scope="col">Style</th><th scope="col">“I’m going”</th><th scope="col">When to use it</th></tr></thead>
            <tbody>
              <tr><th scope="row">Polite</th><td><Korean>가요.</Korean></td><td>Everyday default with strangers.</td></tr>
              <tr><th scope="row">Formal</th><td><Korean>갑니다.</Korean></td><td>Formal introductions and public settings.</td></tr>
              <tr><th scope="row">Casual</th><td><Korean>가.</Korean></td><td>Close relationships where casual speech is established.</td></tr>
            </tbody>
          </table></div>
          <ExampleParts parts={[['Honored subject', '선생님께서'], ['Honorific verb + polite ending', '오세요.']]} meaning={<>“The teacher is coming.” <Korean>께서</Korean> and <Korean>-시-</Korean> honor the teacher. <Korean>요</Korean> shows politeness toward the listener.</>} />
          <ExampleParts parts={[['Statement', '학교에 가요.'], ['Question', '학교에 가요?']]} meaning="“I’m going to school.” / “Are you going to school?” Rising intonation can signal the question." />
          <a className="text-button" href="#listening">Practice listening and conversation <Icon name="arrow" size={15} /></a>
        </article>
      </div>
    </div>
  </div>
}

/** Match the shape of the written slots and show their assembled Hangul block. */
function SyllableBlock({ letters: [initial, vowel, result, endings = []], position }: {
  letters: Syllable; position: 'right' | 'below'
}) {
  return <figure className="syllable-card" aria-label={`Syllable ${result}, vowel ${position === 'right' ? 'on the right' : 'below'}`}>
    <div className={`syllable-block syllable-vowel-${position}`}>
      <span className="syllable-slot syllable-initial"><small>C</small><Korean>{initial}</Korean></span>
      <span className="syllable-slot syllable-vowel"><small>V</small><Korean>{vowel}</Korean></span>
      {endings.length > 0 && <div className="syllable-coda" role="group" aria-label="Coda">
        {endings.map(letter => <span key={letter} className="syllable-slot"><small>C</small><Korean>{letter}</Korean></span>)}
        <small className="syllable-coda-label" aria-hidden="true">Coda</small>
      </div>}
    </div>
    <span aria-hidden="true" className="syllable-arrow">→</span>
    <strong className="syllable-result"><Korean>{result}</Korean></strong>
  </figure>
}

/** Keep labeled Korean chunks in reading order and pair them with a full gloss. */
function ExampleParts({ parts, meaning }: {
  parts: readonly (readonly [label: string, korean: string, english?: string])[]; meaning: ReactNode
}) {
  return <figure className="intro-example">
    <dl className="intro-parts">
      {parts.map(([label, korean, english]) => <div key={label}>
        <dt>{label}</dt>
        <dd><Korean>{korean}</Korean>{english && <small>{english}</small>}</dd>
      </div>)}
    </dl>
    <figcaption>{meaning}</figcaption>
  </figure>
}
