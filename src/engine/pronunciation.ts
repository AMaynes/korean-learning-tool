/**
 * Overview & Purpose: Generate letter and final-consonant pronunciation cards.
 *
 * Architectural Relationships: The pronunciation view draws cards from the Unicode Hangul ranges.
 *
 * External Resources: Unicode Hangul composition and NIKL standard pronunciation rules.
 *
 * Notes: Cards teach syllables in isolation. Sounds may change when syllables connect.
 */


import { composeHangul } from './korean'

const initials = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ']
const vowels = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ']
const silentInitial = initials.indexOf('ㅇ')
const carrierVowel = vowels.indexOf('ㅡ')
const uiVowel = vowels.indexOf('ㅢ')
const iVowel = vowels.indexOf('ㅣ')

// Unicode trailing order, mapped to the seven representative final sounds.
const isolatedFinals = [
  0, 1, 1, 1, 4, 4, 4, 7, 8, 1, 16, 8, 8, 8, 17, 8, 16, 17, 17, 7, 7, 21, 7, 7, 1, 7, 17, 7,
]
const finalCount = isolatedFinals.length

/** A visible symbol and the Hangul syllable to give to the Korean voice. */
export interface PronunciationCard {
  prompt: string
  sound: string
  silent?: boolean
}

const consonantCards = initials.map((prompt, index) => ({
  prompt, sound: composeHangul(index, carrierVowel, 0), silent: index === silentInitial,
}))
const vowelCards = vowels.map((prompt, index) => ({ prompt, sound: composeHangul(silentInitial, index, 0) }))



// Revised Romanization for the modern letters. Some consonants have a different spelling at the end.
const consonantRomanization: Readonly<Record<string, string>> = {
  ㄱ: 'g / k', ㄲ: 'kk', ㄴ: 'n', ㄷ: 'd / t', ㄸ: 'tt', ㄹ: 'r / l', ㅁ: 'm',
  ㅂ: 'b / p', ㅃ: 'pp', ㅅ: 's', ㅆ: 'ss', ㅇ: 'silent / ng', ㅈ: 'j', ㅉ: 'jj',
  ㅊ: 'ch', ㅋ: 'k', ㅌ: 't', ㅍ: 'p', ㅎ: 'h',
}
const vowelRomanization: Readonly<Record<string, string>> = {
  ㅏ: 'a', ㅐ: 'ae', ㅑ: 'ya', ㅒ: 'yae', ㅓ: 'eo', ㅔ: 'e', ㅕ: 'yeo',
  ㅖ: 'ye', ㅗ: 'o', ㅘ: 'wa', ㅙ: 'wae', ㅚ: 'oe', ㅛ: 'yo', ㅜ: 'u',
  ㅝ: 'wo', ㅞ: 'we', ㅟ: 'wi', ㅠ: 'yu', ㅡ: 'eu', ㅢ: 'ui', ㅣ: 'i',
}

/** The chart plays final ㅇ in 응 so learners can hear its ng sound. */
export const hangulAlphabet = {
  vowels: vowelCards.map(card => ({ ...card, romanization: vowelRomanization[card.prompt] })),
  consonants: consonantCards.map(({ prompt, sound, silent }) => ({
    prompt, sound: silent ? '응' : sound, silent, romanization: consonantRomanization[prompt],
  })),
}

export const syllableCardCount = initials.length * vowels.length * finalCount

/** Decode a zero-based index in the syllable deck and normalize its pronunciation for playback in isolation. */
export function syllableCard(index: number): PronunciationCard {
  const stem = Math.floor(index / finalCount)
  const initial = Math.floor(stem / vowels.length)
  const vowel = stem % vowels.length
  const ending = index % finalCount
  const spokenVowel = vowel === uiVowel && initial !== silentInitial ? iVowel : vowel

  return {
    prompt: composeHangul(initial, vowel, ending),
    sound: composeHangul(initial, spokenVowel, isolatedFinals[ending]),
  }
}
