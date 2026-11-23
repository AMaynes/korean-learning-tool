/**
 * Overview & Purpose: Verify the vocabulary, morphology, scheduling, and backup contracts.
 *
 * Architectural Relationships: Tests the pure engine functions used by the UI.
 *
 * External Resources: Vitest.
 *
 * Notes: Test cases are deterministic and share no browser state.
 */


import { describe, expect, it } from 'vitest'
import { conjugationRules, particleRules } from '../src/data/grammar'
import type { WordClass } from '../src/data/model'
import { generate, matchesAnswer, matchesEnglishAnswer, recallCard, toEnglishPractice } from '../src/engine/exercises'
import { attach, batchim, conjugate } from '../src/engine/korean'
import { emptyDeck, recordRecall, nextRecall } from '../src/engine/mastery'
import { hangulAlphabet } from '../src/engine/pronunciation'
import { activeLists, builtInLists, defaultSelection, entryRule } from '../src/engine/registry'
import { addScore, defaults, importBackup } from '../src/engine/storage'

describe('vocabulary registry', () => {
  it('loads distinct numbered lists and preserves explicit independent selections', () => {
    const active = activeLists({ ...defaultSelection, nouns: 'nouns-3', verbs: 'verbs-2', adjectives: 'adjectives-3' })
    expect(active.nouns.entries[0].korean).toBe('가족')
    expect(active.verbs.entries[0].korean).toBe('마시다')
    expect(active.adjectives.entries[0].korean).toBe('비싸다')
    expect(active.pronouns.id).toBe('pronouns-1')
    expect(active.particles.entries).toHaveLength(20)
    expect(active.conjugations.entries).toHaveLength(20)
  })

  it('combines all lists in the selected category and preserves that selection in a backup', () => {
    const active = activeLists({ ...defaultSelection, nouns: 'nouns-all', particles: 'particles-all' })
    for (const category of ['nouns', 'particles'] as const) {
      const entries = builtInLists.filter(list => list.category === category).flatMap(list => list.entries)
      expect(active[category]).toMatchObject({ id: category + '-all', name: 'All lists', entries })
    }
    const state = { ...defaults(), selected: { ...defaultSelection, nouns: 'nouns-all', particles: 'particles-all' } }
    expect(importBackup({ kind: 'korean-study-backup', state }).selected).toEqual(state.selected)
    const particles = generate('particles', active, 'nouns')
    expect(particles.some(item => item.prompt === '선생님')).toBe(true)
    expect(particles.some(item => item.target === 'particles-all:even')).toBe(true)
  })

  it('resolves invalid or cross-category selections to the bundled defaults', () => {
    const active = activeLists({ ...defaultSelection, nouns: 'custom-nouns', verbs: 'nouns-2', adjectives: 'adjectives-3' })
    expect(active.nouns.id).toBe('nouns-1')
    expect(active.verbs.id).toBe('verbs-1')
    expect(active.adjectives.id).toBe('adjectives-3')
  })

  it('provides a worked grammar example for every bundled pattern', () => {
    const grammarLists = builtInLists.filter(list => list.category === 'particles' || list.category === 'conjugations')
    for (const list of grammarLists) {
      for (const entry of list.entries) {
        expect(entryRule(list.category, entry)?.examples[0]).toEqual(expect.objectContaining({
          original: expect.any(String), result: expect.any(String),
        }))
      }
    }
  })
})

