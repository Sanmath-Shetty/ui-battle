const LINKS = [
  { href: '#top', label: 'The pot' },
  { href: '#browse', label: 'Browse' },
  { href: '#favorites', label: 'Favorites' },
]

const label = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em]'

export default function Footer() {
  return (
    <footer className="border-t border-ink/15 px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between 2xl:max-w-[1600px]">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-ink">Recipe Radar</p>
          <p className="mt-1 text-base text-ink-soft">Scan your pantry. Find dinner.</p>
        </div>

        <nav aria-label="Footer">
          <ul className="-mx-3 flex flex-wrap">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`flex h-11 items-center rounded-full px-3 text-ink underline-offset-4 outline-none hover:text-tomato-ink hover:underline focus-visible:ring-2 focus-visible:ring-tomato ${label}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className={`${label} text-ink-soft`}>Food photography from Unsplash</p>
      </div>
    </footer>
  )
}
