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
  ['writing-system', 'Hangul and sound'],
  ['nominals', 'Nominals and particles'], ['predicates', 'Predicates and endings'],
  ['modifiers', 'Modifiers and clauses'], ['conversation', 'Everyday usage'],
  ['sentence', 'Sentence structure'],
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
      <p>Work up from a Hangul block to “Today I’m eating spicy food at home.”</p>
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
              <tr>
                <th scope="row"><Korean>ㅁ + ㅓ + ㄱ → 먹</Korean><small><Korean>먹어요 → [머거요]</Korean></small></th>
                <td>The <Korean>ㄱ</Korean> is the coda in <Korean>먹</Korean>. In <Korean>먹어요</Korean> (“eat”), it moves to the start of the next syllable in speech.</td>
              </tr>
            </tbody>
          </table></div>
          <a className="text-button" href="#pronunciation">Practice Hangul and batchim <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="nominals" tabIndex={-1}>Nominals and particles</h2>
          <ExampleParts parts={[['Noun', '음식', 'food'], ['Object particle', '을', 'marks the object'], ['Object phrase', '음식을', 'food']]} meaning={<>The last block of <Korean>음식</Korean> ends in <Korean>ㄱ</Korean>, so attach <Korean>을</Korean>.</>} />
          <p>Particles often attach to noun phrases. For pairs like <Korean>을/를</Korean>, check whether the last block has a final consonant before choosing the form.</p>
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
              <tr><th scope="row">Action location <Korean>에서</Korean></th><td><Korean>집에서 먹어요.</Korean></td><td>I eat at home.</td></tr>
              <tr><th scope="row">Time <Korean>에</Korean></th><td><Korean>세 시에 만나요.</Korean></td><td>Let’s meet at three.</td></tr>
              <tr><th scope="row">Time word <Korean>오늘</Korean></th><td><Korean>오늘 먹어요.</Korean></td><td>I’m eating it today. <Korean>오늘</Korean> (“today”) stands on its own.</td></tr>
              <tr><th scope="row">Possession <Korean>의</Korean></th><td><Korean>친구의 집</Korean></td><td>A friend’s house.</td></tr>
            </tbody>
          </table></div>
          <p>Some pronouns change with <Korean>가</Korean>. <Korean>저 + 가 → 제가</Korean> and <Korean>누구 + 가 → 누가</Korean>.</p>
          <a className="text-button" href="#grammar">Practice particles <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="predicates" tabIndex={-1}>Predicates and endings</h2>
          <ExampleParts parts={[['Dictionary form', '먹다', 'to eat'], ['Stem', '먹', 'eat'], ['Stem + ending', '먹어요', 'eat, everyday polite']]} meaning={<>Remove <Korean>다</Korean> to get the block <Korean>먹</Korean>. Add <Korean>어요</Korean> to make the everyday polite form.</>} />
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
            <ExampleParts parts={[['Noun modifier', '매운', 'spicy'], ['Noun', '음식', 'food']]} meaning={<>Change <Korean>맵다</Korean> (“be spicy”) to <Korean>매운</Korean> before <Korean>음식</Korean>. The object phrase is <Korean>매운 음식을</Korean> (“spicy food”).</>} />
            <ExampleParts parts={[['Action clause', '먹는'], ['Noun', '사람']]} meaning={<>A person eating. <Korean>먹다 → 먹는</Korean> before a noun.</>} />
            <ExampleParts parts={[['Manner', '빨리'], ['Action', '먹어요.']]} meaning="Eat quickly. The adverb comes before the action." />
            <ExampleParts parts={[['Linked action', '먹고', 'eat and then'], ['Final action', '쉬어요.', 'rest']]} meaning={<>Eat and then rest. <Korean>-고</Korean> links the two actions.</>} />
          </div>
          <p><Korean>먹다 → 먹기 → 먹기 전에</Korean> means “eat → eating → before eating.” <Korean>-기</Korean> lets an action work like a noun.</p>
        </article>

        <article className="panel intro-panel">
          <h2 id="conversation" tabIndex={-1}>Everyday usage</h2>
          <div className="table-wrap intro-table"><table aria-label="Speech style examples">
            <thead><tr><th scope="col">Style</th><th scope="col">“I eat”</th><th scope="col">When to use it</th></tr></thead>
            <tbody>
              <tr><th scope="row">Everyday polite</th><td><Korean>먹어요.</Korean></td><td>Everyday default with strangers.</td></tr>
              <tr><th scope="row">Formal polite</th><td><Korean>먹습니다.</Korean></td><td>Formal introductions and public settings.</td></tr>
              <tr><th scope="row">Casual</th><td><Korean>먹어.</Korean></td><td>Close relationships where casual speech is established.</td></tr>
            </tbody>
          </table></div>
          <ExampleParts parts={[['Honored subject', '선생님께서'], ['Honorific verb + polite ending', '오세요.']]} meaning={<>“The teacher is coming.” <Korean>께서</Korean> and <Korean>-시-</Korean> honor the teacher. <Korean>요</Korean> shows politeness toward the listener.</>} />
          <ExampleParts parts={[['Statement', '매운 음식을 먹어요.', 'I eat spicy food.'], ['Question', '매운 음식을 먹어요?', 'Do you eat spicy food?']]} meaning="The words can stay the same. Rising intonation can signal the question." />
          <a className="text-button" href="#listening">Practice listening and conversation <Icon name="arrow" size={15} /></a>
        </article>

        <SentenceStructure />
      </div>
    </div>
  </div>
}

