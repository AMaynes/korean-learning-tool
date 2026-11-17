/**
 * Overview & Purpose: Generate scoped practice prompts and evaluate documented alternatives.
 *
 * Architectural Relationships: Practice views pass active list snapshots from the registry.
 *
 * External Resources: Authored grammar rules, tagged vocabulary, and fixed teaching frames.
 *
 * Notes: Generated sentence components always come from selected decks.
 */


import type { Category, Entry, Transformation, WordList } from '../data/model'
import type { PracticeMode } from './storage'
import { attach, conjugate } from './korean'
import { entryRule } from './registry'

type Active = Record<Category, WordList>
type HostCategory = 'nouns' | 'pronouns' | 'both'
type PredicateCategory = 'verbs' | 'adjectives' | 'both'

/** A rendered exercise with exact examples, accepted alternatives, and a target for progress. */
export interface Exercise {
  id: string
  target: string
  prompt: string
  cue: string
  answer: string
  alternatives?: string[]
  explanation: string
  transformation?: Transformation
  tokens?: string[]
  audio?: string
  translation?: string
  responses?: string[]
}

/** Normalize NFC, terminal punctuation, and repeated spaces while preserving word boundaries. */
export function normalizedAnswer(text: string) {
  return text.normalize('NFC').trim().replace(/\s+/gu, ' ').replace(/[.?!…。！？]+$/u, '').trim()
}

/** Match documented alternatives while leaving unseen sentence variants available for self-review. */
export function matchesAnswer(answer: string, accepted: string[]) {
  const normalized = normalizedAnswer(answer)
  return normalized.length > 0 && accepted.some(option => normalized === normalizedAnswer(option))
}

export type RecallDirection = 'en-to-ko' | 'ko-to-en'

/** Accept the listed English alternatives with optional usage labels and “to”. */
export function matchesEnglishAnswer(input: string, accepted: string[]) {
  const simplify = (text: string) => normalizedAnswer(text.replace(/\([^)]*\)/gu, '').replace(/[‘’]/gu, "'").replace(/·/gu, ' '))
    .toLowerCase().replace(/^to\s+/u, '')
  const answer = simplify(input)
  return Boolean(answer) && accepted.some(option => simplify(option) === answer)
}

/** Convert one vocabulary entry into a retrieval prompt in the chosen direction. */
export function recallCard(category: Category, entry: Entry, direction: RecallDirection = 'en-to-ko'): Exercise {
  const rule = entryRule(category, entry)
  const transformation = rule?.examples[0]
  if (direction === 'ko-to-en') {
    return {
      id: entry.id, target: entry.id, prompt: transformation?.result ?? entry.korean, cue: 'Korean prompt',
      answer: transformation?.meaning ?? entry.english, explanation: rule?.note ?? [entry.note, entry.example].filter(Boolean).join(' · '),
      alternatives: transformation ? undefined : entry.english.replace(/\([^)]*\)/gu, '').split(/\s+\/\s+/u),
      transformation,
    }
  }
  if (rule && transformation) {
    return {
      id: entry.id, target: entry.id, prompt: transformation.original, cue: rule.english,
      answer: transformation.result, explanation: rule.note, transformation,
    }
  }
  return {
    id: entry.id, target: entry.id, prompt: entry.english, cue: 'Write or recall in Hangul',
    answer: entry.korean, alternatives: entry.alternatives, explanation: [entry.note, entry.example].filter(Boolean).join(' · '),
  }
}

