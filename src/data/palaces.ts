import { builtInLists } from '../engine/registry'

import { sceneMaps } from './sceneMaps'

export const classicPalaces = { home: 'Home', park: 'Park', cafe: 'Café', school: 'School', station: 'Train Station' }
export type Theme = keyof typeof classicPalaces
export const palaceNames: Record<string, string> = {
  ...classicPalaces, ...Object.fromEntries(sceneMaps.map(map => [map.id, map.name])),
}
type Room = [room: string, stops: [place: string, word: string][]]
const routes: Record<Theme, Room[]> = {
  home: [
    ['Entryway', [['Front gate', '집'], ['Doorbell', '오다'], ['Doormat', '여기'], ['Coat hook', '가방'], ['Shoe rack', '가다']]],
    ['Living room', [['Sofa', '편하다'], ['Coffee table', '차'], ['Rug', '같이'], ['Bookshelf', '책'], ['Window', '보다']]],
    ['Kitchen', [['Fridge', '음식'], ['Counter', '김치'], ['Sink', '물'], ['Stove', '뜨겁다'], ['Spice rack', '맛있다']]],
    ['Garden', [['Birdbath', '작다'], ['Bench', '가족'], ['Apple tree', '크다'], ['Pond', '조용하다'], ['Greenhouse', '덥다']]],
    ['Bedroom', [['Bed', '자다'], ['Nightstand', '일어나다'], ['Mirror', '나'], ['Wardrobe', '고르다'], ['Lamp', '읽다']]],
    ['Study', [['Desk', '쓰다'], ['Chair', '일하다'], ['Globe', '한국'], ['Clock', '시간'], ['Noticeboard', '내일']]],
  ],
  park: [
    ['Park entrance', [['Iron gate', '걷다'], ['Trail map', '지도'], ['Bicycle rack', '타다'], ['Ticket booth', '표'], ['Stone arch', '크다']]],
    ['Playground', [['Slide', '빠르다'], ['Swing', '재미있다'], ['Sandbox', '짓다'], ['Climbing frame', '운동하다'], ['Seesaw', '같이']]],
    ['Lakeside', [['Footbridge', '천천히'], ['Boat dock', '기다리다'], ['Reed bed', '조용하다'], ['Fishing pier', '물'], ['Waterfall', '듣다']]],
  ],
  cafe: [
    ['Café entrance', [['Striped awning', '카페'], ['Chalkboard', '얼마예요?'], ['Glass door', '오다'], ['Umbrella stand', '찾다'], ['Menu board', '고르다']]],
    ['Coffee bar', [['Bean grinder', '커피'], ['Espresso machine', '뜨겁다'], ['Milk pitcher', '마시다'], ['Pastry case', '빵'], ['Register', '사다']]],
    ['Seating area', [['Window seat', '친구'], ['Reading lamp', '읽다'], ['Corner booth', '조용하다'], ['Bar stool', '편하다'], ['Patio table', '차']]],
  ],
  school: [
    ['School entrance', [['School gate', '학교'], ['Locker', '가방'], ['Hall clock', '시간'], ['Classroom door', '선생님'], ['Noticeboard', '오늘']]],
    ['Classroom', [['Lesson board', '배우다'], ['Writing desk', '쓰다'], ['Raised hand', '묻다'], ['Workbook', '어렵다'], ['Reading corner', '책']]],
  ],
  station: [
    ['Ticket hall', [['Station entrance', '역'], ['Route map', '지도'], ['Ticket machine', '표'], ['Ticket counter', '사다'], ['Fare display', '얼마예요?']]],
    ['Platform', [['Departure board', '떠나다'], ['Waiting bench', '기다리다'], ['Arrival clock', '도착하다'], ['Train door', '타다'], ['Subway tracks', '지하철']]],
  ],
}
const catalog = [...new Map(builtInLists.filter(list => list.category !== 'topics').flatMap(list => list.entries.map(entry => {
  const key = list.category + '-' + entry.id
  return [key, {...entry, key, category: list.category}] as const
}))).values()]
const byWord = new Map(catalog.map(entry => [entry.korean, entry]))
export type PalaceLandmark = { room: string; place: string; word: { korean: string; english: string }; cueId: string }

export function palaceRoute(id: string, custom: {name: string; stops: string[]; theme?: Theme} | undefined, cues: Record<string, string>) {
  const map = sceneMaps.find(map => map.id === id)
  if (map) return map.sections.flatMap(scene => scene.stops.map(([korean, english, place], i) => ({
    room: scene.name, place, word: { korean, english }, cueId: 'stop-' + scene.id + '-' + i,
  })))
  const theme = (custom?.theme ?? (custom ? 'home' : id)) as Theme
  const themed = routes[theme].flatMap(([room, stops]) => stops.map(([place, word]) => ({room, place, word: byWord.get(word)!})))
  const route = (custom ? custom.stops.map((place, i) => {
    const terms: string[] = place.toLowerCase().match(/[a-z가-힣]+/gu) ?? []
    const match = catalog.find(w => terms.includes(w.korean) || terms.includes(w.english.toLowerCase())) ??
      themed.find(stop => terms.some(term => stop.place.toLowerCase().split(' ').includes(term)))?.word
    return {room: custom.name, place, word: match ?? themed[i % themed.length].word}
  }) : themed).map((stop, i) => ({...stop, cueId: 'stop-' + id + '-' + i}))
  // Older releases placed each category independently along the same landmarks.
  const offsets = new Map<string, number>()
  for (const word of catalog) {
    const slot = offsets.get(word.category) ?? 0
    offsets.set(word.category, slot + 1)
    const key = (id === 'home' ? '' : id + '-') + word.key
    if (!cues[key]) continue
    const stop = route[slot % (custom?.stops.length ?? themed.length)]
    if (stop.word.key === word.key && !cues[stop.cueId]) stop.cueId = key
    else route.push({...stop, word, cueId: key})
  }
  return route
}
