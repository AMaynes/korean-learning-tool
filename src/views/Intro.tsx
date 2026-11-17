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

const subjectDefinition = 'The subject is who or what the predicate describes. It can be the person acting, the thing with a certain quality, or something that exists. 이 and 가 are common subject particles.'
const topicDefinition = 'The topic is what the speaker is talking about. Read 은 or 는 as “as for …” while learning. The topic can also be the subject, or it can frame the sentence around a time, place, or contrast.'
const predicateDefinition = 'The predicate tells you what happens, what something is like, or what it is. In the basic Korean sentence pattern it comes last.'
const objectDefinition = 'The object is what the action is directed at, like the food you eat. 을 or 를 commonly marks the object.'
const modifierDefinition = 'A modifier adds detail to another word. A noun modifier goes before its noun, like “spicy” before “food”.'

const grammarDefinitions = {
  'Action': 'An action predicate tells you what someone does or what happens.',
  'Action clause': 'This clause describes a noun by saying what someone does. Here 먹는 describes the person as someone who is eating.',
  'Action location': '에서 attaches to the place where the action happens.',
  'Action made noun-like': 'An ending such as -기 turns an action into something you can talk about as a noun, like “eat” becoming “eating”.',
  'Adverb': 'An adverb adds detail such as when or how something happens. Some particles can attach to an adverb for emphasis.',
  'Auxiliary': 'An auxiliary adds meaning to another verb. Here -고 싶어요 expresses a desire to do the action.',
  'Batchim': 'Batchim (받침) is one or two consonant letters at the bottom of a Hangul block. That bottom position is the coda.',
  'Casual': 'Use this style where casual speech is already comfortable, such as with close friends.',
  'Certain verb forms': 'Some particles can follow a verb with a connecting ending. In 먹지는, 는 highlights 먹지 within the negative expression.',
  'Change': 'This predicate tells you what someone or something became. The complement names the result.',
  'Companion · (이)랑': 'This phrase tells you who goes along with the person doing the action. (이)랑 means “with” here.',
  'Complement': 'A complement completes the meaning of a predicate such as “become”. Here it says what the subject became.',
  'Condition subject': 'This is the subject inside the “if” clause. It goes with the predicate that expresses the condition.',
  'Condition · -(으)면': 'This ending marks the condition for the main clause, like “if …” in English.',
  'Consonant ending': 'Use 이에요 after a noun whose last syllable ends in a consonant.',
  'Consonant letter': 'A Hangul letter that can fill the start of a block or, for some consonants, its bottom position.',
  'Description': 'A descriptive predicate says what someone or something is like. 맛있어요 expresses “is delicious” on its own.',
  'Destination': 'Here 에 attaches to the destination. It tells you where someone is going.',
  'Destination · 에': 'Here 에 attaches to the destination. It tells you where someone is going.',
  'Dictionary form': 'This is the form you look up in a dictionary. A verb or descriptive verb typically ends in 다 in this form.',
  'Everyday polite': 'This style is polite in everyday conversation. The ending is often -아요 or -어요.',
  'Everyday polite action': 'This is the main action. Its ending uses everyday polite speech with the listener.',
  'Existence': '있어요 says that someone or something is present. With a location, it can mean “there is …”.',
  'Exists / have': '있어요 can mean “there is” or “have”. Context tells you which English meaning fits.',
  'Final action': 'The last predicate gives the final action and carries the sentence’s speech style ending.',
  'First action · -고': 'The ending -고 connects the first action to the next one. Here it reads like “and then”.',
  'First object': 'This is the object of the first action in the sentence.',
  'Formal polite': 'This style uses endings like -습니다 and is common in formal introductions and announcements.',
  'Future': 'This form can express a plan, prediction, or something expected to happen later.',
  'Honored subject': '께서 is the honorific subject particle. It shows respect toward the person doing the action.',
  'Honorific verb + polite ending': 'The verb honors the person doing the action with -시-. The polite ending addresses the listener respectfully.',
  'Identity': 'This predicate says who or what someone or something is. It uses a noun with 이에요 or 예요.',
  'Irregular stem': 'Some stems change before certain endings. The ㅂ in 어렵다 changes in 어려워요.',
  'Linked action': 'This action uses a connecting ending such as -고 so another action can follow it.',
  'Location': 'This phrase tells you where something exists, stays, or happens. With 있어요, 에 marks the place.',
  'Main action': 'This is the action in the main clause. Another clause can supply what was said, when it happened, or why.',
  'Main predicate': predicateDefinition,
  'Main subject': 'This subject belongs to the main predicate. A smaller clause inside the sentence can have its own subject.',
  'Manner': 'Manner tells you how an action happens. An adverb such as 빨리 or 천천히 gives that detail.',
  'Means · (으)로': 'Here (으)로 marks how you do something, such as the transportation you use.',
  'Missing / don’t have': '없어요 means something is absent. Depending on context, English uses “there isn’t” or “don’t have”.',
  'Modifiers': modifierDefinition,
  'Negation': 'Negation makes a statement negative. Here 안 comes before the action.',
  'Nominals': 'A nominal is a noun or something that works like a noun, such as a pronoun, a noun phrase, or an action turned into a noun. Nominals can fill roles like subject or object.',
  'Noun': 'A noun names a person, place, thing, or idea. A particle can attach to it to show its role.',
  'Noun modifier': modifierDefinition,
  'Noun or pronoun': 'A noun names something. A pronoun stands in for a person or thing, like “I”. Both can take a particle.',
  'Noun-modifying verb': 'This form lets a verb describe the noun after it, as in “the book I read”.',
  'Object': objectDefinition,
  'Object noun': objectDefinition,
  'Object noun · 을': objectDefinition,
  'Object particle': '을 and 를 mark what the action is directed at. Use 을 after a final consonant and 를 after a vowel.',
  'Object phrase': 'The whole phrase is the object. It can include a modifier, a noun, and a particle, as in 매운 음식을.',
  'Object · 을/를': objectDefinition,
  'Past': 'This form places the action in the past. 먹었어요 means “ate”.',
  'Past ending': 'This ending adds past tense to the stem. 먹 + 었어요 gives 먹었어요, “ate”.',
  'Phrase with a particle': 'A second particle can add meaning to a phrase that already has one. 집에서 marks where the action happens, and 는 singles that place out.',
  'Place': 'This phrase tells you where the action happens.',
  'Place · 에서': '에서 marks where the action takes place. 집에서 means “at home” here.',
  'Polite request': 'The ending -아/어 주세요 asks someone politely to do something.',
  'Possession': '의 connects the possessor or associated noun to what follows. 친구의 집 means “a friend’s house”.',
  'Predicates': predicateDefinition,
  'Question': 'A question asks for information. An everyday polite yes/no question can use the statement form with question intonation.',
  'Question word': 'A question word fills the spot of the information requested. Here 뭘 asks which thing someone is eating.',
  'Quoted predicate · -다고': 'This ending links a reported statement to a verb such as “said”.',
  'Quoted subject': 'This subject belongs to the statement being reported. A separate subject can identify who said it.',
  'Reason subject': 'This subject belongs to the clause that gives the reason for the main statement.',
  'Reason · -아서/어서': 'This ending can connect a reason to what happens because of it.',
  'Recipient': 'The recipient is who gets something. 에게 attaches to the person receiving it here.',
  'Speaker': 'This is the person who made the statement being reported.',
  'Statement': 'A statement tells the listener something. Here it says what the speaker eats.',
  'Stem': 'The stem is the part of the verb you build on. Remove 다 from the dictionary form to find it.',
  'Stem + ending': 'The ending attaches to the stem and adds information such as politeness or tense.',
  'Subject': subjectDefinition,
  'Subject + topic particle': 'Here the person doing the action is also the topic. 저 means “I”. 는 frames what follows as a statement about me, like “as for me”.',
  'Subject · 가': subjectDefinition,
  'Suggestion': 'The ending -(으)ㄹ까요? can invite someone to do something together, like “Shall we …?”',
  'Time': 'This part tells you when something happens. A time such as 세 시 uses 에, and a word such as 오늘 can stand alone.',
  'Time word': 'A time word such as 오늘 tells when the action happens. 오늘 can stand without a particle here.',
  'Topic': topicDefinition,
  'Topic · 는': topicDefinition,
  'Vowel contraction': 'The vowel at the end of the stem can combine with a vowel in the ending. 가 + 아요 becomes 가요.',
  'Vowel ending': 'Use 예요 after a noun whose last syllable ends in a vowel.',
  'Vowel letter': 'A Hangul letter that supplies the vowel sound in a block. Its shape determines where it fits around the first consonant.',
  'Who read it': 'This is the subject of the shorter clause that describes the noun. 제가 tells you who read the book.',
  'Yes/no question': 'This asks for a yes or no answer. Everyday polite speech can use the statement form with question intonation.',
  'clauses': 'A clause is a group of words built around a predicate. It can stand alone or work inside a larger sentence.',
  'endings': 'Endings attach to verb stems. They can show tense or speech style, or connect the predicate to other words and clauses.',
  'particles': 'A particle attaches right after a word or phrase. It can mark a role such as subject or object, or add a meaning such as “also”, “only”, or contrast.',
} as const

