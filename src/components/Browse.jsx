import { useRef, useState } from 'react'
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

const pillBase =
  'inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium outline-none transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-lime'

function CategoryTabs({ value, onChange, counts }) {
  return (
    <div
      role="group"
      aria-label="Filter by meal"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORIES.map((category) => {
        const active = category.value === value
        return (
          <button
            key={category.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category.value)}
            className={`${pillBase} ${
              active
                ? 'bg-lime text-bg shadow-[0_0_30px_-10px_rgba(200,241,105,0.8)]'
                : 'bg-surface text-muted ring-1 ring-cream/10 hover:text-cream'
            }`}
          >
            {category.label}
            <span className={`text-xs tabular-nums ${active ? 'text-bg/60' : 'text-muted/70'}`}>
              {counts[category.value]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function DietFilter({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter by diet" className="inline-flex self-start rounded-full bg-surface p-1 ring-1 ring-cream/10">
      {DIETS.map((diet) => {
        const active = diet.value === value
        return (
          <button
            key={diet.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(diet.value)}
            className={`${pillBase} h-9 px-3.5 ${active ? 'bg-surface-2 text-cream ring-1 ring-cream/15' : 'text-muted hover:text-cream'}`}
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
    <div className="relative w-full md:max-w-sm">
      <label htmlFor="recipe-search" className="sr-only">Search recipes</label>
      <svg viewBox="0 0 16 16" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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
        className="h-12 w-full rounded-full bg-surface pl-11 pr-5 text-sm text-cream outline-none ring-1 ring-cream/10 transition-shadow duration-500 placeholder:text-muted/70 focus:ring-2 focus:ring-lime/60 md:text-base"
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
  const visible = inDiet.filter((recipe) => category === 'all' || recipe.category === category)
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
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-lime">The full menu</p>
        <h2 id="browse-title" className="mt-3 max-w-2xl font-display text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-cream">
          Browse every recipe on the radar.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          Not sure what is in the fridge yet? Start with the meal you are in the mood for and narrow it down from there.
        </p>

        <div className="mt-10">
          <SearchField value={query} onChange={setQuery} />
        </div>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CategoryTabs value={category} onChange={setCategory} counts={counts} />
          <DietFilter value={diet} onChange={setDiet} />
        </div>

        <p className="mt-6 text-sm text-muted" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? 'recipe' : 'recipes'}
        </p>

        {visible.length > 0 ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="mt-5 rounded-2xl bg-surface px-6 py-14 text-center ring-1 ring-cream/10">
            <p className="font-display text-2xl font-semibold text-cream">Nothing on the radar here.</p>
            <p className="mt-2 text-sm text-muted">{query.trim() ? `No recipe matches “${query.trim()}” with these filters.` : 'No recipe matches that meal and diet together.'}</p>
            <button
              type="button"
              onClick={clearFilters}
              className={`${pillBase} mt-6 bg-cream/10 text-cream hover:bg-cream/15`}
            >
              Clear search and filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
