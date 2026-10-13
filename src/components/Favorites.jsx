import RecipeCard from './RecipeCard.jsx'

const label = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em]'

export default function Favorites({ recipes, pantry = [], favoriteIds, onOpenRecipe, onToggleFavorite }) {
  // Keep the order in which recipes were saved.
  const saved = favoriteIds.map((id) => recipes.find((recipe) => recipe.id === id)).filter(Boolean)

  return (
    <section id="favorites" aria-labelledby="favorites-title" className="scroll-mt-24 px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
        <p className={`${label} text-tomato-ink`}>Your shortlist</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-ink/15 pb-4">
          <h2 id="favorites-title" className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
            Saved for later
          </h2>
          <p className={`${label} tabular-nums text-ink-soft`} aria-live="polite">
            {saved.length} {saved.length === 1 ? 'recipe' : 'recipes'} saved on this device
          </p>
        </div>

        {saved.length > 0 ? (
          <ul className="mt-6 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} pantry={pantry} onOpen={onOpenRecipe} isFavorite onToggleFavorite={onToggleFavorite} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-2xl border-2 border-dashed border-ink/20 px-6 py-12 text-center">
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-tomato" fill="currentColor" stroke="#1C1915" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
            </svg>
            <p className="mt-4 text-2xl font-bold tracking-tight text-ink">Nothing saved yet.</p>
            <p className="mt-2 max-w-sm text-base leading-snug text-ink-soft">
              Tap the heart on any recipe and it will wait here for you, even after you close the tab.
            </p>
            <a
              href="#browse"
              className={`mt-6 inline-flex h-11 items-center rounded-full bg-ink px-5 text-paper outline-none transition-colors duration-300 hover:bg-tomato focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${label}`}
            >
              Browse recipes
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