describe('recall direction', () => {
  it('reverses vocabulary while accepting the listed English meanings', () => {
    const deck = activeLists(defaultSelection).nouns
    const house = deck.entries.find(entry => entry.id === 'home')!
    expect(recallCard(deck.category, house)).toMatchObject({ prompt: 'House / Home', answer: '집' })
    const card = recallCard(deck.category, house, 'ko-to-en')
    expect(card).toMatchObject({ prompt: '집', answer: 'House / Home' })
    const answers = [card.answer, ...card.alternatives ?? []]
    expect(matchesEnglishAnswer('  home. ', answers)).toBe(true)
    expect(matchesEnglishAnswer('HOUSE', answers)).toBe(true)
    expect(matchesEnglishAnswer('Hotel', answers)).toBe(false)
  })

  it('uses the completed Korean example in reverse grammar recall', () => {
    const deck = activeLists(defaultSelection).conjugations
    const card = recallCard(deck.category, deck.entries[0], 'ko-to-en')
    expect(card).toMatchObject({ prompt: '먹어요', answer: 'Eat (polite)' })
    expect(matchesEnglishAnswer('to eat', [card.answer])).toBe(true)
    expect(card.transformation?.original).toBe('먹다')
  })
})

describe('practice in English', () => {
  it('uses the finished Korean form for particle and conjugation recognition', () => {
    const active = activeLists(defaultSelection)
    for (const mode of ['particles', 'conjugations'] as const) {
      const exercise = generate(mode, active)[0]
      expect(toEnglishPractice(mode, exercise)).toMatchObject({
        prompt: exercise.answer, answer: exercise.cue, target: 'ko-to-en:' + exercise.target,
        transformation: exercise.transformation,
      })
    }
  })

  it('reverses sentence, dictation, and conversation prompts without changing the audio', () => {
    const active = activeLists(defaultSelection)
    const writing = generate('writing', active)[0]
    const reversed = toEnglishPractice('writing', writing)
    expect(reversed).toMatchObject({ prompt: writing.answer, answer: writing.prompt })
    for (const mode of ['writing', 'dictation'] as const) {
      const exercise = generate(mode, active)[0]
      expect(toEnglishPractice(mode, exercise)).toMatchObject({
        prompt: exercise.answer, answer: exercise.prompt, audio: exercise.audio,
      })
    }
    const conversation = generate('conversation', active)[0]
    expect(toEnglishPractice('conversation', conversation)).toMatchObject({
      prompt: conversation.prompt, answer: conversation.translation, audio: conversation.audio,
    })
  })
})

describe('pronunciation decks', () => {
  it('covers every modern consonant and vowel and uses a carrier for initials', () => {
    const letterCards = [...hangulAlphabet.consonants, ...hangulAlphabet.vowels]
    expect(hangulAlphabet.consonants).toHaveLength(19)
    expect(hangulAlphabet.vowels).toHaveLength(21)
    expect(new Set(letterCards.map(card => card.prompt)).size).toBe(40)
    expect(letterCards).toContainEqual(expect.objectContaining({ prompt: 'ㄱ', sound: '그', silent: false }))
    expect(letterCards).toContainEqual(expect.objectContaining({ prompt: 'ㅇ', sound: '응', silent: true }))
    expect(letterCards).toContainEqual(expect.objectContaining({ prompt: 'ㅘ', sound: '와' }))
  })


})

describe('particles', () => {
  it.each([
    ['친구', 'subject', '친구가'], ['집', 'subject', '집이'], ['저', 'subject', '제가'],
    ['너', 'subject', '네가'], ['누구', 'subject', '누가'], ['학교', 'topic', '학교는'],
    ['밥', 'topic', '밥은'], ['친구', 'object', '친구를'], ['음식', 'object', '음식을'],
    ['서울', 'direction', '서울로'], ['집', 'direction', '집으로'], ['학교', 'direction', '학교로'],
    ['집', 'writtenWith', '집과'], ['친구', 'writtenWith', '친구와'],
    ['집', 'colloquialWith', '집이랑'], ['친구', 'colloquialWith', '친구랑'],
    ['선생님', 'honorificRecipient', '선생님께'],
  ])('%s with %s gives %s', (word, rule, answer) => expect(attach(word, rule)?.result).toBe(answer))

  it('has an applied example for every catalog rule', () => {
    expect(Object.values(particleRules).every(rule => rule.examples.every(example => example.applied && example.result))).toBe(true)
    expect(attach('123', 'subject')).toBeNull()
    expect(attach('친구', 'fake')).toBeNull()
  })
})

