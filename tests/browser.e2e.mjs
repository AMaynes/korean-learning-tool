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

describe('deployed study workflow', { concurrency: false }, () => {
  it('opens the tool by default and navigates to the separate intro on a narrow screen', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(projectPage)
    await heading(page, 'Vocabulary Recall')
    assert.equal(await page.getByRole('heading', { name: 'How Korean works' }).count(), 0)
    await page.getByRole('link', { name: 'Intro', exact: true }).click()
    await heading(page, 'How Korean works')
    await heading(page, 'Nominals and particles')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.reload()
    await heading(page, 'How Korean works')
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
    await page.getByText('Clean recalls 1 / 4', { exact: true }).waitFor()

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

    await page.getByRole('button', { name: 'Sentence Assembly' }).click()
    const tokens = page.getByRole('group', { name: 'Available words' }).or(page.locator('.token-bank'))
    assert.equal(await tokens.getByText('먹어요', { exact: true }).count(), 0)
    await page.getByRole('button', { name: 'Reveal answer' }).click()
    await page.getByText('Example answer', { exact: true }).waitFor()
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
    assert.equal(backup.state.recall['nouns-1'].entries.person.streak, 1)

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
    await reopened.getByText('In practice', { exact: true }).waitFor()
    assert.match(await reopened.locator('.stats').innerText(), /In practice\s+1/)
    await reopened.close()
  })

  it('keeps dictation hidden, handles unavailable audio, and offers guided answers', async () => {
    const page = await browser.newPage()
    await page.addInitScript(() => {
      Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => [] })
    })
    await page.goto(projectPage + '#listening')
    await heading(page, 'Listening & Conversation')
    await page.getByRole('button', { name: 'Play audio' }).click()
    await page.getByText(/Install a Korean system voice or reveal the transcript/).waitFor()
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
})