/** Resolve all practice modes from the exact scope of active deck IDs. */
export function generate(mode: PracticeMode, active: Active, scope: HostCategory | PredicateCategory = 'both'): Exercise[] {
  switch (mode) {
    case 'particles': return particleExercises(active, scope === 'nouns' || scope === 'pronouns' ? scope : 'both')
    case 'conjugations': return conjugationExercises(active, scope === 'verbs' || scope === 'adjectives' ? scope : 'both')
    case 'assembly': case 'writing': return sentenceExercises(active)
    case 'conversation': return sentenceExercises(active).filter(exercise => exercise.audio).map(exercise => ({
      ...exercise, prompt: exercise.audio!, cue: 'Reply in Korean', translation: exercise.translation,
      explanation: `A polite statement can become a question with rising intonation. ${exercise.explanation}`,
    }))
    case 'dictation': return [
      ...sentenceExercises(active).map(exercise => ({ ...exercise, audio: exercise.answer, translation: exercise.prompt })),
      ...active.sentences.entries.map(entry => ({
        id: `dictation:${active.sentences.id}:${entry.id}`, target: `${active.sentences.id}:${entry.id}`,
        prompt: entry.english, cue: 'Listen and type', answer: entry.korean, explanation: entry.note ?? 'This phrase comes from your active Common Sentences list.',
        alternatives: entry.alternatives, audio: entry.korean, translation: entry.english,
      })),
    ]
  }
}

export const toEnglishTargetPrefix = 'ko-to-en:'

/** Use the Korean model or spoken prompt to practice its meaning in English. */
export function toEnglishPractice(mode: PracticeMode, exercise: Exercise): Exercise {
  const transformation = exercise.transformation
  const answer = transformation ? exercise.cue :
    mode === 'conversation' ? exercise.translation ?? exercise.prompt : exercise.prompt
  const cue = mode === 'particles' ? 'Explain the particle in English' :
    mode === 'conjugations' ? 'Explain what the ending expresses' : 'Recall the English meaning'
  return {
    ...exercise,
    target: toEnglishTargetPrefix + exercise.target,
    prompt: mode === 'conversation' ? exercise.prompt : exercise.answer,
    cue, answer,
    alternatives: transformation ? answer.split(/\s+\/\s+/u) : undefined,
    tokens: mode === 'assembly' ? normalizedAnswer(answer).split(/\s+/u) : undefined,
  }
}

/** Expand particle rules over eligible active host words, including both batchim environments. */
function particleExercises(active: Active, scope: HostCategory): Exercise[] {
  const lists = scope === 'both' ? [active.nouns, active.pronouns] : [active[scope]]
  return active.particles.entries.flatMap(ruleEntry => {
    const rule = entryRule('particles', ruleEntry)
    if (!rule) return []
    return lists.flatMap(list => list.entries.flatMap(word => {
      const tags = word.tags ?? []
      if (rule.nounTag && !tags.includes(rule.nounTag)) return []
      if (['honorificRecipient', 'honorificSubject'].includes(rule.id) && !/(님|분)$/.test(word.korean)) return []
      if (rule.id === 'approx' && !tags.some(tag => tag === 'place' || tag === 'time')) return []
      if (rule.id === 'each' && ['나', '너', '저', '우리', '저희', '이것', '그것', '저것', '누구', '무엇'].includes(word.korean)) return []
      const form = attach(word.korean, rule.id)
      if (!form) return []
      return [{
        id: `${active.particles.id}:${ruleEntry.id}:${list.id}:${word.id}`,
        target: `${active.particles.id}:${ruleEntry.id}`, prompt: word.korean, cue: rule.english, answer: form.result,
        explanation: rule.note, transformation: { original: word.korean, originalMeaning: word.english, ...form, meaning: `${word.english} · ${rule.english}` },
      }]
    }))
  })
}

/** Generate supported word/rule pairs and preserve the requested grammatical meaning. */
function conjugationExercises(active: Active, scope: PredicateCategory): Exercise[] {
  const lists = scope === 'both' ? [active.verbs, active.adjectives] : [active[scope]]
  return active.conjugations.entries.flatMap(ruleEntry => {
    const rule = entryRule('conjugations', ruleEntry)
    if (!rule) return []
    return lists.flatMap(list => list.entries.flatMap(word => {
      const result = conjugate(word, list.category === 'verbs' ? 'verb' : 'adjective', rule.id)
      if (!result) return []
      return [{
        id: `${active.conjugations.id}:${ruleEntry.id}:${list.id}:${word.id}`,
        target: `${active.conjugations.id}:${ruleEntry.id}`, prompt: word.korean, cue: rule.english, answer: result,
        explanation: rule.note, transformation: {
          original: word.korean, originalMeaning: word.english, stem: word.korean.slice(0, -1),
          applied: rule.korean, result, meaning: `${word.english} · ${rule.english}`,
        },
      }]
    }))
  })
}