/** Each teaching label refers to one of the available English explanations. */
type GrammarTerm = keyof typeof grammarDefinitions

/** The selected label and, when available, its Korean example and English meaning. */
type GrammarSelection = {
  id: string
  term: GrammarTerm
  korean?: string
  english?: string
  detail?: string
}

const GrammarHelp = createContext<{
  activeId?: string
  open: (selection: GrammarSelection, trigger: HTMLButtonElement) => void
} | null>(null)

/** Teach the system from syllable construction through conversational usage. */
export function Intro() {
  const [explanation, setExplanation] = useState<GrammarSelection | null>(null)
  const explanationHeading = useRef<HTMLHeadingElement>(null)
  const explanationTrigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (explanation) explanationHeading.current?.focus({ preventScroll: true })
  }, [explanation])

  function closeExplanation() {
    setExplanation(null)
    explanationTrigger.current?.focus()
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
      <p>Work up from a Hangul block to “Today I’m eating spicy food at home.” Select an underlined grammar label to see what it does.</p>
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
            <span><strong>C</strong> <GrammarLabel term="Consonant letter" /></span>
            <span><strong>V</strong> <GrammarLabel term="Vowel letter" /></span>
          </div>
          <p>Each Hangul block is one syllable. Any final consonant letters, called <GrammarLabel term="Batchim">batchim</GrammarLabel> (<Korean>받침</Korean>), go in the coda at the bottom.</p>

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
          <h2 id="nominals" tabIndex={-1}><GrammarLabel term="Nominals" /> and <GrammarLabel term="particles" /></h2>
          <ExampleParts parts={[['Noun', '음식', 'food'], ['Object particle', '을', 'marks the object'], ['Object phrase', '음식을', 'food']]} meaning={<>The last block of <Korean>음식</Korean> ends in <Korean>ㄱ</Korean>, so attach <Korean>을</Korean>.</>} />
          <p>Particles often attach to noun phrases. For pairs like <Korean>을/를</Korean>, check whether the last block has a final consonant before choosing the form.</p>
          <div className="table-wrap intro-table"><table aria-label="Particle forms after consonants and vowels">
            <thead><tr><th scope="col">Role</th><th scope="col">After consonant</th><th scope="col">After vowel</th></tr></thead>
            <tbody>{coreParticles.map(({ role, pattern, meaning, consonant, vowel }) => <tr key={role}>
              <th scope="row"><GrammarLabel term={role} korean={vowel} /> <Korean>{pattern}</Korean><small>{meaning}</small></th>
              <td><Korean>{consonant}</Korean></td>
              <td><Korean>{vowel}</Korean></td>
            </tr>)}</tbody>
          </table></div>
          <div className="table-wrap intro-table"><table aria-label="Particles for place, time, and possession">
            <thead><tr><th scope="col">Use</th><th scope="col">Example</th><th scope="col">Meaning</th></tr></thead>
            <tbody>
              <tr><th scope="row"><GrammarLabel term="Destination" korean="학교에" english="to school" /> <Korean>에</Korean></th><td><Korean>학교에 가요.</Korean></td><td>I’m going to school.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Action location" korean="집에서" english="at home" /> <Korean>에서</Korean></th><td><Korean>집에서 먹어요.</Korean></td><td>I eat at home.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Time" korean="세 시에" english="at three" /> <Korean>에</Korean></th><td><Korean>세 시에 만나요.</Korean></td><td>Let’s meet at three.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Time word" korean="오늘" english="today" /> <Korean>오늘</Korean></th><td><Korean>오늘 먹어요.</Korean></td><td>I’m eating it today. <Korean>오늘</Korean> (“today”) stands on its own.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Possession" korean="친구의" english="a friend’s" /> <Korean>의</Korean></th><td><Korean>친구의 집</Korean></td><td>A friend’s house.</td></tr>
            </tbody>
          </table></div>
          <p>Some pronouns change with <Korean>가</Korean>. <Korean>저 + 가 → 제가</Korean> and <Korean>누구 + 가 → 누가</Korean>.</p>
          <a className="text-button" href="#grammar">Practice particles <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="predicates" tabIndex={-1}><GrammarLabel term="Predicates" /> and <GrammarLabel term="endings" /></h2>
          <ExampleParts parts={[['Dictionary form', '먹다', 'to eat'], ['Stem', '먹', 'eat'], ['Stem + ending', '먹어요', 'eat, everyday polite']]} meaning={<>Remove <Korean>다</Korean> to get the block <Korean>먹</Korean>. Add <Korean>어요</Korean> to make the everyday polite form.</>} />
          <div className="table-wrap intro-table"><table aria-label="Predicate ending examples">
            <thead><tr><th scope="col">Change</th><th scope="col">Example</th><th scope="col">Meaning</th></tr></thead>
            <tbody>
              <tr><th scope="row"><GrammarLabel term="Past ending" korean="먹 + 었어요 → 먹었어요" english="Ate." /></th><td><Korean>먹 + 었어요 → 먹었어요</Korean></td><td>Ate.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Vowel contraction" korean="가 + 아요 → 가요" english="Go." /></th><td><Korean>가 + 아요 → 가요</Korean></td><td>Go.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Irregular stem" korean="어렵다 → 어려워요" english="It’s difficult." /></th><td><Korean>어렵다 → 어려워요</Korean></td><td>It’s difficult.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Auxiliary" korean="먹 + 고 싶어요 → 먹고 싶어요" english="I want to eat." /></th><td><Korean>먹 + 고 싶어요 → 먹고 싶어요</Korean></td><td>I want to eat.</td></tr>
            </tbody>
          </table></div>
          <div className="intro-pairs">
            <ExampleParts parts={[['Consonant ending', '학생이에요.', 'is a student'], ['Vowel ending', '친구예요.', 'is a friend']]} meaning="“Is a student” and “is a friend.”" />
            <ExampleParts parts={[['Exists / have', '물이 있어요.', 'there’s water'], ['Missing / don’t have', '물이 없어요.', 'there’s no water']]} meaning="“There’s water” and “there’s no water.”" />
          </div>
        </article>

        <article className="panel intro-panel">
          <h2 id="modifiers" tabIndex={-1}><GrammarLabel term="Modifiers" /> and <GrammarLabel term="clauses" /></h2>
          <div className="intro-pairs">
            <ExampleParts parts={[['Noun modifier', '매운', 'spicy'], ['Noun', '음식', 'food']]} meaning={<>Change <Korean>맵다</Korean> (“be spicy”) to <Korean>매운</Korean> before <Korean>음식</Korean>. The object phrase is <Korean>매운 음식을</Korean> (“spicy food”).</>} />
            <ExampleParts parts={[['Action clause', '먹는', 'who is eating'], ['Noun', '사람', 'a person']]} meaning={<>A person eating. <Korean>먹다 → 먹는</Korean> before a noun.</>} />
            <ExampleParts parts={[['Manner', '빨리', 'quickly'], ['Action', '먹어요.', 'eat']]} meaning="Eat quickly. The adverb comes before the action." />
            <ExampleParts parts={[['Linked action', '먹고', 'eat and then'], ['Final action', '쉬어요.', 'rest']]} meaning={<>Eat and then rest. <Korean>-고</Korean> links the two actions.</>} />
          </div>
          <p><Korean>먹다 → 먹기 → 먹기 전에</Korean> means “eat → eating → before eating.” <Korean>-기</Korean> lets an action work like a noun.</p>
        </article>

        <article className="panel intro-panel">
          <h2 id="conversation" tabIndex={-1}>Everyday usage</h2>
          <div className="table-wrap intro-table"><table aria-label="Speech style examples">
            <thead><tr><th scope="col">Style</th><th scope="col">“I eat”</th><th scope="col">When to use it</th></tr></thead>
            <tbody>
              <tr><th scope="row"><GrammarLabel term="Everyday polite" korean="먹어요." english="I eat." /></th><td><Korean>먹어요.</Korean></td><td>Everyday default with strangers.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Formal polite" korean="먹습니다." english="I eat." /></th><td><Korean>먹습니다.</Korean></td><td>Formal introductions and public settings.</td></tr>
              <tr><th scope="row"><GrammarLabel term="Casual" korean="먹어." english="I eat." /></th><td><Korean>먹어.</Korean></td><td>Close relationships where casual speech is established.</td></tr>
            </tbody>
          </table></div>
          <ExampleParts parts={[['Honored subject', '선생님께서', 'the teacher'], ['Honorific verb + polite ending', '오세요.', 'is coming']]} meaning={<>“The teacher is coming.” <Korean>께서</Korean> and <Korean>-시-</Korean> honor the teacher. <Korean>요</Korean> shows politeness toward the listener.</>} />
          <ExampleParts parts={[['Statement', '매운 음식을 먹어요.', 'I eat spicy food.'], ['Question', '매운 음식을 먹어요?', 'Do you eat spicy food?']]} meaning="The words can stay the same. Rising intonation can signal the question." />
          <a className="text-button" href="#listening">Practice listening and conversation <Icon name="arrow" size={15} /></a>
        </article>

        <SentenceStructure />
      </div>

      <aside className={'panel intro-explanation' + (explanation ? ' is-open' : '')} id="intro-grammar-explanation" aria-label="Grammar explanation">
        <div className="intro-explanation-header">
          <h2 ref={explanationHeading} tabIndex={-1}>{explanation?.term ?? 'Grammar explanation'}</h2>
          {explanation && <button type="button" className="text-button" onClick={closeExplanation} aria-label="Close explanation">Close</button>}
        </div>
        {explanation ? <>
          {explanation.korean && <div className="intro-explanation-example">
            <strong><Korean>{explanation.korean}</Korean></strong>
            {explanation.english && <small>{explanation.english}</small>}
          </div>}
          <p>{grammarDefinitions[explanation.term]}</p>
          {explanation.detail && <p>{explanation.detail}</p>}
        </> : <p>Select an underlined grammar label to see what it does.</p>}
      </aside>
    </div>
  </div>
  </GrammarHelp.Provider>
}

