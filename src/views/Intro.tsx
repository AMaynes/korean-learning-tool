/**
 * Overview & Purpose: Teach the Korean language system through diagrams and worked examples.
 *
 * Architectural Relationships: Linked from the tool shell and back to practice modules.
 *
 * External Resources: HRD Korea Hangeul textbook and National Institute of Korean Language.
 *
 * Notes: Hangul diagrams distinguish written letters from speech sounds.
 */


import { Fragment, createContext, useContext, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  conjugationRules, introGlossary, introWordMeanings, modifierTypes, nounTypes,
  numeralTypes, particleTypes, pronounTypes, verbTypes,
} from '../data/intro'
import type { ExampleFocus, GlossaryExample, IntroTerm, IntroType } from '../data/intro'
import { hangulAlphabet } from '../engine/pronunciation'
import { Icon, Korean, speakKorean, stopKoreanAudio } from './shared'

const sections = [
  ['hangul', 'Hangul + Pronunciation'],
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
        <LessonSection id="hangul" title="Hangul + Pronunciation">
          <LessonTabs sectionId="hangul" tabs={[
            { label: 'Korean Alphabet (Hangul)', content: <HangulAlphabet /> },
            { label: 'Hangul Syllables', content: <HangulSyllables /> },
          ]} />
        </LessonSection>

        <LessonSection id="nominals" title="Nominals" initiallyOpen>
          <p>Nouns, pronouns, and numerals can act as <GrammarLabel term="Nominal">nominals</GrammarLabel>.</p>
          <LessonTabs sectionId="nominals" tabs={[
            { label: "Nouns", content: <>
              <p>A <GrammarLabel term="Noun">noun</GrammarLabel> can fit more than one type. <Korean>음식</Korean> is both common and concrete.</p>
              <TypeTable title="Noun types" typeHeading="Noun Type" rows={nounTypes} />
              <ApplicationChecks unit="a noun" showRulesHeading particles="Yes" conjugates={false} note="Nouns take many particles. Common ones include 은/는 (topic), 이/가 (subject), 을/를 (object), 의 (possession), 에/에서 (place), 에게 (recipient), and 도/만 (also/only). Choose by the noun’s role and meaning."
                examples={[
                  [[["음식", "food"], ["을", "object marker"], ["음식을", "food as the object"]], ["을", "object particle", "follows 음식 because it ends in ㄱ."]],
                  [[["커피", "coffee"], ["를", "object marker"], ["커피를", "coffee as the object"]], ["를", "object particle", "follows 커피 because it ends in ㅣ."]],
                  [[["음식", "food"], ["이", "subject marker"], ["음식이", "food as the subject"]], ["이", "subject particle", "marks the noun 음식 as the subject."]],
                  [[["집", "home"], ["에서", "at (place of action)"], ["집에서", "at home"]], ["에서", "place particle", "marks the noun 집 as the place where an action happens."]],
                ]}
              />
            </> },
            { label: "Pronouns", content: <>
              <p>A <GrammarLabel term="Pronoun">pronoun</GrammarLabel> can stand for a person or thing already clear from context.</p>
              <TypeTable title="Pronoun types" typeHeading="Pronoun Type" rows={pronounTypes} />
              <ApplicationChecks unit="a pronoun" showRulesHeading particles="Yes" conjugates={false} note="Pronouns use many of the same particles as nouns, including 은/는 (topic), 이/가 (subject), 을/를 (object), 의 (possession), 에게 (recipient), and 도/만 (also/only). 저 changes to 제 before 가."
                examples={[
                  [[["저", "I"], ["는", "topic marker"], ["저는", "as for me"]], ["저", "I", "is the pronoun. 는 is the topic particle."]],
                  [[["저", "I"], ["가", "subject marker"], ["제가", "I as the subject"]], ["제", "I", "is the pronoun form that goes before the subject particle 가."]],
                  [[["저", "I"], ["를", "object marker"], ["저를", "me as the object"]], ["를", "object particle", "marks the pronoun 저 as the object."]],
                  [[["저", "I"], ["도", "too"], ["저도", "me too"]], ["도", "also", "adds “too” to the pronoun 저, giving “me too.”"]],
                ]}
              />
            </> },
            { label: "Numerals", content: <>
              <TypeTable title="Numeral types" typeHeading="Numeral Type" rows={numeralTypes} />
              <ApplicationChecks unit="a numeral" showRulesHeading particles="Yes" conjugates={false} note="A particle can follow a number on its own or the full phrase with a counter."
                examples={[
                  [[["둘", "two"], ["이", "subject marker"], ["둘이", "two as the subject"]], ["둘", "two", "is the numeral. 이 is the subject particle."]],
                  [[["세 개", "three items"], ["를", "object marker"], ["세 개를", "three items as the object"]], ["세", "three", "is the number form before the counter 개. 를 marks the whole phrase as the object."]],
                ]}
              />
            </> },
          ]} />
        </LessonSection>

        <LessonSection id="predicates" title="Predicates">
          <p>A <GrammarLabel term="Predicate">predicate</GrammarLabel> tells what happens, what something is like, or what it is. Start the worked sentence with the dictionary form <Korean>먹다</Korean> (<em>“to eat”</em>).</p>
          <LessonTabs sectionId="predicates" tabs={[
            { label: "Verbs", content: <>
              <h3>Verb types</h3>
              <TypeTable title="Verb types" typeHeading="Verb pattern" rows={verbTypes} />
              <ApplicationChecks unit="a verb" showRulesHeading particles="Sometimes" conjugates note="The verb stem takes an ending first. Some forms, like 걷기 and 먹지, can then take a particle."
                examples={[
                  [[["걷기", "walking"], ["가", "subject marker"], ["걷기가", "walking as the subject"]], ["걷기", "walking", "is the noun form of the verb 걷다. 가 is the subject particle."]],
                  [[["먹지", "eat (with -지)"], ["는", "contrast marker"], ["먹지는", "as for eating"]], ["는", "contrast particle", "attaches after the ending -지 and adds contrast to “I don’t eat it.”"], ["먹지는 않아요", "I don’t eat it."]],
                ]}
              />
              <h3>Conjugation rules</h3>
              <p>Drop <Korean>다</Korean> from a dictionary-form <GrammarLabel term="Verb">verb</GrammarLabel> to find its stem. Then check which form the ending needs.</p>
              <TypeTable title="How verb endings attach" typeHeading="Connection rule" rows={[
                ['Direct attach', '먹다 → 먹고', 'to eat → eat and then', ['-고', 'and then', 'attaches to 먹 as it is. -지만 and the -기 in -기 전에 do too. In -고 싶다, -고 is the part that attaches.']],
                ['아/어', '먹어요 → 먹어서', 'eat → because I eat', ['먹어', 'eat', 'is the part before 요. Add -서 here, or use the same form with -도 and -야 돼요.']],
                ['(으) buffer', '가면 / 먹으면', 'if I go / if I eat', ['-면 / -으면', 'if', 'show the pattern: 가 ends in a vowel, and 먹 ends in a consonant. Check the final sound with -(으)니까 and -(으)ㄹ 거예요 too.']],
              ]} />
              <p>Check the exact ending for stem changes. For <Korean>살다</Korean> (<em>to live</em>), <Korean>살면</Korean> (<em>if I live</em>) keeps <Korean>ㄹ</Korean> and <Korean>사니까</Korean> (<em>because I live</em>) drops it.</p>
            </> },
            { label: "Adjectives", content: <>
              <p>An <GrammarLabel term="Adjective">adjective</GrammarLabel> describes what someone or something is like. It can be the predicate or go before the noun it describes.</p>
              <GlossaryExamples examples={introGlossary.Adjective.examples} />
              <ApplicationChecks unit="an adjective" showRulesHeading particles="Sometimes" conjugates note="The adjective stem takes an ending first. Some forms, like 건강하기 and 맵지, can then take a particle."
                examples={[
                  [[["건강하기", "being healthy"], ["가", "subject marker"], ["건강하기가", "being healthy as the subject"]], ["건강하기", "being healthy", "is the noun form of the adjective 건강하다. 가 is the subject particle."], ["건강하기가 어렵다", "It’s hard to be healthy."]],
                  [[["맵지", "be spicy (with -지)"], ["는", "contrast marker"], ["맵지는", "as for being spicy"]], ["맵지", "be spicy", "is the adjective stem 맵 with the connecting ending -지. 는 adds contrast."], ["맵지는 않아요", "It isn’t spicy."]],
                ]}
              />
              <h3>Conjugation rules</h3>
              <p>Drop <Korean>다</Korean> to get the adjective stem. Before the everyday polite ending, the irregular stem <Korean>맵-</Korean> (<em>spicy</em>) changes and combines with the ending to make <Korean>매워요</Korean> (<em>is spicy</em>).</p>
            </> },
          ]} />
        </LessonSection>

        <LessonSection id="modifiers" title="Modifiers + Particles + Conjugation">
          <p><GrammarLabel term="Modifier">Modifiers</GrammarLabel> add detail, <GrammarLabel term="Particles">particles</GrammarLabel> mark each phrase’s job, and conjugation gives the predicate an ending.</p>
          <LessonTabs sectionId="modifiers" tabs={[
            { label: "Determiners + Adverbs", content: <>
              <p><GrammarLabel term="Determiner">Determiners</GrammarLabel> go directly before nouns and tell which one, how many, or what kind. An <GrammarLabel term="Adverb">adverb</GrammarLabel> often tells when, how, or to what degree something happens.</p>
              <TypeTable title="Determiner and adverb types" rows={modifierTypes} />
              <ApplicationChecks unit="a determiner" particles="No" conjugates={false} note="The particle follows the whole phrase."
                examples={[
                  [[["세 사람", "three people"], ["을", "object marker"], ["세 사람을", "three people as the object"]], ["세", "three", "is the determiner. The object particle 을 comes after the noun 사람."]],
                ]}
              />
              <ApplicationChecks unit="an adverb" particles="Yes" conjugates={false} note="Some adverbs take a particle for emphasis."
                examples={[
                  [[["아직", "still"], ["도", "emphasis"], ["아직도", "still, even now"]], ["아직", "still", "is the adverb. 도 adds emphasis."]],
                ]}
              />
            </> },
            { label: "Particles", content: <>
              <TypeTable title="What takes particles" rows={[
                ['Nouns, pronouns, numerals', '음식을 / 저는 / 둘이', 'food / I / two people', ['을 / 는 / 이', 'object / topic / subject markers', 'are the particles attached to the noun, pronoun, and numeral.']],
                ['Verbs and adjectives', '걷기가 / 맵지는', 'walking, as the subject / as for being spicy', ['-기 / -지', 'noun-forming / connecting endings', 'are endings that make forms that can take a particle.']],
                ['Phrases with a determiner', '이 책을', 'this book, as the object', ['을', 'object marker', 'is the particle that comes after the full phrase 이 책.']],
                ['Adverbs', '아직도', 'still', ['도', 'also, with emphasis here', 'is the particle that adds emphasis to the adverb 아직.']],
                ['Particles and connecting endings', '집에서는 / 먹지는', 'as for at home / as for eating', ['는', 'topic or contrast marker', 'is the particle that can follow 에서 or -지.']],
              ]} />
              <h3>Common particle types</h3>
              <div className="table-wrap intro-table"><table aria-label="Common particle types">
                <thead><tr><th scope="col">Use</th><th scope="col">Particles</th><th scope="col">When to use them</th></tr></thead>
                <tbody>{particleTypes.map(([use, forms, meaning]) => <tr key={use}>
                  <th scope="row">{use}</th><td><Korean>{forms}</Korean></td><td>{meaning}</td>
                </tr>)}</tbody>
              </table></div>
              <h3>HOW TO USE PARTICLES</h3>
              <ol>
                <li>Choose the job. To mark what you eat, use the object particle <Korean>을/를</Korean>.</li>
                <li>Choose the form. After a final consonant, use <Korean>은, 이, 을, 과</Korean>. After a vowel, use <Korean>는, 가, 를, 와</Korean>, respectively. For <Korean>으로/로</Korean>, use <Korean>로</Korean> after a vowel or final <Korean>ㄹ</Korean>.</li>
                <li>Write the particle directly after the word, with no space. Some particles always look the same, like <Korean>도</Korean> (<em>also</em>).</li>
              </ol>
              <h4>Particle examples without conjugation</h4>
              {particleTypes.map(([use, , , parts]) => <div className="intro-check-example" key={use}>
                <strong>{use}</strong><ParticleEquation parts={parts} />
              </div>)}
              <h4>One example with conjugation</h4>
              <p><Korean>밥<b>을</b> 먹습니다.</Korean> <em>I eat rice.</em></p>
              <p><Korean>밥 + 을 = 밥을</Korean> (<em>rice as the object</em>). <Korean>을</Korean> is the particle.</p>
              <p><Korean>먹 + 습니다 = 먹습니다</Korean> (<em>I eat</em>). <Korean>먹</Korean> means <em>eat</em> and <Korean>-습니다</Korean> is the formal polite ending.</p>
              <p>Special case: <Korean>이다</Korean> (<em>to be</em>) is the particle that conjugates.</p>
            </> },
            { label: "Conjugation", content: <>
              <TypeTable title="What conjugates" rows={[
                ['Verbs', '먹다 → 먹어요', 'to eat → eat', ['-어요', 'everyday polite ending', 'is the polite ending that attaches to the verb stem 먹.']],
                ['Adjectives', '맵다 → 매워요', 'to be spicy → is spicy', ['맵 → 매워요', 'spicy → is spicy', 'shows how the adjective stem changes.']],
                ['Copula 이다', '학생이다 → 학생이에요', 'to be a student → am a student', ['이다', 'to be', 'is the conjugating particle in traditional Korean grammar.']],
              ]} />
              <h3>HOW TO CONJUGATE</h3>
              <p>Start with a dictionary form like <Korean>먹다</Korean> (<em>to eat</em>). Drop <Korean>다</Korean> to get the stem <Korean>먹</Korean> (<em>eat</em>). Choose an ending for what you want to say, then attach it using its own rule. A hyphen marks the attachment point and disappears when you write the word.</p>
              <h4>Examples without particles</h4>
              {conjugationRules.map(([rule, description, examples]) => <section key={rule}>
                <h4>{rule}</h4>
                <p>{description}</p>
                {examples.map(parts => <ParticleEquation key={parts[2][0]} parts={parts} />)}
              </section>)}
              <h4>One example with a particle</h4>
              <p><Korean>밥<b>을</b> 먹고 쉰다.</Korean> <em>I eat rice and then rest.</em></p>
              <ParticleEquation parts={[['밥', 'rice'], ['을', 'object particle'], ['밥을', 'rice as the object']]} />
              <p><Korean>먹고</Korean> (<em>eat and then</em>) uses the ending <Korean>-고</Korean>. <Korean>쉰다</Korean> means <em>rest</em>. Adding <Korean>밥을</Korean> tells you what gets eaten.</p>
            </> },
          ]} />
          <a className="text-button" href="#grammar">Practice particles and conjugation <Icon name="arrow" size={15} /></a>
        </LessonSection>

        <LessonSection id="independent" title="Independent Forms">
          <p>Interjections can stand on their own or come before a clause. They can respond, express a reaction, or get someone’s attention.</p>
          <TypeTable title="Independent forms" rows={[
            ['Response', '네! / 아니요!', 'Yes! / No!', ['네 / 아니요', 'yes / no', 'are interjections that answer a question.']],
            ['Reaction', '와!', 'Wow!', ['와', 'wow', 'is an interjection that expresses surprise.']],
            ['Attention', '저기요!', 'Excuse me!', ['저기요', 'excuse me', 'is an interjection that gets someone’s attention.']],
          ]} />
          <p><ExampleNumber /><Korean>네, 오늘 집에서 먹어요.</Korean> (<em>“Yes, I’m eating at home today.”</em>) <Korean>네</Korean> is the response before the clause.</p>
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
          <GlossaryExamples examples={introGlossary[explanation.term].examples} />
        </> : <p>Select an underlined term for a definition and three examples.</p>}
      </aside>
    </div>
  </div>
  </GrammarHelp.Provider>
}

