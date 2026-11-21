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
export type GlossaryExample = readonly [korean: string, english: string, focus: ExampleFocus]

type GlossaryEntry = {
  definition: string
  examples: readonly [GlossaryExample, GlossaryExample, GlossaryExample]
}

const nounGlossary = {
  'Common (general entities)': {
    definition: 'A common noun names a general kind of person, place, or thing.',
    examples: [
      ['음식', 'food', ['음식', 'food', 'is a common noun because it names food in general.']],
      ['선생님', 'teacher', ['선생님', 'teacher', 'is a common noun because it can mean any teacher.']],
      ['학교', 'school', ['학교', 'school', 'is a common noun because it can mean any school.']],
    ],
  },
  'Proper (specific names)': {
    definition: 'A proper noun is the name of a particular person, place, or thing.',
    examples: [
      ['서울', 'Seoul', ['서울', 'Seoul', 'is a proper noun because it names a specific city.']],
      ['부산', 'Busan', ['부산', 'Busan', 'is a proper noun because it names a specific city.']],
      ['한강', 'Han River', ['한강', 'Han River', 'is a proper noun because it names a specific river.']],
    ],
  },
  'Dependent (requires a modifier)': {
    definition: 'A dependent noun needs a word or phrase before it to complete its meaning.',
    examples: [
      ['갈 수 있어요.', 'I can go.', ['수', 'way or ability', 'is the dependent noun. 갈 tells you what you can do.']],
      ['마실 것', 'something to drink', ['것', 'thing', 'is the dependent noun. 마실 tells you what kind of thing.']],
      ['본 적이 있어요.', 'I’ve seen it before.', ['적', 'past experience', 'is the dependent noun. 본 tells you what you’ve done before.']],
    ],
  },
  'Concrete (physical entities)': {
    definition: 'A concrete noun names something physical.',
    examples: [
      ['사과', 'apple', ['사과', 'apple', 'is a concrete noun because you can hold it.']],
      ['책', 'book', ['책', 'book', 'is a concrete noun because you can hold it.']],
      ['연필', 'pencil', ['연필', 'pencil', 'is a concrete noun because you can hold it.']],
    ],
  },
  'Abstract (concepts)': {
    definition: 'An abstract noun names a feeling, quality, or idea.',
    examples: [
      ['기쁨', 'joy', ['기쁨', 'joy', 'is an abstract noun because it’s a feeling.']],
      ['사랑', 'love', ['사랑', 'love', 'is an abstract noun because it’s a feeling.']],
      ['자유', 'freedom', ['자유', 'freedom', 'is an abstract noun because it’s an idea.']],
    ],
  },
} as const satisfies Record<string, GlossaryEntry>

const pronounGlossary = {
  Personal: {
    definition: 'Personal pronouns stand for people, including the speaker and listener.',
    examples: [
      ['저는 학생이에요.', 'I’m a student.', ['저', 'I', 'is the humble personal pronoun for the speaker.']],
      ['너는 학생이야?', 'Are you a student?', ['너', 'you', 'is the casual personal pronoun for the listener.']],
      ['우리는 먹어요.', 'We eat.', ['우리', 'we', 'is the personal pronoun for the speaker’s group.']],
    ],
  },
  Demonstrative: {
    definition: 'Demonstrative pronouns point to a thing.',
    examples: [
      ['이것이 좋아요.', 'I like this.', ['이것', 'this thing', 'is a demonstrative pronoun for something near the speaker.']],
      ['그것을 골라요.', 'I choose that.', ['그것', 'that thing', 'is a demonstrative pronoun for something near the listener or already mentioned.']],
      ['저것은 책이에요.', 'That over there is a book.', ['저것', 'that thing over there', 'is a demonstrative pronoun for something farther away.']],
    ],
  },
  Interrogative: {
    definition: 'Interrogative pronouns stand for the person, thing, or place you ask about.',
    examples: [
      ['누가 왔어요?', 'Who came?', ['누가', 'who', 'is the subject form of the interrogative pronoun 누구.']],
      ['무엇을 먹어요?', 'What are you eating?', ['무엇', 'what', 'is the interrogative pronoun for the thing being eaten.']],
      ['어디에 가요?', 'Where are you going?', ['어디', 'where', 'is the interrogative pronoun for the destination.']],
    ],
  },
  Indefinite: {
    definition: 'Indefinite pronouns stand for an unspecified person, thing, or place.',
    examples: [
      ['누군가 왔어요.', 'Someone came.', ['누군가', 'someone', 'is an indefinite pronoun because the person is unspecified.']],
      ['무언가 있어요.', 'Something is there.', ['무언가', 'something', 'is an indefinite pronoun because the thing is unspecified.']],
      ['어딘가 가고 싶어요.', 'I want to go somewhere.', ['어딘가', 'somewhere', 'is an indefinite pronoun because the place is unspecified.']],
    ],
  },
  Reflexive: {
    definition: 'A reflexive pronoun refers back to someone in the sentence.',
    examples: [
      ['민수는 자기 책을 읽어요.', 'Minsu reads his own book.', ['자기', 'one’s own', 'is the reflexive pronoun referring back to Minsu.']],
      ['지수는 자기 방을 청소해요.', 'Jisu cleans her own room.', ['자기', 'one’s own', 'is the reflexive pronoun referring back to Jisu.']],
      ['친구는 자기 이름을 써요.', 'My friend writes their own name.', ['자기', 'one’s own', 'is the reflexive pronoun referring back to my friend.']],
    ],
  },
} as const satisfies Record<string, GlossaryEntry>

