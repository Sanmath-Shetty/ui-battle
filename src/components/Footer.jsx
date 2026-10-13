const LINKS = [
  { href: '#top', label: 'Radar' },
  { href: '#browse', label: 'Browse' },
  { href: '#favorites', label: 'Favorites' },
]

export default function Footer() {
  return (
    <footer className="border-t border-cream/10 px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl font-semibold text-cream">Recipe Radar</p>
          <p className="mt-1 text-sm text-muted">Scan your pantry. Find dinner.</p>
        </div>

        <nav aria-label="Footer">
          <ul className="-mx-3 flex flex-wrap">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex h-11 items-center rounded-full px-3 text-sm text-muted outline-none transition-colors duration-500 hover:text-cream focus-visible:ring-2 focus-visible:ring-lime"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-xs text-muted/80">Food photography from Unsplash.</p>
      </div>
    </footer>
  )
}
