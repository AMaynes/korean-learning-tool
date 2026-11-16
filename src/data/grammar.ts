/**
 * Overview & Purpose: Describe grammatical rules and worked examples for the study library.
 *
 * Architectural Relationships: Consumed by the registry and exercise generator.
 *
 * External Resources: Korean Language Institute beginner grammar and Sejong curriculum.
 *
 * Notes: These definitions distinguish attachment rules from predicate morphology.
 */


import { attach, conjugate } from '../engine/korean'
import type { Category, Entry, Irregular, Transformation, WordClass, WordList } from './model'

/** One shared grammar definition and its learner-facing examples. */
export interface Rule {
  id: string
  korean: string
  english: string
  type: string
  note: string
  examples: Transformation[]
  nounTag?: 'person' | 'place'
}

type ParticleSeed = [string, string, string, string, [string, string][], Rule['nounTag']?]
type ConjugationSeed = [string, string, string, string, string, string, string, string, WordClass?, Irregular?]

/** Generate particle examples using the same implementation as practice. */
function particle([id, korean, english, note, originals, nounTag]: ParticleSeed): Rule {
  return {
    id, korean, english, note, nounTag, type: 'Particle',
    examples: originals.map(([original, originalMeaning]) => ({
      original, originalMeaning, ...attach(original, id)!, meaning: `${originalMeaning} · ${english}`,
    })),
  }
}

/** Keep the dictionary form, derived stem, and context visible for every pattern. */
function ending([id, korean, english, type, note, original, originalMeaning, meaning, wordClass = 'verb', irregular]: ConjugationSeed): Rule {
  const entry: Entry = { id: 'example', korean: original, english: originalMeaning, irregular }
  const result = conjugate(entry, wordClass, id)!
  return { id, korean, english, type, note, examples: [{ original, originalMeaning, stem: original.slice(0, -1), applied: korean, result, meaning }] }
}

const friend: [string, string] = ['친구', 'Friend']
const house: [string, string] = ['집', 'Home']
const food: [string, string] = ['음식', 'Food']
const school: [string, string] = ['학교', 'School']
const teacher: [string, string] = ['선생님', 'Teacher']
const seoul: [string, string] = ['서울', 'Seoul']

const coreParticles = ([
  ['topic', '은/는', 'Topic marker', '은 after a final consonant, 는 after a vowel. Sets the topic or highlights a contrast.', [house, ['저', 'I (humble)']]],
  ['subject', '이/가', 'Subject marker', '이 after a final consonant, 가 after a vowel. Identifies the subject. 저, 나, 너, and 누구 combine as 제가, 내가, 네가, and 누가.', [house, friend, ['저', 'I (humble)']]],
  ['object', '을/를', 'Object marker', '을 after a final consonant, 를 after a vowel. Marks what the action directly affects.', [food, friend]],
  ['possession', '의', 'Possession / relation', 'Attach 의 to the possessor. Put the thing possessed after it.', [friend, teacher]],
  ['also', '도', 'Also / too', 'Adds the marked item to a group. It often replaces 은/는, 이/가, or 을/를.', [friend, ['저', 'I (humble)']]],
  ['only', '만', 'Only / just', 'Limits the scope to the marked item.', [['물', 'Water'], food]],
  ['destination', '에', 'Destination / time / location', 'Marks where something goes or exists, or when it happens. 학교에 가요 means “go to school.”', [school, ['세 시', 'Three o’clock']], 'place'],
  ['actionPlace', '에서', 'Action location / from', 'Marks where an action happens, or the starting location of motion.', [school, seoul], 'place'],
  ['direction', '(으)로', 'Direction / means', '으로 after most final consonants. 로 after a vowel or final ㄹ.', [house, school, seoul]],
  ['start', '부터', 'Starting at / from', 'Marks the starting point, especially a time or order.', [['오늘', 'Today'], ['세 시', 'Three o’clock']]],
  ['until', '까지', 'Until / up to', 'Marks an endpoint in time, space, or a range.', [school, ['세 시', 'Three o’clock']]],
  ['recipient', '에게', 'To / for someone', 'Marks the recipient of an action such as giving or sending.', [friend, teacher], 'person'],
  ['colloquialRecipient', '한테', 'To / from someone (spoken)', 'In conversation, marks a recipient or, with verbs such as 받다, a source.', [friend, teacher], 'person'],
  ['honorificRecipient', '께', 'To someone (honorific)', 'Marks a recipient you are showing respect to.', [teacher, ['부모님', 'Parents']], 'person'],
  ['with', '하고', 'And / with', 'A common spoken connector between nouns. It can also mark a companion.', [friend, teacher]],
  ['colloquialWith', '(이)랑', 'And / with (casual)', '이랑 after a final consonant, 랑 after a vowel. Common in conversation.', [house, friend]],
  ['writtenWith', '와/과', 'And / with', '과 after a final consonant, 와 after a vowel. Common in writing and formal speech.', [house, friend]],
  ['comparison', '보다', 'Than / comparison', 'Marks the standard of comparison. 친구보다 means “than a friend” in context.', [friend, teacher]],
  ['like', '처럼', 'Like / as', 'Marks something you are comparing a quality or manner to.', [friend, ['고양이', 'Cat']]],
  ['each', '마다', 'Every / each', 'Distributes an action or property across times or members of a group.', [['날', 'Day'], ['사람', 'Person']]],
] satisfies ParticleSeed[]).map(particle)

