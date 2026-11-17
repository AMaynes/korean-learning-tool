/**
 * Overview & Purpose: Supply the Intro's glossary, word categories, and grammar application rules.
 *
 * Architectural Relationships: Rendered by the Intro view.
 *
 * External Resources: National Institute of Korean Language school grammar terminology.
 *
 * Notes: Tables distinguish the usual form from cases like particle stacking and nominalization.
 */


/** The exact part being taught, its English meaning, and why it fits. */
export type ExampleFocus = readonly [korean: string, english: string, reason: string]

/** One Korean example and its English translation, with the relevant part identified. */
type GlossaryExample = readonly [korean: string, english: string, focus: ExampleFocus]

export const introGlossary = {
  Nominal: {
    definition: 'A nominal is a noun or something that works like one. It can fill a sentence role such as subject or object.',
    examples: [
      ['음식이 맛있어요.', 'The food is delicious.', ['음식', 'food', 'is a nominal because it names a thing.']],
      ['저는 먹어요.', 'I eat.', ['저', 'I', 'is a nominal because it stands for the speaker.']],
      ['걷기가 좋아요.', 'I like walking.', ['걷기', 'walking', 'works like a noun because it names the action of walking.']],
    ],
  },
  Predicate: {
    definition: 'The predicate tells what happens, what something is like, or what it is. It normally comes at the end of its clause.',
    examples: [
      ['음식을 먹어요.', 'I eat food.', ['먹어요', 'eat', 'is the predicate because it tells what I do.']],
      ['음식이 매워요.', 'The food is spicy.', ['매워요', 'is spicy', 'is the predicate because it describes the food.']],
      ['저는 학생이에요.', 'I’m a student.', ['학생이에요', 'am a student', 'is the predicate because it tells what I am.']],
    ],
  },
  Modifier: {
    definition: 'A modifier adds detail to another word or phrase.',
    examples: [
      ['매운 음식', 'spicy food', ['매운', 'spicy', 'modifies the food by describing its taste.']],
      ['이 책', 'this book', ['이', 'this', 'modifies the noun by showing which book.']],
      ['천천히 먹어요.', 'I eat slowly.', ['천천히', 'slowly', 'modifies the action by showing how I eat.']],
    ],
  },
  Clause: {
    definition: 'A clause is a group of words organized around a predicate. It can stand alone or form part of another sentence.',
    examples: [
      ['비가 와요.', 'It’s raining.', ['비가 와요', 'it is raining', 'is a clause because it has a predicate.']],
      ['비가 오면 집에 있어요.', 'If it rains, I’ll stay home.', ['비가 오면', 'if it rains', 'is a clause that tells when I’ll stay home.']],
      ['제가 읽은 책', 'the book I read', ['제가 읽은', 'I read', 'is a clause that tells which book.']],
    ],
  },
  Particles: {
    definition: 'Particles attach to a word or phrase to mark its role or add meaning. Some have two forms based on the preceding sound.',
    examples: [
      ['책 + 을 → 책을', 'book, marked as the object', ['을', 'object marker', 'marks the book as the object.']],
      ['집 + 에서 → 집에서', 'at home', ['에서', 'at, where an action happens', 'marks where the action happens.']],
      ['저 + 도 → 저도', 'me too', ['도', 'also', 'adds the meaning “too”.']],
    ],
  },
  Batchim: {
    definition: 'Batchim (받침) refers to the consonant letter or letters written at the bottom of a Hangul block.',
    examples: [
      ['가', 'ga', ['가', 'ga', 'has no batchim because the bottom slot is empty.']],
      ['감', 'gam', ['ㅁ', 'm', 'is the batchim because it’s at the bottom of 감.']],
      ['값', 'price', ['ㅂ + ㅅ', 'b and s letters', 'are the double batchim at the bottom of 값.']],
    ],
  },
  Coda: {
    definition: 'The coda is the consonant position at the end of a spoken syllable. In a Hangul block, the bottom slot shows the written final consonants.',
    examples: [
      ['감 [감]', 'persimmon', ['ㅁ', 'm sound', 'is the coda because it ends the syllable.']],
      ['값 [갑]', 'price', ['ㅂ', 'p sound', 'is the coda because [갑] ends in a p sound.']],
      ['먹어요 [머거요]', 'eat', ['ㄱ', 'g sound here', 'starts the next syllable when you say 먹어요.']],
    ],
  },
  Topic: {
    definition: 'A topic sets up what the sentence is about. Read 은/는 as “as for …” while learning. A topic can also be the subject or set up a contrast.',
    examples: [
      ['저는 집에서 먹어요.', 'I eat at home.', ['저는', 'as for me', 'is the topic because I’m talking about myself.']],
      ['오늘은 제가 요리해요.', 'Today I’m the one cooking.', ['오늘은', 'as for today', 'is the topic because I’m talking about today.']],
      ['저는 커피가 좋아요.', 'I like coffee.', ['저는', 'as for me', 'is the topic because I’m talking about what I like.']],
    ],
  },
  Subject: {
    definition: 'The subject is the person or thing the predicate describes. It can perform an action, have a quality, or exist.',
    examples: [
      ['제가 요리해요.', 'I cook.', ['제가', 'I', 'is the subject because I cook.']],
      ['음식이 매워요.', 'The food is spicy.', ['음식이', 'the food', 'is the subject because the food is spicy.']],
      ['집에 고양이가 있어요.', 'There’s a cat at home.', ['고양이가', 'a cat', 'is the subject because the cat is there.']],
    ],
  },
  Object: {
    definition: 'The object is what an action acts on or is directed at. 을/를 commonly marks it.',
    examples: [
      ['음식을 먹어요.', 'I eat food.', ['음식을', 'food', 'is the object because it’s what I eat.']],
      ['책을 읽어요.', 'I read a book.', ['책을', 'a book', 'is the object because it’s what I read.']],
      ['커피를 마셔요.', 'I drink coffee.', ['커피를', 'coffee', 'is the object because it’s what I drink.']],
    ],
  },
  Verb: {
    definition: 'A verb expresses an action, an event, or a process. The verb stem takes endings to show things like tense and speech style.',
    examples: [
      ['먹다 → 먹어요', 'to eat → eat', ['먹다', 'to eat', 'is a verb because eating is an action.']],
      ['오다 → 와요', 'to come → come', ['오다', 'to come', 'is a verb because coming is an action.']],
      ['되다 → 됐어요', 'to become → became', ['되다', 'to become', 'is a verb because it shows a change.']],
    ],
  },
  Noun: {
    definition: 'A noun names a person, place, thing, or idea. A noun can take a particle to show how it fits into the sentence.',
    examples: [
      ['선생님이 와요.', 'The teacher is coming.', ['선생님', 'teacher', 'is a noun because it’s a person.']],
      ['서울에 가요.', 'I’m going to Seoul.', ['서울', 'Seoul', 'is a noun because it’s a place.']],
      ['기쁨을 느껴요.', 'I feel joy.', ['기쁨', 'joy', 'is a noun because it’s a feeling.']],
    ],
  },
  Determiner: {
    definition: 'A determiner goes directly before a noun to show which one, how many, or what kind.',
    examples: [
      ['이 책을 읽어요.', 'I read this book.', ['이', 'this', 'is a determiner because it points out which book.']],
      ['세 사람이 와요.', 'Three people are coming.', ['세', 'three', 'is a determiner because it tells how many people.']],
      ['새 책을 샀어요.', 'I bought a new book.', ['새', 'new', 'is a determiner because it says what kind of book.']],
    ],
  },
  Adverb: {
    definition: 'An adverb adds information such as time, manner, or degree, often to a predicate.',
    examples: [
      ['빨리 먹어요.', 'I eat quickly.', ['빨리', 'quickly', 'is an adverb because it tells how I eat.']],
      ['자주 만나요.', 'We meet often.', ['자주', 'often', 'is an adverb because it tells how often we meet.']],
      ['너무 매워요.', 'It’s too spicy.', ['너무', 'too', 'is an adverb because it tells how spicy the food is.']],
    ],
  },
  Pronoun: {
    definition: 'A pronoun can stand in for a person, thing, or place. Particles can mark its role.',
    examples: [
      ['저는 학생이에요.', 'I’m a student.', ['저', 'I', 'is a pronoun because it stands for the speaker.']],
      ['이것이 좋아요.', 'I like this.', ['이것', 'this thing', 'is a pronoun because it stands for a nearby thing.']],
      ['누가 왔어요?', 'Who came?', ['누가', 'who', 'is a pronoun because it stands for the person we’re asking about.']],
    ],
  },
  Adjective: {
    definition: 'A Korean adjective describes a quality or state. It conjugates, so it can end a clause or take a form that describes a noun.',
    examples: [
      ['음식이 매워요.', 'The food is spicy.', ['매워요', 'is spicy', 'is an adjective because it describes the taste.']],
      ['매운 음식', 'spicy food', ['매운', 'spicy', 'is an adjective because it describes the food.']],
      ['방이 조용했어요.', 'The room was quiet.', ['조용했어요', 'was quiet', 'is an adjective because it describes the room.']],
    ],
  },
} as const satisfies Record<string, {
  definition: string
  examples: readonly [GlossaryExample, GlossaryExample, GlossaryExample]
}>