const actionPhrases: Record<string, [string, (noun: Entry) => string, 'object' | 'destination']> = {
  먹다: ['food', noun => `eat ${gloss(noun)}`, 'object'],
  마시다: ['drink', noun => `drink ${gloss(noun)}`, 'object'],
  읽다: ['reading', noun => `read the ${gloss(noun)}`, 'object'],
  보다: ['seen', noun => `see the ${gloss(noun)}`, 'object'],
  돕다: ['person', noun => `help the ${gloss(noun)}`, 'object'],
  사다: ['thing', noun => `buy the ${gloss(noun)}`, 'object'],
  고르다: ['thing', noun => `choose the ${gloss(noun)}`, 'object'],
  찾다: ['seen', noun => `look for the ${gloss(noun)}`, 'object'],
  기다리다: ['person', noun => `wait for the ${gloss(noun)}`, 'object'],
  타다: ['ride', noun => `take the ${gloss(noun)}`, 'object'],
  가다: ['place', noun => `go to ${destinationGloss(noun)}`, 'destination'],
  오다: ['place', noun => `come to ${destinationGloss(noun)}`, 'destination'],
  도착하다: ['place', noun => `arrive at ${destinationGloss(noun)}`, 'destination'],
}
const simpleActions: Record<string, string> = {
  자다: 'sleep', 일하다: 'work', 운동하다: 'exercise', 걷다: 'walk', 일어나다: 'get up',
  말하다: 'speak', 떠나다: 'leave', 쓰다: 'write', 배우다: 'learn',
}

function gloss(word: Entry) { return word.english.split(' / ')[0].replace(/\s+\(.*\)$/, '').toLowerCase() }
function destinationGloss(word: Entry) {
  if (['한국', '서울'].includes(word.korean)) return word.english
  if (['집', '학교'].includes(word.korean)) return word.korean === '집' ? 'my home' : 'school'
  return 'the ' + gloss(word)
}
function sentenceCase(value: string) { return value.charAt(0).toUpperCase() + value.slice(1) }

