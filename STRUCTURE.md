# Project structure

## At a glance

```text
korean-learning-tool/
├── .github/
│   └── workflows/
│       └── pages.yml
├── .gitignore
├── README.md
├── STRUCTURE.md
├── TODO.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── style.css
│   ├── assets/pictures/
│   ├── data/
│   │   ├── grammar.ts
│   │   ├── intro.ts
│   │   ├── pictures.ts
│   │   ├── model.ts
│   │   └── words.ts
│   ├── engine/
│   │   ├── exercises.ts
│   │   ├── korean.ts
│   │   ├── mastery.ts
│   │   ├── pronunciation.ts
│   │   ├── registry.ts
│   │   └── storage.ts
│   └── views/
│       ├── App.tsx
│       ├── Intro.tsx
│       ├── Library.tsx
│       ├── Practice.tsx
│       ├── Pronunciation.tsx
│       ├── Recall.tsx
│       ├── Settings.tsx
│       └── shared.tsx
└── tests/
    ├── browser.e2e.mjs
    └── unit.test.ts
```

## Detailed reference

| Path | Responsibility |
| --- | --- |
| `.github/workflows/pages.yml` | Tests the project and deploys a verified build from the main branch. |
| `.gitignore` | Excludes local dependencies and generated test/build files. |
| `README.md` | Documents operation, curriculum editing, testing, and deployment. |
| `STRUCTURE.md` | Maps the source tree and its boundaries. |
| `TODO.md` | Tracks potential improvements to the curriculum and generator. |
| `index.html` | Provides the mount point and static page metadata. |
| `package.json` / `package-lock.json` | Define and lock tooling and runtime dependencies. |
| `tsconfig.json` / `vite.config.ts` | Set strict checking and repository-relative build assets. |
| `src/main.tsx` / `src/style.css` | Mount the app and define the grayscale palette and responsive layout. |
| `src/data/grammar.ts` | Owns the catalog of particle and conjugation rules, explanations, and examples. |
| `src/data/intro.ts` | Holds the Intro’s glossary examples and word-category tables. |
| `src/data/pictures.ts` / `src/assets/pictures/` | Maps pictured vocabulary to bundled illustrations and accessible descriptions. |
| `src/data/model.ts` | Defines shared data contracts. |
| `src/data/words.ts` | Owns starter lexical vocabulary and semantic tags. |
| `src/engine/exercises.ts` | Generates study exercises from active decks and evaluates known alternatives. |
| `src/engine/korean.ts` | Applies phonological variants and stems/endings to known word classes. |
| `src/engine/mastery.ts` | Schedules recall with per-deck clocks and entry mastery states. |
| `scripts/build-hangul-audio.py` | Creates the deployable Korean audio clips for pronunciation fallback. |
| `src/engine/pronunciation.ts` | Generates vowel, consonant, and full syllable cards with isolated sound models. |
| `src/engine/registry.ts` | Resolves active decks from the bundled catalog and looks up grammar rules. |
| `src/engine/storage.ts` | Saves browser study data atomically and validates full backups. |
| `src/views/App.tsx` | Owns navigation, active selections, and study-state lifecycle. |
| `src/views/Intro.tsx` | Guides learners through word categories and a worked sentence, with an interactive glossary. |
| `src/views/Library.tsx` | Displays bundled vocabulary decks in a compact searchable table. |
| `src/views/Practice.tsx` | Houses grammar, sentence, dictation, and conversation interactions. |
| `src/views/Pronunciation.tsx` | Presents the three Pronouncing Hangul decks with playback and self-rating. |
| `src/views/Recall.tsx` | Houses flashcard review, typing, and spaced mastery. |
| `src/views/Settings.tsx` | Houses list configuration, preferences, resets, and backups. |
| `src/views/shared.tsx` | Provides reusable accessible study and file controls. |
| `tests/browser.e2e.mjs` | Covers the published-bundle workflow in a real browser. |
| `tests/unit.test.ts` | Covers morphology, generation, stable IDs, backup validation, and scheduling. |
