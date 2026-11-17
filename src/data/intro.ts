/**
 * Overview & Purpose: Supply the Intro's glossary, word categories, and grammar application rules.
 *
 * Architectural Relationships: Rendered by the Intro view.
 *
 * External Resources: National Institute of Korean Language school grammar terminology.
 *
 * Notes: Tables distinguish the usual form from cases like particle stacking and nominalization.
 */


/** One Korean example, its English meaning, and what it demonstrates. */
type GlossaryExample = readonly [korean: string, english: string, explanation: string]

export const introGlossary = {
  Nominal: {
    definition: 'A nominal is a noun or something that works like one. It can fill a sentence role such as subject or object.',
    examples: [
      ['음식이 맛있어요.', 'The food is delicious.', '음식 is a noun used as the subject.'],
      ['저는 먹어요.', 'I eat.', '저 is a pronoun used as the topic.'],
      ['걷기가 좋아요.', 'I like walking.', '걷기 is a verb made noun-like by -기.'],
    ],
  },
  Predicate: {
    definition: 'The predicate tells what happens, what something is like, or what it is. It normally comes at the end of its clause.',
    examples: [
      ['음식을 먹어요.', 'I eat food.', '먹어요 tells what the speaker does.'],
      ['음식이 매워요.', 'The food is spicy.', '매워요 describes the food.'],
      ['저는 학생이에요.', 'I’m a student.', '학생이에요 identifies the speaker.'],
    ],
  },
  Modifier: {
    definition: 'A modifier adds detail to another word or phrase.',
    examples: [
      ['매운 음식', 'spicy food', '매운 tells what kind of food.'],
      ['이 책', 'this book', '이 tells which book.'],
      ['천천히 먹어요.', 'I eat slowly.', '천천히 tells how the person eats.'],
    ],
  },
  Clause: {
    definition: 'A clause is a group of words organized around a predicate. It can stand alone or form part of another sentence.',
    examples: [
      ['비가 와요.', 'It’s raining.', 'This clause stands on its own. 와요 is its predicate.'],
      ['비가 오면 집에 있어요.', 'If it rains, I’ll stay home.', '비가 오면 is the clause that gives the condition.'],
      ['제가 읽은 책', 'the book I read', '제가 읽은 is a clause that describes 책.'],
    ],
  },
  Particles: {
    definition: 'Particles attach to a word or phrase to mark its role or add meaning. Some have two forms based on the preceding sound.',
    examples: [
      ['책 + 을 → 책을', 'book, marked as the object', '책 ends in a consonant, so the object marker is 을.'],
      ['집 + 에서 → 집에서', 'at home', '에서 marks the place where an action happens.'],
      ['저 + 도 → 저도', 'me too', '도 adds the meaning “also”.'],
    ],
  },
  Batchim: {
    definition: 'Batchim (받침) refers to the consonant letter or letters written at the bottom of a Hangul block.',
    examples: [
      ['가', 'ga', 'The block ends in a vowel and has no batchim.'],
      ['감', 'gam', 'ㅁ is the batchim.'],
      ['값', 'price', 'ㅂ and ㅅ form a double batchim.'],
    ],
  },
  Coda: {
    definition: 'The coda is the consonant position at the end of a spoken syllable. In a Hangul block, the bottom slot shows the written final consonants.',
    examples: [
      ['감 [감]', 'persimmon', 'The syllable ends in the /m/ sound.'],
      ['값 [갑]', 'price', 'Two final letters are written. In isolation the spoken coda is /p/.'],
      ['먹어요 [머거요]', 'eat', 'The ㄱ written at the bottom of 먹 becomes the beginning of the next spoken syllable.'],
    ],
  },
  Topic: {
    definition: 'A topic sets up what the sentence is about. Read 은/는 as “as for …” while learning. A topic can also be the subject or set up a contrast.',
    examples: [
      ['저는 집에서 먹어요.', 'I eat at home.', '저는 sets me as the topic. I’m also the person eating.'],
      ['오늘은 제가 요리해요.', 'Today I’m the one cooking.', '오늘은 sets today as the topic. 제가 identifies who cooks.'],
      ['저는 커피가 좋아요.', 'I like coffee.', '저는 frames this as my preference. 커피가 is the subject of 좋아요.'],
    ],
  },
  Subject: {
    definition: 'The subject is the person or thing the predicate describes. It can perform an action, have a quality, or exist.',
    examples: [
      ['제가 요리해요.', 'I cook.', '제가 identifies who cooks.'],
      ['음식이 매워요.', 'The food is spicy.', '음식이 identifies what has the quality.'],
      ['집에 고양이가 있어요.', 'There’s a cat at home.', '고양이가 identifies what exists.'],
    ],
  },
  Object: {
    definition: 'The object is what an action acts on or is directed at. 을/를 commonly marks it.',
    examples: [
      ['음식을 먹어요.', 'I eat food.', '음식을 is what gets eaten.'],
      ['책을 읽어요.', 'I read a book.', '책을 is what gets read.'],
      ['커피를 마셔요.', 'I drink coffee.', '커피를 is what gets drunk.'],
    ],
  },
  Verb: {
    definition: 'A verb expresses an action, an event, or a process. The verb stem takes endings to show things like tense and speech style.',
    examples: [
      ['먹다 → 먹어요', 'to eat → eat', '먹다 is an action that can take an object.'],
      ['오다 → 와요', 'to come → come', '오다 expresses motion and can stand without a direct object.'],
      ['되다 → 됐어요', 'to become → became', '되다 describes a change of state.'],
    ],
  },
  Noun: {
    definition: 'A noun names a person, place, thing, or idea. A noun can take a particle to show how it fits into the sentence.',
    examples: [
      ['음식', 'food', 'A common noun for something concrete.'],
      ['서울', 'Seoul', 'A proper noun naming a particular city.'],
      ['기쁨', 'joy', 'An abstract noun naming a feeling.'],
    ],
  },
  Adverb: {
    definition: 'An adverb adds information such as time, manner, or degree, often to a predicate.',
    examples: [
      ['빨리 먹어요.', 'I eat quickly.', '빨리 tells how the person eats.'],
      ['자주 만나요.', 'We meet often.', '자주 tells how frequently it happens.'],
      ['너무 매워요.', 'It’s too spicy.', '너무 tells how strong the spiciness is.'],
    ],
  },
  Pronoun: {
    definition: 'A pronoun can stand in for a person, thing, or place. Particles can mark its role.',
    examples: [
      ['저는 학생이에요.', 'I’m a student.', '저 is the humble first-person pronoun.'],
      ['이것이 좋아요.', 'I like this.', '이것 stands for the thing near the speaker.'],
      ['누가 왔어요?', 'Who came?', '누가 is the subject form of the question pronoun 누구.'],
    ],
  },
  Adjective: {
    definition: 'A Korean adjective describes a quality or state. It conjugates, so it can end a clause or take a form that describes a noun.',
    examples: [
      ['음식이 매워요.', 'The food is spicy.', '매워요 is the predicate form of 맵다.'],
      ['매운 음식', 'spicy food', '매운 is the noun-modifying form of 맵다.'],
      ['방이 조용했어요.', 'The room was quiet.', '조용했어요 gives the quality in the past.'],
    ],
  },
} as const satisfies Record<string, {
  definition: string
  examples: readonly [GlossaryExample, GlossaryExample, GlossaryExample]
}>