/** The only terms that open the Intro's grammar panel. */
export type IntroTerm = keyof typeof introGlossary

/** A category within a subgenre, with a Korean form or phrase and its English meaning. */
export type IntroType = readonly [type: string, korean: string, english: string, focus?: ExampleFocus]

export const nounTypes: readonly IntroType[] = [
  ['Common', '음식', 'food', ['음식', 'food', 'is common because it names a general kind of thing.']],
  ['Proper', '서울', 'Seoul', ['서울', 'Seoul', 'is proper because it names a specific city.']],
  ['Independent', '책', 'book', ['책', 'book', 'is independent because it can stand alone.']],
  ['Dependent (bound)', '갈 수 있어요.', 'I can go.', ['수', 'way or possibility', 'is dependent because it needs a word before it, like 갈.']],
  ['Concrete', '사과', 'apple', ['사과', 'apple', 'is concrete because you can touch it.']],
  ['Abstract', '기쁨', 'joy', ['기쁨', 'joy', 'is abstract because it’s a feeling.']],
]

export const pronounTypes: readonly IntroType[] = [
  ['Personal', '저 / 너 / 우리', 'I (humble) / you (casual) / we', ['저 / 너 / 우리', 'I (humble) / you (casual) / we', 'stand for people.']],
  ['Demonstrative', '이것 / 그것 / 저것', 'this thing / that thing / that thing over there', ['이것 / 그것 / 저것', 'this thing / that thing / that thing over there', 'point out which thing.']],
  ['Interrogative', '누구 / 무엇', 'who / what', ['누구 / 무엇', 'who / what', 'ask who or what.']],
  ['Indefinite', '누군가 / 무언가', 'someone / something', ['누군가 / 무언가', 'someone / something', 'stand for someone or something unspecified.']],
  ['Reflexive', '자기', 'oneself', ['자기', 'oneself', 'refers back to someone already mentioned.']],
]

