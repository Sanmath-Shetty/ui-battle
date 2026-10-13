import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import RecipeCard from './RecipeCard.jsx'
import DietMark from './DietMark.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'main', label: 'Lunch & Dinner' },
  { value: 'dessert', label: 'Desserts' },
]

const DIETS = [
  { value: 'all', label: 'All' },
  { value: 'veg', label: 'Veg' },
  { value: 'nonveg', label: 'Non-veg' },
]

const CATEGORY_WORDS = { breakfast: 'breakfast', main: 'lunch dinner main', dessert: 'dessert sweet' }
const DIET_WORDS = { veg: 'veg vegetarian', nonveg: 'non-veg nonveg' }

// Every word typed must appear somewhere in the recipe's name, ingredients, meal or diet.
function matchesQuery(recipe, query) {
  const haystack = [recipe.name, ...recipe.ingredients, CATEGORY_WORDS[recipe.category], DIET_WORDS[recipe.diet]].join(' ').toLowerCase()
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((word) => haystack.includes(word))
}

const label = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em]'
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

/** Paper index tabs on a ruled line; one hand-drawn underline slides to the active tab. */
function CategoryTabs({ value, onChange, counts }) {
  const row = useRef(null)
  const underline = useRef(null)

  useEffect(() => {
    const place = (animate) => {
      const active = row.current?.querySelector('[aria-pressed="true"]')
      if (!active) return
      const to = { x: active.offsetLeft + 10, width: active.offsetWidth - 20 }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (animate && !reduce) gsap.to(underline.current, { ...to, duration: 0.45, ease: 'power3.out' })
      else gsap.set(underline.current, to)
    }
    place(true)
    const onResize = () => place(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [value])

  return (
    <div
      ref={row}
      role="group"
      aria-label="Filter by meal"
      className="relative -mx-4 flex gap-1 overflow-x-auto border-b-2 border-ink/15 px-4 pt-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORIES.map((category) => {
        const active = category.value === value
        return (
          <button
            key={category.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category.value)}
            className={`relative inline-flex h-12 shrink-0 items-center gap-2 rounded-t-lg border-2 border-b-0 px-4 text-sm font-semibold outline-none transition-[background-color,color,translate] duration-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tomato-ink ${
              active
                ? '-mb-[2px] border-ink/15 bg-paper-2 text-ink'
                : 'translate-y-1 border-transparent text-ink-soft hover:translate-y-0.5 hover:bg-paper-2/60 hover:text-ink'
            }`}
          >
            {category.label}
            <span className={`font-mono text-[10px] tabular-nums ${active ? 'text-tomato-ink' : 'text-ink-soft'}`}>{counts[category.value]}</span>
          </button>
        )
      })}
      <svg
        ref={underline}
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-1.5 left-0 h-2 w-0"
        aria-hidden="true"
      >
        <path d="M2 5c16-3 30-3 48-1s34 2 48-2" fill="none" stroke="#A8301D" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

function DietFilter({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter by diet" className="inline-flex self-start rounded-full border-[1.5px] border-ink bg-paper-2 p-1">
      {DIETS.map((diet) => {
        const active = diet.value === value
        return (
          <button
            key={diet.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(diet.value)}
            className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 transition-colors duration-300 ${label} ${focusRing} ${
              active ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {diet.value !== 'all' && <DietMark diet={diet.value} />}
            {diet.label}
          </button>
        )
      })}
    </div>
  )
}

function SearchField({ value, onChange }) {
  return (
    <div className="relative w-full rounded-full border-[1.5px] border-ink bg-paper-2 shadow-[3px_3px_0_#1C1915] transition-transform duration-300 focus-within:-translate-y-0.5 md:max-w-sm">
      <label htmlFor="recipe-search" className="sr-only">Search recipes</label>
      <svg viewBox="0 0 16 16" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3 3" strokeLinecap="round" />
      </svg>
      <input
        id="recipe-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by dish or ingredient"
        autoComplete="off"
        className="h-12 w-full rounded-full bg-transparent pl-11 pr-5 text-base text-ink outline-none placeholder:text-ink-soft/70 focus-visible:ring-2 focus-visible:ring-tomato"
      />
    </div>
  )
}

export default function Browse({ recipes, pantry = [], onOpenRecipe, favoriteIds = [], onToggleFavorite }) {
  const root = useRef(null)
  const [category, setCategory] = useState('all')
  const [diet, setDiet] = useState('all')
  const [query, setQuery] = useState('')

  const inDiet = recipes.filter((recipe) => (diet === 'all' || recipe.diet === diet) && matchesQuery(recipe, query))
  // With something in the pot, best match first (share of the recipe you have, then count).
  // Array.sort is stable, so ties and the empty-pot case keep the default order.
  const filtered = inDiet.filter((recipe) => category === 'all' || recipe.category === category)
  const visible =
    pantry.length === 0
      ? filtered
      : filtered
          .map((recipe) => ({ recipe, have: recipe.ingredients.filter((item) => pantry.includes(item)).length }))
          .sort((a, b) => b.have / b.recipe.ingredients.length - a.have / a.recipe.ingredients.length || b.have - a.have)
          .map(({ recipe }) => recipe)
  const counts = Object.fromEntries(
    CATEGORIES.map(({ value }) => [value, value === 'all' ? inDiet.length : inDiet.filter((r) => r.category === value).length]),
  )

  const clearFilters = () => {
    setCategory('all')
    setDiet('all')
    setQuery('')
  }

  // Cards rise in on first scroll and again whenever the filters change.
  useGSAP(
    () => {
      const cards = gsap.utils.toArray('[data-card]', root.current)
      if (cards.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(cards, {
        y: 24,
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      })
    },
    { scope: root, dependencies: [category, diet], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="browse" aria-labelledby="browse-title" className="scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
        <p className={`${label} text-tomato-ink`}>The full cookbook</p>
        <h2 id="browse-title" className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,5.5vw,4.25rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
          Every recipe, <span className="text-tomato">one shelf.</span>
        </h2>
        <p className="mt-4 max-w-xl text-base leading-snug text-ink-soft lg:text-lg">
          Not sure what is in the fridge yet? Start with the meal you are in the mood for and narrow it down from there.
        </p>

        <div className="mt-10">
          <SearchField value={query} onChange={setQuery} />
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CategoryTabs value={category} onChange={setCategory} counts={counts} />
          <DietFilter value={diet} onChange={setDiet} />
        </div>

        <p className={`mt-6 border-b border-ink/15 pb-2 text-ink-soft ${label}`} aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? 'recipe' : 'recipes'}
        </p>

        {visible.length > 0 ? (
          <ul className="mt-6 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((recipe) => (
              <li key={recipe.id} data-card>
                <RecipeCard
                  recipe={recipe}
                  pantry={pantry}
                  onOpen={onOpenRecipe}
                  isFavorite={favoriteIds.includes(recipe.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-ink/20 px-6 py-14 text-center">
            <p className="font-display text-3xl font-extrabold tracking-tight text-ink">Nothing on this shelf.</p>
            <p className="mt-2 text-base text-ink-soft">
              {query.trim() ? `No recipe matches “${query.trim()}” with these filters.` : 'No recipe matches that meal and diet together.'}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className={`mt-6 h-11 rounded-full bg-ink px-5 text-paper transition-colors duration-300 hover:bg-tomato active:scale-[0.98] ${label} ${focusRing}`}
            >
              Clear search and filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
