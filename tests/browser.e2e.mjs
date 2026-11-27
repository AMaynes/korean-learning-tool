/**
 * Overview & Purpose: Run production-build workflows in Chromium through Playwright.
 *
 * Architectural Relationships: Invoked by npm and GitHub Actions after Vite builds.
 *
 * External Resources: Chromium or a Chrome installation selected by the test environment.
 *
 * Notes: Route interception serves the exact production assets at a GitHub Pages-style subpath.
 */


import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const projectPage = 'http://korean-study.test/korean-learning-tool/'
const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const timeout = 5000

let browser
let profile

before(async () => {
  profile = await mkdtemp(join(tmpdir(), 'korean-browser-'))
  browser = await chromium.launchPersistentContext(profile, {
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL } : {}),
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
  })
  browser.setDefaultTimeout(timeout)
  await browser.route(projectPage + '**', async route => {
    const pathname = new URL(route.request().url()).pathname
    const entry = pathname.endsWith('/') ? 'index.html' : join('assets', basename(pathname))
    try { await route.fulfill({ path: join(dist, entry) }) } catch { await route.fulfill({ status: 404 }) }
  })
})

after(async () => {
  await browser?.close()
  if (profile) await rm(profile, { recursive: true, force: true }).catch(() => {})
})

/** Await text in a reliable role, with Playwright's own timeout diagnostics. */
async function heading(page, name) { await page.getByRole('heading', { name, exact: true }).waitFor() }

/** Confirm a select update and wait for the asynchronously committed browser state. */
async function select(page, label, value) {
  const control = page.getByLabel(label, { exact: true })
  await control.selectOption(value)
  await page.waitForFunction(({ label, value }) =>
    [...document.querySelectorAll('label')].some(item => item.firstChild?.textContent === label && item.querySelector('select')?.value === value),
  { label, value })
  assert.equal(await control.inputValue(), value)
  const category = { Nouns: 'nouns', Verbs: 'verbs', Adjectives: 'adjectives' }[label]
  if (category) await page.waitForFunction(({ category, value }) => new Promise(resolve => {
    const connection = indexedDB.open('korean-learning-tool', 1)
    connection.onerror = () => resolve(false)
    connection.onsuccess = () => {
      const db = connection.result
      const request = db.transaction('study', 'readonly').objectStore('study').get('state')
      request.onsuccess = () => { db.close(); resolve(request.result?.selected[category] === value) }
      request.onerror = () => { db.close(); resolve(false) }
    }
  }), { category, value })
}

async function mockKoreanAudio(page) {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      const filename = new URL(this.src).pathname.split('/').pop()
      window.lastPronunciation = String.fromCodePoint(...filename.slice(6, -4).split('-').map(hex => parseInt(hex, 16)))
      queueMicrotask(() => this.onended?.(new Event('ended')))
      return Promise.resolve()
    }

  })
}

