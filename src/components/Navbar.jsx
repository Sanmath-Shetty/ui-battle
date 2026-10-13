import { useEffect, useState } from 'react'

const LINKS = [
  { id: 'top', label: 'Radar' },
  { id: 'browse', label: 'Browse' },
  { id: 'favorites', label: 'Favorites' },
]

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-lime'

function RadarLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-lime" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeWidth="1.2" strokeOpacity="0.45" />
      <circle cx="12" cy="12" r="5.5" strokeWidth="1.2" strokeOpacity="0.7" />
      <path d="M12 12 19 5" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Tracks which page section sits under the middle of the viewport. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids])

  return active
}

const SECTION_IDS = LINKS.map((link) => link.id)

export default function Navbar({ favoritesCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useActiveSection(SECTION_IDS)
  const hasFavorites = favoritesCount > 0

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const goTo = (event, id) => {
    event.preventDefault()
    setMenuOpen(false)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-8 md:pt-4">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full bg-surface/60 pl-5 pr-1.5 shadow-[inset_0_1px_1px_rgba(244,239,227,0.08),0_12px_40px_-20px_rgba(0,0,0,0.8)] ring-1 ring-cream/10 backdrop-blur-xl"
      >
        <a href="#top" onClick={(event) => goTo(event, 'top')} className={`flex items-center gap-2.5 rounded-full ${focusRing}`}>
          <RadarLogo />
          <span className="font-display text-lg font-semibold tracking-tight text-cream">Recipe Radar</span>
        </a>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center sm:flex">
            {LINKS.slice(0, 2).map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(event) => goTo(event, link.id)}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={`flex h-11 items-center rounded-full px-4 text-sm font-medium transition-colors duration-500 hover:text-cream ${focusRing} ${
                    active === link.id ? 'text-lime' : 'text-muted'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#favorites"
            onClick={(event) => goTo(event, 'favorites')}
            aria-label={`Favorites, ${favoritesCount} saved`}
            className={`flex h-11 items-center gap-2 rounded-full bg-cream/5 pl-3.5 pr-2 text-sm font-medium text-cream ring-1 transition-colors duration-500 hover:bg-cream/10 ${focusRing} ${
              active === 'favorites' ? 'ring-lime/40' : 'ring-cream/10'
            }`}
          >
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${hasFavorites ? 'text-tomato' : 'text-muted'}`} fill={hasFavorites ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
            </svg>
            <span aria-hidden="true" className="hidden sm:inline">Favorites</span>
            <span
              aria-hidden="true"
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums transition-colors duration-500 ${
                hasFavorites ? 'bg-lime text-bg' : 'bg-cream/10 text-muted'
              }`}
            >
              {favoritesCount}
            </span>
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-cream transition-colors duration-500 hover:bg-cream/10 sm:hidden ${focusRing}`}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /> : <path d="M2.5 5.5h11M2.5 10.5h11" />}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <ul
          id="mobile-menu"
          className="mx-auto mt-2 max-w-7xl rounded-3xl bg-surface/90 p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] ring-1 ring-cream/10 backdrop-blur-xl sm:hidden"
        >
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(event) => goTo(event, link.id)}
                aria-current={active === link.id ? 'true' : undefined}
                className={`flex h-12 items-center justify-between rounded-2xl px-4 text-base font-medium transition-colors duration-500 hover:bg-cream/5 ${focusRing} ${
                  active === link.id ? 'text-lime' : 'text-cream'
                }`}
              >
                {link.label}
                {link.id === 'favorites' && <span className="text-sm tabular-nums text-muted">{favoritesCount}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
