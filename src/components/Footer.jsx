const LINKS = [
  { href: '#top', label: 'Radar' },
  { href: '#browse', label: 'Browse' },
  { href: '#favorites', label: 'Favorites' },
]

// Torn top edge, drawn as a strip that sits on top of the footer's paper.
const TORN_TOP = (() => {
  const points = []
  for (let i = 0; i <= 60; i++) points.push(`${(i / 60) * 1200},${[9, 4, 11, 6, 2, 8, 12, 5][i % 8]}`)
  return `M0,16 L${points.join(' L')} L1200,16 Z`
})()

function smoothScroll(event, href) {
  const target = document.querySelector(href)
  if (!target) return
  event.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  history.replaceState(null, '', href)
}

function PotDoodle() {
  return (
    <svg viewBox="0 0 48 40" className="h-9 w-11 shrink-0" fill="none" stroke="#1C1915" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 9c-2 3 2 4 0 7M24 6c-2 3 2 4 0 7M31 9c-2 3 2 4 0 7" />
      <path d="M8 19h32v6a12 12 0 0 1-12 12h-8A12 12 0 0 1 8 25z" fill="#E5432D" />
      <path d="M6 19h36M8 22H4M40 22h4" />
    </svg>
  )
}

/** Cookbook back page: torn paper edge, logo with a pot doodle, quick links, taped credit line. */
export default function Footer() {
  return (
    <footer className="relative mt-8 bg-paper-2 px-4 pb-10 pt-12 md:px-8 md:pt-14">
      <svg viewBox="0 0 1200 16" preserveAspectRatio="none" className="absolute inset-x-0 -top-[15px] h-4 w-full" aria-hidden="true">
        <path d={TORN_TOP} fill="#FBF6EC" />
      </svg>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <PotDoodle />
          <div>
            <p className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">Recipe Radar</p>
            <p className="mt-1 text-base text-ink-soft">Scan your pantry. Find dinner.</p>
          </div>
        </div>

        <nav aria-label="Footer">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft">Jump to</p>
          <ul className="-mx-3 mt-1 flex flex-wrap">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => smoothScroll(event, link.href)}
                  className="group relative flex h-11 items-center px-3 text-base font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-tomato-ink"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-2 h-[2px] origin-left scale-x-0 rounded-full bg-tomato-ink transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-start gap-4 border-t border-dashed border-ink/20 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="relative -rotate-1 px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink">
          <span aria-hidden="true" className="absolute inset-0 -z-0 bg-saffron/45" style={{ clipPath: 'polygon(0 12%, 3% 0, 97% 4%, 100% 16%, 98% 50%, 100% 86%, 97% 100%, 3% 96%, 0 84%, 2% 50%)' }} />
          <span className="relative">
            Made with <span className="text-tomato-ink" role="img" aria-label="love">♥</span> by Team Hallmark — Pratham &amp; Sanmath
          </span>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">Food photography from Unsplash</p>
      </div>
    </footer>
  )
}