/** The only terms that open the Intro's grammar panel. */
export type IntroTerm = keyof typeof introGlossary

/** A category within a subgenre, with a Korean form or phrase and its English meaning. */
export type IntroType = readonly [type: string, korean: string, english: string]

export const nounTypes: readonly IntroType[] = [
  ['Common', '음식', 'food'],
  ['Proper', '서울', 'Seoul'],
  ['Independent', '책', 'book, a noun that can stand by itself'],
  ['Dependent (bound)', '갈 수 있어요.', 'I can go. 수 needs a preceding modifier, here 갈.'],
  ['Concrete', '사과', 'apple, something physical'],
  ['Abstract', '기쁨', 'joy, a feeling or idea'],
]

export const pronounTypes: readonly IntroType[] = [
  ['Personal', '저 / 너 / 우리', 'I (humble) / you (casual) / we'],
  ['Demonstrative', '이것 / 그것 / 저것', 'this thing / that thing / that thing over there'],
  ['Interrogative', '누구 / 무엇', 'who / what'],
  ['Indefinite', '누군가 / 무언가', 'someone / something'],
  ['Reflexive', '자기', 'oneself, referring back to someone in context'],
]

export const numeralTypes: readonly IntroType[] = [
  ['Native Korean cardinal', '하나 / 둘 / 셋', 'one / two / three. Common with counters and for hours.'],
  ['Sino-Korean cardinal', '일 / 이 / 삼', 'one / two / three. Common for dates, minutes, and prices.'],
  ['Ordinal', '첫째 / 둘째 / 세 번째', 'first / second / third'],
  ['Before a counter', '세 개', 'three items. 셋 changes to 세 before 개.'],
]