const numeralGlossary = {
  'Native Korean cardinal': {
    definition: 'Native Korean cardinal numbers say how many.',
    examples: [
      ['하나', 'one', ['하나', 'one', 'is the native Korean number for one.']],
      ['둘', 'two', ['둘', 'two', 'is the native Korean number for two.']],
      ['셋', 'three', ['셋', 'three', 'is the native Korean number for three.']],
    ],
  },
  'Sino-Korean cardinal': {
    definition: 'Use Sino-Korean numbers for dates, money, minutes, seconds, phone numbers, and measurements. Native Korean numbers are common for counting things and people, age with 살, and clock hours with 시.',
    examples: [
      ['삼 분', 'three minutes', ['삼', 'three', 'is Sino-Korean because minutes use this system. 분 means minutes.']],
      ['삼천 원', '3,000 won', ['삼천', 'three thousand', 'is Sino-Korean because prices use this system. 원 is the currency unit.']],
      ['삼월', 'March', ['삼', 'three', 'is Sino-Korean because calendar months use this system. 월 means month.']],
    ],
  },
  Ordinal: {
    definition: 'Ordinal numbers tell you where something comes in order.',
    examples: [
      ['첫째', 'first', ['첫째', 'first', 'is the ordinal for position one.']],
      ['둘째', 'second', ['둘째', 'second', 'is the ordinal for position two.']],
      ['세 번째', 'third', ['세 번째', 'third', 'is the ordinal for position three.']],
    ],
  },
  'Before a counter': {
    definition: 'Some native Korean numbers change form before a counter.',
    examples: [
      ['세 개', 'three items', ['세', 'three', 'is the form of 셋 before the item counter 개.']],
      ['한 명', 'one person', ['한', 'one', 'is the form of 하나 before the people counter 명.']],
      ['두 권', 'two books', ['두', 'two', 'is the form of 둘 before the book counter 권.']],
    ],
  },
} as const satisfies Record<string, GlossaryEntry>

const verbGlossary = {
  'Dark-vowel verbs': {
    definition: 'In the regular 아/어 pattern, use 어 when the last vowel of the stem is something other than ㅏ or ㅗ. Vowels can combine.',
    examples: [
      ['먹다 → 먹어요', 'to eat → eat', ['먹 + -어요', 'eat', 'shows the stem 먹 taking -어요 because its vowel is ㅓ.']],
      ['읽다 → 읽어요', 'to read → read', ['읽 + -어요', 'read', 'shows the stem 읽 taking -어요 because its vowel is ㅣ.']],
      ['마시다 → 마셔요', 'to drink → drink', ['시 + -어 → 셔', 'drink', 'shows ㅣ and ㅓ combining in the verb 마시다.']],
    ],
  },
  'Light-vowel verbs': {
    definition: 'In the regular 아/어 pattern, use 아 when the last vowel of the stem is ㅏ or ㅗ. Vowels can combine.',
    examples: [
      ['받다 → 받아요', 'to receive → receive', ['받 + -아요', 'receive', 'shows the stem 받 taking -아요 because its vowel is ㅏ.']],
      ['가다 → 가요', 'to go → go', ['가 + -아 → 가', 'go', 'shows the stem vowel and ending combining into one ㅏ.']],
      ['오다 → 와요', 'to come → come', ['오 + -아 → 와', 'come', 'shows ㅗ and ㅏ combining into ㅘ.']],
    ],
  },
  'Irregular verbs (shapeshifting)': {
    definition: 'Some verb stems change in a special way with certain endings. Learn the change with the verb.',
    examples: [
      ['듣다 → 들어요', 'to listen → listen', ['듣 → 들', 'listen', 'shows the irregular ㄷ changing to ㄹ before -어요.']],
      ['돕다 → 도와요', 'to help → help', ['돕 → 도와요', 'help', 'shows the irregular ㅂ changing before the vowel ending.']],
      ['모르다 → 몰라요', 'to not know → don’t know', ['모르 → 몰라요', 'don’t know', 'shows the irregular 르 pattern adding ㄹ to the syllable before 르.']],
    ],
  },
  'Do verbs (hada)': {
    definition: '하다 means “to do.” It and verbs that end in -하다, like 공부하다 (to study), change 하다 to 해요 in everyday polite speech.',
    examples: [
      ['하다 → 해요', 'to do → do', ['하다 → 해요', 'do', 'shows 하여 shortening to 해 before 요.']],
      ['공부하다 → 공부해요', 'to study → study', ['해요', 'do', 'is the conjugated 하다 part of 공부하다.']],
      ['운동하다 → 운동해요', 'to exercise → exercise', ['해요', 'do', 'is the conjugated 하다 part of 운동하다.']],
    ],
  },
} as const satisfies Record<string, GlossaryEntry>