describe('conjugation', () => {
  it.each([
    ['먹다', 'present', '먹어요'], ['먹다', 'past', '먹었어요'], ['가다', 'past', '갔어요'],
    ['보다', 'present', '봐요'], ['쓰다', 'present', '써요'], ['배우다', 'present', '배워요'],
    ['쉬다', 'present', '쉬어요'], ['되다', 'present', '돼요'], ['하다', 'past', '했어요'],
    ['가다', 'future', '갈 거예요'], ['읽다', 'request', '읽으세요'], ['살다', 'request', '사세요'],
    ['먹다', 'request', '먹으세요'], ['살다', 'presentModifier', '사는'], ['살다', 'nModifier', '산'],
    ['받다', 'present', '받아요'], ['알다', 'if', '알면'], ['알다', 'formal', '압니다'],
    ['먹다', 'while', '먹으면서'], ['먹다', 'nominal', '먹기'], ['먹다', 'want', null],
    ['x', 'present', null],
  ])('%s with %s gives %s', (korean, rule, result) => {
    expect(conjugate({ id: 'example', korean, english: 'test' }, 'verb', rule)).toBe(result)
  })

  it.each([
    ['걷다', 'd', 'verb', 'present', '걸어요'], ['걷다', 'd', 'verb', 'future', '걸을 거예요'],
    ['듣다', 'd', 'verb', 'past', '들었어요'], ['짓다', 's', 'verb', 'present', '지어요'],
    ['짓다', 's', 'verb', 'nModifier', '지은'], ['고르다', 'reu', 'verb', 'past', '골랐어요'],
    ['빠르다', 'reu', 'adjective', 'present', '빨라요'], ['어렵다', 'b', 'adjective', 'present', '어려워요'],
    ['돕다', 'b', 'verb', 'present', '도와요'], ['쉽다', 'b', 'adjective', 'nModifier', '쉬운'],
    ['빨갛다', 'h', 'adjective', 'present', '빨개요'], ['하얗다', 'h', 'adjective', 'nModifier', '하얀'],
  ] as const)('%s applies its tagged %s irregular', (korean, irregular, wordClass: WordClass, rule, result) => {
    expect(conjugate({ id: 'example', korean, english: 'test', irregular }, wordClass, rule)).toBe(result)
  })

  it('skips inapplicable adjective and existence forms', () => {
    const pretty = { id: 'pretty', korean: '예쁘다', english: 'pretty' }
    expect(conjugate(pretty, 'adjective', 'ongoing')).toBeNull()
    expect(conjugate(pretty, 'adjective', 'presentModifier')).toBeNull()
    expect(conjugate(pretty, 'adjective', 'nModifier')).toBe('예쁜')
    expect(Object.values(conjugationRules).every(rule => rule.examples.every(example => Boolean(example.result)))).toBe(true)
  })
})

describe('dynamic exercises', () => {
  const active = activeLists({ ...defaultSelection, nouns: 'nouns-2', verbs: 'verbs-2' })
  it('fills sentence slots from actual active decks', () => {
    const writing = generate('writing', active)
    expect(writing.some(item => item.answer === '저는 커피를 마셔요')).toBe(true)
    expect(writing.some(item => item.answer.includes('친구') || item.answer.includes('먹어요'))).toBe(false)
    expect(generate('particles', active, 'nouns').every(item => active.nouns.entries.some(entry => entry.korean === item.prompt))).toBe(true)
    expect(generate('conjugations', active, 'verbs').every(item => active.verbs.entries.some(entry => entry.korean === item.prompt))).toBe(true)
  })

  it('drops inactive grammar and exposes honest fallbacks', () => {
    expect(generate('writing', { ...active, conjugations: { ...active.conjugations, entries: [] } })).toEqual([])
    expect(generate('dictation', { ...active, nouns: { ...active.nouns, entries: [] } }).some(item => item.answer === '감사합니다.')).toBe(true)
    expect(generate('conversation', active).every(item => item.audio && item.responses?.length)).toBe(true)
  })

  it('offers explicit topic, subject, and omitted-speaker alternatives', () => {
    const item = generate('writing', active).find(item => item.answer === '저는 커피를 마셔요')!
    expect(matchesAnswer('제가 커피를 마셔요.', item.alternatives!)).toBe(true)
    expect(matchesAnswer('커피를   마셔요!', item.alternatives!)).toBe(true)
    expect(matchesAnswer('커피 를 마셔요', item.alternatives!)).toBe(false)
    expect(matchesAnswer('커피를 마셔요'.normalize('NFD'), item.alternatives!)).toBe(true)
  })
})

