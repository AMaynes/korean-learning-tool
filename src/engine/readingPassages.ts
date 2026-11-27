import { lexicalLists } from '../data/words'
import { attach } from './korean'

function line(korean: string, english: string, glosses: string) {
  return { korean, english, glosses: glosses.split('|') }
}

const cafeDrinks = lexicalLists.filter(list => list.category === 'nouns')
  .flatMap(list => list.entries.filter(entry => entry.tags?.includes('drink')))
  .map(entry => {
    const drink = entry.english.toLowerCase()
    return line('카페에서 ' + attach(entry.korean, 'object')!.result + ' 마셔요.',
      'I drink ' + drink + ' at the café.', 'at the café|' + drink + '|drink')
  })

// Glosses follow Korean word order. Sentence translations supply natural English
// subjects for the narrator and companions in each scene.
const scenes = [
  [
    [line('아침에 일어나요.', 'I get up in the morning.', 'in the morning|get up'),
      line('오늘은 아침에 일어나요.', 'Today I get up in the morning.', 'today|in the morning|get up')],
    [line('이를 닦고 씻어요.', 'I brush my teeth and wash up.', 'teeth|brush and|wash up'),
      line('씻고 코트를 입어요.', 'I wash up and put on my coat.', 'wash up and|coat|put on')],
    [line('주차장에서 버스 정류장까지 걸어요.', 'I walk from the parking lot to the bus stop.', 'from the parking lot|bus|as far as the stop|walk'),
      line('정류장에서 버스를 기다려요.', 'I wait for the bus at the stop.', 'at the stop|bus|wait for')],
    [line('버스를 타고 학교에 가요.', 'I take the bus to school.', 'bus|take and|to school|go'),
      line('학교에 가서 친구를 만나요.', 'I go to school and meet a friend there.', 'to school|go and then|a friend|meet')],
  ],
  [
    [line('오늘은 친구하고 식당에 가요.', 'Today I go to a restaurant with a friend.', 'today|with a friend|to a restaurant|go'),
      line('배가 고파서 식당에 가요.', 'I go to a restaurant because I’m hungry.', 'stomach|because I’m hungry|to a restaurant|go')],
    [line('메뉴를 보고 비빔밥을 골라요.', 'I look at the menu and choose bibimbap.', 'menu|look at and|bibimbap|choose'),
      line('메뉴를 보고 불고기를 골라요.', 'I look at the menu and choose bulgogi.', 'menu|look at and|bulgogi|choose'),
      line('메뉴를 보고 라면을 골라요.', 'I look at the menu and choose ramyeon.', 'menu|look at and|ramyeon|choose')],
    [line('음식이 맛있어요.', 'The food is delicious.', 'food|is delicious'),
      line('김치도 먹어요.', 'I eat kimchi too.', 'kimchi too|eat')],
    [line('밥을 먹고 물을 마셔요.', 'I eat my meal and drink water.', 'a meal|eat and|water|drink'),
      line('밥을 먹고 친구하고 카페에 가요.', 'I eat and then go to a café with a friend.', 'a meal|eat and|with a friend|to a café|go')],
  ],
  [
    [line('오늘은 날씨가 맑아요.', 'It’s clear today.', 'today|weather|is clear'),
      line('오늘은 날씨가 따뜻해요.', 'It’s warm today.', 'today|weather|is warm')],
    [line('친구하고 공원에 가요.', 'I go to the park with a friend.', 'with a friend|to the park|go'),
      line('집에서 공원까지 걸어요.', 'I walk from home to the park.', 'from home|as far as the park|walk')],
    [line('공원에서 오리를 봐요.', 'I see ducks in the park.', 'in the park|ducks|see'),
      line('공원에 있는 나무를 봐요.', 'I look at the trees in the park.', 'in the park|located there (describes the trees)|trees|look at')],
    [line('공원에서 쉬어요.', 'I rest in the park.', 'in the park|rest'),
      line('공원을 걷고 집에 가요.', 'I walk through the park and go home.', 'through the park|walk and|home|go')],
  ],
  [
    [line('오늘은 친구를 만나요.', 'I meet a friend today.', 'today|a friend|meet'),
      line('주말에 친구를 만나요.', 'I meet a friend on the weekend.', 'on the weekend|a friend|meet')],
    [line('학교에서 만나서 카페에 가요.', 'We meet at school and go to a café.', 'at school|meet and then|to a café|go'),
      line('공원에서 만나서 카페까지 걸어요.', 'We meet in the park and walk to the café.', 'in the park|meet and then|as far as the café|walk')],
    [...cafeDrinks, line('카페에서 쿠키를 먹어요.', 'I eat a cookie at the café.', 'at the café|a cookie|eat')],
    [line('친구하고 같이 공부해요.', 'I study together with my friend.', 'with my friend|together|study'),
      line('다음 주에도 같이 공부해요.', 'We study together next week too.', 'next|week too|together|study')],
  ],
  [
    [line('오늘은 집에서 쉬어요.', 'I rest at home today.', 'today|at home|rest'),
      line('학교에서 집에 와요.', 'I come home from school.', 'from school|home|come')],
    [line('부엌에서 물을 마셔요.', 'I drink water in the kitchen.', 'in the kitchen|water|drink'),
      line('부엌에서 빵을 먹어요.', 'I eat bread in the kitchen.', 'in the kitchen|bread|eat')],
    [line('방에서 게임을 해요.', 'I play a game in my room.', 'in my room|a game|play (a game)'),
      line('소파에 앉아서 책을 읽어요.', 'I sit on the couch and read a book.', 'on the couch|sit down and|a book|read')],
    [line('피곤해서 자요.', 'I go to sleep because I’m tired.', 'because I’m tired|go to sleep'),
      line('휴대폰을 보고 자요.', 'I look at my phone and then go to sleep.', 'my phone|look at and|go to sleep')],
  ],
  [
    [line('오늘은 서울에서 친구를 만나요.', 'Today I meet a friend in Seoul.', 'today|in Seoul|a friend|meet'),
      line('주말에 서울에서 친구를 만나요.', 'I meet a friend in Seoul on the weekend.', 'on the weekend|in Seoul|a friend|meet')],
    [line('역에서 만나서 시장에 가요.', 'We meet at the station and go to the market.', 'at the station|meet and then|to the market|go'),
      line('역에서 만나서 시장까지 걸어요.', 'We meet at the station and walk to the market.', 'at the station|meet and then|as far as the market|walk')],
    [line('가게에서 지갑을 봐요.', 'I look at a wallet in a shop.', 'in a shop|a wallet|look at'),
      line('가게에서 코트를 봐요.', 'I look at a coat in a shop.', 'in a shop|a coat|look at')],
    [line('예쁘지만 비싸요.', 'It’s pretty, but expensive.', 'is pretty, but|is expensive'),
      line('싸서 사요.', 'I buy it because it’s inexpensive.', 'because it’s inexpensive|buy')],
  ],
]

