import type { Entry, WordList } from './model'
import { sceneMaps } from './sceneMaps'
import { lexicalLists } from './words'

// Older entries that are not already stops in the maps, grouped by familiar use.
const relatedWords: Record<string, string[]> = {
  morning: ['있다', '없다', '일어나다', '편하다', '항상'],
  forecast: ['걷다', '앉다', '일어나다', '달리다', '읽다', '쓰다', '춥다', '덥다', '조용하다', '천천히'],
  commute: ['가방', '책', '읽다', '쓰다', '배우다', '듣다', '알다', '어렵다', '쉽다', '바쁘다', '하다', '어제'],
  'campus-meal': ['음식', '맛있다', '뜨겁다', '많다', '적다', '차'],
  gym: ['운동하다', '피곤하다', '자주', '빠르다', '느리다'],
  'minecraft-build': ['짓다', '좋다', '나쁘다', '예쁘다', '빨갛다', '하얗다', '길다', '재미있다', '같다'],
  arrival: ['한국', '서울', '지도', '타다', '도착하다', '떠나다', '예약하다', '가깝다', '멀다'],
  introductions: ['사랑', '나', '저', '너', '우리', '저희', '누구', '누군가', '이분', '그분', '행복하다', '슬프다', '말하다', '잘 지내요?'],
  plans: ['오다', '기다리다', '나중에', '벌써', '같이', '아마', '잠깐만'],
  ordering: ['것', '이것', '그것', '저것', '그거', '저거', '무언가', '사다', '고르다', '비싸다', '싸다', '이거 주세요.', '카드 돼요?', '영수증 주세요.'],
  directions: ['무엇', '뭐', '여기', '거기', '저기', '어디', '찾다', '묻다', '돕다', '왜', '어떻게', '다시', '화장실이 어디예요?'],
  goodbyes: ['잘 다녀오세요.', '예', '아니', '그래', '알겠어', '정말', '잘'],
}

const originalEntries = new Map(lexicalLists.flatMap(list => list.entries.map(entry => [entry.korean, { ...entry, id: 'lex-' + list.category + '-' + entry.id }] as const)))

export const topicLists: WordList[] = sceneMaps.map(map => {
  const entries = new Map<string, Entry>()
  for (const section of map.sections) {
    for (const [korean, english] of section.stops) {
      if (entries.has(korean)) continue
      const id = Array.from(korean, char => char.codePointAt(0)!.toString(16)).join('-')
      entries.set(korean, { id, korean, english })
    }
  }
  const related = (relatedWords[map.id] ?? []).map(word => originalEntries.get(word)!)
  return { category: 'topics', id: 'topics-' + map.id, name: map.name, entries: [...entries.values(), ...related] }
})
