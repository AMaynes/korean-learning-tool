import { conjugationRules, particleRules } from '../data/grammar'
import type { Entry, WordClass } from '../data/model'
import { lexicalLists } from '../data/words'
import { attach, batchim, conjugate } from './korean'

export function readingToken(word: string) {
  return word.normalize('NFC').replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '')
}

export interface Breakdown {
  base: string
  stem: string
  parts: { form: string; role: string }[]
}

// Match spellings produced by the same rules used in practice. An arbitrary
// syllable that resembles a particle is insufficient evidence to split a word.
const forms = new Map<string, Breakdown[]>()
function register(surface: string, breakdown: Breakdown) {
  const matches = forms.get(surface) ?? []
  matches.push(breakdown)
  forms.set(surface, matches)
}
const nominals = new Set(lexicalLists.filter(list => ['nouns', 'pronouns'].includes(list.category))
  .flatMap(list => list.entries.map(entry => entry.korean)))
for (const noun of `아침 오늘 이 코트 주차장 정류장 배 메뉴 비빔밥 불고기 라면 날씨 공원 오리 나무 주말 주
부엌 방 게임 소파 휴대폰 가게 지갑 쿠키 저녁 점심 내일 어제 그다음 기분 꽃 오후 잔 학생 선생님 동생
엄마 아빠 이름 버스 정원 도서관 사과 바다 병원 약국 연구실 운동 수업 수영장 머리 창문 문 침대
의자 연필 고양이 강아지 우산 화장실 편의점 할머니 할아버지 누나 오빠 한국어 영어 원 돈 여권 주소`.split(/\s+/u)) nominals.add(noun)

const bareWords = new Set([...nominals, '같이', '다음', '정말', '조금', '아주', '일찍', '한', '더', '잘', '매일', '지금'])
for (const noun of nominals) {
  for (const rule of Object.values(particleRules)) {
    const attached = attach(noun, rule.id)
    if (!attached) continue
    const part = { form: attached.applied, role: rule.english.replace(' marker', '') + ' particle' }
    register(attached.result, { base: noun, stem: noun, parts: [part] })
    if (['destination', 'actionPlace', 'until', 'start', 'recipient'].includes(rule.id)) {
      for (const extra of ['topic', 'also', 'only']) {
        const stacked = attach(attached.result, extra)!
        register(stacked.result, { base: noun, stem: noun, parts: [part,
          { form: stacked.applied, role: particleRules[extra].english.replace(' marker', '') + ' particle' }] })
      }
    }
  }
  const consonant = Boolean(batchim(noun))
  for (const [suffix, role] of [
    [consonant ? '이에요' : '예요', 'polite present'], [consonant ? '이었어요' : '였어요', 'polite past'],
    ['입니다', 'formal polite statement'],
  ]) {
    register(noun + suffix, { base: noun, stem: noun, parts: [{ form: suffix, role: '이다 (to be) · ' + role }] })
  }
}

function addPredicate(entry: Entry, wordClass: WordClass) {
  const base = entry.korean
  const stem = base.slice(0, -1)
  bareWords.add(base)
  for (const rule of Object.values(conjugationRules)) {
    const result = conjugate(entry, wordClass, rule.id)
    if (!result || result.includes(' ')) continue
    let form = rule.korean
    if (['present', 'past', 'because', 'casual'].includes(rule.id)) {
      // Recover the underlying vowel even when the written stem contracts
      // (마시 + 었어요 → 마셨어요) or changes irregularly (걷 + 어요 → 걸어요).
      const vowel = (syllable: string) => Math.floor((syllable.charCodeAt(0) - 0xac00) / 28) % 21
      const last = vowel(stem.slice(-1))
      const harmony = last === 18 ? vowel(stem.slice(-2, -1)) : last
      let joining = [0, 8].includes(harmony) ? '아' : '어'
      if (entry.irregular === 'b') joining = ['돕', '곱'].includes(stem) ? '아' : '어'
      if (stem.endsWith('하')) joining = '여'
      if (entry.irregular !== 'h') {
        const past: Record<string, string> = { 아: '았', 어: '었', 여: '였' }
        const endings: Record<string, string> = { present: joining + '요', past: past[joining] + '어요',
          casual: joining, because: joining + '서' }
        form = '-' + endings[rule.id]
      }
    } else if (result.startsWith(stem) && result.length > stem.length) {
      form = '-' + result.slice(stem.length)
    }
    register(result, { base, stem, parts: [{ form, role: rule.english + ' ending' }] })
  }
}

for (const list of lexicalLists) {
  if (list.category === 'verbs' || list.category === 'adjectives') {
    for (const entry of list.entries) addPredicate(entry, list.category === 'verbs' ? 'verb' : 'adjective')
  }
}
for (const [type, bases] of [
  ['verb', '닦다 씻다 입다 만나다 쉬다 앉다 공부하다 놀다 만들다 놓다 주다 전화하다 잃어버리다'],
  ['adjective', '고프다 맑다 따뜻하다 시원하다 아프다 달다 필요하다 괜찮다 미안하다 위험하다 긴급하다'],
] as const) {
  for (const base of bases.split(' ')) addPredicate({ id: base, korean: base, english: '' }, type)
}
addPredicate({ id: 'spicy', korean: '맵다', english: 'spicy', irregular: 'b' }, 'adjective')

// In 읽을 거예요, the first word carries the prospective modifier and the
// second is the contracted dependent noun 것 with the polite copula.
register('거예요', { base: '거 (것)', stem: '거', parts: [{ form: '예요', role: '이다 (to be) · polite present' }] })

export function readingBreakdowns(word: string, reviewed = false): Breakdown[] {
  const surface = readingToken(word)
  const bare = bareWords.has(surface) ? [{ base: surface, stem: surface, parts: [] }] : []
  const matches = [...bare, ...(forms.get(surface) ?? [])]
  if (reviewed) {
    // These homographs have known readings throughout the authored passages.
    const bases: Record<string, string> = { 물을: '물', 한: '한', 잔: '잔', 있는: '있다' }
    if (bases[surface]) return matches.filter(match => match.base === bases[surface])
  }
  return matches
}
