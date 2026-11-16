/**
 * Overview & Purpose: Configure static hosting for any repository path.
 *
 * Architectural Relationships: Loaded by Vite and Vitest.
 *
 * External Resources: None.
 *
 * Notes: Hash navigation keeps direct links on the single HTML entry point.
 */


import { defineConfig } from 'vite'

export default defineConfig({ base: './' })
