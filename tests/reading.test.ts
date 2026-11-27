import { describe, expect, it } from 'vitest'
import { readingBreakdowns, readingToken } from '../src/engine/readingGrammar'
import { passageByText, readingAudioPrompts, reviewedLines } from '../src/engine/readingPassages'

describe('reading review', () => {
  it('provides aligned word glosses, grammar and audio for every reviewed line', () => {
    for (const line of reviewedLines) {
      const words = line.korean.split(' ')
      expect(line.glosses, line.korean).toHaveLength(words.length)
      expect(line.glosses.every(Boolean)).toBe(true)
      expect(line.english).toBeTruthy()
      expect(readingAudioPrompts.has(line.korean)).toBe(true)
      for (const word of words) {
        expect(readingBreakdowns(word, true), word).toHaveLength(1)
        expect(readingAudioPrompts.has(readingToken(word))).toBe(true)
      }
    }
  })
  it('uses the sense of the word in its sentence', () => {
    expect(passageByText.get('카페에서 차를 마셔요.')?.glosses[1]).toBe('tea')
    expect(passageByText.get('주차장에서 버스 정류장까지 걸어요.')?.glosses[0]).toBe('from the parking lot')
    expect(passageByText.get('정류장에서 버스를 기다려요.')?.glosses[0]).toBe('at the stop')
    expect(readingBreakdowns('물을', true).map(x => x.base)).toEqual(['물'])
    expect(readingBreakdowns('물을').map(x => x.base)).toContain('묻다')
  })
  it('shows contractions, irregular endings and stacked particles without guessing unknown stems', () => {
    for (const [word, base, parts] of [
      ['“마셨어요.”', '마시다', ['-었어요']], ['걸었어요', '걷다', ['-었어요']],
      ['골라요', '고르다', ['-아요']], ['주에도', '주', ['에', '도']], ['제가', '저', ['가']],
      ['학교예요', '학교', ['예요']], ['사과', '사과', []],
    ] as const) {
      const match = readingBreakdowns(word).find(item => item.base === base)
      expect(match?.parts.map(part => part.form), word).toEqual(parts)
    }
    expect(readingBreakdowns('까치')).toEqual([])
  })
})