const extraParticles = ([
  ['choice', '(이)나', 'Or / an available choice', '이나 after a final consonant, 나 after a vowel. Can connect alternatives or suggest an available option.', [food, ['커피', 'Coffee']]],
  ['onlyNegative', '밖에', 'Only / nothing except', 'Pair 밖에 with a negative predicate. 물밖에 없어요 means “There’s only water.”', [['물', 'Water'], food]],
  ['fromPerson', '한테서', 'From someone (spoken)', 'Marks the source person in conversation.', [friend, teacher], 'person'],
  ['even', '조차', 'Even', 'Marks a surprising or extreme case, often in a negative situation.', [friend, ['이름', 'Name']]],
  ['approx', '쯤', 'Approximately', 'Put 쯤 after a time, quantity, or place to indicate an approximation.', [['세 시', 'Three o’clock'], ['열 명', 'Ten people']]],
  ['honorificSubject', '께서', 'Subject marker (honorific)', 'Identifies a subject you are showing respect to.', [teacher, ['부모님', 'Parents']], 'person'],
  ['allInGroup', '끼리', 'Among / with members of a group', 'Marks people or things grouped together, as in 친구끼리 among friends.', [friend, ['가족', 'Family']], 'person'],
] satisfies ParticleSeed[]).map(particle)

const coreEndings = ([
  ['present', '-아/어요', 'Present polite', 'Sentence ending', 'Select 아 or 어, then apply contractions and add 요. 하다 becomes 해요.', '먹다', 'Eat', 'Eat (polite)'],
  ['past', '-았/었어요', 'Past polite', 'Sentence ending', 'Use the 아/어 base with past ㅆ, then add 어요.', '먹다', 'Eat', 'Ate (polite)'],
  ['future', '-(으)ㄹ 거예요', 'Future / intention', 'Sentence ending', 'Attach ㄹ/을 to the stem before 거예요. With adjectives this often expresses a prediction.', '가다', 'Go', 'Will go'],
  ['casual', '-아/어', 'Casual present', 'Sentence ending', 'Use the 아/어 base in an appropriate informal relationship.', '보다', 'See', 'See (casual)'],
  ['formal', '-ㅂ니다/습니다', 'Formal statement', 'Sentence ending', 'Use ㅂ니다 after a vowel and 습니다 after most consonants. Final ㄹ drops before ㅂ니다.', '알다', 'Know', 'Know (formal)'],
  ['request', '-(으)세요', 'Polite request / command', 'Sentence ending', 'Use 세요 after a vowel or after dropping final ㄹ, 으세요 after most other consonants. Some verbs have dedicated honorific forms.', '읽다', 'Read', 'Please read'],
  ['wish', '-고 싶다', 'Want to', 'Auxiliary', 'Add 고 to an action verb and put 싶어요 after it. Typically expresses the speaker’s desire in a statement or asks about the listener’s desire.', '먹다', 'Eat', 'Want to eat'],
  ['ongoing', '-고 있다', 'Ongoing action', 'Auxiliary', 'Add 고 to the action stem, then 있어요 for the polite progressive.', '읽다', 'Read', 'Am reading'],
  ['ability', '-(으)ㄹ 수 있다', 'Ability / can', 'Auxiliary construction', 'Use the ㄹ/을 modifier before 수 있어요.', '가다', 'Go', 'Can go'],
  ['must', '-아/어야 하다', 'Must / have to', 'Auxiliary', 'Use the 아/어 base followed by 야 해요.', '하다', 'Do', 'Have to do'],
  ['negative', '-지 않다', 'Negation', 'Auxiliary', 'Add 지 to the stem and put 않아요 after it.', '가다', 'Go', 'Do not go'],
  ['and', '-고', 'And / then', 'Connective', 'Attach 고 to link actions or descriptions. Follow it with the next clause.', '먹다', 'Eat', 'Eat and …'],
  ['but', '-지만', 'But / although', 'Connective', 'Attach 지만 to set up a contrast with the next clause.', '좋다', 'Good', 'It is good, but …', 'adjective'],
  ['if', '-(으)면', 'If / when', 'Connective', 'Use 면 after a vowel or final ㄹ and 으면 after most other consonants.', '먹다', 'Eat', 'If / when someone eats …'],
  ['because', '-아/어서', 'Because / so / then', 'Connective', 'Add 서 to the 아/어 base. It can connect a cause to its result or two closely related actions.', '늦다', 'Be late', 'Because it is late …', 'adjective'],
  ['while', '-(으)면서', 'While doing', 'Connective', 'Use 면서 after a vowel or final ㄹ, and 으면서 after most other consonants. The two actions usually share a subject.', '먹다', 'Eat', 'While eating …'],
  ['presentModifier', '-는', 'Present verb noun modifier', 'Noun modifier', 'Place the modified predicate before its noun. Final ㄹ drops before 는.', '살다', 'Live', '… who lives …'],
  ['nModifier', '-(으)ㄴ', 'Past verb / adjective noun modifier', 'Noun modifier', 'For action verbs, usually completed action. For descriptive predicates, usually a current property.', '예쁘다', 'Pretty', 'Pretty (before a noun)', 'adjective'],
  ['futureModifier', '-(으)ㄹ', 'Future noun modifier', 'Noun modifier', 'Place the ㄹ/을 form before the noun to indicate a prospective action or description.', '먹다', 'Eat', '… to eat'],
  ['nominal', '-기', 'Action nominalization', 'Nominalizer', 'Attach 기 to make a predicate function like a noun.', '읽다', 'Read', 'Reading / the act of reading'],
] satisfies ConjugationSeed[]).map(ending)

