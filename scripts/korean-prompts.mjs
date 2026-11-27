/** Enumerate audio using the same alphabet and sentence generator as the learner. */
import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { hangulAlphabet } = await server.ssrLoadModule('/src/engine/pronunciation.ts')
  const { generate, recallCard } = await server.ssrLoadModule('/src/engine/exercises.ts')
  const { activeLists, selectableLists } = await server.ssrLoadModule('/src/engine/registry.ts')
  const active = activeLists(Object.fromEntries(selectableLists.filter(list => list.id.endsWith('-all')).map(list => [list.category, list.id])))
  const prompts = new Set([...hangulAlphabet.vowels, ...hangulAlphabet.consonants].map(card => card.sound))
  const { readingAudioPrompts } = await server.ssrLoadModule('/src/engine/readingPassages.ts')
  for (const text of readingAudioPrompts) prompts.add(text)
  for (const list of selectableLists) {
    for (const entry of list.entries) prompts.add(recallCard(list.category, entry, 'ko-to-en').prompt)
  }
  // Subject choice and particle availability can change an utterance even when the same words are active.
  for (const pronouns of selectableLists.filter(list => list.category === 'pronouns')) {
    for (const particles of selectableLists.filter(list => list.category === 'particles')) {
      for (const mode of ['dictation', 'conversation']) {
        for (const exercise of generate(mode, { ...active, pronouns, particles })) {
          if (exercise.audio) prompts.add(exercise.audio)
        }
      }
    }
  }
  writeFileSync(process.argv[2], JSON.stringify([...prompts].sort()))
} finally {
  await server.close()
}
