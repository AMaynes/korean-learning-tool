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
import { generate, matchesAnswer, matchesEnglishAnswer, recallCard } from '../src/engine/exercises'
import { attach, batchim, conjugate } from '../src/engine/korean'
import { emptyDeck, finishRecall, markRecallFailure, nextRecall } from '../src/engine/mastery'
import { batchimCard, batchimCardCount, letterCards } from '../src/engine/pronunciation'
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

describe('pronunciation decks', () => {
  it('covers every modern consonant and vowel and uses a carrier for initials', () => {
    expect(new Set(letterCards.map(card => card.prompt)).size).toBe(40)
    expect(letterCards).toContainEqual({ prompt: 'ㄱ', sound: '그', silent: false })
    expect(letterCards).toContainEqual({ prompt: 'ㅇ', sound: '으', silent: true })
    expect(letterCards).toContainEqual({ prompt: 'ㅘ', sound: '와' })
  })

  it('includes every modern written batchim syllable exactly once', () => {
    const cards = Array.from({ length: batchimCardCount }, (_, index) => batchimCard(index))
    expect(new Set(cards.map(card => card.prompt)).size).toBe(10_773)
    expect(new Set(cards.map(card => batchim(card.prompt))).size).toBe(27)
    expect(new Set(cards.map(card => batchim(card.sound)))).toEqual(new Set([1, 4, 7, 8, 16, 17, 21]))
    const sounds = Object.fromEntries(cards.map(card => [card.prompt, card.sound]))
    expect(sounds).toMatchObject({
      값: '갑', 몫: '목', 닭: '닥', 삶: '삼', 넓: '널', 싫: '실', 갔: '갇', 흰: '힌',
    })
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

describe('mastery and persistence', () => {
  it('requires 2, 2, then 4 intervening cards before mastery', () => {
    let deck = emptyDeck
    const ids = ['a', 'b']
    let last: string | undefined
    for (let turn = 0; turn < 40 && deck.entries.a?.streak !== 4; turn++) {
      const next = nextRecall(ids, deck, last)!
      deck = finishRecall(deck, next.id, false, next.review, ids.length)
      last = next.id
    }
    const clean = deck.entries.a.history.filter(entry => entry.outcome === 'clean').map(entry => entry.at)
    expect(clean).toHaveLength(4)
    expect(clean[1] - clean[0]).toBeGreaterThanOrEqual(3)
    expect(clean[2] - clean[1]).toBeGreaterThanOrEqual(3)
    expect(clean[3] - clean[2]).toBeGreaterThanOrEqual(5)
    expect(deck.entries.a.streak).toBe(4)
  })

  it('requires correction and keeps reveal failures scoped to their own list', () => {
    const deck = finishRecall(emptyDeck, 'a', false, false, 3)
    const failed = markRecallFailure(deck, 'a')
    const corrected = finishRecall(failed, 'a', true, false, 3)
    expect(corrected.entries.a).toMatchObject({ streak: 0, failures: 1 })
    const state = { ...defaults(), selected: { ...defaultSelection, nouns: 'nouns-3' }, recall: { 'nouns-1': corrected } }
    const restored = importBackup(JSON.parse(JSON.stringify({ kind: 'korean-study-backup', state })))
    expect(restored.selected.nouns).toBe('nouns-3')
    expect(restored.recall['nouns-1'].entries.a.failures).toBe(1)
  })

  it('does not invent intervening cards in a single-entry deck', () => {
    const first = finishRecall(emptyDeck, 'a', false, false, 1)
    expect(nextRecall(['a'], first, 'a')).toEqual({ id: 'a', review: true })
    expect(finishRecall(first, 'a', false, true, 1).clock).toBe(first.clock)
    expect(nextRecall([], first)).toBeNull()
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
      recall: { 'nouns-1': finishRecall(emptyDeck, 'person', false, false, 10) },
    }
    const restored = importBackup({ kind: 'korean-study-backup', state })
    expect(restored).not.toHaveProperty('customLists')
    expect(restored).not.toHaveProperty('difficulty')
    expect(restored.selected).toMatchObject({ nouns: 'nouns-3', verbs: 'verbs-1' })
    expect(restored.recall['nouns-1'].entries.person.streak).toBe(1)
    expect(restored).not.toHaveProperty('theme')
    expect(activeLists({ nouns: 'nouns-1' }).nouns.entries[0].korean).toBe('사람')
  })

  it('tracks mode scores and rejects invalid backups', () => {
    let state = defaults()
    for (let i = 0; i < 3; i++) state = addScore(state, 'assembly', 'frame-1', true)
    expect(state.scores.assembly?.['frame-1']).toMatchObject({ mastered: true, attempts: 3 })
    expect(state.scores.writing).toBeUndefined()
    expect(() => importBackup({ kind: 'korean-study-backup', state: { ...state, version: 2 } })).toThrow()
  })
})