const extraEndings = ([
  ['try', '-아/어 보다', 'Try doing', 'Auxiliary', 'Use an action verb’s 아/어 base before 봐요.', '먹다', 'Eat', 'Try eating'],
  ['plan', '-(으)려고 하다', 'Plan / intend to', 'Auxiliary', 'Attach 려고 after a vowel or final ㄹ, 으려고 after most other consonants, then add 해요.', '가다', 'Go', 'Plan to go'],
  ['before', '-기 전에', 'Before doing', 'Time connective', 'Nominalize with 기 and follow it with 전에.', '먹다', 'Eat', 'Before eating …'],
  ['after', '-(으)ㄴ 후에', 'After doing', 'Time connective', 'Use the completed-action modifier with 후에.', '가다', 'Go', 'After going …'],
  ['seems', '-(으)ㄹ 것 같다', 'Probably / seems likely', 'Auxiliary construction', 'Use the prospective modifier before 것 같아요.', '오다', 'Come', 'Will probably come'],
  ['background', '-는데 / -(으)ㄴ데', 'Background / contrast', 'Connective', 'Use 는데 for action verbs and forms ending in 있다/없다, and ㄴ데/은데 for most other adjectives.', '어렵다', 'Difficult', 'It is difficult, and/but …', 'adjective', 'b'],
] satisfies ConjugationSeed[]).map(ending)

export const particleRules = Object.fromEntries([...coreParticles, ...extraParticles].map(rule => [rule.id, rule]))
export const conjugationRules = Object.fromEntries([...coreEndings, ...extraEndings].map(rule => [rule.id, rule]))

/** Make a grammar deck using references to authored rules. */
function grammarList(category: Extract<Category, 'particles' | 'conjugations'>, number: number, name: string, rules: Rule[]): WordList {
  return { id: `${category}-${number}`, category, name: `List ${number} · ${name}`,
    entries: rules.map(rule => ({ id: rule.id, korean: rule.korean, english: rule.english, rule: rule.id })) }
}

export const grammarLists = [
  grammarList('particles', 1, '20 core particles', coreParticles),
  grammarList('particles', 2, 'Limits, choices & emphasis', extraParticles),
  grammarList('conjugations', 1, '20 core endings', coreEndings),
  grammarList('conjugations', 2, 'Sequence & intent', extraEndings),
]