export const introGlossary = {
  ...nounGlossary,
  ...pronounGlossary,
  ...numeralGlossary,
  ...verbGlossary,
  Nominal: {
    definition: 'A nominal is a noun or something that works like one. It can fill a sentence role such as subject or object.',
    examples: [
      ['음식이 맛있어요.', 'The food is delicious.', ['음식', 'food', 'is a nominal because it names a thing.']],
      ['저는 먹어요.', 'I eat.', ['저', 'I', 'is a nominal because it stands for the speaker.']],
      ['걷기가 좋아요.', 'I like walking.', ['걷기', 'walking', 'is a nominal because it names the action of walking.']],
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
      ['매운 음식', 'spicy food', ['매운', 'spicy', 'is the modifier because it describes the food’s taste.']],
      ['이 책', 'this book', ['이', 'this', 'is the modifier because it shows which book.']],
      ['천천히 먹어요.', 'I eat slowly.', ['천천히', 'slowly', 'is the modifier because it shows how I eat.']],
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
      ['책 + 을 → 책을', 'book, marked as the object', ['을', 'object marker', 'is the particle that marks the book as the object.']],
      ['집 + 에서 → 집에서', 'at home', ['에서', 'at, where an action happens', 'is the particle that marks where the action happens.']],
      ['저 + 도 → 저도', 'me too', ['도', 'also', 'is the particle that means “too”.']],
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
} as const satisfies Record<string, GlossaryEntry>

/** The only terms that open the Intro's grammar panel. */
export type IntroTerm = keyof typeof introGlossary

/** A category within a subgenre, with a Korean form or phrase and its English meaning. */
export type IntroType = readonly [type: string, korean: string, english: string, focus: ExampleFocus]

/** Show the first of each subtype’s three examples in its lesson table. */
function firstExamples(glossary: Readonly<Record<string, GlossaryEntry>>): IntroType[] {
  return Object.entries(glossary).map(([label, { examples: [[korean, english, focus]] }]) => [label, korean, english, focus])
}

export const nounTypes = firstExamples(nounGlossary)
export const pronounTypes = firstExamples(pronounGlossary)
export const numeralTypes = firstExamples(numeralGlossary)
export const verbTypes = firstExamples(verbGlossary)

export const modifierTypes: readonly IntroType[] = [
  ['Demonstrative determiner', '이 책', 'this book', ['이', 'this', 'is a determiner because it points out which book.']],
  ['Quantity determiner', '세 사람', 'three people', ['세', 'three', 'is a determiner because it tells how many people.']],
  ['Descriptive determiner', '새 책', 'a new book', ['새', 'new', 'is a determiner because it says what kind of book.']],
  ['Time or frequency adverb', '자주 만나요.', 'We meet often.', ['자주', 'often', 'is an adverb because it tells how often we meet.']],
  ['Manner adverb', '빨리 먹어요.', 'I eat quickly.', ['빨리', 'quickly', 'is an adverb because it tells how I eat.']],
  ['Degree adverb', '아주 매워요.', 'It’s very spicy.', ['아주', 'very', 'is an adverb because it tells how spicy the food is.']],
  ['Negative adverb', '안 먹어요.', 'I don’t eat it.', ['안', 'not', 'is an adverb because it makes the action negative.']],
  ['Connecting adverb', '그래서 집에 가요.', 'So I’m going home.', ['그래서', 'so', 'is the connecting adverb because it links this result to what came before.']],
]

export const particleTypes: readonly IntroType[] = [
  ['Topic or contrast', '저 + 는 → 저는', 'as for me', ['는', 'topic marker', 'is the particle that marks me as the topic.']],
  ['Subject', '친구 + 가 → 친구가', 'a friend, marked as the subject', ['가', 'subject marker', 'is the particle that marks the friend as the subject.']],
  ['Object', '커피 + 를 → 커피를', 'coffee, marked as the object', ['를', 'object marker', 'is the particle that marks coffee as the object.']],
  ['Other case roles', '집 + 에서 → 집에서', 'at home', ['에서', 'at, where an action happens', 'is the particle that marks where the action happens.']],
  ['Possession', '친구 + 의 → 친구의', 'a friend’s', ['의', '’s, of', 'is the particle that shows what the friend owns.']],
  ['Addition or restriction', '저도 / 저만', 'me too / only me', ['도 / 만', 'also / only', 'are the particles that mean “also” and “only”.']],
  ['Noun connector', '책과 연필', 'a book and a pencil', ['과', 'and', 'is the particle that joins two nouns.']],
]

export const conjugationRules = [
  ['Say that you do one thing and then another', 'Use -고 (and, or and then) on the first action. Attach 고 directly to its stem, then say the second action.', [
    [['먹', 'eat'], ['고', 'and then'], ['먹고', 'eat and then…']],
    [['먹고', 'I eat and then…'], ['쉰다', 'I rest'], ['먹고 쉰다', 'I eat and then rest']],
  ]],
  ['Say what you do in casual speech', 'Check the last vowel in the stem. Use -아 for ㅏ or ㅗ and -어 for other regular vowels. Matching vowels can merge. Words ending in 하다 use 해.', [
    [['가', 'go'], ['아', 'casual ending'], ['가', 'I go']],
    [['먹', 'eat'], ['어', 'casual ending'], ['먹어', 'I eat']],
    [['하', 'do'], ['여', 'casual ending'], ['해', 'I do']],
  ]],
  ['Say what happens if a condition is met', 'For -(으)면, add 면 after a vowel or final ㄹ. Add 으면 after other regular final consonants.', [
    [['살', 'live'], ['면', 'if'], ['살면', 'if I live']],
    [['먹', 'eat'], ['으면', 'if'], ['먹으면', 'if I eat']],
  ]],
  ['Say “I listen” with the irregular verb 듣다', 'The stem of 듣다 changes from 듣 to 들 before a vowel ending. It keeps ㄷ before -고.', [
    [['듣', 'listen'], ['어', 'casual ending'], ['들어', 'I listen']],
    [['듣', 'listen'], ['고', 'and then'], ['듣고', 'listen and then…']],
  ]],
  ['Make a formal polite statement', 'For a formal polite statement, add ㅂ니다 after a vowel or 습니다 after a consonant. A final ㄹ drops before ㅂ니다.', [
    [['살', 'live'], ['ㅂ니다', 'formal polite ending'], ['삽니다', 'I live']],
    [['먹', 'eat'], ['습니다', 'formal polite ending'], ['먹습니다', 'I eat']],
  ]],
] as const

/** Short English meanings for the Korean words used in the Intro examples. */
export const introWordMeanings: Readonly<Record<string, string>> = {
  '-어요': 'polite ending',
  가: 'subject marker',
  가고: 'go',
  가다: 'to go',
  가면: 'if I go',
  가요: 'go',
  갈: 'to go',
  감: 'persimmon',
  값: 'price',
  같이: 'together',
  것: 'thing',
  개: 'item counter',
  개를: 'items',
  공부하다: 'to study',
  공부해요: 'study',
  거예요: 'will',
  건강하기가: 'being healthy',
  걷기: 'walking',
  걷기가: 'walking',
  걷다: 'to walk',
  고양이가: 'a cat',
  골라요: 'choose',
  곰: 'bear',
  권: 'book counter',
  그것: 'that thing',
  그것을: 'that thing',
  그래서: 'so',
  기쁨: 'joy',
  기쁨을: 'joy',
  너: 'you',
  너는: 'you (casual)',
  너무: 'too',
  네: 'yes',
  누가: 'who',
  누구: 'who',
  누군가: 'someone',
  느껴요: 'feel',
  는: 'topic marker',
  닫혀요: 'closes',
  도: 'also',
  도와요: 'help',
  돕다: 'to help',
  됐어요: 'became',
  되다: 'to become',
  두: 'two',
  둘: 'two',
  둘이: 'two people',
  둘째: 'second',
  듣다: 'to listen',
  들어요: 'listen',
  를: 'object marker',
  마셔요: 'drink',
  마시다: 'to drink',
  마실: 'to drink',
  만나요: 'meet',
  맛있어요: 'is delicious',
  매운: 'spicy',
  매워요: 'is spicy',
  맵다: 'to be spicy',
  맵지는: 'as for being spicy',
  먹고: 'eat and then',
  먹다: 'to eat',
  먹습니다: 'eat, formal polite',
  먹어: 'eat, casual',
  먹어서: 'because I eat',
  먹어요: 'eat',
  먹었어요: 'ate',
  먹여요: 'feed',
  먹으면: 'if I eat',
  먹을: 'eat, future form',
  먹을까요: 'shall we eat',
  먹지: 'eat',
  먹지는: 'as for eating',
  명: 'people counter',
  모르다: 'to not know',
  몫: 'share',
  몰라요: 'don’t know',
  무언가: 'something',
  무엇: 'what',
  무엇을: 'what',
  문이: 'the door',
  물: 'water',
  뭘: 'what',
  민수는: 'Minsu',
  바빠요: 'is busy',
  받다: 'to receive',
  받아요: 'receive',
  밥을: 'rice',
  방을: 'the room',
  방이: 'the room',
  번째: 'in order',
  본: 'seen',
  부산: 'Busan',
  봐요: 'try',
  비가: 'rain',
  빨리: 'quickly',
  사과: 'apple',
  사랑: 'love',
  사람: 'person',
  사람을: 'people',
  사람이: 'people',
  삼: 'three',
  샀어요: 'bought',
  새: 'new',
  서울: 'Seoul',
  서울에: 'to Seoul',
  선생님: 'teacher',
  선생님이: 'the teacher',
  세: 'three',
  셋: 'three',
  수: 'way or ability',
  쉬어요: 'rest',
  십: 'ten',
  싶어요: 'want to',
  써요: 'write',
  아기가: 'the baby',
  아기에게: 'to the baby',
  아니요: 'no',
  아주: 'very',
  아직도: 'still',
  안: 'not',
  않아요: 'don’t',
  어디에: 'where to',
  어딘가: 'somewhere',
  어렵다: 'is hard',
  에서: 'at, where something happens',
  연필: 'pencil',
  오늘: 'today',
  오늘은: 'as for today',
  오다: 'to come',
  오면: 'if it comes',
  오세요: 'come, honorific',
  와: 'wow',
  와요: 'comes',
  왔어요: 'came',
  요리해요: 'cook',
  우리: 'we',
  우리는: 'we',
  운동하다: 'to exercise',
  운동해요: 'exercise',
  을: 'object marker',
  음식: 'food',
  음식을: 'food',
  음식이: 'the food',
  의: '’s, of',
  이: 'this',
  이것: 'this thing',
  이것이: 'this thing',
  이다: 'to be',
  이름을: 'name',
  일: 'one',
  읽다: 'to read',
  읽어요: 'read',
  읽은: 'read, describing a noun',
  있어요: 'is there',
  자기: 'oneself',
  자유: 'freedom',
  자요: 'sleeps',
  자주: 'often',
  작다: 'to be small',
  작아요: 'is small',
  저: 'I',
  저것: 'that thing over there',
  저것은: 'that thing over there',
  저기요: 'excuse me',
  저는: 'as for me',
  저도: 'me too',
  저만: 'only me',
  저를: 'me, marked as the object',
  적이: 'past experience',
  제: 'I',
  제가: 'I',
  조용했어요: 'was quiet',
  좋아요: 'is good',
  주세요: 'please do it',
  줘요: 'give',
  지수는: 'Jisu',
  집: 'home',
  집에: 'at home',
  집에서: 'at home',
  집에서는: 'as for at home',
  책: 'book',
  책과: 'book and',
  책을: 'a book',
  책이에요: 'is a book',
  천천히: 'slowly',
  첫째: 'first',
  청소해요: 'clean',
  친구: 'friend',
  친구가: 'a friend',
  친구는: 'my friend',
  친구에게: 'to a friend',
  친구의: 'a friend’s',
  커요: 'is big',
  커피: 'coffee',
  커피가: 'coffee',
  커피를: 'coffee',
  크지: 'be big',
  하나: 'one',
  하다: 'to do',
  학교: 'school',
  학생이다: 'to be a student',
  학생이야: 'are a student',
  학생이에요: 'am a student',
  한: 'one',
  한강: 'Han River',
  해요: 'do',
  분: 'minutes',
  삼천: 'three thousand',
  삼월: 'March',
  원: 'won',
}