const vowelComparison = [
  { label: 'Base vowels', groups: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅐㅔ'] },
  { label: 'Y-vowels', groups: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅒㅖ'] },
]
const similarVowels = ['ㅙㅚㅞ']
const relatedConsonants = ['ㄱㄲㅋ', 'ㄷㄸㅌ', 'ㅂㅃㅍ', 'ㅅㅆ', 'ㅈㅉㅊ']

/** Display the modern alphabet and play its sounds on demand. */
function HangulAlphabet() {
  const [audioError, setAudioError] = useState('')
  useEffect(() => stopKoreanAudio, [])

  function play(sound: string) {
    setAudioError('')
    speakKorean(sound, 1, () => {}, () => setAudioError('Sound couldn’t play. Try again.'))
  }

  return <>
    <p>Tap a letter to hear it. Consonants play with <Korean>ㅡ</Korean>. <Korean>ㅇ</Korean> is silent at the start, so you’ll hear its <em>ng</em> sound in <Korean>응</Korean>.</p>
    {audioError && <p role="status">{audioError}</p>}
    <AlphabetGroup
      title="Vowels" note="Read down to compare each base vowel with its y-vowel. Vowels in the same box often sound alike."
      letters={hangulAlphabet.vowels} soundGroups={similarVowels} comparison={vowelComparison} onPlay={play}
    />
    <AlphabetGroup
      title="Consonants" note="Consonants in each box have related starting sounds. Listen for differences in airflow or tension."
      letters={hangulAlphabet.consonants} soundGroups={relatedConsonants} onPlay={play}
    />
  </>
}

/** Place similar letters together while keeping a play button for every letter. */
function AlphabetGroup({ title, note, letters, soundGroups, comparison = [], onPlay }: {
  title: string
  note: string
  letters: readonly { prompt: string; sound: string; romanization: string }[]
  soundGroups: readonly string[]
  comparison?: readonly { label: string; groups: readonly string[] }[]
  onPlay: (sound: string) => void
}) {
  const groupedLetters = soundGroups.join('') + comparison.flatMap(({ groups }) => groups).join('')

  function renderLetter({ prompt, sound, romanization }: (typeof letters)[number]) {
    return <button
      key={prompt} type="button" className="hangul-letter button" aria-label={`Play ${prompt}, ${romanization}`}
      onClick={() => onPlay(sound)}
    >
      <Korean>{prompt}</Korean><Icon name="sound" size={14} />
      <small>{romanization}</small>
    </button>
  }

  function renderGroup(group: string) {
    const buttons = letters.filter(({ prompt }) => group.includes(prompt)).map(renderLetter)
    if (group.length === 1) return buttons
    return <div className="hangul-sound-group" key={group} role="group" aria-label={[...group].join(' ')}>{buttons}</div>
  }

  return <section className="hangul-letter-group" aria-label={title}>
    <h3>{title}</h3>
    <p className="hangul-group-note">{note}</p>
    {comparison.length > 0 && <div className="hangul-vowel-comparison">
      {comparison.map(({ label, groups }) => <div className="hangul-vowel-row" key={label} role="group" aria-label={label}>
        {groups.map(renderGroup)}
      </div>)}
    </div>}
    <div className="hangul-sound-groups">{soundGroups.map(renderGroup)}</div>
    <div className="hangul-letter-grid">
      {letters.filter(({ prompt }) => !groupedLetters.includes(prompt)).map(renderLetter)}
    </div>
  </section>
}

/** Show where consonants and vowels sit in a single Hangul syllable block. */
function HangulSyllables() {
  return <>
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

    <h3>Things to note</h3>
    <div className="table-wrap intro-table hangul-sounds"><table aria-label="Hangul spelling and sound examples">
      <thead><tr><th scope="col">Korean</th><th scope="col">What to notice</th></tr></thead>
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
    <a className="text-button" href="#pronunciation">Practice pronouncing Hangul <Icon name="arrow" size={15} /></a>
  </>
}

/** Show how to assemble a clause, change what it says, and combine it with other clauses. */
function SentenceStructure() {
  return <LessonSection id="sentence" title="Sentence Structures">
    <LessonTabs sectionId="sentence" tabs={[
      { label: 'Statements', content: <>
        <p>Put the <GrammarLabel term="Predicate">predicate</GrammarLabel> last. For an action with an object, a common order is <strong>who + what + action</strong>.</p>
        <ExampleParts parts={[
          ['Topic', '저는', 'I', '는 · topic particle', '는'],
          ['Object', '밥을', 'rice', '을 · object particle', '을'],
          ['Predicate', '먹어요.', 'eat', 'Verb'],
        ]} meaning="I eat rice." />
        <p>Here, <Korean>저</Korean> (<em>I</em>) is both the topic and the subject. <Korean>는</Korean> marks the topic, and the speaker is the one eating. In other sentences, the topic and subject can differ.</p>
        <p>When it’s clear who’s eating, you can leave out <Korean>저<u>는</u></Korean> (<em>I</em>) and say <Korean>밥<u>을</u> 먹어요</Korean> (<em>I eat rice</em>).</p>
      </> },
      { label: 'Questions', content: <>
        <h3>Ask for information</h3>
        <p>For a yes/no question in everyday polite speech, keep the statement’s words and raise your voice at the end. To ask for a detail, put a question word where the answer belongs.</p>
        <ExampleParts parts={[['Object', '밥을', 'rice', '을 · object particle', '을'], ['Question', '먹어요?', 'do you eat?', 'Verb']]} meaning="Do you eat rice?" />
        <ExampleParts parts={[['Object', '무엇을', 'what', '을 · object particle (무엇을 contracts to 뭘)', '을'], ['Question', '먹어요?', 'are you eating?', 'Verb']]} meaning="What are you eating?" />
      </> },
      { label: 'Commands & requests', content: <>
        <h3>Ask someone to do something</h3>
        <p>Put the requested action last. Use <Korean>-(으)세요</Korean> for a polite instruction or <Korean>-아/어 주세요</Korean> to ask someone to do you a favor.</p>
        <ExampleParts parts={[['Object', '책을', 'the book', '을 · object particle', '을'], ['Instruction', '읽으세요.', 'please read', 'Verb + polite instruction ending']]} meaning="Please read the book." />
        <ExampleParts parts={[['Object', '책을', 'the book', '을 · object particle', '을'], ['Action', '읽어', 'read', 'Verb'], ['Request', '주세요.', 'please do it for me', 'Auxiliary verb']]} meaning="Please read the book for me." />
      </> },
      { label: 'Suggestions', content: <>
        <h3>Suggest doing something together</h3>
        <p>Use <Korean>-자</Korean> for a casual suggestion or <Korean>-(으)ㄹ까요?</Korean> to ask what the other person thinks.</p>
        <ExampleParts parts={[['Together', '같이', 'together', 'Adverb'], ['Suggestion', '먹자.', 'let’s eat', 'Verb + suggestion ending']]} meaning="Let’s eat together." />
        <ExampleParts parts={[['Together', '같이', 'together', 'Adverb'], ['Suggestion', '먹을까요?', 'shall we eat?', 'Verb + question ending']]} meaning="Shall we eat together?" />
      </> },
      { label: 'Exclamations', content: <>
        <h3>React to something you notice</h3>
        <p>Use <Korean>-네요</Korean> when something strikes you in the moment, such as tasting food for the first time.</p>
        <ExampleParts parts={[['Subject', '음식이', 'the food', '이 · subject particle', '이'], ['Reaction', '맵네요!', 'is spicy!', 'Adjective + reaction ending']]} meaning="Wow, the food is spicy!" />
      </> },
    ]} />
    <a className="text-button" href="#grammar">Practice sentence structure <Icon name="arrow" size={15} /></a>
  </LessonSection>
}

/** Match the shape of the written slots and show their assembled Hangul block. */
function SyllableBlock({ letters: [initial, vowel, result, endings = []], position }: {
  letters: Syllable; position: 'right' | 'below'
}) {
  return <figure className="syllable-card" aria-label={`Syllable ${result}, vowel ${position === 'right' ? 'on the right' : 'below'}`}>
    <ExampleNumber />
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
  parts: readonly (readonly [label: string, korean: string, english: string, grammar: string, particle?: string])[]; meaning: string; note?: ReactNode
}) {
  function markParticle(word: string, particle?: string) {
    if (!particle) return word
    return <>{word.slice(0, -particle.length)}<u>{particle}</u></>
  }
  return <figure className="intro-example">
    <figcaption>
      <ExampleNumber />
      <strong><Korean>{parts.map(([label, word, , , particle], index) => <Fragment key={label}>{index > 0 && ' '}{markParticle(word, particle)}</Fragment>)}</Korean></strong><br />
      <em>{meaning}</em>{note && <> {note}</>}
    </figcaption>
    <dl className="intro-parts">
      {parts.map(([label, korean, english, grammar, particle]) => <div key={label}>
        <dt>{isIntroTerm(label) ? <GrammarLabel term={label} /> : label}</dt>
        <dd><Korean>{markParticle(korean, particle)}</Korean><small><em>{english}</em></small><span className="intro-part-grammar">{grammar}</span></dd>
      </div>)}
    </dl>
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
    if (korean === '크지 않아요.' && word === '않아요') meaning = 'isn’t'
    return { word, meaning }
  })
  if (!glosses.length || (glosses.length === 1 && glosses[0].meaning === english)) return null

  return <div className="intro-word-glosses">
    {glosses.map(({ word, meaning }, index) => <span key={index}>
      <Korean>{word}</Korean>{meaning && <em> {meaning}</em>}
    </span>)}
  </div>
}

