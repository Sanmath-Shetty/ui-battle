import { useEffect, useState } from 'react'

const LINKS = [
  { id: 'top', label: 'The pot' },
  { id: 'browse', label: 'Browse' },
  { id: 'favorites', label: 'Favorites' },
]

const label = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em]'
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-tomato'

function RadarLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5.5" strokeWidth="1.4" strokeOpacity="0.5" />
      <path d="M12 12 19 5" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.2" fill="#E5432D" stroke="none" />
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
        className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border-[1.5px] border-ink bg-paper-2/85 pl-5 pr-1.5 shadow-[3px_3px_0_#1C1915] backdrop-blur-md 2xl:max-w-[1600px]"
      >
        <a href="#top" onClick={(event) => goTo(event, 'top')} className={`flex min-h-11 items-center gap-2.5 rounded-full ${focusRing}`}>
          <RadarLogo />
          <span className="text-lg font-extrabold tracking-tight text-ink">Recipe Radar</span>
        </a>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center sm:flex">
            {LINKS.slice(0, 2).map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(event) => goTo(event, link.id)}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={`flex h-11 items-center rounded-full px-4 underline-offset-[6px] transition-colors duration-300 hover:text-tomato-ink ${label} ${focusRing} ${
                    active === link.id ? 'text-tomato-ink underline decoration-2' : 'text-ink'
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
            className={`flex h-11 items-center gap-2 rounded-full border-[1.5px] pl-3.5 pr-1.5 text-ink transition-colors duration-300 hover:border-ink ${label} ${focusRing} ${
              active === 'favorites' ? 'border-ink' : 'border-ink/15'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-tomato" fill={hasFavorites ? 'currentColor' : 'none'} stroke="#1C1915" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
            </svg>
            <span aria-hidden="true" className="hidden sm:inline">Favorites</span>
            <span
              aria-hidden="true"
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 font-semibold tabular-nums transition-colors duration-300 ${
                hasFavorites ? 'bg-saffron text-ink' : 'bg-ink/10 text-ink-soft'
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
            className={`flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-300 hover:bg-ink/10 sm:hidden ${focusRing}`}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /> : <path d="M2.5 5.5h11M2.5 10.5h11" />}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <ul
          id="mobile-menu"
          className="mx-auto mt-3 max-w-7xl rounded-3xl border-[1.5px] border-ink bg-paper-2 p-2 shadow-[3px_3px_0_#1C1915] sm:hidden"
        >
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(event) => goTo(event, link.id)}
                aria-current={active === link.id ? 'true' : undefined}
                className={`flex h-12 items-center justify-between rounded-2xl px-4 text-lg font-bold tracking-tight transition-colors duration-300 hover:bg-ink/5 ${focusRing} ${
                  active === link.id ? 'text-tomato-ink' : 'text-ink'
                }`}
              >
                {link.label}
                {link.id === 'favorites' && <span className={`${label} tabular-nums text-ink-soft`}>{favoritesCount}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
