/**
 * Overview & Purpose: Apply Hangul-aware particles and a bounded set of predicate endings.
 *
 * Architectural Relationships: Called by the curriculum catalog and exercise generator.
 *
 * External Resources: Unicode Hangul syllable composition: U+AC00–U+D7A3.
 *
 * Notes: Lexical irregulars are tagged per entry. Unsupported combinations return null.
 */


import type { Entry, WordClass } from '../data/model'

const HANGUL = 0xac00
const lastJa = 28
const vowelCount = 21
const final = { none: 0, n: 4, d: 7, r: 8, b: 17, s: 19, ss: 20, h: 27 }

const contractions: Record<number, number> = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7,
  8: 9, 9: 9, 10: 10, 11: 10, 12: 12, 13: 14, 14: 14, 15: 15,
  20: 6,
}

/** Decode the final Hangul block for batchim and vowel analysis. */
function split(word: string) {
  const offset = (word.charCodeAt(word.length - 1) || 0) - HANGUL
  if (offset < 0 || offset >= 11172) return null
  return { head: word.slice(0, -1), initial: Math.floor(offset / (lastJa * vowelCount)), vowel: Math.floor(offset / lastJa) % vowelCount, final: offset % lastJa }
}

/** Compose a modern Hangul block from Unicode leading, vowel, and trailing indices. */
export function composeHangul(initial: number, vowel: number, ending: number) {
  return String.fromCharCode(HANGUL + (initial * vowelCount + vowel) * lastJa + ending)
}

/** Recompose a Hangul block without changing earlier syllables. */
function block(parts: NonNullable<ReturnType<typeof split>>, vowel = parts.vowel, batchim = parts.final) {
  return parts.head + composeHangul(parts.initial, vowel, batchim)
}

/** Return the Unicode jongseong index, or null for a non-Hangul ending. */
export function batchim(word: string) {
  return split(word.normalize('NFC').trim())?.final ?? null
}

/** Attach a selected grammar rule, including pronoun contractions and the ㄹ exception. */
export function attach(word: string, rule: string): { applied: string; result: string } | null {
  word = word.normalize('NFC').trim()
  const ending = batchim(word)
  if (ending === null) return null
  const paired: Record<string, [string, string]> = {
    topic: ['은', '는'], subject: ['이', '가'], object: ['을', '를'], direction: ['으로', '로'],
    colloquialWith: ['이랑', '랑'], writtenWith: ['과', '와'], choice: ['이나', '나'],
    onlyNegative: ['밖에', '밖에'], asRole: ['으로서', '로서'], asMeans: ['으로써', '로써'],
  }
  const fixed: Record<string, string> = {
    possession: '의', also: '도', only: '만', destination: '에', actionPlace: '에서',
    start: '부터', until: '까지', recipient: '에게', colloquialRecipient: '한테', honorificRecipient: '께',
    with: '하고', comparison: '보다', like: '처럼', each: '마다',
    fromPerson: '한테서', even: '조차', evenUnexpected: '마저', approx: '쯤',
    quote: '라고', honorificSubject: '께서', allInGroup: '끼리',
  }
  const direction = ['direction', 'asRole', 'asMeans'].includes(rule)
  const pairedIndex = ending === 0 || (direction && ending === final.r) ? 1 : 0
  const applied = paired[rule]?.[pairedIndex] ?? fixed[rule]
  if (!applied) return null
  const pronouns: Record<string, string> = { 나: '내', 저: '제', 너: '네', 누구: '누' }
  const base = rule === 'subject' ? pronouns[word] ?? word : word
  return { applied, result: base + applied }
}

/** Build the vowel-ending base used by present, past, obligation, and causal forms. */
function informal(stem: string, irregular?: Entry['irregular']): string {
  const end = split(stem)!
  const previous = split(end.head)
  if (stem.endsWith('하')) return end.head + '해'
  if (stem === '푸') return '퍼'
  if (stem === '뵈') return '봬'
  if (irregular === 'reu' && stem.endsWith('르') && previous?.final === 0) {
    return block(previous, previous.vowel, final.r) + ([0, 8].includes(previous.vowel) ? '라' : '러')
  }
  if (irregular === 'h' && end.final === final.h) return block(end, [2, 6].includes(end.vowel) ? 3 : 1, 0)
  if (irregular === 'b' && end.final === final.b) {
    return block(end, end.vowel, 0) + (['돕', '곱'].includes(stem) ? '와' : '워')
  }
  const bright = [0, 8].includes(end.vowel)
  if (end.final === final.d && irregular === 'd') return block(end, end.vowel, final.r) + (bright ? '아' : '어')
  if (end.final === final.s && irregular === 's') return block(end, end.vowel, 0) + (bright ? '아' : '어')
  if (end.final) return stem + (bright ? '아' : '어')
  if (end.vowel === 18) return block(end, previous && [0, 8].includes(previous.vowel) ? 0 : 4, 0)
  if (stem === '이') return stem + '어'
  const contracted = contractions[end.vowel]
  return contracted === undefined ? stem + (bright ? '아' : '어') : block(end, contracted, 0)
}