/** The enclosing example group supplies sequential numbers in reading order. */
function ExampleNumber() {
  return <span className="intro-example-number" />
}

/** Show the Korean form, translation, and what to notice. */
function GlossaryExamples({ examples }: { examples: readonly GlossaryExample[] }) {
  return <ul className="intro-explanation-examples" aria-label="Examples">
    {examples.map(([korean, english, focus]) => <li className="intro-explanation-example" key={korean}>
      <ExampleNumber />
      <strong><Korean>{korean}</Korean></strong>
      <small><em>{english}</em></small>
      <WordGlosses korean={korean} english={english} />
      <p><ExplainExample focus={focus} /></p>
    </li>)}
  </ul>
}

/** Identify the Korean part, its English meaning, and the reason it fits the example. */
function ExplainExample({ focus: [korean, english, reason] }: { focus: ExampleFocus }) {
  return <><b><Korean>{korean}</Korean></b> (<em>{english}</em>) {reason}</>
}

/** Present each category or application rule beside a Korean example. */
function TypeTable({ title, typeHeading = 'Type', rows }: { title: string; typeHeading?: string; rows: readonly IntroType[] }) {
  return <div className="table-wrap intro-table"><table aria-label={title}>
    <thead><tr><th scope="col">{typeHeading}</th><th scope="col">Korean</th><th scope="col">English</th></tr></thead>
    <tbody>{rows.map(([label, korean, english, focus]) => <tr key={label}>
      <th scope="row">{isIntroTerm(label) ? <GrammarLabel term={label} /> : label}</th>
      <td><Korean>{korean}</Korean></td>
      <td><em>{english}</em><WordGlosses korean={korean} english={english} /><p><ExplainExample focus={focus} /></p></td>
    </tr>)}</tbody>
  </table></div>
}

