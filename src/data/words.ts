/**
 * Overview & Purpose: Provide beginner lexical decks and semantic tags for sentence slots.
 *
 * Architectural Relationships: The registry combines these decks with the grammar catalog.
 *
 * External Resources: None.
 *
 * Notes: Explicit entry keys remain stable when files are reordered.
 */


import type { Category, Entry, Irregular, WordList } from './model'

type Seed = [id: string, korean: string, english: string, tags?: string, irregular?: Irregular, note?: string, example?: string]

/** Convert compact authored rows to a stable numbered list. */
function deck(category: Category, number: number, name: string, rows: Seed[]): WordList {
  return {
    id: `${category}-${number}`, category, name: `List ${number} · ${name}`,
    entries: rows.map(([id, korean, english, tags, irregular, note, example]): Entry =>
      ({ id, korean, english, tags: tags?.split(' '), irregular, note, example })),
  }
}

export const lexicalLists: WordList[] = [
  deck('nouns', 1, 'Essentials', [
    ['person', '사람', 'Person', 'person seen'], ['friend', '친구', 'Friend', 'person seen'],
    ['home', '집', 'House / Home', 'place seen thing'], ['school', '학교', 'School', 'place'],
    ['food', '음식', 'Food', 'food thing'], ['water', '물', 'Water', 'drink thing'],
    ['time', '시간', 'Time', 'thing'], ['love', '사랑', 'Love'],
    ['korea', '한국', 'Korea', 'place'], ['thing', '것', 'Thing', 'thing seen'],
  ]),
  deck('nouns', 2, 'Food & everyday places', [
    ['rice', '밥', 'Rice / Meal', 'food thing'], ['bread', '빵', 'Bread', 'food thing'],
    ['kimchi', '김치', 'Kimchi', 'food thing'], ['coffee', '커피', 'Coffee', 'drink thing'],
    ['tea', '차', 'Tea', 'drink thing'], ['restaurant', '식당', 'Restaurant', 'place thing'],
    ['cafe', '카페', 'Café', 'place'], ['market', '시장', 'Market', 'place'],
    ['bag', '가방', 'Bag', 'thing seen'], ['book', '책', 'Book', 'reading thing seen'],
  ]),
  deck('nouns', 3, 'People & travel', [
    ['family', '가족', 'Family', 'person seen'], ['teacher', '선생님', 'Teacher', 'person seen'],
    ['station', '역', 'Station', 'place'], ['airport', '공항', 'Airport', 'place'],
    ['hotel', '호텔', 'Hotel', 'place'], ['seoul', '서울', 'Seoul', 'place'],
    ['ticket', '표', 'Ticket', 'thing seen'], ['map', '지도', 'Map', 'thing seen reading'],
    ['bus', '버스', 'Bus', 'thing seen ride'], ['subway', '지하철', 'Subway', 'thing seen ride'],
  ]),
  deck('pronouns', 1, 'Core pronouns', [
    ['i-casual', '나', 'I / me (casual)', 'first person', undefined, '나 + 가 → 내가'],
    ['i-polite', '저', 'I / me (humble)', 'first person', undefined, '저 + 가 → 제가'],
    ['you-casual', '너', 'You (casual)', 'second person', undefined, '너 + 가 → 네가. Reserve 너 for close relationships or appropriate informal contexts.'],
    ['we', '우리', 'We / our', 'first-plural person'], ['we-humble', '저희', 'We / our (humble)', 'first-plural person'],
    ['this', '이것', 'This thing', 'thing'], ['that', '그것', 'That thing', 'thing'],
    ['that-over-there', '저것', 'That thing over there', 'thing'], ['who', '누구', 'Who', 'person', undefined, '누구 + 가 → 누가'],
    ['what', '무엇', 'What', 'thing'],
  ]),
  deck('pronouns', 2, 'Spoken reference', [
    ['this-spoken', '이거', 'This thing (spoken)', 'thing'], ['that-spoken', '그거', 'That thing (spoken)', 'thing'],
    ['over-there-spoken', '저거', 'That thing over there (spoken)', 'thing'],
    ['what-spoken', '뭐', 'What (spoken)', 'thing'], ['somebody', '누군가', 'Someone', 'person'],
    ['something', '무언가', 'Something', 'thing'],
  ]),
  deck('pronouns', 3, 'Places & people', [
    ['here', '여기', 'Here', 'place'], ['there', '거기', 'There (near listener or previously mentioned)', 'place'],
    ['over-there', '저기', 'Over there', 'place'], ['where', '어디', 'Where', 'place'],
    ['this-person', '이분', 'This person (respectful)', 'person polite-subject'],
    ['that-person', '그분', 'That person (respectful)', 'person polite-subject'],
  ]),
  deck('verbs', 1, 'Essential actions', [
    ['do', '하다', 'To do', 'action'], ['exist', '있다', 'To exist / have', 'exist'],
    ['not-exist', '없다', 'To not exist / not have', 'exist'], ['go', '가다', 'To go', 'motion'],
    ['come', '오다', 'To come', 'motion'], ['eat', '먹다', 'To eat', 'food'],
    ['see', '보다', 'To see / watch', 'seen', undefined, undefined, '친구를 봐요.'],
    ['speak', '말하다', 'To speak', 'action'], ['know', '알다', 'To know', 'stative'],
    ['learn', '배우다', 'To learn', 'action'],
  ]),
  deck('verbs', 2, 'Daily routines', [
    ['drink', '마시다', 'To drink', 'drink'], ['read', '읽다', 'To read', 'reading'],
    ['write', '쓰다', 'To write / use', 'action'], ['sleep', '자다', 'To sleep', 'action'],
    ['work', '일하다', 'To work', 'action'], ['exercise', '운동하다', 'To exercise', 'action'],
    ['walk', '걷다', 'To walk', 'action', 'd'], ['listen', '듣다', 'To listen', 'action', 'd'],
    ['help', '돕다', 'To help', 'person', 'b'], ['get-up', '일어나다', 'To get up', 'action'],
  ]),
  deck('verbs', 3, 'Travel & conversation', [
    ['ride', '타다', 'To ride / take', 'ride'], ['arrive', '도착하다', 'To arrive', 'motion'],
    ['leave', '떠나다', 'To leave', 'action'], ['buy', '사다', 'To buy', 'thing'],
    ['find', '찾다', 'To look for', 'seen'], ['ask', '묻다', 'To ask', 'action', 'd'],
    ['wait', '기다리다', 'To wait for', 'person'], ['reserve', '예약하다', 'To make a reservation', 'action'],
    ['choose', '고르다', 'To choose', 'thing', 'reu'], ['build', '짓다', 'To build', 'action', 's'],
  ]),
  deck('adjectives', 1, 'Core descriptions', [
    ['good', '좋다', 'Good', 'thing place food drink person'], ['bad', '나쁘다', 'Bad', 'thing'],
    ['big', '크다', 'Big', 'thing place'], ['small', '작다', 'Small', 'thing place'],
    ['much', '많다', 'Many / much', 'thing food drink'], ['little', '적다', 'Few / little', 'thing food drink'],
    ['pretty', '예쁘다', 'Pretty', 'thing person place'], ['delicious', '맛있다', 'Delicious', 'food drink'],
    ['difficult', '어렵다', 'Difficult', 'reading', 'b'], ['easy', '쉽다', 'Easy', 'reading', 'b'],
  ]),
  deck('adjectives', 2, 'Feelings & color', [
    ['happy', '행복하다', 'Happy', 'person'], ['tired', '피곤하다', 'Tired', 'person'],
    ['busy', '바쁘다', 'Busy', 'person place'], ['sad', '슬프다', 'Sad', 'person'],
    ['cold-weather', '춥다', 'Cold (weather / feeling)', undefined, 'b'],
    ['hot-weather', '덥다', 'Hot (weather / feeling)', undefined, 'b'],
    ['red', '빨갛다', 'Red', 'thing', 'h'], ['white', '하얗다', 'White', 'thing', 'h'],
    ['quiet', '조용하다', 'Quiet', 'place person'], ['long', '길다', 'Long', 'thing'],
  ]),
  deck('adjectives', 3, 'Everyday evaluations', [
    ['expensive', '비싸다', 'Expensive', 'thing food drink'], ['cheap', '싸다', 'Cheap', 'thing food drink'],
    ['near', '가깝다', 'Near', 'place', 'b'], ['far', '멀다', 'Far', 'place'],
    ['fast', '빠르다', 'Fast', 'ride person', 'reu'], ['slow', '느리다', 'Slow', 'ride person'],
    ['interesting', '재미있다', 'Interesting', 'reading thing'], ['convenient', '편하다', 'Comfortable / Convenient', 'place thing'],
    ['hot-touch', '뜨겁다', 'Hot (to the touch)', 'food drink', 'b'], ['same', '같다', 'Same', 'thing'],
  ]),
  deck('sentences', 1, 'Everyday courtesies', [
    ['how-are-you', '잘 지내요?', 'How are you doing?'], ['thanks', '감사합니다.', 'Thank you'],
    ['sorry', '미안해.', 'Sorry (casual)'], ['okay', '괜찮아요.', "It's okay"],
  ]),
  deck('sentences', 2, 'Ordering & shopping', [
    ['how-much', '얼마예요?', 'How much is it?'], ['give-this', '이거 주세요.', 'This one, please'],
    ['can-card', '카드 돼요?', 'Can I pay by card?'], ['receipt', '영수증 주세요.', 'A receipt, please'],
  ]),
  deck('sentences', 3, 'Getting around', [
    ['bathroom', '화장실이 어디예요?', 'Where is the restroom?'], ['say-again', '다시 말해 주세요.', 'Please say that again'],
    ['help', '도와주세요.', 'Please help me'], ['go-well', '잘 다녀오세요.', 'Have a good trip and come back safely'],
  ]),
  deck('independent', 1, 'Everyday responses', [
    ['yes', '예', 'Yes (polite/formal)'], ['no', '아니요', 'No (polite)'], ['no-casual', '아니', 'No (casual)'],
    ['thanks', '고마워', 'Thanks (casual)'], ['okay', '그래', 'Yeah / okay / I see'],
    ['got-it', '알겠어', 'Got it (casual)'], ['hello', '안녕하세요', 'Hello (polite)'], ['wait', '잠깐만', 'Wait a moment'],
  ]),
  deck('independent', 2, 'Time & frequency', [
    ['now', '지금', 'Now'], ['today', '오늘', 'Today'], ['yesterday', '어제', 'Yesterday'],
    ['tomorrow', '내일', 'Tomorrow'], ['often', '자주', 'Often'], ['always', '항상', 'Always'],
    ['already', '벌써', 'Already (so soon)'], ['later', '나중에', 'Later'],
  ]),
  deck('independent', 3, 'Adverbs & reactions', [
    ['really', '정말', 'Really'], ['together', '같이', 'Together'], ['again', '다시', 'Again'],
    ['slowly', '천천히', 'Slowly'], ['well', '잘', 'Well'], ['why', '왜', 'Why'],
    ['how', '어떻게', 'How'], ['perhaps', '아마', 'Probably'],
  ]),
]