/** Show how to assemble a clause, change what it says, and combine it with other clauses. */
function SentenceStructure() {
  return <article className="panel intro-panel">
    <h2 id="sentence" tabIndex={-1}>Sentence structure</h2>
    <p>Start with the predicate. It tells you what happens, what something is like, or what it is. In the basic sentence pattern it comes last, after the people, things, time, and place.</p>
    <ExampleParts parts={[['Subject + topic particle', '저는', 'I'], ['Object · 을/를', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="I eat food." />
    <h3>Build the full sentence</h3>
    <ExampleParts
      parts={[
        ['Time', '오늘', 'today'],
        ['Subject + topic particle', '저는', 'I'],
        ['Place · 에서', '집에서', 'at home'],
        ['Noun modifier', '매운', 'spicy'],
        ['Object noun · 을', '음식을', 'food'],
        ['Everyday polite action', '먹어요.', 'eat'],
      ]}
      meaning="Today I’m eating spicy food at home."
    />
    <p><Korean>매운 음식을</Korean> is one object phrase. The particle <Korean>을</Korean> goes after the noun <Korean>음식</Korean>, and the polite predicate <Korean>먹어요</Korean> closes the sentence.</p>

    <h3>What the predicate needs</h3>
    <div className="intro-pairs">
      <ExampleParts parts={[['Subject', '아기가', 'the baby'], ['Action', '자요.', 'sleeps']]} meaning="The baby sleeps. This action takes no object." />
      <ExampleParts parts={[['Subject', '음식이', 'the food'], ['Description', '맛있어요.', 'is delicious']]} meaning="The food is delicious." />
      <ExampleParts parts={[['Topic', '민수는', 'Minsu'], ['Identity', '학생이에요.', 'is a student']]} meaning="Minsu is a student." />
      <ExampleParts parts={[['Location', '집에', 'at home'], ['Subject', '고양이가', 'a cat'], ['Existence', '있어요.', 'is there']]} meaning="There’s a cat at home." />
      <ExampleParts parts={[['Recipient', '친구에게', 'to a friend'], ['Object', '책을', 'a book'], ['Action', '줘요.', 'give']]} meaning="I give a friend a book. The recipient gets the object." />
      <ExampleParts parts={[['Subject', '친구가', 'my friend'], ['Complement', '선생님이', 'a teacher'], ['Change', '됐어요.', 'became']]} meaning="My friend became a teacher. The complement says what the subject became." />
    </div>

    <h3>What particles attach to</h3>
    <p><Korean>은/는</Korean> sets the topic or adds contrast. <Korean>이/가</Korean> marks the subject, and <Korean>을/를</Korean> marks the object. In <Korean>저는 음식을 먹어요</Korean>, the topic is also the person eating. A topic and a separate subject can appear together.</p>
    <ExampleParts parts={[['Topic · 는', '저는', 'as for me'], ['Subject · 가', '커피가', 'coffee'], ['Description', '좋아요.', 'is pleasing']]} meaning="I like coffee. Literally, “As for me, coffee is pleasing.”" />
    <div className="table-wrap intro-table"><table aria-label="What Korean particles can attach to">
      <thead><tr><th scope="col">Attaches to</th><th scope="col">Build it</th><th scope="col">Meaning</th></tr></thead>
      <tbody>
        <tr><th scope="row">Noun or pronoun</th><td><Korean>책 + 을 → 책을</Korean></td><td>“Book” marked as the object</td></tr>
        <tr><th scope="row">Action made noun-like</th><td><Korean>말하기 + 가 → 말하기가</Korean></td><td>“Speaking” marked as the subject</td></tr>
        <tr><th scope="row">Adverb</th><td><Korean>아직 + 도 → 아직도</Korean></td><td>“Still,” with emphasis</td></tr>
        <tr><th scope="row">Certain verb forms</th><td><Korean>먹지 + 는 → 먹지는</Korean></td><td>Emphasizes “eat” in <Korean>먹지는 않아요</Korean> (“I don’t eat it”)</td></tr>
        <tr><th scope="row">Phrase with a particle</th><td><Korean>집에서 + 는 → 집에서는</Korean></td><td>“At home,” with home singled out</td></tr>
      </tbody>
    </table></div>

    <h3>Moving and leaving out parts</h3>
    <p>Time and other phrases can move. Leave out a subject or object when the listener can supply it from context.</p>
    <ExampleParts parts={[['Topic', '저는', 'I'], ['Time', '오늘', 'today'], ['Place', '집에서', 'at home'], ['Noun modifier', '매운', 'spicy'], ['Object noun', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="“Today I’m eating spicy food at home,” with the topic first this time." />
    <div className="intro-pairs">
      <ExampleParts parts={[['Object', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="I eat food. The speaker is understood." />
      <ExampleParts parts={[['Action', '먹어요.', 'eat']]} meaning="I’m eating it. The listener supplies who is eating and what they’re eating." />
    </div>
    <ExampleParts parts={[['Companion · (이)랑', '친구랑', 'with a friend'], ['Means · (으)로', '지하철로', 'by subway'], ['Destination · 에', '학교에', 'to school'], ['Action', '가요.', 'go']]} meaning="I go to school by subway with a friend. Each particle shows how that phrase relates to the action." />

    <h3>Modifiers and clauses</h3>
    <div className="intro-pairs">
      <ExampleParts parts={[['Noun modifier', '매운', 'spicy'], ['Object', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="I eat spicy food. The modifier stays with the noun when the rest of the sentence gets shorter." />
      <ExampleParts parts={[['Object', '책을', 'a book'], ['Manner', '천천히', 'slowly'], ['Action', '읽어요.', 'read']]} meaning="I read a book slowly. The adverb goes before the action it describes." />
    </div>
    <ExampleParts parts={[['Who read it', '제가', 'I'], ['Noun-modifying verb', '읽은', 'read'], ['Main subject', '책이', 'the book'], ['Main predicate', '재미있어요.', 'is interesting']]} meaning={<>The book I read is interesting. The whole clause <Korean>제가 읽은</Korean> goes before <Korean>책</Korean>.</>} />
    <div className="intro-pairs">
      <ExampleParts parts={[['Noun modifier', '매운', 'spicy'], ['First object', '음식을', 'food'], ['First action · -고', '먹고', 'eat and then'], ['Final action', '쉬어요.', 'rest']]} meaning="I eat spicy food and then rest. The last action keeps the polite ending." />
      <ExampleParts parts={[['Reason subject', '비가', 'rain'], ['Reason · -아서/어서', '와서', 'because it’s falling'], ['Location', '집에', 'at home'], ['Main predicate', '있어요.', 'stay']]} meaning="I’m staying home because it’s raining." />
      <ExampleParts parts={[['Condition subject', '비가', 'rain'], ['Condition · -(으)면', '오면', 'if it falls'], ['Location', '집에', 'at home'], ['Main predicate', '있어요.', 'stay']]} meaning="If it rains, I’ll stay home." />
      <ExampleParts parts={[['Speaker', '민수가', 'Minsu'], ['Quoted subject', '비가', 'rain'], ['Quoted predicate · -다고', '온다고', 'that it’s falling'], ['Main action', '했어요.', 'said']]} meaning="Minsu said it was raining." />
    </div>

    <h3>How the sentence ends</h3>
    <p>Keep the same action and change the predicate to set the tense or speech style, ask a question, make a request, or suggest doing something together.</p>
    <div className="table-wrap intro-table"><table aria-label="Ways to end a Korean sentence">
      <thead><tr><th scope="col">Use</th><th scope="col">Example</th><th scope="col">Meaning</th></tr></thead>
      <tbody>
        <tr><th scope="row">Everyday polite</th><td><Korean>먹어요.</Korean></td><td>I eat it.</td></tr>
        <tr><th scope="row">Casual</th><td><Korean>먹어.</Korean></td><td>I eat it.</td></tr>
        <tr><th scope="row">Formal polite</th><td><Korean>먹습니다.</Korean></td><td>I eat it.</td></tr>
        <tr><th scope="row">Past</th><td><Korean>먹었어요.</Korean></td><td>I ate it.</td></tr>
        <tr><th scope="row">Future</th><td><Korean>먹을 거예요.</Korean></td><td>I’ll eat it.</td></tr>
        <tr><th scope="row">Negation</th><td><Korean>안 먹어요.</Korean></td><td>I don’t eat it.</td></tr>
        <tr><th scope="row">Yes/no question</th><td><Korean>먹어요?</Korean></td><td>Do you eat it?</td></tr>
        <tr><th scope="row">Question word</th><td><Korean>뭘 먹어요?</Korean></td><td>What are you eating?</td></tr>
        <tr><th scope="row">Polite request</th><td><Korean>먹어 주세요.</Korean></td><td>Please eat it.</td></tr>
        <tr><th scope="row">Suggestion</th><td><Korean>같이 먹을까요?</Korean></td><td>Shall we eat together?</td></tr>
      </tbody>
    </table></div>
    <p>Put <Korean>뭘</Korean> (“what,” the object) in the same place as <Korean>매운 음식을</Korean> in the original sentence.</p>
    <a className="text-button" href="#grammar">Practice sentence structure <Icon name="arrow" size={15} /></a>
  </article>
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