type GlossedPart = readonly [korean: string, english: string]
type ParticleEquationParts = readonly [base: GlossedPart, particle: GlossedPart, result: GlossedPart]

/** Keep each English gloss beneath its Korean form as the equation narrows. */
function ParticleEquation({ parts: [base, particle, result] }: { parts: ParticleEquationParts }) {
  function term([korean, english]: GlossedPart) {
    return <span className="equation-term"><Korean>{korean}</Korean><em>{english}</em></span>
  }
  return <div className="particle-equation">
    {term(base)}<span>+</span>{term(particle)}<span>=</span>{term(result)}
  </div>
}

/** Show the attachment and conjugation answers for the form named in the question. */
function ApplicationChecks({ unit, particles, conjugates, note, examples, showRulesHeading = false }: {
  unit: string; particles: 'Yes' | 'No' | 'Sometimes'; conjugates: boolean; note: string
  examples: readonly (readonly [parts: ParticleEquationParts, focus: ExampleFocus, sentence?: GlossedPart])[]
  showRulesHeading?: boolean
}) {
  return <div className="intro-application">
    <dl>
      <div><dt>Does {unit} take particles?</dt><dd>{particles}</dd></div>
      <div><dt>Does {unit} conjugate?</dt><dd>{conjugates ? 'Yes' : 'No'}</dd></div>
    </dl>
    {showRulesHeading && <h3>Particle rules</h3>}
    <p>{note}</p>
    {examples.map(([parts, focus, sentence]) => <div key={parts[2][0]} className="intro-check-example">
      <ExampleNumber />
      <ParticleEquation parts={parts} />
      {sentence && <p><Korean>{sentence[0]}</Korean> (<em>{sentence[1]}</em>)</p>}
      <p><ExplainExample focus={focus} /></p>
    </div>)}
  </div>
}
