/**
 * Overview & Purpose: Configure static hosting for any repository path.
 *
 * Architectural Relationships: Loaded by Vite and Vitest.
 *
 * External Resources: None.
 *
 * Notes: Hash navigation keeps direct links on the single HTML entry point.
 */


import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [{
    name: 'garu-dictionary-notices',
    generateBundle() {
      const root = join(dirname(fileURLToPath(import.meta.resolve('garu-ko/browser'))), '..')
      const licenses = readdirSync(join(root, 'models/licenses')).map(file => 'models/licenses/' + file)
      for (const file of ['LICENSE', 'NOTICE', 'models/NOTICE.md', 'models/bulk-provenance.json', ...licenses]) {
        this.emitFile({ type: 'asset', fileName: 'licenses/garu/' + file, source: readFileSync(join(root, file)) })
      }
    },
  }],
})
