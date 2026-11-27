/** Preserve hard line breaks even when the pasted passage omits punctuation. */
export function readingSentences(text: string) {
  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('ko', { granularity: 'sentence' }) : null
  return text.split(/\r\n?|\n/u).flatMap(line => {
    const parts = segmenter ? Array.from(segmenter.segment(line), item => item.segment)
      : line.match(/[^.!?。！？]+(?:[.!?。！？]+|$)|[.!?。！？]+/gu) ?? []
    return parts.map(part => part.trim()).filter(Boolean)
  })
}

/** Keep whitespace-delimited words together within the provider's request size. */
export function readingChunks(text: string, limit: number) {
  const chunks: string[] = []
  let chunk = ''
  for (let word of text.split(/\s+/u)) {
    if (chunk && chunk.length + word.length + 1 > limit) {
      chunks.push(chunk)
      chunk = ''
    }
    while (word.length > limit) {
      const cut = /[\uD800-\uDBFF]/u.test(word[limit - 1]) ? limit - 1 : limit
      chunks.push(word.slice(0, cut))
      word = word.slice(cut)
    }
    chunk = chunk ? chunk + ' ' + word : word
  }
  if (chunk) chunks.push(chunk)
  return chunks
}

export async function translateReading(text: string, signal: AbortSignal) {
  const translations: string[] = []
  for (const q of readingChunks(text, 900)) {
    const params = new URLSearchParams({ client: 'gtx', sl: 'ko', tl: 'en', dt: 't', q })
    const requestSignal = typeof AbortSignal.any === 'function'
      ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : signal
    const response = await fetch('https://translate.googleapis.com/translate_a/single?' + params, { signal: requestSignal })
    if (!response.ok) throw new Error('Translation unavailable')
    const data = await response.json()
    const translated = Array.isArray(data?.[0]) && data[0].map((part: unknown) =>
      Array.isArray(part) && typeof part[0] === 'string' ? part[0] : '').join('').trim()
    if (!translated) throw new Error('Translation unavailable')
    translations.push(translated)
  }
  return translations.join(' ')
}

interface DeviceTranslator {
  translate(text: string, options: { signal: AbortSignal }): Promise<string>
  destroy(): void
}
interface TranslatorFactory {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>
  create(options: { sourceLanguage: string; targetLanguage: string; signal: AbortSignal }): Promise<DeviceTranslator>
}

const koreanToEnglish = { sourceLanguage: 'ko', targetLanguage: 'en' }
const deviceFactory = (globalThis as typeof globalThis & { Translator?: TranslatorFactory }).Translator

export async function canTranslateOnDevice() {
  if (!deviceFactory) return false
  return (await deviceFactory.availability(koreanToEnglish)) !== 'unavailable'
}

export async function openDeviceTranslator(signal: AbortSignal) {
  if (!deviceFactory) throw new Error('Device translation unavailable')
  return deviceFactory.create({ ...koreanToEnglish, signal })
}
