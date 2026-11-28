/**
 * Overview & Purpose: Order library entries by meaning within the selected deck.
 *
 * Architectural Relationships: Library uses these headings and the existing grammar families.
 *
 * External Resources: None.
 *
 * Notes: This is a display order. The catalog owns entry IDs and practice order.
 */


import { practiceFamilies } from './grammar'
import type { Entry, WordList } from './model'

// Each line is a study sequence. Spelling variants, related verb forms and
// opposites are adjacent even when they came from different decks.
const vocabularyGroups = {
  'Home, rooms & furniture': '집|집에|방|부엌|화장실|문|창문|침대|소파',
  'Getting ready & going to bed': '일어나다|일어나요|이를 닦아요|씻어요|입어요|코트|자다|자요',
  'Parks & nature': '공원|나무|오리',
  'Walking, resting & watching': '걷다|걸어요|쉬어요|쉬세요|보다|봐요|앉아요',
  'Weather & forecasts': '날씨|날씨가|맑아요|비가 와요|비 올 거예요|눈이 와요|우산',
  'Temperature': '춥다|추워요|오늘 추워요|시원해요|따뜻해요|덥다|더워요|뜨겁다',
  'Time of day & dates': '시간|몇 시예요|세 시예요|아침|어제|오늘|내일|이번 주|다음 주|월요일|금요일|주말',
  'Timing & frequency': '언제|지금|벌써|나중에|늦었어요|항상|매일|자주|다시',
  'People & relationships': '사람|친구|친구가|선생님|가족|엄마|아빠|할머니|할아버지|동생|누나|오빠',
  'Referring to people': '나|저|저는|제가|너|우리|저희|이분|그분|누구|누군가',
  'Greetings & introductions': '안녕|안녕하세요|반갑습니다|잘 지내요|이름이 뭐야|이름이 뭐예요|저는 …이에요|저는 …예요',
  'Plans & meeting up': '뭐 해|뭐 하세요|어디 가|어디 가세요|만나요|같이|기다리다|기다려요|잠깐만|잠깐만요|잠시만요',
  'Feelings & reactions': '사랑|좋아해요|행복하다|슬프다|대박|정말|아마',
  'Yes, no & acknowledgment': '네|예|아니요|아니|그래|알겠어',
  'Thanks & apologies': '감사합니다|고마워요|고마워|천만에요|죄송합니다|미안해|실례합니다',
  'Departures, returns & good nights': '안녕히 가세요|안녕히 계세요|다녀오세요|잘 다녀오세요|다녀왔어요|조심하세요|잘 자|잘 자요|안녕히 주무세요',
  'Transit & travel documents': '차|택시|버스|지하철|주차장|정류장|역|공항|표|여권',
  'Going, arriving & leaving': '가다|가요|오다|와요|타다|도착하다|떠나다',
  'Directions & distance': '지도|주소|입구|출구|왼쪽|오른쪽|직진|가깝다|멀다',
  'Here, there & where': '여기|거기|저기|어디|여기 있어요|어디예요|지하철 어디예요|화장실이 어디예요',
  'Cities, landmarks & lodging': '한국|서울|서울에서|궁|박물관|호텔|예약|예약하다',
  'School, supplies & studying': '학교|학교에|가방|책|공부하다|공부해요|배우다|알다|읽다|읽어요|쓰다|써요|듣다|들어요',
  'Work & difficulty': '하다|해요|일하다|바쁘다|쉽다|쉬워요|어렵다|어려워요',
  'Places to eat & drink': '식당|카페|카페에서|메뉴',
  'Meals, dishes & snacks': '음식|밥|비빔밥|불고기|라면|김치|빵|쿠키',
  'Drinks': '물|차 (tea)|커피',
  'Eating & drinking': '배고파요|먹다|먹어요|목말라요|마시다|마셔요',
  'Taste & flavor': '맛있다|맛있어요|맛없어요|달아요|매워요',
  'Ordering': '여기요|주세요|이거 주세요|물 주세요|커피 주세요',
  'Stores, prices & payment': '가게|편의점|시장|은행|지갑|돈|원|얼마예요|싸다|싸요|비싸다|비싸요|고르다|사다|사요|카드 돼요|영수증 주세요',
  'Things & pointing them out': '것|이것|이거|이거는|그것|그거|저것|저거|무엇|뭐|무언가',
  'Questions, speech & understanding': '왜|어떻게|묻다|말하다|영어 하세요|한국어 잘 못해요|천천히 말해 주세요|다시 말해 주세요',
  'Help & requests': '필요해요|도움이 필요해요|돕다|도와줘|도와주세요|잃어버렸어요|찾다|전화해 주세요|열어 주세요|닫아 주세요|조용히 해 주세요',
  'Body & exercise': '머리|배|손|발|운동하다|운동해요|피곤하다|피곤해요',
  'Health & symptoms': '괜찮으세요|괜찮아요|괜찮지 않아요|아파요|머리가 아파요|배가 아파요|열이 있어요|약|약국|병원|병원에 가요',
  'Emergencies': '위험해요|긴급해요|경찰서|119에 전화해 주세요',
  'Sino-Korean numbers': '일|이|삼|사|오|육|칠|팔|구|십',
  'Native Korean numbers': '하나|둘|셋|넷',
  'Size, quantity & comparison': '작다|작아요|크다|커요|길다|적다|많다|같다|있다|없다',
  'Speed & manner': '빠르다|느리다|천천히|잘',
  'Quality & impressions': '좋다|좋아요|나쁘다|나빠요|예쁘다|예뻐요|멋있어요|재미있다|재미있어요|편하다|조용하다',
  'Colors': '색|빨갛다|하얗다',
  'Games & devices': '휴대폰|게임',
  'Minecraft menus & settings': '타이틀 화면|싱글플레이|멀티플레이|게임 종료|설정|언어|조작|비디오 설정|음악 및 소리|난이도|세계 선택|새로운 세계 만들기|게임 모드|서바이벌|크리에이티브',
  'Building & crafting materials': '짓다|목재|참나무 원목|참나무 판자|흙|돌|조약돌|제작대|화로|석탄|불',
  'Mining tools': '도구|더 좋은 도구|도끼|곡괭이|철 곡괭이|다이아몬드 곡괭이',
  'Ores, gems & portal materials': '철 광석|철|철 주괴|다이아몬드|흑요석|부싯돌과 부시',
  'Settlements': '마을|농장',
  'Combat': '적|검|방패',
  'The Nether': '네더 차원문|네더|네더 요새|용암|블레이즈 막대기',
  'The End': '엔더맨|엔더 진주|엔더의 눈|엔드 차원문|엔드|엔더 드래곤|겉날개',
}

