# Korean Learning Tool

A standalone Korean practice workspace for English-speaking learners. Study words and grammar in Hangul, then use independently selected vocabulary lists in recall, sentence practice, dictation, and conversation. The default page opens the practice tool. The separate Intro diagrams Hangul blocks and breaks down grammar with worked examples.

**Website** [Korean Learning Tool](https://amaynes.github.io/korean-learning-tool/)

## Running the project

On macOS, Windows, or Linux with a supported Node.js version, run:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite.

## System overview

The vocabulary registry resolves eight independent categories. Exercise engines use those selections for grammar and listening, and the recall scheduler uses stable list and entry IDs. IndexedDB stores active deck selections, settings, and progress. The static app requires no account or backend.

## Study modules

- **Pronunciation** presents all 40 modern Hangul letters and all 10,773 modern syllables with batchim. Listen with a Korean browser voice and mark your answer with **Y** or **N**. Batchim audio models syllables in isolation.
- **Vocabulary Library** shows fixed lists in a compact searchable table, with examples for particles and endings.
- **Vocabulary Recall** offers ungraded flashcards and spaced typing. Three clean recalls and a delayed fourth earn mastery. A single-card deck can practice and needs additional cards to meet the spacing rule.
- **Grammar Trainer** covers particle practice, conjugation, sentence assembly, and sentence writing. Open-ended alternatives can be compared against sample answers and self-reviewed.
- **Listening & Conversation** uses the device’s Korean synthesis voice for dictation and conversation prompts. Listening can reveal a transcript when a voice is unavailable. Conversation is guided by study frames and example replies.

## Adding vocabulary

Vocabulary lists ship with the website. To add a list, update the catalog in [src/data/words.ts](src/data/words.ts) or [src/data/grammar.ts](src/data/grammar.ts) and publish the change. Keep existing IDs stable so selections and progress carry forward. Use semantic tags when words should fill compatible sentence slots. New grammar rules need worked examples, engine support, and tests.

Backups from **Settings** include progress and preferences. An older backup restores study data for the published catalog, with default selections used where necessary.

## Testing and deployment

```sh
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite tests the production artifacts at a Pages-style subpath. It can use installed Chrome by setting `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome`. With a fork or a new repository, set **Settings → Pages → Source → GitHub Actions**, then push to `main` or run **Test and deploy to Pages**. The workflow verifies the site before deploying the `dist` folder. See the [Vite deployment guide](https://vite.dev/guide/static-deploy#github-pages).

Study data belongs to the browser profile and site origin. Export a full backup before switching devices or clearing site data. Sentence templates currently use the Present Polite pattern. Word combinations depend on compatible semantic tags and selected particles. Pronunciation scoring and open-ended AI feedback are outside the tool’s scope.

## References

- [HRD Korea Hangeul textbook](https://www.eps.go.kr/exam/The_Standard_Textbook_of_EPS-TOPIK.pdf)
- [National Institute of Korean Language standard pronunciation](https://korean.go.kr/kornorms/m/m_regltn.do?regltn_code=0002)
- [Unicode Hangul composition](https://unicode.org/faq/korean.html)

- [Konkuk University Korean Language Institute beginner grammar](https://www.konkuk.ac.kr/bbs/kli-eng/4259/1169225/download.do)
- [How to Study Korean irregular conjugations](https://www.howtostudykorean.com/unit1/unit-1-lessons-1-8/unit-1-lesson-7/)

## Dependencies

Node.js 20.19+ or 22.12+, npm, React, TypeScript, Vite, Vitest, and Playwright. Audio requires a browser with a Korean system speech voice.