export const numeralTypes: readonly IntroType[] = [
  ['Native Korean cardinal', '하나 / 둘 / 셋', 'one / two / three', ['하나 / 둘 / 셋', 'one / two / three', 'count in native Korean.']],
  ['Sino-Korean cardinal', '일 / 이 / 삼', 'one / two / three', ['일 / 이 / 삼', 'one / two / three', 'count in Sino-Korean.']],
  ['Ordinal', '첫째 / 둘째 / 세 번째', 'first / second / third', ['첫째 / 둘째 / 세 번째', 'first / second / third', 'show position in an order.']],
  ['Before a counter', '세 개', 'three items', ['세', 'three', 'is the form of 셋 used before 개.']],
]

export const verbTypes: readonly IntroType[] = [
  ['Intransitive', '아기가 자요.', 'The baby sleeps.', ['자요', 'sleeps', 'has no direct object.']],
  ['Transitive', '음식을 먹어요.', 'I eat food.', ['먹어요', 'eat', 'has food as its direct object.']],
  ['With a recipient', '친구에게 책을 줘요.', 'I give a book to a friend.', ['줘요', 'give', 'has a recipient because the friend gets the book.']],
  ['Auxiliary', '먹어 봐요.', 'Try eating it.', ['봐요', 'try', 'adds the meaning “try”.']],
  ['Passive', '문이 닫혀요.', 'The door closes.', ['닫혀요', 'closes', 'is passive because the door gets closed.']],
  ['Causative', '아기에게 밥을 먹여요.', 'I feed the baby.', ['먹여요', 'feed', 'is causative because someone gets the baby to eat.']],
  ['Regular', '먹다 → 먹어요', 'to eat → eat', ['먹', 'eat', 'is regular because the stem stays the same.']],
  ['Irregular', '듣다 → 들어요', 'to listen → listen', ['듣', 'listen', 'is irregular because ㄷ changes to ㄹ.']],
]

