import RecipeCard from './RecipeCard.jsx'

export default function Favorites({ recipes, favoriteIds, onOpenRecipe, onToggleFavorite }) {
  // Keep the order in which recipes were saved.
  const saved = favoriteIds.map((id) => recipes.find((recipe) => recipe.id === id)).filter(Boolean)

  return (
    <section id="favorites" aria-labelledby="favorites-title" className="scroll-mt-24 px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-surface/60 p-6 ring-1 ring-cream/10 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-tomato">Your shortlist</p>
            <h2 id="favorites-title" className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-tight tracking-tight text-cream">
              Saved for later
            </h2>
          </div>
          <p className="text-sm tabular-nums text-muted" aria-live="polite">
            {saved.length} {saved.length === 1 ? 'recipe' : 'recipes'} saved on this device
          </p>
        </div>

        {saved.length > 0 ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} onOpen={onOpenRecipe} isFavorite onToggleFavorite={onToggleFavorite} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-cream/15 px-6 py-12 text-center">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-tomato/80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
            </svg>
            <p className="mt-4 font-display text-xl font-semibold text-cream">Nothing saved yet.</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Tap the heart on any recipe and it will wait here for you, even after you close the tab.
            </p>
            <a
              href="#browse"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-cream/10 px-5 text-sm font-medium text-cream outline-none transition-colors duration-500 hover:bg-cream/15 focus-visible:ring-2 focus-visible:ring-lime"
            >
              Browse recipes
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
