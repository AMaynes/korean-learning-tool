import type { Token } from 'garu-ko/browser'
import type { Breakdown } from './readingGrammar'
import { readingToken } from './readingGrammar'

const particleNames: Record<string, string> = {
  은: 'Topic particle', 는: 'Topic particle', 도: 'Also / too particle', 만: 'Only particle',
  에: 'Time / location / destination particle', 에서: 'Action location / source particle',
  까지: 'Endpoint particle', 부터: 'Starting point particle', 로: 'Direction / means particle',
  으로: 'Direction / means particle', 랑: 'With / and particle', 이랑: 'With / and particle',
  하고: 'With / and particle', 에게: 'Recipient particle', 한테: 'Recipient / source particle',
  요: 'Politeness marker',
}
const tagNames: Record<string, string> = {
  JKS: 'Subject particle', JKO: 'Object particle', JKG: 'Possessive particle',
  JKB: 'Adverbial particle', JX: 'Auxiliary particle', JC: 'Joining particle',
  JKQ: 'Quotation particle', JKV: 'Vocative particle', JKC: 'Complement particle',
  EP: 'Pre-final ending', EF: 'Sentence ending', EC: 'Connecting ending',
  ETM: 'Noun-modifying ending', ETN: 'Nominalizing ending', VCP: '이다 (to be) · copula',
}
const endingNames: Record<string, string> = {
  았: 'Past tense', 었: 'Past tense', 였: 'Past tense', 겠: 'Intention / prediction',
  시: 'Subject honorific', 으시: 'Subject honorific', 습니다: 'Formal polite ending',
  ㅂ니다: 'Formal polite ending', 어요: 'Polite ending', 아요: 'Polite ending', 여요: 'Polite ending',
  고: 'Connecting ending · and / then', 지만: 'Connecting ending · but',
  면: 'Conditional ending', 으면: 'Conditional ending',
}

function wordAnalysis(word: string, tokens: Token[]): Breakdown | undefined {
  const morphemes = tokens.filter(token => !/^S[FPSOEW]$/u.test(token.pos))
  const cut = morphemes.findIndex(token => Object.hasOwn(tagNames, token.pos))
  const head = cut < 0 ? morphemes : morphemes.slice(0, cut)
  const stem = head.map(token => token.text).join('')
  if (!stem) return
  const predicate = /^(VV|VA|VX|VCN|XSV|XSA)$/u.test(head.at(-1)!.pos)
  const suffixes = cut < 0 ? [] : morphemes.slice(cut)
  if (!suffixes.length && stem !== readingToken(word)) return
  if (suffixes.some(token => !Object.hasOwn(tagNames, token.pos))) return
  const parts = suffixes.map(token => {
    const particle = token.pos.startsWith('J')
    let form = token.text
    // The analyzer may normalize contracted 해 to 하 + 아.
    if (predicate && stem.endsWith('하') && token === suffixes[0]) {
      form = form.replace(/^아/u, '여').replace(/^았/u, '였')
    }
    const role = (particle ? particleNames[form] : endingNames[form]) ?? tagNames[token.pos]
    return { form: particle || token.pos === 'VCP' ? form : '-' + form, role }
  })
  return { base: predicate ? stem + '다' : stem, stem, parts }
}

// Offsets refer to Unicode code points and several morphemes may occupy the
// same span after contraction. Align to the original space-separated words.
export function alignAnalysis(sentence: string, tokens: Token[]) {
  const byWord: (Breakdown | undefined)[] = []
  let tokenIndex = 0
  let start = 0
  for (const [chunk] of sentence.matchAll(/\s+|\S+/gu)) {
    const end = start + Array.from(chunk).length
    if (chunk.trim()) {
      const first = tokenIndex
      while (tokenIndex < tokens.length && tokens[tokenIndex].start < end) tokenIndex++
      byWord.push(wordAnalysis(chunk, tokens.slice(first, tokenIndex)))
    }
    start = end
  }
  return byWord
}

async function loadAnalyzer() {
  const { Garu } = await import('garu-ko/browser')
  return Garu.load()
}
let analyzer: ReturnType<typeof loadAnalyzer> | undefined

export async function analyzePastedSentences(sentences: string[]) {
  analyzer ??= loadAnalyzer().catch(error => { analyzer = undefined; throw error })
  const model = await analyzer
  return new Map(sentences.map(sentence => {
    const result = model.analyze(sentence)
    return [sentence, alignAnalysis(sentence, (Array.isArray(result) ? result[0] : result).tokens)]
  }))
}