export const adjectiveTypes: readonly IntroType[] = [
  ['Physical quality', '커요.', 'is big', ['커요', 'is big', 'describes size.']],
  ['State', '바빠요.', 'is busy', ['바빠요', 'is busy', 'describes how someone is doing.']],
  ['Evaluation', '좋아요.', 'is good or pleasing', ['좋아요', 'is good or pleasing', 'expresses an opinion.']],
  ['Auxiliary', '먹고 싶어요.', 'I want to eat.', ['싶어요', 'want to', 'adds the meaning “want to”.']],
  ['Regular', '작다 → 작아요', 'to be small → is small', ['작', 'small', 'is regular because the stem stays the same.']],
  ['Irregular', '맵다 → 매워요', 'to be spicy → is spicy', ['맵', 'spicy', 'is irregular because ㅂ changes in 매워요.']],
  ['Before a noun', '맵다 → 매운 음식', 'to be spicy → spicy food', ['매운', 'spicy', 'describes the noun 음식.']],
]

export const modifierTypes: readonly IntroType[] = [
  ['Demonstrative determiner', '이 책', 'this book', ['이', 'this', 'is a determiner because it points out which book.']],
  ['Quantity determiner', '세 사람', 'three people', ['세', 'three', 'is a determiner because it tells how many people.']],
  ['Descriptive determiner', '새 책', 'a new book', ['새', 'new', 'is a determiner because it says what kind of book.']],
  ['Time or frequency adverb', '자주 만나요.', 'We meet often.', ['자주', 'often', 'is an adverb because it tells how often we meet.']],
  ['Manner adverb', '빨리 먹어요.', 'I eat quickly.', ['빨리', 'quickly', 'is an adverb because it tells how I eat.']],
  ['Degree adverb', '아주 매워요.', 'It’s very spicy.', ['아주', 'very', 'is an adverb because it tells how spicy the food is.']],
  ['Negative adverb', '안 먹어요.', 'I don’t eat it.', ['안', 'not', 'is an adverb because it makes the action negative.']],
  ['Connecting adverb', '그래서 집에 가요.', 'So I’m going home.', ['그래서', 'so', 'links the result to what came before.']],
]

export const particleTypes: readonly IntroType[] = [
  ['Topic or contrast', '저 + 는 → 저는', 'as for me', ['는', 'topic marker', 'marks me as the topic.']],
  ['Subject', '친구 + 가 → 친구가', 'a friend, marked as the subject', ['가', 'subject marker', 'marks the friend as the subject.']],
  ['Object', '커피 + 를 → 커피를', 'coffee, marked as the object', ['를', 'object marker', 'marks coffee as the object.']],
  ['Other case roles', '집 + 에서 → 집에서', 'at home', ['에서', 'at, where an action happens', 'marks where the action happens.']],
  ['Possession', '친구 + 의 → 친구의', 'a friend’s', ['의', '’s, of', 'links the friend to what they own.']],
  ['Addition or restriction', '저도 / 저만', 'me too / only me', ['도 / 만', 'also / only', 'mean “also” and “only”.']],
  ['Noun connector', '책과 연필', 'a book and a pencil', ['과', 'and', 'joins two nouns.']],
]

export const conjugationTypes: readonly IntroType[] = [
  ['Speech style', '먹어 / 먹어요 / 먹습니다', 'eat in three speech styles', ['-어 / -어요 / -습니다', 'casual / polite / formal polite endings', 'make the same verb casual or polite.']],
  ['Tense', '먹어요 → 먹었어요', 'eat → ate', ['-었-', 'past marker', 'puts the action in the past.']],
  ['Connect clauses', '먹고 쉬어요.', 'I eat and then rest.', ['-고', 'and then here', 'links eating and resting.']],
  ['Modify a noun', '맵다 → 매운 음식', 'to be spicy → spicy food', ['매운', 'spicy', 'describes the noun 음식.']],
  ['Make an action noun-like', '걷다 → 걷기', 'to walk → walking', ['-기', '-ing here', 'lets “walking” act like a noun.']],
  ['Honorific', '오다 → 오세요', 'come, with respect toward the person coming', ['-시-', 'subject honorific', 'shows respect for the person coming.']],
]
