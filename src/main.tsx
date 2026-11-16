/**
 * Overview & Purpose: Mount the standalone Korean learning workspace.
 *
 * Architectural Relationships: Vite loads this entry point; the App owns the study state.
 *
 * External Resources: App stylesheet.
 *
 * Notes: Rendering is scoped to the single static document.
 */


import { createRoot } from 'react-dom/client'
import { App } from './views/App'
import './style.css'

createRoot(document.getElementById('root')!).render(<App />)