describe('adaptive recall and persistence', () => {
  it('opens one new word per distinct clean recall and keeps learned words unlocked', () => {
    const ids = ['a', 'b', 'c']
    let deck = recordRecall(emptyDeck, 'a', false)
    expect(nextRecall(ids, deck, 'a')).toBe('a')
    deck = recordRecall(deck, 'a', true)
    expect(nextRecall(ids, deck, 'a')).toBe('b')
    deck = recordRecall(deck, 'b', false)
    expect(nextRecall(ids, deck, 'b')).toBe('a')
    deck = recordRecall(deck, 'a', true)
    expect(nextRecall(ids, deck, 'a')).toBe('b')
    deck = recordRecall(deck, 'b', true)
    for (let i = 0; i < 101; i++) deck = recordRecall(deck, 'a', false)
    expect(nextRecall(ids, deck)).toBe('c')
  })

  it('favors recent misses, reduces correct cards, and avoids immediate repeats', () => {
    let deck = recordRecall(emptyDeck, 'c', true)
    deck = recordRecall(deck, 'a', true)
    deck = recordRecall(recordRecall(deck, 'a', false), 'b', true)
    const ids = ['a', 'b', 'c']
    const draws = Array.from({ length: 100 }, (_, i) => nextRecall(ids, deck, undefined, () => i / 100))
    const count = (id: string) => draws.filter(card => card === id).length
    expect(count('a')).toBeGreaterThan(count('c'))
    expect(count('c')).toBeGreaterThan(count('b'))
    expect(nextRecall(ids, deck, 'a', () => 0)).toBe('b')
    expect(nextRecall(['a'], deck, 'a')).toBe('a')
    expect(nextRecall([], deck)).toBeNull()
  })

  it('restores legacy progress while discarding retired settings and custom lists', () => {
    const state = {
      ...defaults(),
      theme: 'light',
      difficulty: { writing: 'challenge' },
      customLists: [
        { id: 'nouns-1', category: 'nouns', name: 'Edited nouns', entries: [] },
        { id: 'custom-verbs', category: 'verbs', name: 'Custom verbs', entries: [] },
      ],
      selected: { ...defaultSelection, nouns: 'nouns-3', verbs: 'custom-verbs' },
      recall: { 'nouns-1': { clock: 1, entries: { person: { streak: 1, failures: 0, due: 3, history: [{ at: 0, outcome: 'clean' }] } } } },
    }
    const restored = importBackup({ kind: 'korean-study-backup', state })
    expect(restored).not.toHaveProperty('customLists')
    expect(restored).not.toHaveProperty('difficulty')
    expect(restored.selected).toMatchObject({ nouns: 'nouns-3', verbs: 'verbs-1' })
    expect(restored.recall['nouns-1'].entries.person.history[0].outcome).toBe('clean')
    expect(restored).not.toHaveProperty('theme')
    expect(activeLists({ nouns: 'nouns-1' }).nouns.entries[0].korean).toBe('사람')
  })

  it('tracks mode scores and rejects invalid backups', () => {
    let state = defaults()
    for (let i = 0; i < 3; i++) state = addScore(state, 'writing', 'frame-1', true)
    expect(state.scores.writing?.['frame-1']).toMatchObject({ mastered: true, attempts: 3 })
    expect(state.scores.decoding).toBeUndefined()
    expect(() => importBackup({ kind: 'korean-study-backup', state: { ...state, version: 2 } })).toThrow()
  })
})
