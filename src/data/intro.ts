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
      ['음식이 맛있어요.', 'The food is delicious.', ['음식', 'food', 'is a nominal because it names a thing and can fill the subject slot.']],
      ['저는 먹어요.', 'I eat.', ['저', 'I', 'is a nominal because the pronoun stands in for the speaker and can be the topic.']],
      ['걷기가 좋아요.', 'I like walking.', ['걷기', 'walking', 'is a nominal because -기 lets the action of walking fill a noun’s role.']],
    ],
  },
  Predicate: {
    definition: 'The predicate tells what happens, what something is like, or what it is. It normally comes at the end of its clause.',
    examples: [
      ['음식을 먹어요.', 'I eat food.', ['먹어요', 'eat', 'is the predicate because it says what the speaker does.']],
      ['음식이 매워요.', 'The food is spicy.', ['매워요', 'is spicy', 'is the predicate because it says what the food is like.']],
      ['저는 학생이에요.', 'I’m a student.', ['학생이에요', 'am a student', 'is the predicate because it says what the speaker is.']],
    ],
  },
  Modifier: {
    definition: 'A modifier adds detail to another word or phrase.',
    examples: [
      ['매운 음식', 'spicy food', ['매운', 'spicy', 'is a modifier because it describes the kind of food.']],
      ['이 책', 'this book', ['이', 'this', 'is a modifier because it points out which book.']],
      ['천천히 먹어요.', 'I eat slowly.', ['천천히', 'slowly', 'is a modifier because it tells how the person eats.']],
    ],
  },
  Clause: {
    definition: 'A clause is a group of words organized around a predicate. It can stand alone or form part of another sentence.',
    examples: [
      ['비가 와요.', 'It’s raining.', ['비가 와요', 'it is raining', 'is a clause because it is built around the predicate 와요 and can stand on its own.']],
      ['비가 오면 집에 있어요.', 'If it rains, I’ll stay home.', ['비가 오면', 'if it rains', 'is a clause because it has its own predicate, 오면, and gives the condition.']],
      ['제가 읽은 책', 'the book I read', ['제가 읽은', 'I read', 'is a clause because it has a subject and a predicate. It describes the book.']],
    ],
  },
  Particles: {
    definition: 'Particles attach to a word or phrase to mark its role or add meaning. Some have two forms based on the preceding sound.',
    examples: [
      ['책 + 을 → 책을', 'book, marked as the object', ['을', 'object marker', 'is a particle because it attaches to 책 and shows that the book is the object. 책 ends in a consonant, so use 을.']],
      ['집 + 에서 → 집에서', 'at home', ['에서', 'at, where an action happens', 'is a particle because it attaches to 집 and marks where the action happens.']],
      ['저 + 도 → 저도', 'me too', ['도', 'also', 'is a particle because it attaches to 저 and adds the meaning “too”.']],
    ],
  },
  Batchim: {
    definition: 'Batchim (받침) refers to the consonant letter or letters written at the bottom of a Hangul block.',
    examples: [
      ['가', 'ga', ['가', 'ga', 'has no batchim because the bottom consonant slot is empty.']],
      ['감', 'gam', ['ㅁ', 'm', 'is the batchim in 감 because it is the consonant letter at the bottom of the block.']],
      ['값', 'price', ['ㅂ + ㅅ', 'b and s letters', 'are a double batchim because both consonants are written at the bottom of 값.']],
    ],
  },
  Coda: {
    definition: 'The coda is the consonant position at the end of a spoken syllable. In a Hangul block, the bottom slot shows the written final consonants.',
    examples: [
      ['감 [감]', 'persimmon', ['ㅁ', 'm sound', 'is the coda because it closes the spoken syllable 감.']],
      ['값 [갑]', 'price', ['ㅂ', 'p sound', 'is the coda in spoken [갑] because it closes the syllable. The written block 값 has two final letters.']],
      ['먹어요 [머거요]', 'eat', ['ㄱ', 'g sound here', 'is written as the batchim in 먹. In [머거요] it starts 거, so it serves as the next syllable’s onset.']],
    ],
  },
  Topic: {
    definition: 'A topic sets up what the sentence is about. Read 은/는 as “as for …” while learning. A topic can also be the subject or set up a contrast.',
    examples: [
      ['저는 집에서 먹어요.', 'I eat at home.', ['저는', 'as for me', 'is the topic because 는 frames the sentence around the speaker, who is also the person eating.']],
      ['오늘은 제가 요리해요.', 'Today I’m the one cooking.', ['오늘은', 'as for today', 'is the topic because 은 frames the statement around today. 제가 identifies the person cooking.']],
      ['저는 커피가 좋아요.', 'I like coffee.', ['저는', 'as for me', 'is the topic because 는 frames this as the speaker’s preference. 커피가 is the subject of 좋아요.']],
    ],
  },
  Subject: {
    definition: 'The subject is the person or thing the predicate describes. It can perform an action, have a quality, or exist.',
    examples: [
      ['제가 요리해요.', 'I cook.', ['제가', 'I', 'is the subject because it identifies who cooks. 가 marks that role.']],
      ['음식이 매워요.', 'The food is spicy.', ['음식이', 'the food', 'is the subject because the predicate describes the food as spicy.']],
      ['집에 고양이가 있어요.', 'There’s a cat at home.', ['고양이가', 'a cat', 'is the subject because it identifies what exists at home.']],
    ],
  },
  Object: {
    definition: 'The object is what an action acts on or is directed at. 을/를 commonly marks it.',
    examples: [
      ['음식을 먹어요.', 'I eat food.', ['음식을', 'food', 'is the object because it names what the person eats.']],
      ['책을 읽어요.', 'I read a book.', ['책을', 'a book', 'is the object because it names what the person reads.']],
      ['커피를 마셔요.', 'I drink coffee.', ['커피를', 'coffee', 'is the object because it names what the person drinks.']],
    ],
  },
  Verb: {
    definition: 'A verb expresses an action, an event, or a process. The verb stem takes endings to show things like tense and speech style.',
    examples: [
      ['먹다 → 먹어요', 'to eat → eat', ['먹다', 'to eat', 'is a verb because it names the action of eating. 먹어요 is its polite form.']],
      ['오다 → 와요', 'to come → come', ['오다', 'to come', 'is a verb because it expresses movement. 와요 is its polite form.']],
      ['되다 → 됐어요', 'to become → became', ['되다', 'to become', 'is a verb because it describes a change. 됐어요 places that change in the past.']],
    ],
  },
  Noun: {
    definition: 'A noun names a person, place, thing, or idea. A noun can take a particle to show how it fits into the sentence.',
    examples: [
      ['선생님이 와요.', 'The teacher is coming.', ['선생님', 'teacher', 'is a noun because it names a person.']],
      ['서울에 가요.', 'I’m going to Seoul.', ['서울', 'Seoul', 'is a proper noun because it names one particular place.']],
      ['기쁨을 느껴요.', 'I feel joy.', ['기쁨', 'joy', 'is an abstract noun because it names a feeling.']],
    ],
  },
  Determiner: {
    definition: 'A determiner goes directly before a noun to show which one, how many, or what kind.',
    examples: [
      ['이 책을 읽어요.', 'I read this book.', ['이', 'this', 'is a determiner because it points out which book.']],
      ['세 사람이 와요.', 'Three people are coming.', ['세', 'three', 'is a determiner because it tells how many people.']],
      ['새 책을 샀어요.', 'I bought a new book.', ['새', 'new', 'is a determiner because it describes what kind of book directly before 책.']],
    ],
  },
  Adverb: {
    definition: 'An adverb adds information such as time, manner, or degree, often to a predicate.',
    examples: [
      ['빨리 먹어요.', 'I eat quickly.', ['빨리', 'quickly', 'is an adverb because it tells how the person eats.']],
      ['자주 만나요.', 'We meet often.', ['자주', 'often', 'is an adverb because it tells how frequently we meet.']],
      ['너무 매워요.', 'It’s too spicy.', ['너무', 'too', 'is an adverb because it tells the degree of spiciness.']],
    ],
  },
  Pronoun: {
    definition: 'A pronoun can stand in for a person, thing, or place. Particles can mark its role.',
    examples: [
      ['저는 학생이에요.', 'I’m a student.', ['저', 'I', 'is a pronoun because it refers to the speaker in place of their name.']],
      ['이것이 좋아요.', 'I like this.', ['이것', 'this thing', 'is a pronoun because it stands for the nearby thing without naming it.']],
      ['누가 왔어요?', 'Who came?', ['누구', 'who', 'is a pronoun because it stands for an unknown person. 누가 is its subject form here.']],
    ],
  },
  Adjective: {
    definition: 'A Korean adjective describes a quality or state. It conjugates, so it can end a clause or take a form that describes a noun.',
    examples: [
      ['음식이 매워요.', 'The food is spicy.', ['매워요', 'is spicy', 'is an adjective because it describes the food’s taste. It is the predicate form of 맵다.']],
      ['매운 음식', 'spicy food', ['매운', 'spicy', 'is a form of the adjective 맵다 because it describes the food’s taste. Here it modifies the noun 음식.']],
      ['방이 조용했어요.', 'The room was quiet.', ['조용했어요', 'was quiet', 'is an adjective because it describes the room’s quality. The ending puts that quality in the past.']],
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
  ['Common', '음식', 'food', ['음식', 'food', 'is common because it names a class of things.']],
  ['Proper', '서울', 'Seoul', ['서울', 'Seoul', 'is proper because it names one particular city.']],
  ['Independent', '책', 'book', ['책', 'book', 'is independent because it can stand by itself.']],
  ['Dependent (bound)', '갈 수 있어요.', 'I can go.', ['수', 'way or possibility', 'is dependent because it needs a preceding modifier. In this sentence 갈 modifies it.']],
  ['Concrete', '사과', 'apple', ['사과', 'apple', 'is concrete because it names a physical thing.']],
  ['Abstract', '기쁨', 'joy', ['기쁨', 'joy', 'is abstract because it names a feeling.']],
]

export const pronounTypes: readonly IntroType[] = [
  ['Personal', '저 / 너 / 우리', 'I (humble) / you (casual) / we', ['저 / 너 / 우리', 'I (humble) / you (casual) / we', 'are personal pronouns because they stand for the speaker, the listener, or a group.']],
  ['Demonstrative', '이것 / 그것 / 저것', 'this thing / that thing / that thing over there', ['이것 / 그것 / 저것', 'this thing / that thing / that thing over there', 'are demonstrative because they point out which thing is meant.']],
  ['Interrogative', '누구 / 무엇', 'who / what', ['누구 / 무엇', 'who / what', 'are interrogative because they stand for an unknown person or thing in a question.']],
  ['Indefinite', '누군가 / 무언가', 'someone / something', ['누군가 / 무언가', 'someone / something', 'are indefinite because they refer to an unspecified person or thing.']],
  ['Reflexive', '자기', 'oneself', ['자기', 'oneself', 'is reflexive because it refers back to someone already mentioned.']],
]

export const numeralTypes: readonly IntroType[] = [
  ['Native Korean cardinal', '하나 / 둘 / 셋', 'one / two / three', ['하나 / 둘 / 셋', 'one / two / three', 'are native Korean cardinals because they give quantities using the native number system.']],
  ['Sino-Korean cardinal', '일 / 이 / 삼', 'one / two / three', ['일 / 이 / 삼', 'one / two / three', 'are Sino-Korean cardinals because they give quantities using the Chinese-derived number system.']],
  ['Ordinal', '첫째 / 둘째 / 세 번째', 'first / second / third', ['첫째 / 둘째 / 세 번째', 'first / second / third', 'are ordinals because they express position in an order.']],
  ['Before a counter', '세 개', 'three items', ['세', 'three', 'is the form of 셋 used before the counter 개.']],
]

export const verbTypes: readonly IntroType[] = [
  ['Intransitive', '아기가 자요.', 'The baby sleeps.', ['자요', 'sleeps', 'is intransitive because it gives an action with no direct object.']],
  ['Transitive', '음식을 먹어요.', 'I eat food.', ['먹어요', 'eat', 'is transitive because it takes 음식 as its direct object.']],
  ['With a recipient', '친구에게 책을 줘요.', 'I give a book to a friend.', ['줘요', 'give', 'takes a recipient because giving involves passing something to someone. 친구에게 identifies who gets it.']],
  ['Auxiliary', '먹어 봐요.', 'Try eating it.', ['봐요', 'try', 'is an auxiliary because it adds “try” to the action 먹어.']],
  ['Passive', '문이 닫혀요.', 'The door closes.', ['닫혀요', 'closes', 'is passive because the door undergoes the action. The base form 닫히다 comes from 닫다.']],
  ['Causative', '아기에게 밥을 먹여요.', 'I feed the baby.', ['먹여요', 'feed', 'is causative because it means causing or helping the baby to eat.']],
  ['Regular', '먹다 → 먹어요', 'to eat → eat', ['먹', 'eat', 'is a regular verb stem because it stays the same when -어요 is added.']],
  ['Irregular', '듣다 → 들어요', 'to listen → listen', ['듣', 'listen', 'is irregular because its last consonant changes from ㄷ to ㄹ before -어요.']],
]

export const adjectiveTypes: readonly IntroType[] = [
  ['Physical quality', '커요.', 'is big', ['커요', 'is big', 'is a physical adjective because it describes size.']],
  ['State', '바빠요.', 'is busy', ['바빠요', 'is busy', 'is an adjective of state because it says what condition someone is in.']],
  ['Evaluation', '좋아요.', 'is good or pleasing', ['좋아요', 'is good or pleasing', 'is evaluative because it expresses a judgment or preference.']],
  ['Auxiliary', '먹고 싶어요.', 'I want to eat.', ['싶어요', 'want to', 'is an auxiliary adjective because it adds the state of wanting to the action 먹고.']],
  ['Regular', '작다 → 작아요', 'to be small → is small', ['작', 'small', 'is a regular adjective stem because it stays the same when -아요 is added.']],
  ['Irregular', '맵다 → 매워요', 'to be spicy → is spicy', ['맵', 'spicy', 'is irregular because its ㅂ changes in the form 매워요.']],
  ['Before a noun', '맵다 → 매운 음식', 'to be spicy → spicy food', ['매운', 'spicy', 'is the noun-modifying form because it goes before 음식 and describes it.']],
]

export const modifierTypes: readonly IntroType[] = [
  ['Demonstrative determiner', '이 책', 'this book', ['이', 'this', 'is a determiner because it points to which 책 directly before the noun.']],
  ['Quantity determiner', '세 사람', 'three people', ['세', 'three', 'is a determiner because it tells how many people directly before 사람.']],
  ['Descriptive determiner', '새 책', 'a new book', ['새', 'new', 'is a determiner because it describes 책 directly before the noun.']],
  ['Time or frequency adverb', '자주 만나요.', 'We meet often.', ['자주', 'often', 'is an adverb because it tells how frequently we meet.']],
  ['Manner adverb', '빨리 먹어요.', 'I eat quickly.', ['빨리', 'quickly', 'is an adverb because it tells how the person eats.']],
  ['Degree adverb', '아주 매워요.', 'It’s very spicy.', ['아주', 'very', 'is an adverb because it tells how strong the spiciness is.']],
  ['Negative adverb', '안 먹어요.', 'I don’t eat it.', ['안', 'not', 'is an adverb because it makes the following action negative.']],
  ['Connecting adverb', '그래서 집에 가요.', 'So I’m going home.', ['그래서', 'so', 'is a connecting adverb because it introduces the result of what was just said.']],
]

export const particleTypes: readonly IntroType[] = [
  ['Topic or contrast', '저 + 는 → 저는', 'as for me', ['는', 'topic marker', 'is a topic particle because it frames the sentence around the speaker.']],
  ['Subject', '친구 + 가 → 친구가', 'a friend, marked as the subject', ['가', 'subject marker', 'is a subject particle because it shows what the predicate is about grammatically.']],
  ['Object', '커피 + 를 → 커피를', 'coffee, marked as the object', ['를', 'object marker', 'is an object particle because it marks coffee as what the action is directed at.']],
  ['Other case roles', '집 + 에서 → 집에서', 'at home', ['에서', 'at, where an action happens', 'is a location particle because it shows where an action takes place.']],
  ['Possession', '친구 + 의 → 친구의', 'a friend’s', ['의', '’s, of', 'is a possessive particle because it can link an owner to what follows.']],
  ['Addition or restriction', '저도 / 저만', 'me too / only me', ['도 / 만', 'also / only', 'are particles that add someone to a group or limit the group to that person.']],
  ['Noun connector', '책과 연필', 'a book and a pencil', ['과', 'and', 'is a connecting particle because it joins the two nouns.']],
]

export const conjugationTypes: readonly IntroType[] = [
  ['Speech style', '먹어 / 먹어요 / 먹습니다', 'eat in three speech styles', ['-어 / -어요 / -습니다', 'casual / polite / formal polite endings', 'give the same verb different levels of formality or politeness.']],
  ['Tense', '먹어요 → 먹었어요', 'eat → ate', ['-었-', 'past marker', 'moves the action into the past in 먹었어요.']],
  ['Connect clauses', '먹고 쉬어요.', 'I eat and then rest.', ['-고', 'and then here', 'connects eating to the next clause about resting.']],
  ['Modify a noun', '맵다 → 매운 음식', 'to be spicy → spicy food', ['매운', 'spicy', 'is the form of 맵다 that can describe 음식 directly before it.']],
  ['Make an action noun-like', '걷다 → 걷기', 'to walk → walking', ['-기', '-ing here', 'lets 걷기 act like a noun.']],
  ['Honorific', '오다 → 오세요', 'come, with respect toward the person coming', ['-시-', 'subject honorific', 'shows respect for the person coming in 오세요.']],
]
