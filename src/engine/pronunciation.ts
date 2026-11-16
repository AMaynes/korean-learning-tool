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
const writtenFinalCount = isolatedFinals.length - 1

/** A visible symbol and the Hangul syllable to give to the Korean voice. */
export interface PronunciationCard {
  prompt: string
  sound: string
  silent?: boolean
}

export const letterCards: readonly PronunciationCard[] = [
  ...initials.map((prompt, index) => ({
    prompt, sound: composeHangul(index, carrierVowel, 0), silent: index === silentInitial,
  })),
  ...vowels.map((prompt, index) => ({ prompt, sound: composeHangul(silentInitial, index, 0) })),
]

export const batchimCardCount = initials.length * vowels.length * writtenFinalCount

/** Decode a zero-based index in the syllable deck and normalize its pronunciation for playback in isolation. */
export function batchimCard(index: number): PronunciationCard {
  const stem = Math.floor(index / writtenFinalCount)
  const initial = Math.floor(stem / vowels.length)
  const vowel = stem % vowels.length
  const ending = index % writtenFinalCount + 1
  const spokenVowel = vowel === uiVowel && initial !== silentInitial ? iVowel : vowel

  return {
    prompt: composeHangul(initial, vowel, ending),
    sound: composeHangul(initial, spokenVowel, isolatedFinals[ending]),
  }
}