/** Show how to assemble a clause, change what it says, and combine it with other clauses. */
function SentenceStructure() {
  return <article className="panel intro-panel">
    <h2 id="sentence" tabIndex={-1}>Sentence structure</h2>
    <p>Start with the <GrammarLabel term="Predicates">predicate</GrammarLabel>. It tells you what happens, what something is like, or what it is. In the basic sentence pattern it comes last, after the people, things, time, and place.</p>
    <ExampleParts parts={[['Subject + topic particle', '저는', 'I'], ['Object · 을/를', '음식을', 'food'], ['Action', '먹어요.', 'eat']]} meaning="I eat food." />
    <h3>Build the full sentence</h3>
    <ExampleParts
      parts={[
        ['Time', '오늘', 'today', '오늘 sets when the speaker is eating. This example puts it first.'],
        ['Subject + topic particle', '저는', 'I'],
        ['Place · 에서', '집에서', 'at home'],
        ['Noun modifier', '매운', 'spicy', '매운 describes 음식, the food. Together they mean “spicy food”.'],
        ['Object noun · 을', '음식을', 'food', '을 marks 음식 as what the speaker is eating.'],
        ['Everyday polite action', '먹어요.', 'eat', '먹 is the stem for “eat”. -어요 makes it polite in everyday conversation.'],
      ]}
      meaning="Today I’m eating spicy food at home."
    />
    <p><Korean>매운 음식을</Korean> is one <GrammarLabel term="Object phrase" korean="매운 음식을" english="spicy food">object phrase</GrammarLabel>. The particle <Korean>을</Korean> goes after the noun <Korean>음식</Korean>, and the polite predicate <Korean>먹어요</Korean> closes the sentence.</p>

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
    <ExampleParts parts={[['Topic · 는', '저는', 'as for me', '저는 tells you whose opinion this is. The speaker is talking about what they like.'], ['Subject · 가', '커피가', 'coffee', '가 marks 커피 as the subject. 좋다 describes the coffee as pleasing.'], ['Description', '좋아요.', 'is pleasing']]} meaning="I like coffee. Literally, “As for me, coffee is pleasing.”" />
    <div className="table-wrap intro-table"><table aria-label="What Korean particles can attach to">
      <thead><tr><th scope="col">Attaches to</th><th scope="col">Build it</th><th scope="col">Meaning</th></tr></thead>
      <tbody>
        <tr><th scope="row"><GrammarLabel term="Noun or pronoun" korean="책 + 을 → 책을" english="“Book” marked as the object" /></th><td><Korean>책 + 을 → 책을</Korean></td><td>“Book” marked as the object</td></tr>
        <tr><th scope="row"><GrammarLabel term="Action made noun-like" korean="말하기 + 가 → 말하기가" english="“Speaking” marked as the subject" /></th><td><Korean>말하기 + 가 → 말하기가</Korean></td><td>“Speaking” marked as the subject</td></tr>
        <tr><th scope="row"><GrammarLabel term="Adverb" korean="아직 + 도 → 아직도" english="“Still,” with emphasis" /></th><td><Korean>아직 + 도 → 아직도</Korean></td><td>“Still,” with emphasis</td></tr>
        <tr><th scope="row"><GrammarLabel term="Certain verb forms" korean="먹지는 않아요" english="I don’t eat it." /></th><td><Korean>먹지 + 는 → 먹지는</Korean></td><td>Emphasizes “eat” in <Korean>먹지는 않아요</Korean> (“I don’t eat it”)</td></tr>
        <tr><th scope="row"><GrammarLabel term="Phrase with a particle" korean="집에서 + 는 → 집에서는" english="“At home,” with home singled out" /></th><td><Korean>집에서 + 는 → 집에서는</Korean></td><td>“At home,” with home singled out</td></tr>
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
        <tr><th scope="row"><GrammarLabel term="Everyday polite" korean="먹어요." english="I eat it." /></th><td><Korean>먹어요.</Korean></td><td>I eat it.</td></tr>
        <tr><th scope="row"><GrammarLabel term="Casual" korean="먹어." english="I eat it." /></th><td><Korean>먹어.</Korean></td><td>I eat it.</td></tr>
        <tr><th scope="row"><GrammarLabel term="Formal polite" korean="먹습니다." english="I eat it." /></th><td><Korean>먹습니다.</Korean></td><td>I eat it.</td></tr>
        <tr><th scope="row"><GrammarLabel term="Past" korean="먹었어요." english="I ate it." /></th><td><Korean>먹었어요.</Korean></td><td>I ate it.</td></tr>
        <tr><th scope="row"><GrammarLabel term="Future" korean="먹을 거예요." english="I’ll eat it." /></th><td><Korean>먹을 거예요.</Korean></td><td>I’ll eat it.</td></tr>
        <tr><th scope="row"><GrammarLabel term="Negation" korean="안 먹어요." english="I don’t eat it." /></th><td><Korean>안 먹어요.</Korean></td><td>I don’t eat it.</td></tr>
        <tr><th scope="row"><GrammarLabel term="Yes/no question" korean="먹어요?" english="Do you eat it?" /></th><td><Korean>먹어요?</Korean></td><td>Do you eat it?</td></tr>
        <tr><th scope="row"><GrammarLabel term="Question word" korean="뭘 먹어요?" english="What are you eating?" /></th><td><Korean>뭘 먹어요?</Korean></td><td>What are you eating?</td></tr>
        <tr><th scope="row"><GrammarLabel term="Polite request" korean="먹어 주세요." english="Please eat it." /></th><td><Korean>먹어 주세요.</Korean></td><td>Please eat it.</td></tr>
        <tr><th scope="row"><GrammarLabel term="Suggestion" korean="같이 먹을까요?" english="Shall we eat together?" /></th><td><Korean>같이 먹을까요?</Korean></td><td>Shall we eat together?</td></tr>
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
  parts: readonly (readonly [label: GrammarTerm, korean: string, english?: string, detail?: string])[]; meaning: ReactNode
}) {
  return <figure className="intro-example">
    <dl className="intro-parts">
      {parts.map(([label, korean, english, detail]) => <div key={label}>
        <dt><GrammarLabel term={label} korean={korean} english={english} detail={detail} /></dt>
        <dd><Korean>{korean}</Korean>{english && <small>{english}</small>}</dd>
      </div>)}
    </dl>
    <figcaption>{meaning}</figcaption>
  </figure>
}

/** Open the shared panel for a grammar term or a particular Korean example. */
function GrammarLabel({ term, korean, english, detail, children = term }: {
  term: GrammarTerm; korean?: string; english?: string; detail?: string; children?: ReactNode
}) {
  const id = useId()
  const help = useContext(GrammarHelp)
  if (!help) throw new Error('GrammarLabel must be inside the Intro grammar panel provider')

  return <button type="button" className="intro-grammar-label" aria-expanded={help.activeId === id}
    aria-controls="intro-grammar-explanation" onClick={event => help.open({ id, term, korean, english, detail }, event.currentTarget)}>
    {children}
  </button>
}
