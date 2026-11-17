/**
 * Overview & Purpose: Teach the Korean language system through diagrams and worked examples.
 *
 * Architectural Relationships: Linked from the tool shell and back to practice modules.
 *
 * External Resources: HRD Korea Hangeul textbook and National Institute of Korean Language.
 *
 * Notes: Hangul diagrams distinguish written letters from speech sounds.
 */


import { createContext, useContext, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  adjectiveTypes, conjugationTypes, introGlossary, introWordMeanings, modifierTypes, nounTypes,
  numeralTypes, particleTypes, pronounTypes, verbTypes,
} from '../data/intro'
import type { ExampleFocus, IntroTerm, IntroType } from '../data/intro'
import { Icon, Korean } from './shared'

const sections = [
  ['nominals', 'Nominals'],
  ['predicates', 'Predicates'],
  ['modifiers', 'Modifiers + Particles + Conjugation'],
  ['independent', 'Independent Forms'],
  ['sentence', 'Sentence Structures'],
]

/** The letters occupying the initial, vowel, and optional final slots of a block. */
type Syllable = readonly [initial: string, vowel: string, result: string, endings?: readonly string[]]

const syllablePatterns = [
  { pattern: 'CV', ending: 'No coda', right: ['ㄱ', 'ㅏ', '가'], below: ['ㄱ', 'ㅗ', '고'] },
  { pattern: 'CVC', ending: 'Coda with one consonant', right: ['ㄱ', 'ㅏ', '감', ['ㅁ']], below: ['ㄱ', 'ㅗ', '곰', ['ㅁ']] },
  { pattern: 'CVCC', ending: 'Coda with two consonants', right: ['ㄱ', 'ㅏ', '값', ['ㅂ', 'ㅅ']], below: ['ㅁ', 'ㅗ', '몫', ['ㄱ', 'ㅅ']] },
] as const satisfies readonly { pattern: string; ending: string; right: Syllable; below: Syllable }[]

/** The current term and the specific button that opened its explanation. */
type GrammarSelection = { id: string; term: IntroTerm }

const GrammarHelp = createContext<{
  activeId?: string
  open: (selection: GrammarSelection, trigger: HTMLButtonElement) => void
} | null>(null)

