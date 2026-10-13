const LINKS = [
  { href: '#finder', label: 'Finder' },
  { href: '#browse', label: 'Browse' },
]

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

export default function Navbar({ favoritesCount = 0 }) {
  const hasFavorites = favoritesCount > 0

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-8 md:pt-4">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full bg-surface/60 pl-5 pr-1.5 shadow-[inset_0_1px_1px_rgba(244,239,227,0.08),0_12px_40px_-20px_rgba(0,0,0,0.8)] ring-1 ring-cream/10 backdrop-blur-xl"
      >
        <a href="#top" className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lime">
          <RadarLogo />
          <span className="font-display text-lg font-semibold tracking-tight text-cream">Recipe Radar</span>
        </a>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center sm:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex h-11 items-center rounded-full px-4 text-sm font-medium text-muted outline-none transition-colors duration-500 hover:text-cream focus-visible:ring-2 focus-visible:ring-lime"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#favorites"
            aria-label={`Favorites, ${favoritesCount} saved`}
            className="flex h-11 items-center gap-2 rounded-full bg-cream/5 pl-4 pr-2 text-sm font-medium text-cream outline-none ring-1 ring-cream/10 transition-colors duration-500 hover:bg-cream/10 focus-visible:ring-2 focus-visible:ring-lime"
          >
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${hasFavorites ? 'text-tomato' : 'text-muted'}`} fill={hasFavorites ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
            </svg>
            <span aria-hidden="true">Favorites</span>
            <span
              aria-hidden="true"
              className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums transition-colors duration-500 ${
                hasFavorites ? 'bg-lime text-bg' : 'bg-cream/10 text-muted'
              }`}
            >
              {favoritesCount}
            </span>
          </a>
        </div>
      </nav>
    </header>
  )
}
