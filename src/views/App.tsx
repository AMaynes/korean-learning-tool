/**
 * Overview & Purpose: Own navigation, shared list selection, and the study-state lifecycle.
 *
 * Architectural Relationships: Composes practice, library, settings, and introduction.
 *
 * External Resources: Browser location, IndexedDB, and BroadcastChannel.
 *
 * Notes: IndexedDB serializes writes, and broadcasts refresh other open tabs.
 */


import { useEffect, useMemo, useRef, useState } from 'react'
import { categories } from '../data/model'
import type { Category } from '../data/model'
import { activeLists, builtInLists as lists } from '../engine/registry'
import { defaults, loadState, updateState } from '../engine/storage'
import type { StudyState } from '../engine/storage'
import { Intro } from './Intro'
import { Library } from './Library'
import { Practice } from './Practice'
import { Recall } from './Recall'
import { Settings } from './Settings'
import { Icon, Korean } from './shared'
import type { Save, SelectList, View } from './shared'

const studyNav = [
  ['library', 'Vocabulary Library', 'book'],
  ['recall', 'Vocabulary Recall', 'cards'],
  ['grammar', 'Grammar Trainer', 'grammar'],
  ['listening', 'Listening & Conversation', 'sound'],
] as const

/** Keep static hosting compatible with direct links and default to the recall tool. */
function currentView(): View {
  const route = window.location.hash.slice(1)
  if (route === 'intro' || route === 'settings') return route
  return studyNav.find(([id]) => id === route)?.[0] ?? 'recall'
}

/** Render the persistent app frame and scope each workspace to its route and active lists. */
export function App() {
  const [view, setView] = useState(currentView)
  const [state, setState] = useState<StudyState>()
  const [notice, setNotice] = useState('')
  const [category, setCategory] = useState<Category>('nouns')
  const [revision, setRevision] = useState(0)
  const [volatile, setVolatile] = useState(false)
  const stateRef = useRef(defaults())
  const channel = useRef<BroadcastChannel | null>(null)
  const heading = useRef<HTMLElement>(null)

  useEffect(() => {
    let mounted = true
    let latestRead = 0
    async function refresh() {
      const read = ++latestRead
      try {
        const saved = await loadState()
        if (mounted && read === latestRead) { stateRef.current = saved; setState(saved) }
      } catch {
        if (!mounted) return
        setVolatile(true)
        setNotice('Browser storage is unavailable. This session stays in memory. Export a backup before leaving.')
        setState(stateRef.current)
      }
    }
    function onRoute() {
      setView(currentView())
      window.scrollTo(0, 0)
      heading.current?.focus({ preventScroll: true })
    }
    if ('BroadcastChannel' in window) {
      channel.current = new BroadcastChannel('korean-learning-tool-state')
      channel.current.onmessage = () => { void refresh() }
    }
    void refresh()
    window.addEventListener('hashchange', onRoute)
    return () => {
      mounted = false
      window.removeEventListener('hashchange', onRoute)
      channel.current?.close()
    }
  }, [])

  /** Save the transaction outcome before presenting committed progress. */
  const save: Save = async change => {
    try {
      const next = volatile ? change(stateRef.current) : await updateState(change)
      stateRef.current = next
      setState(next)
      channel.current?.postMessage('update')
      return true
    } catch {
      setNotice('The browser could not save this change. Free some storage or close other study tabs, then try again.')
      return false
    }
  }

  const active = useMemo(() => activeLists(state?.selected ?? stateRef.current.selected), [state?.selected])
  const onSelect: SelectList = (category, id) => {
    if (!lists.some(list => list.category === category && list.id === id)) return
    void save(previous => ({ ...previous, selected: { ...previous.selected, [category]: id } }))
  }
  const toolActive = view !== 'intro' && view !== 'settings'

  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); heading.current?.focus() }}>Skip to practice</a>
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#recall"><span className="brand-mark"><Korean>한</Korean></span><div><strong>Korean Learning Tool</strong><small><Korean>한국어 연습</Korean></small></div></a>
        <nav className="top-nav" aria-label="Site">
          <a href="#recall" aria-current={toolActive ? 'page' : undefined}>Tool</a>
          <a href="#intro" aria-current={view === 'intro' ? 'page' : undefined}>Intro</a>
        </nav>
        <a className="button top-settings" href="#settings" aria-current={view === 'settings' ? 'page' : undefined}><Icon name="settings" /><span>Settings</span></a>
      </div>
    </header>
    <div className={'app-frame ' + (!toolActive ? 'full-frame' : '')}>
      {toolActive && <aside className="sidebar">
        <nav aria-label="Learning modules"><span className="sidebar-label">Study modules</span>
          {studyNav.map(([id, name, icon]) => <a href={'#' + id} key={id} aria-current={view === id ? 'page' : undefined}><Icon name={icon} /><span>{name}</span></a>)}
        </nav>
        <nav className="sidebar-bottom" aria-label="Study preferences"><a href="#settings"><Icon name="settings" /><span>Active vocabulary</span></a></nav>
      </aside>}
      <main id="main" ref={heading} tabIndex={-1} className="main">
        {notice && <p className="status-message" role="status">{notice}</p>}
        {!state && view !== 'intro' && <p role="status">Loading your study workspace…</p>}
        {view === 'intro' && <Intro />}
        {state && view === 'settings' && <Settings state={state} lists={lists} active={active}
          onSelect={onSelect} save={save} invalidate={() => setRevision(value => value + 1)} />}
        {state && view === 'recall' && <Recall key={revision} category={category} setCategory={setCategory} deck={active[category]}
          lists={lists} onSelect={onSelect} save={save} progress={state.recall[active[category].id]} />}
        {state && view === 'library' && <Library category={category} setCategory={setCategory} active={active[category]}
          lists={lists} onSelect={onSelect} />}
        {state && (view === 'grammar' || view === 'listening') && <Practice key={view + revision}
          module={view} active={active} lists={lists} state={state} onSelect={onSelect} save={save} />}
        <footer className="footer"><span><Korean>한국어 연습</Korean></span><span>{toolActive ? `Active ${categories[category].toLowerCase()} · ${active[category].name}` : 'Korean Learning Tool'}</span></footer>
      </main>
    </div>
  </>
}