/** Teach the system from syllable construction through conversational usage. */
export function Intro() {
  const [explanation, setExplanation] = useState<GrammarSelection | null>(null)
  const explanationHeading = useRef<HTMLHeadingElement>(null)
  const explanationPanel = useRef<HTMLElement>(null)
  const explanationTrigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (explanation) {
      if (explanationPanel.current) explanationPanel.current.scrollTop = 0
      explanationHeading.current?.focus({ preventScroll: true })
    }
  }, [explanation])

  function closeExplanation() {
    setExplanation(null)
    explanationTrigger.current?.focus({ preventScroll: true })
  }

  function openExplanation(selection: GrammarSelection, trigger: HTMLButtonElement) {
    explanationTrigger.current = trigger
    if (explanation?.id === selection.id) closeExplanation()
    else setExplanation(selection)
  }

  return <GrammarHelp.Provider value={{ activeId: explanation?.id, open: openExplanation }}>
  <div className="intro" onKeyDown={event => {
    if (event.key === 'Escape' && explanation) closeExplanation()
  }}>
    <div className="section-heading"><div>
      <h1>How Korean works</h1>
      <p>Build up to <em>“Today I’m eating spicy food at home.”</em> Choose a tab to see its examples and rules. Select an underlined term for three examples.</p>
    </div><a className="button primary" href="#recall">Go to practice <Icon name="arrow" /></a></div>

    <div className="intro-layout">
      <aside className="panel intro-index" aria-label="On this page">
        <h2>On this page</h2>
        {sections.map(([id, label]) => <button key={id} className="text-button" onClick={() => {
          const section = document.getElementById(id)
          if (!(section instanceof HTMLDetailsElement)) return
          section.open = true
          setExplanation(null)
          section.querySelector('summary')?.focus({ preventScroll: true })
          section.scrollIntoView({ block: 'start' })
        }}>{label}</button>)}
      </aside>

      <div className="intro-content">
        <details className="panel intro-primer">
          <summary>Hangul and sound</summary>
          <div className="intro-panel">
          <div className="syllable-legend">
            <span><strong>C</strong> Consonant letter</span>
            <span><strong>V</strong> Vowel letter</span>
          </div>
          <p>Each Hangul block is one syllable. Any final consonant letters, called <GrammarLabel term="Batchim">batchim</GrammarLabel> (<Korean>받침</Korean>), go in the <GrammarLabel term="Coda">coda</GrammarLabel> at the bottom.</p>

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
                <th scope="row"><Korean>값 → [갑]</Korean><WordGlosses korean="값 → [갑]" /><small>Coda <Korean>ㅂ + ㅅ → ㅂ</Korean></small></th>
                <td>Both letters share one coda. Said on its own, <Korean>값</Korean> has only the <Korean>ㅂ</Korean> sound at the end.</td>
              </tr>
              <tr>
                <th scope="row"><Korean>밥을 → [바블]</Korean><WordGlosses korean="밥을 → [바블]" /><small>Coda <Korean>ㅂ</Korean> in <Korean>밥</Korean></small></th>
                <td>The <Korean>ㅂ</Korean> sound moves to the start of the next syllable.</td>
              </tr>
              <tr>
                <th scope="row"><Korean>사람 / 물</Korean><WordGlosses korean="사람 / 물" /><small>Coda <Korean>ㄹ</Korean> in <Korean>물</Korean></small></th>
                <td><Korean>ㄹ</Korean> taps between vowels in <Korean>사람</Korean> and sounds closer to “l” at the end of <Korean>물</Korean>.</td>
              </tr>
              <tr>
                <th scope="row"><Korean>ㅁ + ㅓ + ㄱ → 먹</Korean><small><Korean>먹어요 → [머거요]</Korean></small></th>
                <td>The <Korean>ㄱ</Korean> is the coda in <Korean>먹</Korean>. In <Korean>먹어요</Korean> (<em>“eat”</em>), it moves to the start of the next syllable in speech.</td>
              </tr>
            </tbody>
          </table></div>
          <a className="text-button" href="#pronunciation">Practice Hangul and batchim <Icon name="arrow" size={15} /></a>
          </div>
        </details>

        <LessonSection id="nominals" title="Nominals" initiallyOpen>
          <p>Nouns, pronouns, and numerals can act as <GrammarLabel term="Nominal">nominals</GrammarLabel>.</p>
          <LessonTabs sectionId="nominals" tabs={[
            { label: "Nouns", content: <>
              <p>A <GrammarLabel term="Noun">noun</GrammarLabel> can fit more than one type. <Korean>음식</Korean> is both common and concrete.</p>
              <TypeTable title="Noun types" typeHeading="Noun Type" rows={nounTypes} />
              <ApplicationChecks unit="a noun" particles conjugates={false} note="The particle goes after the noun." examples={["음식 + 을 → 음식을"]} />
            </> },
            { label: "Pronouns", content: <>
              <p>A <GrammarLabel term="Pronoun">pronoun</GrammarLabel> can stand for a person or thing already clear from context.</p>
              <TypeTable title="Pronoun types" rows={pronounTypes} />
              <ApplicationChecks unit="a pronoun" particles conjugates={false} note="저 takes 는 for the topic and changes to 제 before the subject particle 가." examples={["저 + 는 → 저는","저 + 가 → 제가"]} />
            </> },
            { label: "Numerals", content: <>
              <TypeTable title="Numeral types" rows={numeralTypes} />
              <ApplicationChecks unit="a numeral" particles conjugates={false} note="A particle can follow a number on its own or the full phrase with a counter." examples={["둘이","세 개를"]} />
            </> },
          ]} />
        </LessonSection>

        <LessonSection id="predicates" title="Predicates">
          <p>A <GrammarLabel term="Predicate">predicate</GrammarLabel> tells what happens, what something is like, or what it is. Start the worked sentence with the dictionary form <Korean>먹다</Korean> (<em>“to eat”</em>).</p>
          <LessonTabs sectionId="predicates" tabs={[
            { label: "Verbs", content: <>
              <p>A <GrammarLabel term="Verb">verb</GrammarLabel> can be described by the sentence parts it needs and how its stem changes.</p>
              <TypeTable title="Verb types" rows={verbTypes} />
              <ApplicationChecks unit="a verb stem" particles={false} conjugates note="Particles can follow some forms of the verb." examples={["걷기가","먹지는"]} />
            </> },
            { label: "Adjectives", content: <>
              <p>An <GrammarLabel term="Adjective">adjective</GrammarLabel> can be the predicate of a clause. It can also describe a noun in a form like <Korean>매운</Korean>.</p>
              <TypeTable title="Adjective types" rows={adjectiveTypes} />
              <ApplicationChecks unit="an adjective stem" particles={false} conjugates note="Particles can follow some forms of the adjective." examples={["건강하기가 어렵다","맵지는 않아요"]} />
            </> },
          ]} />
        </LessonSection>

        <LessonSection id="modifiers" title="Modifiers + Particles + Conjugation">
          <p><GrammarLabel term="Modifier">Modifiers</GrammarLabel> add detail, <GrammarLabel term="Particles">particles</GrammarLabel> mark each phrase’s job, and conjugation gives the predicate an ending.</p>
          <LessonTabs sectionId="modifiers" tabs={[
            { label: "Determiners + Adverbs", content: <>
              <p><GrammarLabel term="Determiner">Determiners</GrammarLabel> go directly before nouns and tell which one, how many, or what kind. An <GrammarLabel term="Adverb">adverb</GrammarLabel> often tells when, how, or to what degree something happens.</p>
              <TypeTable title="Determiner and adverb types" rows={modifierTypes} />
              <ApplicationChecks unit="a determiner" particles={false} conjugates={false} note="The particle follows the whole phrase." examples={["세 사람을"]} />
              <ApplicationChecks unit="an adverb" particles conjugates={false} note="Some adverbs take a particle for emphasis." examples={["아직도"]} />
            </> },
            { label: "Particles", content: <>
              <TypeTable title="What takes particles" rows={[
                ['Nouns, pronouns, numerals', '음식을 / 저는 / 둘이', 'food / I / two people', ['을 / 는 / 이', 'object / topic / subject markers', 'can attach directly to these words.']],
                ['Verbs and adjectives', '걷기가 / 맵지는', 'walking, as the subject / as for being spicy', ['-기 / -지', 'noun-forming / connecting endings', 'make forms that can take a particle.']],
                ['Determiners', '이 책을', 'this book, as the object', ['을', 'object marker', 'comes after the full phrase 이 책.']],
                ['Adverbs', '아직도', 'still', ['도', 'also, with emphasis here', 'adds emphasis to the adverb 아직.']],
                ['Particles and connecting endings', '집에서는 / 먹지는', 'as for at home / as for eating', ['는', 'topic or contrast marker', 'can follow 에서 or -지.']],
              ]} />
              <TypeTable title="Particle types" rows={particleTypes} />
              <ApplicationChecks unit="a particle" particles conjugates={false} note="Some particles stack. In traditional Korean grammar, 이다 is the particle that conjugates." examples={["집에서 + 는 → 집에서는","학생이에요"]} />
            </> },
            { label: "Conjugation", content: <>
              <TypeTable title="What conjugates" rows={[
                ['Verbs', '먹다 → 먹어요', 'to eat → eat', ['-어요', 'everyday polite ending', 'attaches to the verb stem 먹.']],
                ['Adjectives', '맵다 → 매워요', 'to be spicy → is spicy', ['맵 → 매워요', 'spicy → is spicy', 'shows how the adjective stem changes.']],
                ['Copula 이다', '학생이다 → 학생이에요', 'to be a student → am a student', ['이다', 'to be', 'is the conjugating particle in traditional Korean grammar.']],
                ['Nouns, pronouns, numerals, determiners, adverbs', '음식 / 저 / 둘 / 이 / 빨리', 'food / I / two / this / quickly', ['음식 / 저 / 둘 / 이 / 빨리', 'food / I / two / this / quickly', 'keep their base forms under conjugation.']],
                ['Other particles and endings', '을 / -어요', 'object marker / everyday polite ending', ['을 / -어요', 'object marker / everyday polite ending', 'attach to other forms.']],
              ]} />
              <TypeTable title="What endings do" rows={conjugationTypes} />
              <ApplicationChecks unit="a verb ending" particles conjugates={false} note="A particle can follow certain connecting endings." examples={["먹지는 않아요"]} />
            </> },
          ]} />
          <a className="text-button" href="#grammar">Practice particles and conjugation <Icon name="arrow" size={15} /></a>
        </LessonSection>

        <LessonSection id="independent" title="Independent Forms">
          <p>Interjections can stand on their own or come before a clause. They can respond, express a reaction, or get someone’s attention.</p>
          <TypeTable title="Independent forms" rows={[
            ['Response', '네! / 아니요!', 'Yes! / No!'],
            ['Reaction', '와!', 'Wow!'],
            ['Attention', '저기요!', 'Excuse me!'],
          ]} />
          <p><Korean>네, 오늘 집에서 먹어요.</Korean> (<em>“Yes, I’m eating at home today.”</em>) <Korean>네</Korean> is the response before the clause.</p>
          <WordGlosses korean="네, 오늘 집에서 먹어요." />
        </LessonSection>

        <SentenceStructure />
      </div>

      <aside ref={explanationPanel} className={'panel intro-explanation' + (explanation ? ' is-open' : '')} id="intro-grammar-explanation" aria-label="Grammar explanation">
        <div className="intro-explanation-header">
          <h2 ref={explanationHeading} tabIndex={-1}>{explanation?.term ?? 'Grammar explanation'}</h2>
          {explanation && <button type="button" className="text-button" onClick={closeExplanation} aria-label="Close explanation">Close</button>}
        </div>
        {explanation ? <>
          <p>{introGlossary[explanation.term].definition}</p>
          <ul className="intro-explanation-examples" aria-label="Examples">
            {introGlossary[explanation.term].examples.map(([korean, english, focus]) => <li className="intro-explanation-example" key={korean}>
              <strong><Korean>{korean}</Korean></strong>
              <small><em>{english}</em></small>
              <WordGlosses korean={korean} english={english} />
              <p><ExplainExample focus={focus} /></p>
            </li>)}
          </ul>
        </> : <p>Select an underlined term for a definition and three examples.</p>}
      </aside>
    </div>
  </div>
  </GrammarHelp.Provider>
}

