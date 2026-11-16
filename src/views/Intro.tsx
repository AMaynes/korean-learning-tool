/**
 * Overview & Purpose: Explain the Korean language system with worked examples.
 *
 * Architectural Relationships: Linked from the tool shell and back to practice modules.
 *
 * External Resources: Konkuk University beginner grammar and the Sejong teaching guide.
 *
 * Notes: Examples use Hangul and English explanations.
 */


import { Icon, Korean } from './shared'

const sections = [
  ['writing-system', 'Hangul and sound'], ['sentence', 'Sentence structure'],
  ['nominals', 'Nominals and particles'], ['predicates', 'Predicates and endings'],
  ['modifiers', 'Modifiers and clauses'], ['conversation', 'Everyday usage'],
]

/** Teach the system from syllable construction through conversational usage. */
export function Intro() {
  return <div className="intro">
    <div className="section-heading"><div>
      <h1>How Korean works</h1>
      <p>Start with the building blocks, then follow a sentence from the first word to the final ending.</p>
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
          <p>A written syllable block combines an initial consonant, a vowel, and sometimes a final consonant called <Korean>받침</Korean> (batchim). A vowel-starting syllable uses silent <Korean>ㅇ</Korean> as its initial placeholder. Final <Korean>ㅇ</Korean> has a nasal sound.</p>
          <div className="system-example"><Korean>ㄱ + ㅏ → 가</Korean><Korean>ㅁ + ㅜ + ㄹ → 물</Korean><Korean>ㅇ + ㅏ → 아</Korean></div>
          <p>Read the blocks in order, then learn how neighboring sounds interact. In <Korean>밥을</Korean>, the final <Korean>ㅂ</Korean> carries into the vowel-starting particle, so the phrase sounds like <Korean>바블</Korean>. The spelling keeps the original noun and particle visible.</p>
          <p><Korean>ㄹ</Korean> is usually a quick tongue tap between vowels, as in <Korean>사람</Korean>. It sounds closer to English “l” at the end of a syllable or in a double <Korean>ㄹ</Korean>, as in <Korean>물</Korean> and <Korean>빨리</Korean>.</p>
        </article>

        <article className="panel intro-panel">
          <h2 id="sentence" tabIndex={-1}>Sentence structure</h2>
          <p>Start with the predicate you need. Add the people, things, time, and place that the listener needs to understand it. In a simple statement the predicate comes last.</p>
          <div className="sentence-diagram" aria-label="I eat food, broken into grammatical parts">
            <div><small>Topic</small><strong><Korean>저는</Korean></strong><span>I / as for me</span></div>
            <div><small>Object</small><strong><Korean>음식을</Korean></strong><span>food</span></div>
            <div><small>Predicate</small><strong><Korean>먹어요</Korean></strong><span>eat (polite)</span></div>
          </div>
          <p><Korean>저는 음식을 먹어요.</Korean> means “I eat food.” A fuller practical frame is <strong>[time] + [topic or subject] + [place] + [object] + [predicate]</strong>. Particles and context allow some reordering. <Korean>음식을 먹어요.</Korean> works when the speaker is already understood.</p>
          <p>With an adjective predicate, the description can end the sentence by itself. <Korean>음식이 맛있어요.</Korean> means “The food is delicious.”</p>
          <a className="text-button" href="#grammar">Practice sentence structure <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="nominals" tabIndex={-1}>Nominals and particles</h2>
          <p>A nominal can be a noun, a pronoun, or a whole phrase acting like a noun. Particles attach directly to that phrase and show its role. Many particle pairs use one form after a consonant and another after a vowel.</p>
          <div className="table-wrap"><table>
            <thead><tr><th scope="col">Role</th><th scope="col">Original + particle</th><th scope="col">Use</th></tr></thead>
            <tbody>
              <tr><th scope="row">Topic</th><td><Korean>저 + 는 → 저는</Korean></td><td>Sets the topic or highlights a contrast.</td></tr>
              <tr><th scope="row">Subject</th><td><Korean>집 + 이 → 집이</Korean><br/><Korean>친구 + 가 → 친구가</Korean></td><td>Identifies who acts or what has a quality.</td></tr>
              <tr><th scope="row">Object</th><td><Korean>음식 + 을 → 음식을</Korean><br/><Korean>친구 + 를 → 친구를</Korean></td><td>Marks what the action directly affects.</td></tr>
              <tr><th scope="row">Relation</th><td><Korean>친구 + 의 → 친구의</Korean></td><td>Marks possession or another relation, as in <Korean>친구의 집</Korean>.</td></tr>
              <tr><th scope="row">Place or time</th><td><Korean>학교 + 에 → 학교에</Korean><br/><Korean>학교 + 에서 → 학교에서</Korean></td><td><Korean>에</Korean> can mark a destination or time. <Korean>에서</Korean> can mark where an action happens.</td></tr>
            </tbody>
          </table></div>
          <p>Try <Korean>누가 와요?</Korean> (“Who’s coming?”) and <Korean>친구가 와요.</Korean> (“My friend is coming.”). In <Korean>친구는 와요.</Korean>, the friend is the topic. Depending on context, it can imply the friend is coming and someone else may be staying home.</p>
          <p>Some pronouns change shape with <Korean>가</Korean>. <Korean>저 + 가 → 제가</Korean> and <Korean>너 + 가 → 네가</Korean> are common examples.</p>
          <a className="text-button" href="#grammar">Practice particles <Icon name="arrow" size={15} /></a>
        </article>

        <article className="panel intro-panel">
          <h2 id="predicates" tabIndex={-1}>Predicates and endings</h2>
          <p>Action verbs and descriptive predicates both have dictionary forms ending in <Korean>다</Korean>. Remove that <Korean>다</Korean> to find the stem. The ending expresses tense, politeness, a relationship to the next clause, or the predicate’s role.</p>
          <div className="table-wrap"><table>
            <thead><tr><th scope="col">Dictionary form</th><th scope="col">Transformation</th><th scope="col">Use</th></tr></thead>
            <tbody>
              <tr><td><Korean>먹다</Korean> · eat</td><td><Korean>먹 + 어요 → 먹어요</Korean></td><td>Present polite.</td></tr>
              <tr><td><Korean>먹다</Korean> · eat</td><td><Korean>먹 + 었어요 → 먹었어요</Korean></td><td>Past polite.</td></tr>
              <tr><td><Korean>가다</Korean> · go</td><td><Korean>가 + 아요 → 가요</Korean></td><td>The vowels contract.</td></tr>
              <tr><td><Korean>어렵다</Korean> · difficult</td><td><Korean>어렵다 → 어려워요</Korean></td><td>The <Korean>ㅂ</Korean> in this stem changes before a vowel ending.</td></tr>
              <tr><td><Korean>먹다</Korean> · eat</td><td><Korean>먹 + 고 + 싶어요 → 먹고 싶어요</Korean></td><td>The auxiliary expresses desire and carries the polite ending.</td></tr>
            </tbody>
          </table></div>
          <p>Some endings attach directly, while others use a vowel or batchim rule, and some trigger a stem change. Compare <Korean>걷다 → 걸어요</Korean> with <Korean>받다 → 받아요</Korean>. Memorize each irregular as part of that verb’s entry.</p>
          <p>For “is a noun,” use the copula <Korean>이다</Korean>. In polite speech, use <Korean>이에요</Korean> after a consonant (<Korean>학생이에요</Korean>) and <Korean>예요</Korean> after a vowel (<Korean>친구예요</Korean>). <Korean>있어요</Korean> and <Korean>없어요</Korean> express existence or possession.</p>
        </article>

        <article className="panel intro-panel">
          <h2 id="modifiers" tabIndex={-1}>Modifiers and clauses</h2>
          <p>Put a describing word or clause before the noun it modifies. Put a time, frequency, or manner word before the action it describes.</p>
          <ul className="examples-list">
            <li><Korean>예쁘다 → 예쁜 집</Korean><span>A pretty house. The descriptive predicate takes a noun modifier ending.</span></li>
            <li><Korean>먹다 → 먹는 사람</Korean><span>A person who is eating. The action clause sits before the noun.</span></li>
            <li><Korean>빨리 먹어요.</Korean><span>Eat quickly. The adverb tells you how the action happens.</span></li>
            <li><Korean>먹고 가요.</Korean><span>Eat and then go. <Korean>-고</Korean> links the first action to the final predicate.</span></li>
            <li><Korean>먹기 전에</Korean><span>Before eating. <Korean>-기</Korean> lets the action function like a noun.</span></li>
          </ul>
        </article>

        <article className="panel intro-panel">
          <h2 id="conversation" tabIndex={-1}>Everyday usage</h2>
          <p>Use the polite <Korean>요</Korean> style as a starting point with strangers and in routine situations. Formal <Korean>습니다/ㅂ니다</Korean> suits introductions, public settings, and some workplaces. Casual speech fits relationships where it is established.</p>
          <p>Honorifics show respect to the person being discussed. Speech style shows how you address the listener. In <Korean>선생님께서 오세요.</Korean>, <Korean>께서</Korean> and <Korean>-시-</Korean> honor the teacher, and <Korean>요</Korean> marks polite speech toward the listener.</p>
          <p>Names and titles often stand in for “you.” <Korean>너</Korean> is informal. A question can use the same polite form as a statement with context and rising intonation. <Korean>학교에 가요?</Korean> can mean “Are you going to school?”</p>
          <p>For a useful practice sequence, build one sentence in Hangul, explain each particle and ending, then listen to it and say it aloud.</p>
          <a className="text-button" href="#listening">Practice listening and conversation <Icon name="arrow" size={15} /></a>
        </article>
      </div>
    </div>
  </div>
}