/** Prepare the stem before an ending with 으, covering tagged consonant changes. */
function euBase(stem: string, irregular?: Entry['irregular']) {
  const end = split(stem)!
  if (irregular === 'b' && end.final === final.b) return { base: block(end, end.vowel, 0) + '우', eu: false }
  if (irregular === 'd' && end.final === final.d) return { base: block(end, end.vowel, final.r), eu: true }
  if (irregular === 's' && end.final === final.s) return { base: block(end, end.vowel, 0), eu: true }
  if (irregular === 'h' && end.final === final.h) return { base: block(end, end.vowel, 0), eu: false }
  return { base: stem, eu: end.final !== 0 && end.final !== final.r }
}

/** Form a ㄴ/ㄹ suffix as a batchim where possible, otherwise add 은/을. */
function modifier(stem: string, type: 'n' | 'r', irregular?: Entry['irregular']): string {
  const { base, eu } = euBase(stem, irregular)
  const end = split(base)!
  if (eu) return base + (type === 'n' ? '은' : '을')
  return block(end, end.vowel, final[type])
}

/** Produce one verified conjugation; word class and semantics govern admissible patterns. */
export function conjugate(entry: Entry, wordClass: WordClass, rule: string): string | null {
  const korean = entry.korean.normalize('NFC').trim()
  if (!/^[가-힣]+다$/.test(korean)) return null
  const stem = korean.slice(0, -1)
  const end = split(stem)!
  const i = entry.irregular
  const existence = stem === '있' || stem === '없' || stem.endsWith('있') || stem.endsWith('없')
  const actionOnly = ['wish', 'ongoing', 'ability', 'request', 'while']
  if (actionOnly.includes(rule) && (wordClass !== 'verb' || existence || entry.tags?.includes('stative'))) return null
  const withoutR = end.final === final.r ? block(end, end.vowel, 0) : stem

  switch (rule) {
    case 'present': return informal(stem, i) + '요'
    case 'casual': return informal(stem, i)
    case 'past': {
      const base = split(informal(stem, i))!
      return block(base, base.vowel, final.ss) + '어요'
    }
    case 'future': return modifier(stem, 'r', i) + ' 거예요'
    case 'formal': return [0, final.r].includes(end.final) ? block(end, end.vowel, final.b) + '니다' : stem + '습니다'
    case 'request': {
      const { base, eu } = euBase(withoutR, i)
      return base + (eu ? '으' : '') + '세요'
    }
    case 'wish': return stem + '고 싶어요'
    case 'ongoing': return stem + '고 있어요'
    case 'ability': return modifier(stem, 'r', i) + ' 수 있어요'
    case 'must': return informal(stem, i) + '야 해요'
    case 'negative': return stem + '지 않아요'
    case 'and': return stem + '고'
    case 'but': return stem + '지만'
    case 'if': case 'while': {
      const { base, eu } = euBase(stem, i)
      return base + (eu ? '으' : '') + (rule === 'if' ? '면' : '면서')
    }
    case 'because': return informal(stem, i) + '서'
    case 'presentModifier': return wordClass === 'verb' || existence ? withoutR + '는' : null
    case 'nModifier': return existence ? null : modifier(stem, 'n', i)
    case 'futureModifier': return modifier(stem, 'r', i)
    case 'nominal': return stem + '기'
    case 'try': return wordClass === 'verb' && !existence ? informal(stem, i) + ' 봐요' : null
    case 'plan': {
      const { base, eu } = euBase(stem, i)
      return wordClass === 'verb' && !existence ? base + (eu ? '으' : '') + '려고 해요' : null
    }
    case 'before': return wordClass === 'verb' && !existence ? stem + '기 전에' : null
    case 'after': return wordClass === 'verb' && !existence ? modifier(stem, 'n', i) + ' 후에' : null
    case 'seems': return modifier(stem, 'r', i) + ' 것 같아요'
    case 'background': {
      if (wordClass === 'verb' || existence) return withoutR + '는데'
      return modifier(stem, 'n', i) + '데'
    }
    default: return null
  }
}
