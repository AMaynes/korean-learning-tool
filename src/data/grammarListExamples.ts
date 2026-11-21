import { attach, batchim, conjugate } from '../engine/korean'
import type { Rule } from './grammar'

type Pair = [string, string]
export type GlossedEquation = [Pair, Pair, Pair]

const people: Pair[] = [['학생', 'student'], ['의사', 'doctor'], ['동생', 'younger sibling'], ['친구', 'friend'], ['누나', 'older sister'], ['형', 'older brother']]
const elders: Pair[] = [['교수님', 'professor'], ['할머니', 'grandmother'], ['할아버지', 'grandfather'], ['아버지', 'father'], ['어머니', 'mother']]
const places: Pair[] = [['방', 'room'], ['카페', 'café'], ['공원', 'park'], ['도시', 'city'], ['마을', 'village']]
const times: Pair[] = [['월요일', 'Monday'], ['두 시', 'two o’clock'], ['내일', 'tomorrow'], ['정오', 'noon'], ['금요일', 'Friday']]
const things: Pair[] = [['책', 'book'], ['사과', 'apple'], ['빵', 'bread'], ['의자', 'chair'], ['연필', 'pencil']]

// The template translates the complete phrase. The middle gloss describes the marker itself.
const particles: Record<string, [Pair[], string, string]> = {
  topic: [things, 'as for', 'as for the X'], subject: [things, 'subject', 'the X (subject)'],
  object: [things, 'object', 'the X (object)'], possession: [people, '’s', 'the X’s'],
  also: [things, 'too', 'the X too'], only: [things, 'only', 'only the X'],
  destination: [places, 'to', 'to the X'], actionPlace: [places, 'at', 'at the X'],
  direction: [places, 'toward', 'toward the X'], start: [times, 'from', 'from X'],
  until: [times, 'until', 'until X'], recipient: [people, 'to', 'to the X'],
  colloquialRecipient: [people, 'to', 'to the X'], honorificRecipient: [elders, 'to (respectful)', 'to the X'],
  with: [people, 'with', 'with the X'], colloquialWith: [people, 'with', 'with the X'],
  writtenWith: [people, 'with', 'with the X'], comparison: [things, 'than', 'than the X'],
  like: [people, 'like', 'like the X'], each: [places, 'every', 'every X'],
  choice: [things, 'or', 'the X or …'], onlyNegative: [things, 'except', 'except the X'],
  fromPerson: [people, 'from', 'from the X'], even: [people, 'even', 'even the X'],
  approx: [times, 'around', 'around X'], honorificSubject: [elders, 'subject (respectful)', 'the X (subject)'],
  allInGroup: [people, 'among', 'among Xs'],
}

const verbs = [
  ['사다', 'buy', 'bought', 'buying'], ['찾다', 'look for', 'looked for', 'looking for'],
  ['보다', 'see', 'saw', 'seeing'], ['닫다', 'close', 'closed', 'closing'],
  ['열다', 'open', 'opened', 'opening'], ['가다', 'go', 'went', 'going'],
]

// For these regular stems, pairs give the vowel-final and consonant-final variants.
// The ㄹ-final stem 열 follows the vowel pattern for 으 endings.
const endings: Record<string, [string, string, string]> = {
  present: ['아요', '아요', 'I VERB'], past: ['았어요', '았어요', 'I PAST'],
  future: ['ㄹ 거예요', '을 거예요', 'I will VERB'], casual: ['아', '아', 'I VERB (casual)'],
  formal: ['ㅂ니다', '습니다', 'I VERB (formal)'], request: ['세요', '으세요', 'please VERB'],
  wish: ['고 싶어요', '고 싶어요', 'I want to VERB'], ongoing: ['고 있어요', '고 있어요', 'I am ING'],
  ability: ['ㄹ 수 있어요', '을 수 있어요', 'I can VERB'], must: ['아야 해요', '아야 해요', 'I must VERB'],
  negative: ['지 않아요', '지 않아요', 'I do not VERB'], and: ['고', '고', 'VERB and …'],
  but: ['지만', '지만', 'I VERB, but …'], if: ['면', '으면', 'if I VERB …'],
  because: ['아서', '아서', 'because I VERB …'], while: ['면서', '으면서', 'while ING …'],
  presentModifier: ['는', '는', 'that I VERB'], nModifier: ['ㄴ', '은', 'that I PAST'],
  futureModifier: ['ㄹ', '을', 'that I will VERB'], nominal: ['기', '기', 'ING'],
  try: ['아 봐요', '아 봐요', 'try ING'], plan: ['려고 해요', '으려고 해요', 'I plan to VERB'],
  before: ['기 전', '기 전', 'before ING'], after: ['ㄴ 후', '은 후', 'after ING'],
  seems: ['ㄹ 것 같아요', '을 것 같아요', 'I will probably VERB'], background: ['는데', '는데', 'I VERB, and …'],
}

export function moreExamples(rule: Rule): GlossedEquation[] {
  const original = rule.examples[0].original
  if (rule.type === 'Particle') {
    const [words, gloss, template] = particles[rule.id]
    return words.filter(([word]) => word !== original).slice(0, 5).map(([word, meaning]) => {
      const { applied, result } = attach(word, rule.id)!
      const plural = meaning + 's'
      return [[word, meaning], [applied, gloss], [result, template.replace('Xs', plural).replace('X', meaning)]]
    })
  }
  const [vowel, consonant, template] = endings[rule.id]
  return verbs.filter(([word]) => word !== original).slice(0, 5).map(([word, meaning, past, ing]) => {
    const stem = word.slice(0, -1)
    const final = batchim(stem)
    let ending = final === 0 || final === 8 ? vowel : consonant
    if (stem === '열') ending = ending.replace(/^아/, '어').replace(/^았/, '었')
    const result = conjugate({ id: word, korean: word, english: meaning }, 'verb', rule.id)!
    return [[stem, meaning], [ending, rule.english], [result, template.replace('VERB', meaning).replace('PAST', past).replace('ING', ing)]]
  })
}