/** Instantiate tagged action, existence, and descriptive frames for compatible active decks. */
function sentenceExercises(active: Active): Exercise[] {
  const hasParticle = (id: string) => active.particles.entries.some(entry => entry.rule === id)
  if (!active.conjugations.entries.some(entry => entry.rule === 'present')) return []
  const scope = [active.nouns, active.pronouns, active.verbs, active.adjectives, active.particles, active.conjugations].map(list => list.id).join(':')
  const first = active.pronouns.entries.find(entry => entry.korean === '저') ??
    active.pronouns.entries.find(entry => entry.tags?.includes('first'))
  const topic = first && hasParticle('topic') ? attach(first.korean, 'topic')?.result : undefined
  const subject = first && hasParticle('subject') ? attach(first.korean, 'subject')?.result : undefined
  const actions: Exercise[] = []
  const descriptions: Exercise[] = []

  /** Register an action frame with a topic and subject alternative when those rules are enabled. */
  function addAction(id: string, body: string[], gloss: string, explanation: string) {
    const core = body.join(' ')
    const tokens = [topic ?? subject, ...body].filter((token): token is string => Boolean(token))
    const answer = tokens.join(' ')
    actions.push({
      id: `${scope}:action:${id}`, target: `${scope}:action:${id}`, prompt: `I ${gloss}.`, cue: 'Build a polite statement',
      answer, alternatives: [core, ...(subject ? [`${subject} ${core}`] : []), ...(topic ? [`${topic} ${core}`] : [])],
      tokens, explanation: `${explanation} The polite predicate comes last. The speaker can be left implicit when clear.`,
      audio: `${core}?`, translation: `Do you ${gloss}?`, responses: [core, answer],
    })
  }

  for (const verb of active.verbs.entries) {
    const predicate = conjugate(verb, 'verb', 'present')
    if (!predicate) continue
    const frame = actionPhrases[verb.korean]
    if (frame && hasParticle(frame[2])) {
      const [tag, english, particle] = frame
      for (const noun of active.nouns.entries.filter(entry => entry.tags?.includes(tag))) {
        if (noun.korean === '집' && particle === 'destination' && verb.korean !== '도착하다') {
          const place = attach(noun.korean, particle)
          if (place) addAction(`${verb.id}:${noun.id}`, [place.result, predicate], verb.korean === '가다' ? 'go home' : 'come home', '에 marks the destination.')
          continue
        }
        const host = attach(noun.korean, particle)
        if (host) addAction(`${verb.id}:${noun.id}`, [host.result, predicate], english(noun), particle === 'object' ? '을/를 marks the direct object.' : '에 marks the destination.')
      }
    }
    if (simpleActions[verb.korean]) addAction(verb.id, [predicate], simpleActions[verb.korean], 'This action can be expressed without a direct object.')
    if (hasParticle('subject') && ['있다', '없다'].includes(verb.korean)) {
      for (const noun of active.nouns.entries.filter(entry => entry.tags?.includes('food') || entry.tags?.includes('drink'))) {
        const host = attach(noun.korean, 'subject')
        if (!host) continue
        const tokens = [host.result, predicate]
        const answer = tokens.join(' ')
        const key = `${scope}:exist:${verb.id}:${noun.id}`
        descriptions.push({
          id: key, target: key, prompt: `There is ${verb.korean === '없다' ? 'no ' : 'some '}${gloss(noun)}.`,
          cue: 'Express presence or absence', answer, tokens, explanation: '이/가 marks what exists or is missing. 있어요 and 없어요 express presence and absence.',
        })
      }
    }
  }

  if (hasParticle('subject') || hasParticle('topic')) {
    for (const adjective of active.adjectives.entries) {
      const predicate = conjugate(adjective, 'adjective', 'present')
      if (!predicate) continue
      const nouns = active.nouns.entries.filter(noun => adjective.tags?.some(tag => noun.tags?.includes(tag)))
      for (const noun of nouns) {
        const markedSubject = hasParticle('subject') ? attach(noun.korean, 'subject')?.result : undefined
        const markedTopic = hasParticle('topic') ? attach(noun.korean, 'topic')?.result : undefined
        if (!markedSubject && !markedTopic) continue
        const tokens = [markedSubject ?? markedTopic!, predicate]
        const answer = tokens.join(' ')
        const id = `${scope}:describe:${adjective.id}:${noun.id}`
        const subjectGloss = ['한국', '서울'].includes(noun.korean) ? noun.english : `the ${gloss(noun)}`
        const quality = adjective.korean === '많다' ? 'plentiful' : adjective.korean === '적다' ? 'scarce' : gloss(adjective)
        descriptions.push({
          id, target: id, prompt: `${sentenceCase(subjectGloss)} is ${quality}.`, cue: 'Describe the subject', answer,
          alternatives: [`${markedTopic ?? markedSubject} ${predicate}`, predicate], tokens,
          explanation: 'The descriptive predicate carries the polite ending by itself. 이/가 marks the subject and 은/는 can set the topic.',
          audio: `${answer}?`, translation: `Is ${subjectGloss} ${quality}?`, responses: [predicate, answer],
        })
      }
    }
  }
  return [...actions, ...descriptions].filter(exercise => (exercise.tokens?.length ?? 0) > 1)
}

/** Shuffle independently so advancing and sentence assembly can use random order safely. */
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const index = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[index]] = [shuffled[index], shuffled[i]]
  }
  return shuffled
}