/** Show how to assemble a clause, change what it says, and combine it with other clauses. */
function SentenceStructure() {
  return <LessonSection id="sentence" title="Sentence Structures">
    <p>Start with the <GrammarLabel term="Predicate">predicate</GrammarLabel>. It tells you what happens, what something is like, or what it is. In the basic sentence pattern it comes last, after the people, things, time, and place.</p>
    <ExampleParts parts={[['Topic', '저는', 'I'], ['Object', '음식을', 'food'], ['Predicate', '먹어요.', 'eat']]} meaning="I eat food." />
    <h3>Build the full sentence</h3>
    <ExampleParts
      parts={[
        ['Time', '오늘', 'today'],
        ['Topic', '저는', 'I'],
        ['Place · 에서', '집에서', 'at home'],
        ['Modifier', '매운', 'spicy'],
        ['Object', '음식을', 'food'],
        ['Predicate', '먹어요.', 'eat'],
      ]}
      meaning="Today I’m eating spicy food at home."
    />
    <p><Korean>음식</Korean> (<em>food</em>) is a <GrammarLabel term="Noun">noun</GrammarLabel> because it’s a thing. <Korean>매운</Korean> (<em>spicy</em>) describes it.</p>

    <h3>What the predicate needs</h3>
    <div className="intro-pairs">
      <ExampleParts parts={[['Subject', '아기가', 'the baby'], ['Action', '자요.', 'sleeps']]} meaning="The baby sleeps." note="This action takes no object." />
      <ExampleParts parts={[['Subject', '음식이', 'the food'], ['Description', '맛있어요.', 'is delicious']]} meaning="The food is delicious." />
      <ExampleParts parts={[['Topic', '민수는', 'Minsu'], ['Identity', '학생이에요.', 'is a student']]} meaning="Minsu is a student." />
      <ExampleParts parts={[['Location', '집에', 'at home'], ['Subject', '고양이가', 'a cat'], ['Existence', '있어요.', 'is there']]} meaning="There’s a cat at home." />
      <ExampleParts parts={[['Recipient', '친구에게', 'to a friend'], ['Object', '책을', 'a book'], ['Action', '줘요.', 'give']]} meaning="I give a friend a book." note="The recipient gets the object." />
      <ExampleParts parts={[['Subject', '친구가', 'my friend'], ['Complement', '선생님이', 'a teacher'], ['Change', '됐어요.', 'became']]} meaning="My friend became a teacher." note="The complement says what the subject became." />
    </div>

    <h3><GrammarLabel term="Topic" /> and <GrammarLabel term="Subject">subject</GrammarLabel></h3>
    <p><Korean>은/는</Korean> sets the topic or adds contrast. <Korean>이/가</Korean> marks the subject, and <Korean>을/를</Korean> marks the object. In <Korean>저는 음식을 먹어요</Korean>, the topic is also the person eating. A topic and a separate subject can appear together.</p>
    <ExampleParts parts={[['Topic', '저는', 'as for me'], ['Subject', '커피가', 'coffee'], ['Description', '좋아요.', 'is pleasing']]} meaning="I like coffee." note={<>Literally, <em>“As for me, coffee is pleasing.”</em></>} />
    <h3>Moving and leaving out parts</h3>
    <p>Time and other phrases can move. Leave out a subject or object when the listener can supply it from context.</p>
    <ExampleParts parts={[['Topic', '저는', 'I'], ['Time', '오늘', 'today'], ['Place', '집에서', 'at home'], ['Modifier', '매운', 'spicy'], ['Object', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="“Today I’m eating spicy food at home.”" note="This time, the topic comes first." />
    <div className="intro-pairs">
      <ExampleParts parts={[['Object', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="I eat food." note="The speaker is understood." />
      <ExampleParts parts={[['Action', '먹어요.', 'eat']]} meaning="I’m eating it." note="The listener supplies who is eating and what they’re eating." />
    </div>
    <ExampleParts parts={[['Companion · (이)랑', '친구랑', 'with a friend'], ['Means · (으)로', '지하철로', 'by subway'], ['Destination · 에', '학교에', 'to school'], ['Action', '가요.', 'go']]} meaning="I go to school by subway with a friend." note="Each particle shows how that phrase relates to the action." />

    <h3><GrammarLabel term="Modifier">Modifiers</GrammarLabel> and <GrammarLabel term="Clause">clauses</GrammarLabel></h3>
    <div className="intro-pairs">
      <ExampleParts parts={[['Modifier', '매운', 'spicy'], ['Object', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="I eat spicy food." note="The modifier stays with the noun when the rest of the sentence gets shorter." />
      <ExampleParts parts={[['Object', '책을', 'a book'], ['Manner', '천천히', 'slowly'], ['Action', '읽어요.', 'read']]} meaning="I read a book slowly." note="천천히 is an adverb because it tells how I read." />
    </div>
    <ExampleParts parts={[['Who read it', '제가', 'I'], ['Noun-modifying verb', '읽은', 'read'], ['Main subject', '책이', 'the book'], ['Main predicate', '재미있어요.', 'is interesting']]} meaning="The book I read is interesting." note={<>The whole clause <Korean>제가 읽은</Korean> goes before <Korean>책</Korean>.</>} />
    <div className="intro-pairs">
      <ExampleParts parts={[['Modifier', '매운', 'spicy'], ['First object', '음식을', 'food'], ['First action · -고', '먹고', 'eat and then'], ['Final action', '쉬어요.', 'rest']]} meaning="I eat spicy food and then rest." note="The last action keeps the polite ending." />
      <ExampleParts parts={[['Reason subject', '비가', 'rain'], ['Reason · -아서/어서', '와서', 'because it’s falling'], ['Location', '집에', 'at home'], ['Main predicate', '있어요.', 'stay']]} meaning="I’m staying home because it’s raining." />
      <ExampleParts parts={[['Condition subject', '비가', 'rain'], ['Condition · -(으)면', '오면', 'if it falls'], ['Location', '집에', 'at home'], ['Main predicate', '있어요.', 'stay']]} meaning="If it rains, I’ll stay home." />
      <ExampleParts parts={[['Speaker', '민수가', 'Minsu'], ['Quoted subject', '비가', 'rain'], ['Quoted predicate · -다고', '온다고', 'that it’s falling'], ['Main action', '했어요.', 'said']]} meaning="Minsu said it was raining." />
    </div>

    <h3>How the sentence ends</h3>
    <p>Keep the same action and change the predicate to set the tense or speech style, ask a question, make a request, or suggest doing something together.</p>
    <div className="table-wrap intro-table"><table aria-label="Ways to end a Korean sentence">
      <thead><tr><th scope="col">Use</th><th scope="col">Example</th><th scope="col">Meaning</th></tr></thead>
      <tbody>
        <tr><th scope="row">Everyday polite</th><td><Korean>먹어요.</Korean></td><td><em>I eat it.</em><WordGlosses korean="먹어요." english="I eat it." /></td></tr>
        <tr><th scope="row">Casual</th><td><Korean>먹어.</Korean></td><td><em>I eat it.</em><WordGlosses korean="먹어." english="I eat it." /></td></tr>
        <tr><th scope="row">Formal polite</th><td><Korean>먹습니다.</Korean></td><td><em>I eat it.</em><WordGlosses korean="먹습니다." english="I eat it." /></td></tr>
        <tr><th scope="row">Past</th><td><Korean>먹었어요.</Korean></td><td><em>I ate it.</em><WordGlosses korean="먹었어요." english="I ate it." /></td></tr>
        <tr><th scope="row">Future</th><td><Korean>먹을 거예요.</Korean></td><td><em>I’ll eat it.</em><WordGlosses korean="먹을 거예요." english="I’ll eat it." /></td></tr>
        <tr><th scope="row">Negation</th><td><Korean>안 먹어요.</Korean></td><td><em>I don’t eat it.</em><WordGlosses korean="안 먹어요." english="I don’t eat it." /></td></tr>
        <tr><th scope="row">Yes/no question</th><td><Korean>먹어요?</Korean></td><td><em>Do you eat it?</em><WordGlosses korean="먹어요?" english="Do you eat it?" /></td></tr>
        <tr><th scope="row">Question word</th><td><Korean>뭘 먹어요?</Korean></td><td><em>What are you eating?</em><WordGlosses korean="뭘 먹어요?" english="What are you eating?" /></td></tr>
        <tr><th scope="row">Polite request</th><td><Korean>먹어 주세요.</Korean></td><td><em>Please eat it.</em><WordGlosses korean="먹어 주세요." english="Please eat it." /></td></tr>
        <tr><th scope="row">Suggestion</th><td><Korean>같이 먹을까요?</Korean></td><td><em>Shall we eat together?</em><WordGlosses korean="같이 먹을까요?" english="Shall we eat together?" /></td></tr>
      </tbody>
    </table></div>
    <p>Put <Korean>뭘</Korean> (<em>“what”</em>, the object) in the same place as <Korean>매운 음식을</Korean> in the original sentence.</p>
    <a className="text-button" href="#grammar">Practice sentence structure <Icon name="arrow" size={15} /></a>
  </LessonSection>
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
function ExampleParts({ parts, meaning, note }: {
  parts: readonly (readonly [label: string, korean: string, english: string])[]; meaning: string; note?: ReactNode
}) {
  return <figure className="intro-example">
    <dl className="intro-parts">
      {parts.map(([label, korean, english]) => <div key={label}>
        <dt>{isIntroTerm(label) ? <GrammarLabel term={label} /> : label}</dt>
        <dd><Korean>{korean}</Korean><small><em>{english}</em></small></dd>
      </div>)}
    </dl>
    <figcaption><em>{meaning}</em>{note && <> {note}</>}</figcaption>
  </figure>
}

/** Match only the explicitly supported glossary terms. */
function isIntroTerm(label: string): label is IntroTerm {
  return Object.hasOwn(introGlossary, label)
}

/** Open the shared explanation panel for a glossary term. */
function GrammarLabel({ term, children = term }: { term: IntroTerm; children?: ReactNode }) {
  const id = useId()
  const help = useContext(GrammarHelp)
  if (!help) throw new Error('GrammarLabel must be inside the Intro grammar panel provider')

  return <button type="button" className="intro-grammar-label" aria-expanded={help.activeId === id}
    aria-controls="intro-grammar-explanation" onClick={event => help.open({ id, term }, event.currentTarget)}>
    {children}
  </button>
}

/** Let readers open a main lesson while keeping its selected tab. */
function LessonSection({ id, title, initiallyOpen = false, children }: {
  id: string; title: string; initiallyOpen?: boolean; children: ReactNode
}) {
  return <details className="panel intro-lesson" id={id} open={initiallyOpen}>
    <summary><h2 id={id + '-title'}>{title}</h2></summary>
    <div className="intro-panel">{children}</div>
  </details>
}

/** Switch lessons within a section using click, touch, or the standard tab keys. */
function LessonTabs({ sectionId, tabs }: {
  sectionId: string; tabs: readonly { label: string; content: ReactNode }[]
}) {
  const [selected, setSelected] = useState(0)

  return <div className="intro-tabs">
    <div className="segmented intro-tablist" role="tablist" aria-labelledby={sectionId + '-title'}>
      {tabs.map(({ label }, index) => <button
        key={label}
        type="button"
        role="tab"
        id={sectionId + '-tab-' + index}
        aria-controls={sectionId + '-panel-' + index}
        aria-selected={index === selected}
        tabIndex={index === selected ? 0 : -1}
        onClick={() => setSelected(index)}
        onKeyDown={event => {
          let next: number
          switch (event.key) {
            case 'ArrowLeft': next = (index + tabs.length - 1) % tabs.length; break
            case 'ArrowRight': next = (index + 1) % tabs.length; break
            case 'Home': next = 0; break
            case 'End': next = tabs.length - 1; break
            default: return
          }
          event.preventDefault()
          setSelected(next)
          event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus()
        }}
      >{label}</button>)}
    </div>
    {tabs.map(({ label, content }, index) => <div
      key={label}
      role="tabpanel"
      id={sectionId + '-panel-' + index}
      aria-labelledby={sectionId + '-tab-' + index}
      hidden={index !== selected}
      tabIndex={0}
    >{content}</div>)}
  </div>
}

/** Give each written word its own English meaning. Brackets show pronunciation. */
function WordGlosses({ korean, english }: { korean: string; english?: string }) {
  const words = korean.replace(/\s*\[[^\]]+\]/g, '').match(/-?[가-힣]+-?/g) ?? []
  const glosses = words.map(word => {
    let meaning = introWordMeanings[word]
    if (word === '이' && korean === '일 / 이 / 삼') meaning = 'two'
    if (korean.includes('비가') && word === '와요') meaning = 'falls'
    if (korean.includes('비가') && word === '오면') meaning = 'if it falls'
    if (korean.includes('집에') && word === '있어요') meaning = 'stay'
    return { word, meaning }
  })
  if (!glosses.length || (glosses.length === 1 && glosses[0].meaning === english)) return null

  return <div className="intro-word-glosses">
    {glosses.map(({ word, meaning }, index) => <span key={index}>
      <Korean>{word}</Korean>{meaning && <> (<em>{meaning}</em>)</>}
    </span>)}
  </div>
}

/** Identify the Korean part, its English meaning, and the reason it fits the example. */
function ExplainExample({ focus: [korean, english, reason] }: { focus: ExampleFocus }) {
  return <><b><Korean>{korean}</Korean></b> (<em>{english}</em>) {reason}</>
}

/** Present each category or application rule beside a Korean example. */
function TypeTable({ title, typeHeading = 'Type', rows }: { title: string; typeHeading?: string; rows: readonly IntroType[] }) {
  return <div className="table-wrap intro-table"><table aria-label={title}>
    <thead><tr><th scope="col">{typeHeading}</th><th scope="col">Example</th><th scope="col">English</th></tr></thead>
    <tbody>{rows.map(([label, korean, english, focus]) => <tr key={label}>
      <th scope="row">{isIntroTerm(label) ? <GrammarLabel term={label} /> : label}</th>
      <td><Korean>{korean}</Korean></td>
      <td><em>{english}</em><WordGlosses korean={korean} english={english} />{focus && <p><ExplainExample focus={focus} /></p>}</td>
    </tr>)}</tbody>
  </table></div>
}

/** Show the attachment and conjugation answers for the form named in the question. */
function ApplicationChecks({ unit, particles, conjugates, note, examples }: {
  unit: string; particles: boolean; conjugates: boolean; note: string; examples: readonly string[]
}) {
  return <div className="intro-application">
    <dl>
      <div><dt>Does {unit} take particles?</dt><dd>{particles ? 'Yes' : 'No'}</dd></div>
      <div><dt>Does {unit} conjugate?</dt><dd>{conjugates ? 'Yes' : 'No'}</dd></div>
    </dl>
    <p>{note}</p>
    {examples.map(korean => <WordGlosses key={korean} korean={korean} />)}
  </div>
}
