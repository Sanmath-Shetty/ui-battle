import { useState } from 'react'
import DietMark from './DietMark.jsx'

const CATEGORY_LABELS = { breakfast: 'Breakfast', main: 'Lunch & Dinner', dessert: 'Dessert' }
const DIET_LABELS = { veg: 'Veg', nonveg: 'Non-veg' }

// Index-card look shared with the hero's MatchStrip: hand-cut edges, washi tape, a seeded tilt.
const CARD_EDGES = [
  'polygon(0.4% 0.8%, 22% 0.2%, 47% 0.6%, 71% 0.1%, 99.6% 0.5%, 100% 38%, 99.5% 71%, 99.8% 99.4%, 74% 99.8%, 49% 99.4%, 23% 99.9%, 0.2% 99.5%, 0.5% 64%, 0% 31%)',
  'polygon(0% 0.3%, 26% 0.7%, 53% 0.1%, 78% 0.6%, 99.7% 0%, 99.4% 33%, 100% 66%, 99.6% 99.7%, 72% 99.4%, 44% 99.9%, 19% 99.5%, 0.4% 99.8%, 0% 69%, 0.5% 36%)',
  'polygon(0.4% 0.1%, 31% 0.5%, 58% 0.2%, 83% 0.7%, 100% 0.3%, 99.6% 42%, 100% 77%, 99.3% 99.8%, 68% 99.5%, 39% 100%, 14% 99.4%, 0% 99.7%, 0.4% 58%, 0% 24%)',
]

// Stable pseudo-random number in [0, 1) from a recipe id, so a card keeps its tilt and edge.
function seeded(id) {
  let h = 2166136261
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0) / 4294967296
}

function WashiTape() {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-2.5 left-6 z-10 h-[18px] w-16 -rotate-[5deg] bg-saffron/55"
      style={{
        clipPath: 'polygon(0 10%, 4% 0, 96% 0, 100% 14%, 97% 32%, 100% 50%, 96% 68%, 100% 86%, 96% 100%, 4% 100%, 0 88%, 3% 70%, 0 50%, 3% 30%)',
        backgroundImage: 'repeating-linear-gradient(45deg, rgb(255 255 255 / 0.22) 0 4px, transparent 4px 9px)',
      }}
    />
  )
}

// Line-art plate shown on a flat saffron block when the photo fails to load.
function PlateFallback() {
  return (
    <svg viewBox="0 0 64 64" className="absolute inset-0 m-auto h-16 w-16 text-ink/50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="32" cy="34" r="20" />
      <circle cx="32" cy="34" r="12" />
      <path d="M26 8c-3 3 3 5 0 8M34 6c-3 3 3 5 0 8M42 8c-3 3 3 5 0 8" />
    </svg>
  )
}

function HeartButton({ name, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Save'} ${name} ${active ? 'from' : 'to'} favorites`}
      className={`absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper-2 shadow-[2px_2px_0_#1C1915] outline-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:-rotate-6 focus-visible:ring-2 focus-visible:ring-tomato active:translate-y-0 ${
        active ? 'text-tomato' : 'text-ink'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? 'currentColor' : 'none'} stroke={active ? '#1C1915' : 'currentColor'} strokeWidth="1.8" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/**
 * `onOpen` and `onToggleFavorite` are optional; without them the card is a plain summary.
 * `pantry` is the ingredient list in the pot. When it is not empty the card shows
 * how much of the recipe is already in the kitchen.
 */
export default function RecipeCard({ recipe, pantry = [], onOpen, isFavorite = false, onToggleFavorite }) {
  const [imageFailed, setImageFailed] = useState(false)
  const { name, category, diet, time, difficulty, image, ingredients } = recipe
  const have = ingredients.filter((item) => pantry.includes(item)).length
  const r = seeded(recipe.id)
  const tilt = (r * 3 - 1.5).toFixed(2)
  const edge = CARD_EDGES[Math.floor(r * 1000) % CARD_EDGES.length]

  return (
    <div className="group h-full pt-2.5">
      <div
        className="relative h-full rotate-(--tilt) transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-focus-within:rotate-0 group-hover:-translate-y-1 group-hover:rotate-0"
        style={{ '--tilt': `${tilt}deg` }}
      >
        <WashiTape />
        <div className="h-full [filter:drop-shadow(0_0_0.5px_rgb(28_25_21/0.45))_drop-shadow(0_2px_0_rgb(28_25_21/0.08))]">
          <article className="relative flex h-full flex-col bg-paper-2 p-3 pt-4" style={{ clipPath: edge }}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-saffron/35">
              {imageFailed ? (
                <PlateFallback />
              ) : (
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageFailed(true)}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                />
              )}

              <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper-2 px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink">
                <DietMark diet={diet} />
                {DIET_LABELS[diet]}
              </span>

              {onToggleFavorite && (
                <HeartButton name={name} active={isFavorite} onClick={() => onToggleFavorite(recipe.id)} />
              )}
            </div>

            <div className="flex flex-1 flex-col px-1.5 pb-2 pt-4">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-tomato-ink">{CATEGORY_LABELS[category]}</p>
              <h3 className="mt-1.5 text-xl font-bold leading-tight tracking-tight text-ink">
                {onOpen ? (
                  <button
                    type="button"
                    onClick={() => onOpen(recipe)}
                    className="text-left outline-none after:absolute after:inset-0 focus-visible:after:ring-[3px] focus-visible:after:ring-inset focus-visible:after:ring-tomato"
                  >
                    {name}
                  </button>
                ) : (
                  name
                )}
              </h3>

              <dl className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                <div>
                  <dt className="sr-only">Time</dt>
                  <dd>{time} min</dd>
                </div>
                <div>
                  <dt className="sr-only">Difficulty</dt>
                  <dd>{difficulty}</dd>
                </div>
                <div>
                  <dt className="sr-only">Ingredients</dt>
                  {pantry.length > 0 ? (
                    <dd className={have > 0 ? 'font-semibold text-basil' : ''}>
                      You have {have}/{ingredients.length}
                    </dd>
                  ) : (
                    <dd>{ingredients.length} ingredients</dd>
                  )}
                </div>
              </dl>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
