import { useState } from 'react'
import DietMark from './DietMark.jsx'

const CATEGORY_LABELS = { breakfast: 'Breakfast', main: 'Lunch & Dinner', dessert: 'Dessert' }
const DIET_LABELS = { veg: 'Veg', nonveg: 'Non-veg' }

function HeartButton({ name, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Save'} ${name} ${active ? 'from' : 'to'} favorites`}
      className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-bg/70 ring-1 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-95 ${
        active ? 'text-tomato ring-tomato/50' : 'text-cream ring-cream/15'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/**
 * `onOpen` and `onToggleFavorite` are optional: the card stays a plain summary until
 * RecipeModal and useFavorites are wired in.
 */
export default function RecipeCard({ recipe, onOpen, isFavorite = false, onToggleFavorite }) {
  const [imageFailed, setImageFailed] = useState(false)
  const { name, category, diet, time, difficulty, image, ingredients } = recipe

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-cream/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-[0_18px_50px_-22px_rgba(200,241,105,0.55)] hover:ring-lime/30 focus-within:ring-lime/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(120%_120%_at_20%_10%,#1e3226,#16251c_55%,#0f1a14)]">
        {/* Thin radar rings show through as the fallback when the photo is missing. */}
        <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {[90, 62, 34].map((r) => (
            <circle key={r} cx="100" cy="75" r={r} fill="none" stroke="#c8f169" strokeOpacity="0.14" strokeWidth="0.5" />
          ))}
        </svg>
        {!imageFailed && (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface to-transparent" aria-hidden="true" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-bg/70 px-2.5 py-1.5 text-xs font-medium text-cream ring-1 ring-cream/15 backdrop-blur-md">
          <DietMark diet={diet} />
          {DIET_LABELS[diet]}
        </span>

        {onToggleFavorite && (
          <HeartButton name={name} active={isFavorite} onClick={() => onToggleFavorite(recipe.id)} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-lime/80">{CATEGORY_LABELS[category]}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-cream">
          {onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(recipe)}
              className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-lime"
            >
              {name}
            </button>
          ) : (
            name
          )}
        </h3>

        <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Time</dt>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <circle cx="8" cy="8" r="6.2" />
              <path d="M8 4.6V8l2.3 1.5" strokeLinecap="round" />
            </svg>
            <dd>{time} min</dd>
          </div>
          <div>
            <dt className="sr-only">Difficulty</dt>
            <dd className="capitalize">{difficulty}</dd>
          </div>
          <div>
            <dt className="sr-only">Ingredients</dt>
            <dd>{ingredients.length} ingredients</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