const lexicalOrder = Object.entries(vocabularyGroups).map(([name, words]) => [name, words.split('|')] as const)

/** Ignore sentence punctuation for lookup and distinguish the two senses of 차. */
function vocabularyKey(entry: Entry) {
  if (entry.korean === '차' && (entry.id === 'tea' || entry.id === 'lex-nouns-tea')) return '차 (tea)'
  return entry.korean.replace(/[.?!]+$/u, '')
}

/** Select and order the active entries only, emitting each once even for overlapping rule families. */
export function libraryGroups(list: WordList) {
  const grammar = list.category === 'particles' || list.category === 'conjugations' ? list.category : undefined
  const order = grammar ? Object.entries(practiceFamilies[grammar]) : lexicalOrder
  const remaining = new Map<string, Entry[]>()
  for (const entry of list.entries) {
    const key = grammar ? entry.id : vocabularyKey(entry)
    const bucket = remaining.get(key)
    if (bucket) bucket.push(entry)
    else remaining.set(key, [entry])
  }
  const groups: { name: string; entries: Entry[] }[] = []
  for (const [name, keys] of order) {
    const entries: Entry[] = []
    for (const key of keys) {
      const bucket = remaining.get(key)
      if (bucket) {
        entries.push(...bucket)
        remaining.delete(key)
      }
    }
    if (entries.length) groups.push({ name, entries })
  }
  if (remaining.size) groups.push({ name: 'More vocabulary', entries: [...remaining.values()].flat() })
  return groups
}
