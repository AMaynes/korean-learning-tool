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