describe('deployed study workflow', { concurrency: false }, () => {
  it('opens the tool by default and navigates to the separate intro on a narrow screen', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ colorScheme: 'light' })
    await mockKoreanAudio(page)
    await page.goto(projectPage)
    await heading(page, 'Vocabulary Recall')
    const palette = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return { background: style.backgroundColor, text: style.color, scheme: style.colorScheme }
    })
    assert.deepEqual(palette, { background: 'rgb(23, 23, 23)', text: 'rgb(255, 255, 255)', scheme: 'dark' })
    assert.equal(await page.getByRole('heading', { name: 'An intro to Korean' }).count(), 0)
    await page.getByRole('link', { name: 'Intro', exact: true }).click()
    await heading(page, 'An intro to Korean')
    const lessonHeadings = page.locator('.intro-lesson > summary h2')
    assert.deepEqual(await lessonHeadings.allTextContents(), [
      'Hangul + Pronunciation', 'Nominals', 'Predicates', 'Modifiers + Particles + Conjugation', 'Independent Forms', 'Sentence Structures',
    ])
    const hangul = page.locator('#hangul')
    await hangul.locator('summary').click()
    const alphabetTab = hangul.getByRole('tab', { name: 'Korean Alphabet (Hangul)', exact: true })
    assert.equal(await alphabetTab.getAttribute('aria-selected'), 'true')
    const alphabet = hangul.getByRole('tabpanel', { name: 'Korean Alphabet (Hangul)', exact: true })
    const vowels = alphabet.getByRole('region', { name: 'Vowels' })
    const consonants = alphabet.getByRole('region', { name: 'Consonants' })
    assert.equal(await vowels.getByRole('button').count(), 21)
    assert.equal(await consonants.getByRole('button').count(), 19)
    for (const group of ['ㅐ ㅔ', 'ㅒ ㅖ', 'ㅙ ㅚ ㅞ']) {
      assert.equal(await vowels.getByRole('group', { name: group, exact: true }).getByRole('button').count(), group.split(' ').length)
    }
    const relatedConsonants = consonants.getByRole('group', { name: 'ㄱ ㄲ ㅋ', exact: true })
    assert.equal(await relatedConsonants.getByRole('button').count(), 3)
    await page.setViewportSize({ width: 320, height: 844 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    const vowelRow = name => vowels.getByRole('group', { name, exact: true }).getByRole('button').evaluateAll(buttons =>
      buttons.map(button => {
        const { x, y } = button.getBoundingClientRect()
        return { x, y, letter: button.querySelector('[lang="ko"]').textContent }
      }))
    const baseVowels = await vowelRow('Base vowels')
    const yVowels = await vowelRow('Y-vowels')
    assert.deepEqual(baseVowels.map(({ letter }) => letter), [...'ㅏㅓㅗㅜㅐㅔ'])
    assert.deepEqual(yVowels.map(({ letter }) => letter), [...'ㅑㅕㅛㅠㅒㅖ'])
    assert.ok(yVowels.every(({ x, y }, index) => x === baseVowels[index].x && y > baseVowels[index].y))
    assert.ok(yVowels.every(({ y }) => y === yVowels[0].y))
    await page.setViewportSize({ width: 390, height: 844 })
    for (const [group, label, syllable] of [
      [vowels, 'Play ㅓ, eo', '어'],
      [vowels, 'Play ㅕ, yeo', '여'],
      [vowels, 'Play ㅐ, ae', '애'],
      [vowels, 'Play ㅔ, e', '에'],
      [relatedConsonants, 'Play ㄱ, g / k', '그'],
      [relatedConsonants, 'Play ㅋ, k', '크'],
      [consonants, 'Play ㅇ, silent / ng', '응'],
    ]) {
      await group.getByRole('button', { name: label, exact: true }).click()
      assert.equal(await page.evaluate(() => window.lastPronunciation), syllable)
    }
    const syllablesTab = hangul.getByRole('tab', { name: 'Hangul Syllables', exact: true })
    await syllablesTab.click()
    assert.equal(await syllablesTab.getAttribute('aria-selected'), 'true')
    assert.equal(await alphabet.isVisible(), false)
    assert.equal(await page.getByRole('figure', { name: /^Syllable / }).count(), 6)
    const stacked = page.getByRole('figure', { name: 'Syllable 몫, vowel below' })
    const positions = await stacked.evaluate(card => [...card.querySelectorAll('.syllable-slot')].map(slot => {
      const box = slot.getBoundingClientRect()
      return { x: box.x, y: box.y }
    }))
    assert.ok(positions[0].y < positions[1].y && positions[1].y < positions[2].y)
    assert.ok(positions[2].x < positions[3].x && positions[2].y === positions[3].y)
    assert.equal(await stacked.getByRole('group', { name: 'Coda', exact: true }).count(), 1)
    await page.getByText('받침', { exact: true }).waitFor()
    await page.getByText('겹받침', { exact: true }).waitFor()
    await page.getByText('ㅂ + ㅅ → ㅂ', { exact: true }).waitFor()
    await page.getByRole('table', { name: 'Hangul spelling and sound examples' }).getByText('먹어요 → [머거요]', { exact: true }).waitFor()
    const sections = page.getByRole('complementary', { name: 'On this page' })
    await sections.getByRole('button', { name: 'Nominals', exact: true }).click()
    const nominals = page.locator('#nominals')
    const nouns = page.getByRole('table', { name: 'Noun types', exact: true })
    await nouns.getByRole('columnheader', { name: 'Korean', exact: true }).waitFor()
    assert.equal(await nouns.locator('.intro-example-number').count(), 0)
    const nounExamples = [
      ['Common (general entities)', ['음식', '선생님', '학교']],
      ['Proper (specific names)', ['서울', '부산', '한강']],
      ['Dependent (requires a modifier)', ['갈 수 있어요.', '마실 것', '본 적이 있어요.']],
      ['Concrete (physical entities)', ['사과', '책', '연필']],
      ['Abstract (concepts)', ['기쁨', '사랑', '자유']],
    ]
    assert.deepEqual(await nouns.getByRole('rowheader').allTextContents(), nounExamples.map(([label]) => label))
    const nounHelp = page.getByRole('complementary', { name: 'Grammar explanation' })
    for (const [label, korean] of nounExamples) {
      const button = nouns.getByRole('button', { name: label, exact: true })
      await button.click()
      await nounHelp.getByRole('heading', { name: label, exact: true }).waitFor()
      assert.deepEqual(await nounHelp.locator('li > strong [lang="ko"]').allTextContents(), korean)
      assert.equal(await nounHelp.locator('li > small em').count(), 3)
      const nounType = label.split(' ')[0].toLowerCase() + ' noun'
      assert.ok((await nounHelp.locator('li > p').allTextContents()).every(text => text.includes(nounType)))
      assert.equal(await button.getAttribute('aria-expanded'), 'true')
      await page.keyboard.press('Escape')
      await nounHelp.waitFor({ state: 'hidden' })
    }
    await nouns.getByRole('columnheader', { name: 'Noun Type', exact: true }).waitFor()
    await page.setViewportSize({ width: 320, height: 844 })
    const nounEquations = nominals.getByRole('tabpanel', { name: 'Nouns', exact: true }).locator('.particle-equation')
    const equationRows = await nounEquations.evaluateAll(rows => rows.map(row => {
      const cells = [...row.children]
      return cells.map(cell => cell.querySelector('[lang="ko"]')?.textContent ?? cell.textContent)
    }))
    assert.deepEqual(equationRows, [
      ['음식', '+', '을', '=', '음식을'],
      ['커피', '+', '를', '=', '커피를'],
      ['음식', '+', '이', '=', '음식이'],
      ['집', '+', '에서', '=', '집에서'],
    ])
    assert.deepEqual(await nounEquations.nth(2).locator('em').allTextContents(), ['food', 'subject marker', 'food as the subject'])
    assert.ok(await nounEquations.evaluateAll(rows => rows.every(row => {
      const cells = [...row.children].map(cell => cell.getBoundingClientRect())
      return cells.every((cell, index) => cell.top === cells[0].top && (index === 0 || cell.left >= cells[index - 1].right))
        && cells[0].left >= 0 && cells[4].right <= innerWidth
        && [...row.querySelectorAll('.equation-term')].every(term =>
          term.lastElementChild.getBoundingClientRect().top >= term.firstElementChild.getBoundingClientRect().bottom)
    })))
    await page.setViewportSize({ width: 390, height: 844 })
    const nounsTab = nominals.getByRole('tab', { name: 'Nouns', exact: true })
    const pronounsTab = nominals.getByRole('tab', { name: 'Pronouns', exact: true })
    assert.equal(await nounsTab.getAttribute('aria-selected'), 'true')
    await nounsTab.press('ArrowRight')
    assert.equal(await pronounsTab.getAttribute('aria-selected'), 'true')
    assert.equal(await pronounsTab.evaluate(button => button === document.activeElement), true)
    await nouns.waitFor({ state: 'hidden' })
    await nominals.getByRole('tabpanel', { name: 'Pronouns' }).getByRole('table').waitFor()
    await nominals.locator('summary').click()
    await pronounsTab.waitFor({ state: 'hidden' })
    await sections.getByRole('button', { name: 'Nominals', exact: true }).click()
    assert.equal(await nominals.locator('summary').evaluate(summary => summary === document.activeElement), true)
    assert.equal(await pronounsTab.getAttribute('aria-selected'), 'true')

    const subtypesByTab = {
      Pronouns: ['Personal', 'Demonstrative', 'Interrogative', 'Indefinite', 'Reflexive'],
      Numerals: ['Native Korean cardinal', 'Sino-Korean cardinal', 'Ordinal', 'Before a counter'],
      Verbs: ['Dark-vowel verbs', 'Light-vowel verbs', 'Irregular verbs (shapeshifting)', 'Do verbs (hada)'],
    }
    const firstFocusByTab = { Pronouns: '저', Numerals: '하나', Verbs: '먹 + -어요' }

    const grammarGroups = [
      ['Nominals', ['Nouns', 'Pronouns', 'Numerals']],
      ['Predicates', ['Verbs', 'Adjectives']],
      ['Modifiers + Particles + Conjugation', ['Determiners + Adverbs', 'Particles', 'Conjugation']],
    ]
    for (const [group, tabs] of grammarGroups) {
      await sections.getByRole('button', { name: group, exact: true }).click()
      const tablist = page.getByRole('tablist', { name: group, exact: true })
      assert.deepEqual(await tablist.getByRole('tab').allTextContents(), tabs)
      for (const title of tabs) {
        await tablist.getByRole('tab', { name: title, exact: true }).click()
        const category = page.getByRole('tabpanel', { name: title, exact: true })
        await category.waitFor({ state: 'visible' })
        if (title === 'Particles' || title === 'Conjugation') {
          const guide = title === 'Particles' ? 'HOW TO USE PARTICLES' : 'HOW TO CONJUGATE'
          await category.getByRole('heading', { name: guide, exact: true }).waitFor()
        } else {
          const answers = await category.locator('.intro-application dd').allTextContents()
          assert.ok(answers.length >= 2 && answers.every(answer => ['Yes', 'No', 'Sometimes'].includes(answer)))
        }
        if (group === 'Nominals' || group === 'Predicates') {
          const particleRules = category.getByRole('heading', { name: 'Particle rules', exact: true })
          assert.equal(await particleRules.evaluate(heading => heading.previousElementSibling?.tagName), 'DL')
        }
        if (title === 'Verbs' || title === 'Adjectives') {
          const conjugationRules = category.getByRole('heading', { name: 'Conjugation rules', exact: true })
          assert.equal(await conjugationRules.evaluate(heading => heading.previousElementSibling?.classList.contains('intro-application')), true)
          const unit = title === 'Verbs' ? 'a verb' : 'an adjective'
          const particleCheck = category.locator('.intro-application dl > div').filter({ hasText: `Does ${unit} take particles?` })
          assert.equal(await particleCheck.locator('dd').textContent(), 'Sometimes')
        }
        if (title === 'Adjectives') {
          const examples = category.getByRole('list', { name: 'Examples' })
          assert.deepEqual(await examples.locator('li > p b [lang="ko"]').allTextContents(), ['매워요', '매운', '조용했어요'])
        }
        const labels = subtypesByTab[title]
        if (!labels) continue
        const table = title === 'Verbs'
          ? category.getByRole('table', { name: 'Verb types', exact: true })
          : category.getByRole('table')
        if (title === 'Verbs') {
          assert.equal(await table.evaluate(element => element.parentElement?.nextElementSibling?.classList.contains('intro-application')), true)
          const rules = category.getByRole('table', { name: 'How verb endings attach' })
          assert.deepEqual(await rules.getByRole('rowheader').allTextContents(), ['Direct attach', '아/어', '(으) buffer'])
        }
        assert.deepEqual(await table.getByRole('rowheader').allTextContents(), labels)
        for (const label of labels) {
          await table.getByRole('button', { name: label, exact: true }).click()
          await nounHelp.getByRole('heading', { name: label, exact: true }).waitFor()
          assert.equal(await nounHelp.locator('li > small em').count(), 3)
          const focus = await nounHelp.locator('li > p b [lang="ko"]').allTextContents()
          assert.equal(focus.length, 3)
          if (label === labels[0]) assert.equal(focus[0], firstFocusByTab[title])
          await page.keyboard.press('Escape')
          await nounHelp.waitFor({ state: 'hidden' })
        }
      }
    }
    await page.getByRole('table', { name: 'What conjugates', exact: true }).getByText('Copula 이다', { exact: true }).waitFor()
    await page.getByRole('tab', { name: 'Determiners + Adverbs', exact: true }).click()
    const modifierTable = page.getByRole('table', { name: 'Determiner and adverb types' })
    const manner = modifierTable.getByRole('row', { name: /Manner adverb/ })
    await manner.locator('.intro-word-glosses').getByText('빨리', { exact: true }).waitFor()
    assert.deepEqual(await manner.locator('td > em').allTextContents(), ['I eat quickly.'])
    assert.deepEqual(await manner.locator('.intro-word-glosses > span').allTextContents(), ['빨리 quickly', '먹어요 eat'])
    await manner.getByText(/because it tells how I eat/).waitFor()
    await page.getByRole('button', { name: 'Determiners', exact: true }).click()
    const determinerHelp = page.getByRole('complementary', { name: 'Grammar explanation' })
    await determinerHelp.getByRole('heading', { name: 'Determiner', exact: true }).waitFor()
    assert.equal(await determinerHelp.getByRole('listitem').count(), 3)
    await determinerHelp.getByText(/because it points out which book/).waitFor()
    await determinerHelp.getByRole('button', { name: 'Close explanation' }).click()
    await page.getByRole('tab', { name: 'Particles', exact: true }).click()
    await page.getByRole('table', { name: 'What takes particles', exact: true }).getByText('아직도', { exact: true }).waitFor()
    await page.getByRole('heading', { name: 'HOW TO USE PARTICLES', exact: true }).waitFor()
    await page.getByText('밥을 먹습니다.', { exact: true }).waitFor()

    await sections.getByRole('button', { name: 'Sentence Structures', exact: true }).click()
    const sentenceExamples = page.locator('#sentence')
    for (const title of ['Questions', 'Commands & requests', 'Suggestions', 'Exclamations', 'Statements']) {
      await sentenceExamples.getByRole('tab', { name: title, exact: true }).click()
      const panel = sentenceExamples.getByRole('tabpanel', { name: title, exact: true })
      await panel.locator('figure').first().waitFor()
      for (const example of await panel.locator('figure').all()) {
        const words = await example.locator('dd [lang="ko"]').allTextContents()
        assert.equal(await example.locator('figcaption [lang="ko"]').innerText(), words.join(' '))
      }
      assert.equal(await sentenceExamples.getByRole('tabpanel').count(), 1)
    }
    const fullSentence = sentenceExamples.getByRole('tabpanel', { name: 'Statements' }).locator('figure')
    assert.equal(await fullSentence.count(), 1)
    assert.deepEqual(await fullSentence.locator('dd [lang="ko"]').allTextContents(), ['저는', '밥을', '먹어요.'])
    assert.deepEqual(await fullSentence.locator('dd small').allTextContents(), ['I', 'rice', 'eat'])
    assert.deepEqual(await fullSentence.getByRole('button').allTextContents(), ['Topic', 'Object', 'Predicate'])
    const glossaryLabels = new Set((await page.locator('.intro-grammar-label').allTextContents()).map(label => label.toLowerCase()))
    assert.deepEqual([...glossaryLabels].sort(), [
      'adjective', 'adverb', 'batchim', 'coda', 'determiners', 'modifiers', 'nominals',
      'noun', 'object', 'particles', 'predicate', 'pronoun', 'subject', 'topic', 'verb',
      ...nounExamples.map(([label]) => label.toLowerCase()),
      ...Object.values(subtypesByTab).flat().map(label => label.toLowerCase()),
    ].sort())

    await page.setViewportSize({ width: 1280, height: 860 })
    const topic = fullSentence.getByRole('button', { name: 'Topic', exact: true })
    const explanation = page.getByRole('complementary', { name: 'Grammar explanation' })
    await topic.click()
    await explanation.getByRole('heading', { name: 'Topic', exact: true }).waitFor()
    const examples = explanation.getByRole('list', { name: 'Examples' })
    assert.deepEqual(await examples.locator('li > strong [lang="ko"]').allTextContents(), [
      '저는 집에서 먹어요.', '오늘은 제가 요리해요.', '저는 커피가 좋아요.',
    ])
    await examples.getByText(/because I’m talking about myself/).waitFor()
    assert.deepEqual(await examples.getByRole('listitem').first().locator('.intro-word-glosses > span').allTextContents(), [
      '저는 as for me', '집에서 at home', '먹어요 eat',
    ])
    assert.deepEqual(await examples.locator('li > small em').allTextContents(), [
      'I eat at home.', 'Today I’m the one cooking.', 'I like coffee.',
    ])
    assert.equal(await topic.getAttribute('aria-expanded'), 'true')
    const articleBounds = await sentenceExamples.boundingBox()
    const panelBounds = await explanation.boundingBox()
    assert.ok(panelBounds.x >= articleBounds.x + articleBounds.width)

    await fullSentence.getByRole('button', { name: 'Predicate', exact: true }).click()
    await explanation.getByRole('heading', { name: 'Predicate', exact: true }).waitFor()
    assert.equal(await examples.getByRole('listitem').count(), 3)
    assert.equal(await topic.getAttribute('aria-expanded'), 'false')

    await page.setViewportSize({ width: 320, height: 760 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.equal(await explanation.evaluate(element => getComputedStyle(element).position), 'fixed')
    await explanation.getByRole('button', { name: 'Close explanation' }).click()
    await explanation.waitFor({ state: 'hidden' })
    const nominal = nominals.locator('.intro-panel').getByRole('button', { name: 'nominals', exact: true })
    await nominal.click()
    await explanation.getByText(/something that works like one/).waitFor()
    await page.keyboard.press('Escape')
    await explanation.waitFor({ state: 'hidden' })
    assert.equal(await nominal.evaluate(button => document.activeElement === button), true)
    await page.reload()
    await heading(page, 'An intro to Korean')
    await page.getByRole('link', { name: 'Go to practice' }).click()
    await heading(page, 'Vocabulary Recall')
    if (process.env.KOREAN_QA_SCREENSHOTS) await page.screenshot({ path: join(process.env.KOREAN_QA_SCREENSHOTS, 'korean-mobile.png'), fullPage: true })
    await page.close()
  })

  it('fits compact vocabulary and practice controls on a 320 px phone', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 320, height: 760 })
    await page.goto(projectPage + '#library')
    await heading(page, 'Vocabulary Library')
    const nouns = page.getByRole('table', { name: 'Nouns vocabulary' })
    await nouns.getByRole('rowheader', { name: '사람', exact: true }).waitFor()
    assert.equal(await nouns.getByRole('row').count(), 11)
    assert.equal(await page.getByRole('button', { name: /edit|new list|add entry|import list/i }).count(), 0)
    await page.getByRole('searchbox', { name: 'Search' }).fill('friend')
    assert.equal(await nouns.getByRole('row').count(), 2)
    await select(page, 'Category', 'conjugations')
    await page.getByRole('table', { name: 'Conjugations vocabulary' }).getByText('먹다 → 먹어요').waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "Vocabulary must fit the phone viewport")

    await page.getByRole('link', { name: 'Grammar Trainer', exact: true }).click()
    await page.getByRole('button', { name: 'Sentence Writing' }).click()
    await page.getByText('Use a polite ending. You can leave out an obvious subject.').waitFor()
    assert.equal(await page.getByLabel('Difficulty', { exact: true }).count(), 0)
    const input = page.getByRole('textbox', { name: 'Your answer' })
    await input.waitFor()
    assert.equal(await input.evaluate(element => getComputedStyle(element).fontSize), '16px')
    const submitHeight = (await page.getByRole('button', { name: 'Check answer' }).boundingBox()).height
    assert.ok(submitHeight >= 44, `Expected a 44 px submit target, got ${submitHeight} px`)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "Writing practice must fit the phone viewport")
    await page.close()
  })

  it('shows final T notes on the Korean side of recall cards and in the library', async () => {
    const page = await browser.newPage()
    await page.goto(projectPage)
    await heading(page, 'Vocabulary Recall')
    await select(page, 'Category', 'pronouns')
    const card = page.locator('.recall-face')
    const words = [
      { english: 'This thing', korean: '이것', pronunciation: '[이걷]', steps: 5 },
      { english: 'That thing', korean: '그것', pronunciation: '[그걷]', steps: 1 },
      { english: 'That thing over there', korean: '저것', pronunciation: '[저걷]', steps: 1 },
      { english: 'What', korean: '무엇', pronunciation: '[무얻]', steps: 2 },
    ]
    const next = page.getByRole('button', { name: 'Next', exact: true })
    for (const { english, korean, pronunciation, steps } of words) {
      for (let index = 0; index < steps; index++) await next.click()
      await card.getByText(english, { exact: true }).waitFor()
      assert.equal(await card.getByText(/unreleased T/).count(), 0)
      await page.getByRole('button', { name: 'Flip card' }).click()
      await card.getByText(korean, { exact: true }).waitFor()
      await card.getByText(/unreleased T/).waitFor()
      await card.getByText(pronunciation, { exact: true }).waitFor()
      await page.getByRole('button', { name: 'Show prompt' }).click()
      await card.getByText(/unreleased T/).waitFor({ state: 'hidden' })
    }

    await page.getByRole('link', { name: 'Vocabulary Library', exact: true }).click()
    await heading(page, 'Vocabulary Library')
    await select(page, 'Category', 'pronouns')
    const table = page.getByRole('table', { name: 'Pronouns vocabulary' })
    for (const { english, korean, pronunciation } of words) {
      await page.getByRole('searchbox', { name: 'Search' }).fill(korean)
      await table.getByRole('rowheader').getByText(/unreleased T/).waitFor()
      await table.getByRole('rowheader').getByText(pronunciation, { exact: true }).waitFor()
      assert.equal(await table.getByRole('cell', { name: english, exact: true }).textContent(), english)
    }
    await page.close()
  })

  it('switches recall from Korean to English and keeps typing progress independent', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 320, height: 760 })
    await page.goto(projectPage)
    await heading(page, 'Vocabulary Recall')
    await select(page, 'Category', 'nouns')
    const direction = page.getByRole('group', { name: 'Recall direction' })
    assert.equal(await direction.getByRole('button', { name: 'Image → Korean' }).count(), 0)
    const reading = direction.getByRole('button', { name: 'Korean → English', exact: true })
    const writing = direction.getByRole('button', { name: 'English → Korean', exact: true })
    const card = page.locator('.recall-face')
    assert.equal(await page.getByRole('heading', { name: 'Deck progress' }).count(), 0)
    const info = page.getByRole('button', { name: 'How to practice' })
    assert.equal(await info.getAttribute('aria-expanded'), 'false')
    await info.click()
    await page.getByText('Recall the Korean word, then flip to check.').waitFor()
    await info.click()
    await card.getByText('Person', { exact: true }).waitFor()
    await reading.click()
    assert.equal(await reading.getAttribute('aria-pressed'), 'true')
    await card.getByText('사람', { exact: true }).waitFor()
    assert.equal(await card.getByText('Person', { exact: true }).count(), 0)
    await page.getByRole('button', { name: 'Flip card' }).click()
    await card.getByText('Person', { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)

    await page.getByRole('button', { name: 'Typing Practice' }).click()
    await card.getByText('사람', { exact: true }).waitFor()
    const input = page.getByRole('textbox', { name: 'Your answer' })
    assert.equal(await input.getAttribute('lang'), 'en')
    await input.fill('wrong answer')
    await input.press('Enter')
    await page.locator('[data-grade="wrong"] .retry').waitFor()
    await input.fill('person')
    await input.press('Enter')
    await page.getByText('Correction complete.', { exact: true }).waitFor()
    await page.locator('[data-grade="correct"]').waitFor()

    await writing.click()
    await card.getByText('Person', { exact: true }).waitFor()
    assert.equal(await input.getAttribute('lang'), 'ko')
    await page.reload()
    await reading.click()
    await page.close()
  })

  it('times a passage and scores through the selected word', async () => {
    const page = await browser.newPage()
    await page.goto(projectPage + '#reading')
    await page.getByLabel('Korean text').fill('물 물!\n차 · 물 커피')
    await page.getByRole('button', { name: 'Start reading' }).click()
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
    await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'))
    const button = name => page.getByRole('button', { name, exact: true })
    const timer = page.getByRole('timer')
    await button('Start').click()
    await page.clock.fastForward(4000)
    assert.equal(await timer.innerText(), '0:04.0')
    await button('Stop').click()
    await page.clock.fastForward(1000)
    assert.equal(await timer.innerText(), '0:04.0')
    await button('Mark last word').click()
    await button('물').last().click()
    await page.getByText('60 WPM', { exact: true }).waitFor()
    await page.getByText(/between the Grade 1 average/).waitFor()
    await page.getByText('How to interpret this pace').click()
    await page.getByRole('link', { name: 'National Korean language curriculum' }).waitFor()
    await button('Change last word').click()
    await button('물!').click()
    await page.getByText('30 WPM', { exact: true }).waitFor()
    await page.getByText(/below the Grade 1 average/).waitFor()
    await button('Restart').click()
    assert.equal(await timer.innerText(), '0:00.0')
    assert.equal(await page.locator('[data-endpoint]').count(), 0)
    await button('Stop').waitFor()
    await page.close()
  })

  it('reveals pasted reading translations with every guess left blank', async () => {
    const page = await browser.newPage()
    const translations = new Map([['물이 있어요.', 'There is water.'], ['물이', 'water'], ['있어요.', 'exists'], ['가요!', 'Go!']])
    await page.route('https://translate.googleapis.com/**', route => {
      const text = new URL(route.request().url()).searchParams.get('q')
      return route.fulfill({ json: [[[translations.get(text), text]]] })
    })
    await page.goto(projectPage)
    await page.getByRole('link', { name: 'Reading Trainer' }).click()
    await page.getByLabel('Korean text').fill('물이 있어요.\n가요!')
    await page.getByRole('button', { name: 'Start reading' }).click()
    const guesses = page.getByRole('textbox', { name: 'Your sentence translation' })
    assert.equal(await guesses.count(), 2)
    assert.equal(await guesses.first().evaluate(el => el.required), false)
    assert.equal(await page.locator('.reading-word input').count(), 3)
    assert.equal(await page.getByRole('button', { name: /Hear sentence/ }).count(), 2)
    assert.equal(await page.getByText('There is water.').count(), 0)
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await page.getByRole('button', { name: 'Translations shown' }).waitFor()
    assert.deepEqual(await page.locator('.reading-word small').allTextContents(), ['water', 'exists', 'Go!'])
    assert.deepEqual(await page.locator('.reading-translation em').allTextContents(), ['There is water.', 'Go!'])
    await page.close()
  })

  it('decodes each Korean word and reviews the complete translation', async () => {
    const page = await browser.newPage({ viewport: { width: 320, height: 740 } })
    await page.goto(projectPage + '#grammar')
    await page.getByRole('button', { name: 'Sentence Decoding', exact: true }).click()
    const check = page.getByRole('button', { name: 'Check meanings' })
    assert.ok(await check.isDisabled())
    const words = page.locator('.decode-words input')
    assert.ok(await words.count() >= 2)
    for (const word of await words.all()) await word.fill('my gloss')
    await page.getByLabel('Whole sentence meaning').fill('my translation')
    await check.click()
    assert.equal(await page.locator('.decode-words em').count(), await words.count())
    await page.getByRole('button', { name: 'Got it · Next' }).click()
    await check.waitFor()
    assert.equal(await words.first().inputValue(), '')
    await page.close()
  })

  it('opens the full grammar list from a recall card in either mode', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 320, height: 760 })
    await page.goto(projectPage + '#recall')
    for (const [mode, category, label, count] of [
      ['Mental Recall', 'particles', 'Particles', 27],
      ['Typing Practice', 'conjugations', 'Conjugations', 26],
    ]) {
      await page.getByRole('button', { name: mode, exact: true }).click()
      await select(page, 'Category', category)
      const trigger = page.locator('.recall-panel').getByRole('button', { name: 'Hints', exact: true })
      await trigger.click()
      const popup = page.getByRole('dialog', { name: 'Grammar list' })
      assert.equal(await popup.getByRole('tab', { name: label }).getAttribute('aria-selected'), 'true')
      const selectedFill = () => popup.getByRole('tab', { selected: true }).evaluate(el => getComputedStyle(el).backgroundColor)
      const fill = await selectedFill()
      assert.notEqual(fill, await popup.getByRole('tab', { selected: false }).evaluate(el => getComputedStyle(el).backgroundColor))
      const glosses = popup.locator('tbody tr:first-child .grammar-gloss small')
      assert.deepEqual(await glosses.allTextContents(), category === 'particles'
        ? ['Home', 'as for', 'as for home'] : ['Eat', 'Present polite', 'Eat (polite)'])
      assert.equal(await popup.locator('tbody tr').count(), count)
      const rows = popup.locator('.grammar-disclosure')
      for (const row of await rows.all()) {
        await row.click()
        assert.equal(await popup.locator('.grammar-detail li').count(), 5)
        assert.equal(await popup.locator('.grammar-detail li small').count(), 15)
        await row.click()
      }
      await popup.getByRole('tab', { name: label === 'Particles' ? 'Conjugations' : 'Particles' }).click()
      assert.equal(await selectedFill(), fill)
      assert.equal(await popup.locator('tbody tr').count(), 53 - count)
      await page.keyboard.press('Escape')
      await popup.waitFor({ state: 'hidden' })
    }
    await page.close()
  })

  it('saves a memory scene and recalls it at the same palace stop', async () => {
    const page = await browser.newPage()
    await page.goto(projectPage)
    await page.getByRole('button', { name: 'Mind Palace', exact: true }).click()
    const palace = page.locator('.palace')
    const stop = await palace.locator('h2').innerText()
    const word = await palace.locator('[lang="ko"]').innerText()
    await palace.getByLabel('My memory scene').fill('A giant balloon opens the gate.')
    await palace.getByRole('button', { name: 'Save scene' }).click()
    await palace.getByRole('button', { name: 'Scene saved' }).waitFor()
    await page.reload()
    await page.getByRole('button', { name: 'Mind Palace', exact: true }).click()
    await palace.getByRole('button', { name: 'Walk the route' }).click()
    assert.equal(await palace.locator('[lang="ko"]').count(), 0)
    assert.equal(await palace.locator('h2').innerText(), stop)
    await palace.getByRole('button', { name: 'Show my scene' }).click()
    await palace.getByText('A giant balloon opens the gate.').waitFor()
    await palace.getByRole('button', { name: 'Reveal word' }).click()
    assert.equal(await palace.locator('[lang="ko"]').innerText(), word)
    await palace.getByRole('button', { name: 'Next stop' }).click()
    assert.notEqual(await palace.locator('h2').innerText(), stop)
    await page.close()
  })

  it('switches palaces and remembers a custom walking route independently', async () => {
    const page = await browser.newPage()
    await page.goto(projectPage)
    const tab = page.getByRole('button', { name: 'Mind Palace', exact: true })
    await tab.click()
    const selector = page.getByLabel('Choose a palace')
    assert.equal(await page.getByLabel('Category', { exact: true }).count(), 0)
    assert.deepEqual(await selector.locator('optgroup[label="Classic palaces"] option').allTextContents(), ['Home', 'Park', 'Café', 'School', 'Train Station'])
    await selector.selectOption('ordering')
    await heading(page, 'Suggest a place for coffee.')
    const words = page.locator('.palace details')
    await page.getByRole('button', { name: 'Walk the route' }).click()
    await page.getByRole('button', { name: 'Next stop' }).click()
    const stop = await page.locator('.palace h2').innerText()
    await words.locator('summary').click()
    await words.getByText('커피 주세요', { exact: true }).waitFor()
    assert.deepEqual(await words.locator('[lang="ko"]').allTextContents(),
      ['카페', '카페에서', '여기요', '주세요', '물 주세요', '커피', '커피 주세요'])
    await words.locator('summary').click()
    assert.equal(await page.locator('.palace h2').innerText(), stop)
    await page.getByRole('button', { name: 'Reveal word' }).waitFor()
    await selector.selectOption('goodbyes')
    await heading(page, 'You stay behind. Say goodbye to the guest walking away.')
    await words.locator('summary').click()
    await words.getByText('안녕히 가세요', { exact: true }).waitFor()
    assert.equal(await words.getByText('커피', { exact: true }).count(), 0)
    await selector.selectOption('station')
    await heading(page, 'Station entrance')
    await page.locator('.palace').getByText('역', { exact: true }).waitFor()
    await selector.selectOption('park')
    await heading(page, 'Iron gate')
    await page.getByRole('button', { name: 'Create palace' }).click()
    await page.getByLabel('Palace name').fill('Campus')
    await page.getByLabel(/Landmarks in walking order/).fill('Bus stop\nLibrary steps')
    await page.getByRole('button', { name: 'Save palace' }).click()
    await heading(page, 'Bus stop')
    const id = await selector.inputValue()
    const scene = page.getByLabel('My memory scene')
    await scene.fill('A person waves from the bus.')
    await page.getByRole('button', { name: 'Save scene' }).click()
    await page.getByRole('button', { name: 'Scene saved' }).waitFor()
    await page.reload()
    await tab.click()
    assert.equal(await selector.inputValue(), id)
    await selector.selectOption('park')
    await heading(page, 'Iron gate')
    assert.equal(await scene.inputValue(), '')
    await selector.selectOption(id)
    await heading(page, 'Bus stop')
    assert.equal(await scene.inputValue(), 'A person waves from the bus.')
    await page.getByRole('button', { name: 'Next stop' }).click()
    await heading(page, 'Library steps')
    await page.close()
  })

  it('plays Korean audio before revealing or checking the English meaning', async () => {
    const page = await browser.newPage()
    await page.goto(projectPage)
    await select(page, 'Category', 'nouns')
    const sound = page.getByRole('button', { name: 'Korean Sound → English' })
    const clip = page.waitForResponse(response => response.url().endsWith('/ko-f1-c0ac-b78c.mp3'))
    await sound.click()
    assert.equal((await clip).ok(), true)
    const face = page.locator('.recall-face')
    assert.equal(await face.locator('[lang="ko"]').count(), 0)
    await page.getByRole('button', { name: 'Flip card' }).click()
    await face.getByText('Person', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Typing Practice' }).click()
    assert.equal(await face.locator('[lang="ko"]').count(), 0)
    const input = page.getByLabel('Your answer')
    await input.fill('person')
    await input.press('Enter')
    await page.getByText('Correct.', { exact: true }).waitFor()
    await page.close()
  })

  it('keeps deck choices independent across active generation and tab reload', async () => {
    const page = await browser.newPage()
    await page.goto(projectPage)
    await heading(page, 'Vocabulary Recall')
    if (process.env.KOREAN_QA_SCREENSHOTS) await page.screenshot({ path: join(process.env.KOREAN_QA_SCREENSHOTS, 'korean-desktop.png'), fullPage: true })
    await page.getByRole('button', { name: 'Flip card' }).click()
    await page.getByText('사람', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Typing Practice' }).click()
    await page.getByLabel('Your answer').fill('사람')
    await page.getByLabel('Your answer').press('Enter')
    await page.getByText('Correct.', { exact: true }).waitFor()

    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await heading(page, 'Study settings')
    await select(page, 'Verbs', 'verbs-2')
    await select(page, 'Adjectives', 'adjectives-3')
    await select(page, 'Nouns', 'nouns-2')
    await page.reload()
    assert.equal(await page.getByLabel('Nouns', { exact: true }).inputValue(), 'nouns-2')
    assert.equal(await page.getByLabel('Verbs', { exact: true }).inputValue(), 'verbs-2')
    assert.equal(await page.getByLabel('Adjectives', { exact: true }).inputValue(), 'adjectives-3')
    assert.equal(await page.getByLabel('Pronouns', { exact: true }).inputValue(), 'pronouns-1')

    await page.getByRole('link', { name: 'Tool', exact: true }).click()
    await page.getByRole('link', { name: 'Vocabulary Library', exact: true }).click()
    await heading(page, 'Vocabulary Library')
    await page.getByRole('rowheader', { name: '밥', exact: true }).waitFor()
    await select(page, 'Category', 'verbs')
    await page.getByRole('rowheader', { name: '마시다', exact: true }).waitFor()
    await page.getByRole('link', { name: 'Practice this list' }).click()
    await heading(page, 'Vocabulary Recall')
    await page.getByText('To drink', { exact: true }).waitFor()

    await page.getByRole('link', { name: 'Grammar Trainer', exact: true }).click()
    await select(page, 'Word category', 'nouns')
    await select(page, 'Grammar rule', 'subject')
    const particle = await page.locator('.exercise-prompt h2').textContent()
    assert.ok(['밥','빵','김치','커피','차','식당','카페','시장','가방','책'].includes(particle))
    await page.getByRole('button', { name: 'Conjugation Practice' }).click()
    await select(page, 'Word category', 'verbs')
    await select(page, 'Grammar rule', 'present')
    const verb = await page.locator('.exercise-prompt h2').textContent()
    assert.ok(['마시다','읽다','쓰다','자다','일하다','운동하다','걷다','듣다','돕다','일어나다'].includes(verb))

    assert.equal(await page.getByRole('button', { name: 'Sentence Assembly' }).count(), 0)
    await page.getByRole('button', { name: 'Sentence Writing' }).click()
    await page.getByLabel('Your answer').fill('안녕하세요')
    await page.getByRole('button', { name: 'Check answer' }).click()
    await page.getByRole('button', { name: 'My answer works' }).waitFor()

    // Close and reopen the tab while retaining the persistent browser profile.
    await page.close()
    const reopened = await browser.newPage()
    await reopened.goto(projectPage + '#settings')
    await heading(reopened, 'Study settings')
    assert.equal(await reopened.getByLabel('Verbs', { exact: true }).inputValue(), 'verbs-2')
    const downloadEvent = reopened.waitForEvent('download')
    await reopened.getByRole('button', { name: 'Export backup' }).click()
    const download = await downloadEvent
    const backup = JSON.parse(await readFile(await download.path(), 'utf8'))
    assert.equal(backup.state.recall['nouns-1'].entries.person.history.at(-1).outcome, 'clean')

    await select(reopened, 'Nouns', 'nouns-3')
    reopened.once('dialog', dialog => void dialog.accept())
    await reopened.locator('input[type=file]').setInputFiles({
      name: 'study-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)),
    })
    await reopened.getByText('Changes saved.', { exact: true }).waitFor()
    assert.equal(await reopened.getByLabel('Nouns', { exact: true }).inputValue(), 'nouns-2')
    await select(reopened, 'Nouns', 'nouns-1')
    await reopened.getByRole('link', { name: 'Tool', exact: true }).click()
    await reopened.getByRole('button', { name: 'Typing Practice' }).click()
    await reopened.close()
  })

  it('plays a pronunciation card before offering Y or N and advances after rating', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 390, height: 844 })
    await mockKoreanAudio(page)
    await page.goto(projectPage)
    await page.getByRole('link', { name: 'Pronouncing Hangul', exact: true }).click()
    await heading(page, 'Pronouncing Hangul')
    const letter = page.getByRole('region', { name: 'Vowels practice' }).getByRole('heading')
    const letterPrompt = await letter.textContent()
    assert.match(letterPrompt, /^[ㄱ-ㅣ]$/u)
    assert.equal(await page.getByText('Did you get it correct?').count(), 0)
    await page.getByRole('button', { name: 'Play sound' }).click()
    await page.getByText('Did you get it correct?').waitFor()
    assert.match(await page.evaluate(() => window.lastPronunciation), /^[가-힣]$/u)
    await page.getByRole('button', { name: 'Yes', exact: true }).click()
    await page.getByText('1 / 1 correct', { exact: true }).waitFor()
    assert.notEqual(await letter.textContent(), letterPrompt)

    assert.equal(await page.getByRole('button', { name: 'Syllables', exact: true }).count(), 0)
    for (const name of ['Vowels', 'Consonants']) {
      await page.getByRole('button', { name, exact: true }).click()
      const region = page.getByRole('region', { name: name + ' practice' })
      const before = await region.getByRole('heading').innerText()
      const score = await region.getByText(/correct$/).innerText()
      await region.getByRole('button', { name: 'Next', exact: true }).click()
      assert.notEqual(await region.getByRole('heading').innerText(), before)
      await region.getByText(score, { exact: true }).waitFor()
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.close()
  })

  it('plays a bundled consonant clip without device voices', async () => {
    const page = await browser.newPage()
    await page.addInitScript(() => Object.defineProperty(speechSynthesis, 'getVoices', { value: () => [] }))
    await page.goto(projectPage + '#pronunciation')
    assert.equal(await page.getByRole('navigation', { name: 'Learning modules' }).getByRole('link').first().innerText(), 'Pronouncing Hangul')
    await page.getByRole('button', { name: 'Consonants', exact: true }).click()
    await page.getByRole('button', { name: 'Play sound' }).click()
    await page.getByRole('button', { name: 'Yes', exact: true }).click()
    await page.getByText('1 / 1 correct', { exact: true }).waitFor()
    await page.close()
  })

  it('keeps dictation hidden, handles unavailable audio, and offers guided answers', async () => {
    const page = await browser.newPage()
    await page.route('**/ko-f1-*.mp3', route => route.abort())
    await page.goto(projectPage + '#listening')
    await heading(page, 'Conversation Tool')
    await page.getByRole('button', { name: 'Play audio' }).click()
    await page.getByText(/Playback failed/).waitFor()
    assert.equal(await page.locator('.model-answer').count(), 0)
    await page.getByRole('button', { name: 'Reveal transcript' }).click()
    await page.getByText('Example answer', { exact: true }).waitFor()

    await page.getByRole('button', { name: 'Guided Conversation' }).click()
    await page.getByRole('button', { name: 'Show English', exact: true }).click()
    await page.getByRole('button', { name: 'Hide English', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Show responses' }).click()
    await page.getByText('Suggested responses', { exact: true }).waitFor()
    await page.close()
  })

  it('uses all active lists and reads Korean for meaning across practice modes', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(projectPage + '#settings')
    await heading(page, 'Study settings')
    await select(page, 'Nouns', 'nouns-all')
    await page.getByRole('link', { name: 'Tool', exact: true }).click()
    await page.getByRole('link', { name: 'Vocabulary Library', exact: true }).click()
    const entries = page.getByRole('table', { name: 'Nouns vocabulary' })
    await entries.getByRole('rowheader', { name: '사람', exact: true }).waitFor()
    await entries.getByRole('rowheader', { name: '선생님', exact: true }).waitFor()
    assert.equal(await entries.getByRole('row').count(), 31)

    await page.getByRole('link', { name: 'Grammar Trainer', exact: true }).click()
    await page.locator('.practice-selectors summary').click()
    assert.equal(await page.getByLabel('Nouns', { exact: true }).inputValue(), 'nouns-all')
    const reading = page.getByRole('group', { name: 'Practice direction' }).getByRole('button', { name: 'Korean → English', exact: true })
    await reading.click()
    for (const mode of ['Particle Practice', 'Conjugation Practice', 'Sentence Writing']) {
      await page.getByRole('button', { name: mode, exact: true }).click()
      await page.locator('.exercise-prompt h2 [lang="ko"]').waitFor()
      assert.equal(await page.locator('.model-answer').count(), 0)
      assert.equal(await page.getByRole('textbox', { name: 'English meaning' }).getAttribute('lang'), 'en')
      await page.getByRole('button', { name: 'Reveal meaning' }).click()
      await page.locator('.model-answer strong').waitFor()
    }

    await page.getByRole('link', { name: 'Conversation Tool', exact: true }).click()
    await reading.click()
    await heading(page, 'Listen and give the English meaning')
    assert.equal(await page.locator('.model-answer').count(), 0)
    await page.getByRole('button', { name: 'Reveal meaning' }).click()
    await page.locator('.feedback p').filter({ hasText: /^Transcript/ }).waitFor()
    await page.locator('.model-answer strong').waitFor()
    await page.getByRole('button', { name: 'Guided Conversation', exact: true }).click()
    await page.locator('.exercise-prompt h2 [lang="ko"]').waitFor()
    assert.equal(await page.getByRole('button', { name: 'Show English', exact: true }).count(), 0)
    await page.getByRole('button', { name: 'Reveal meaning' }).click()
    await page.locator('.model-answer strong').waitFor()
    await page.close()
  })
})