export const passageLines = scenes.flat(2)
const exampleLines = [
  line('오늘 날씨가 정말 좋아요.', 'The weather is really nice today.', 'today|weather|really|is nice'),
  line('저는 아침에 일찍 일어나서 커피를 한 잔 마셨어요.', 'I got up early in the morning and had a cup of coffee.', 'I|in the morning|early|got up and then|coffee|one|cup|drank'),
  line('그다음에 공원에 가서 조금 걸었어요.', 'Then I went to the park and walked a little.', 'after that|to the park|went and then|a little|walked'),
  line('공원에는 나무와 꽃이 많아서 기분이 아주 좋았어요.', 'I felt great because there were lots of trees and flowers in the park.', 'in the park|trees and|flowers|because there were many|mood|very|was good'),
  line('오후에는 카페에 앉아서 책을 읽을 거예요.', 'In the afternoon I’ll sit in a café and read a book.', 'in the afternoon|at a café|sit down and|a book|read (upcoming action)|will (completes the future form)'),
]
export const reviewedLines = [...passageLines, ...exampleLines]
export const passageByText = new Map(reviewedLines.map(item => [item.korean, item]))
export const readingAudioPrompts = new Set(reviewedLines.flatMap(({ korean }) =>
  [korean, ...korean.split(' ').map(word => word.replace(/[.!?]+$/u, ''))]))

export function generatePassage(previous: string) {
  const choices = scenes.filter(([openings]) => !openings.some(line => previous.trimStart().startsWith(line.korean)))
  const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
  return pick(choices).map(slot => pick(slot).korean).join(' ')
}
