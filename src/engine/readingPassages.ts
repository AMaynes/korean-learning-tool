import { lexicalLists } from '../data/words'
import { attach } from './korean'

const cafeDrinks = lexicalLists.filter(list => list.category === 'nouns')
  .flatMap(list => list.entries.filter(entry => entry.tags?.includes('drink')))
  .map(entry => '카페에서 ' + attach(entry.korean, 'object')!.result + ' 마셔요.')

// Each scene has an opening, two related actions, and an ending. Alternatives in
// a slot work with every choice around it, keeping the paragraph on one subject.
const scenes = [
  [
    ['아침에 일어나요.', '오늘은 아침에 일어나요.'],
    ['이를 닦고 씻어요.', '씻고 코트를 입어요.'],
    ['주차장에서 버스 정류장까지 걸어요.', '정류장에서 버스를 기다려요.'],
    ['버스를 타고 학교에 가요.', '학교에 가서 친구를 만나요.'],
  ],
  [
    ['오늘은 친구하고 식당에 가요.', '배가 고파서 식당에 가요.'],
    ['메뉴를 보고 비빔밥을 골라요.', '메뉴를 보고 불고기를 골라요.', '메뉴를 보고 라면을 골라요.'],
    ['음식이 맛있어요.', '김치도 먹어요.'],
    ['밥을 먹고 물을 마셔요.', '밥을 먹고 친구하고 카페에 가요.'],
  ],
  [
    ['오늘은 날씨가 맑아요.', '오늘은 날씨가 따뜻해요.'],
    ['친구하고 공원에 가요.', '집에서 공원까지 걸어요.'],
    ['공원에서 오리를 봐요.', '공원에 있는 나무를 봐요.'],
    ['공원에서 쉬어요.', '공원을 걷고 집에 가요.'],
  ],
  [
    ['오늘은 친구를 만나요.', '주말에 친구를 만나요.'],
    ['학교에서 만나서 카페에 가요.', '공원에서 만나서 카페까지 걸어요.'],
    [...cafeDrinks, '카페에서 쿠키를 먹어요.'],
    ['친구하고 같이 공부해요.', '다음 주에도 같이 공부해요.'],
  ],
  [
    ['오늘은 집에서 쉬어요.', '학교에서 집에 와요.'],
    ['부엌에서 물을 마셔요.', '부엌에서 빵을 먹어요.'],
    ['방에서 게임을 해요.', '소파에 앉아서 책을 읽어요.'],
    ['피곤해서 자요.', '휴대폰을 보고 자요.'],
  ],
  [
    ['오늘은 서울에서 친구를 만나요.', '주말에 서울에서 친구를 만나요.'],
    ['역에서 만나서 시장에 가요.', '역에서 만나서 시장까지 걸어요.'],
    ['가게에서 지갑을 봐요.', '가게에서 코트를 봐요.'],
    ['예쁘지만 비싸요.', '싸서 사요.'],
  ],
]

export function generatePassage(previous: string) {
  // Exclude the current opening so consecutive clicks always give a different scene.
  const choices = scenes.filter(([openings]) => !openings.some(line => previous.trimStart().startsWith(line)))
  const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
  return pick(choices).map(pick).join(' ')
}