export const verbTypes: readonly IntroType[] = [
  ['Intransitive', '아기가 자요.', 'The baby sleeps. This verb takes no direct object.'],
  ['Transitive', '음식을 먹어요.', 'I eat food. The verb acts on an object.'],
  ['With a recipient', '친구에게 책을 줘요.', 'I give a book to a friend.'],
  ['Auxiliary', '먹어 봐요.', 'Try eating it. 봐요 adds the meaning “try”.'],
  ['Passive', '문이 닫혀요.', 'The door closes. 닫히다 is the passive of 닫다.'],
  ['Causative', '아기에게 밥을 먹여요.', 'I feed the baby. 먹이다 means “make or help someone eat”.'],
  ['Regular', '먹다 → 먹어요', 'eat. The stem 먹 stays the same.'],
  ['Irregular', '듣다 → 들어요', 'listen. The final ㄷ changes to ㄹ here.'],
]

export const adjectiveTypes: readonly IntroType[] = [
  ['Physical quality', '커요.', 'is big'],
  ['State', '바빠요.', 'is busy'],
  ['Evaluation', '좋아요.', 'is good or pleasing'],
  ['Auxiliary', '먹고 싶어요.', 'want to eat. 싶어요 expresses desire.'],
  ['Regular', '작다 → 작아요', 'is small. The stem 작 stays the same.'],
  ['Irregular', '맵다 → 매워요', 'is spicy. The ㅂ changes here.'],
  ['Before a noun', '맵다 → 매운 음식', 'spicy food. 매운 describes 음식.'],
]

export const modifierTypes: readonly IntroType[] = [
  ['Demonstrative determiner', '이 책', 'this book'],
  ['Quantity determiner', '세 사람', 'three people'],
  ['Descriptive determiner', '새 책', 'a new book'],
  ['Time or frequency adverb', '자주 만나요.', 'We meet often.'],
  ['Manner adverb', '빨리 먹어요.', 'I eat quickly.'],
  ['Degree adverb', '아주 매워요.', 'It’s very spicy.'],
  ['Negative adverb', '안 먹어요.', 'I don’t eat it.'],
  ['Connecting adverb', '그래서 집에 가요.', 'So I’m going home.'],
]

export const particleTypes: readonly IntroType[] = [
  ['Topic or contrast', '저 + 는 → 저는', 'as for me'],
  ['Subject', '친구 + 가 → 친구가', 'a friend, marked as the subject'],
  ['Object', '커피 + 를 → 커피를', 'coffee, marked as the object'],
  ['Other case roles', '집 + 에서 → 집에서', 'at home. 에서 marks where the action happens.'],
  ['Possession', '친구 + 의 → 친구의', 'a friend’s'],
  ['Addition or restriction', '저도 / 저만', 'me too / only me'],
  ['Noun connector', '책과 연필', 'a book and a pencil'],
]

export const conjugationTypes: readonly IntroType[] = [
  ['Speech style', '먹어 / 먹어요 / 먹습니다', 'eat, in casual / everyday polite / formal polite speech'],
  ['Tense', '먹어요 → 먹었어요', 'eat → ate'],
  ['Connect clauses', '먹고 쉬어요.', 'I eat and then rest.'],
  ['Modify a noun', '맵다 → 매운 음식', 'be spicy → spicy food'],
  ['Make an action noun-like', '걷다 → 걷기', 'walk → walking'],
  ['Honorific', '오다 → 오세요', 'come, with respect toward the person coming'],
]
