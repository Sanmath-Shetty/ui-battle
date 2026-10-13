import { useRef, useState } from 'react'
import gsap from 'gsap'
import DietMark from './DietMark.jsx'
import { CARD_HAIRLINE, WashiTape, indexCardLook } from './IndexCard.jsx'

const CATEGORY_LABELS = { breakfast: 'Breakfast', main: 'Lunch & Dinner', dessert: 'Dessert' }
const DIET_LABELS = { veg: 'Veg', nonveg: 'Non-veg' }
const BURST = [0, 60, 120, 180, 240, 300]

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Heart that pops on every click and throws a small burst of tomato specks when saving. */
function HeartButton({ name, active, onClick }) {
  const button = useRef(null)

  // Its own control, not part of the card's open-recipe hit area: never let the click travel on.
  const press = (event) => {
    event.stopPropagation()
    onClick()
    if (reduced()) return
    const q = gsap.utils.selector(button)
    gsap.fromTo(q('[data-heart]'), { scale: 1 }, { keyframes: { scale: [1, 1.35, 0.92, 1] }, duration: 0.45, ease: 'power2.out' })
    if (active) return
    q('[data-speck]').forEach((speck, i) => {
      const angle = (BURST[i] * Math.PI) / 180
      gsap.fromTo(
        speck,
        { x: 0, y: 0, scale: 1, autoAlpha: 1 },
        { x: Math.cos(angle) * 20, y: Math.sin(angle) * 20, scale: 0.3, autoAlpha: 0, duration: 0.5, ease: 'power3.out' },
      )
    })
  }

  return (
    <button
      ref={button}
      type="button"
      onClick={press}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Save'} ${name} ${active ? 'from' : 'to'} favorites`}
      className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-paper-2 text-ink outline-none ring-2 ring-ink focus-visible:ring-tomato-ink"
    >
      {BURST.map((deg) => (
        <span key={deg} data-speck aria-hidden="true" className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-tomato opacity-0" />
      ))}
      <svg data-heart viewBox="0 0 24 24" className={`h-5 w-5 ${active ? 'text-tomato-ink' : ''}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/** "3/5 IN POT" inside a pencil loop. */
function PotBadge({ have, total }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${have > 0 ? 'text-basil' : 'text-ink-soft'}`}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <path
          d="M52 4C78 3 97 10 96 21 95 32 74 37 49 36 24 35 4 30 4 19 4 9 22 3 46 4c10 0 20 2 26 5"
          fill="none"
          stroke={have > 0 ? '#2E6A3C' : 'rgb(28 25 21 / 0.35)'}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative">{have}/{total} in pot</span>
    </span>
  )
}

function PhotoFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-paper">
      <svg viewBox="0 0 64 64" className="h-14 w-14 text-ink/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M10 34h44a22 18 0 0 1-44 0z" />
        <path d="M22 54h20M26 10c-3 4 3 6 0 10M34 8c-3 4 3 6 0 10M42 12c-3 4 3 6 0 10" />
      </svg>
    </div>
  )
}

/**
 * Recipe index card: washi tape, hand-cut edge, a small tilt that straightens on hover.
 * `onOpen` and `onToggleFavorite` are optional; without them the card is a plain summary.
 * `pantry` is the ingredient list in the pot. When it is not empty the card shows how much
 * of the recipe is already in the kitchen.
 */
export default function RecipeCard({ recipe, pantry = [], onOpen, isFavorite = false, onToggleFavorite }) {
  const [imageFailed, setImageFailed] = useState(!recipe.image)
  const { name, category, diet, time, difficulty, image, ingredients } = recipe
  const have = ingredients.filter((item) => pantry.includes(item)).length
  const { clipPath, tilt } = indexCardLook(recipe.id, 1)

  return (
    // The outer box never moves, so hover stays put; only the inner card lifts (no edge flicker).
    <div className="group h-full pt-2.5">
      <div
        className="relative h-full rotate-(--tilt) transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1.5 group-hover:rotate-0 group-focus-within:rotate-0"
        style={{ '--tilt': tilt }}
      >
        <WashiTape className="left-1/2 -translate-x-1/2" />
        <div className={`h-full ${CARD_HAIRLINE}`}>
          <article className="relative flex h-full flex-col bg-paper-2 p-2" style={{ clipPath }}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
              {imageFailed ? (
                <PhotoFallback />
              ) : (
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
                />
              )}
              <span className="pointer-events-none absolute inset-0 rounded-t-lg ring-1 ring-inset ring-ink/10" aria-hidden="true" />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink ring-1 ring-ink/15">
                <DietMark diet={diet} />
                {DIET_LABELS[diet]}
              </span>
            </div>

            {onToggleFavorite && <HeartButton name={name} active={isFavorite} onClick={() => onToggleFavorite(recipe.id)} />}

            <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <p className="pt-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-tomato-ink">{CATEGORY_LABELS[category]}</p>
                {pantry.length > 0 && <PotBadge have={have} total={ingredients.length} />}
              </div>
              <h3 className="mt-2 font-display text-xl font-bold leading-snug tracking-tight text-ink">
                {onOpen ? (
                  <button
                    type="button"
                    onClick={() => onOpen(recipe)}
                    className="text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-tomato-ink"
                  >
                    {name}
                  </button>
                ) : (
                  name
                )}
              </h3>
              <p className="mt-auto pt-4 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">
                {time} min · {difficulty} · {ingredients.length} ingredients
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
