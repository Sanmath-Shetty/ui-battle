import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Intro, { shouldPlayIntro } from './components/Intro.jsx'
import Browse from './components/Browse.jsx'
import Favorites from './components/Favorites.jsx'
import Footer from './components/Footer.jsx'
import RecipeModal from './components/RecipeModal.jsx'
import { recipes } from './data/recipes.js'
import { useFavorites } from './hooks/useFavorites.js'
import { matchRecipes } from './utils/matchRecipes.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  // Shared with Hero and RadarFinder. Single source of truth for the pantry.
  const [selected, setSelected] = useState([])
  const [openRecipe, setOpenRecipe] = useState(null)
  const { favoriteIds, toggleFavorite } = useFavorites()

  const toggleIngredient = useCallback((name) => {
    setSelected((current) => (current.includes(name) ? current.filter((n) => n !== name) : [...current, name]))
  }, [])

  const matches = useMemo(() => matchRecipes(recipes, selected), [selected])

  // One modal for every card. The last click (pointer or keyboard) tells the modal which card it
  // came from, for the photo morph and to return focus there on close.
  const lastClick = useRef(null)
  const openOrigin = useRef(null)
  useEffect(() => {
    const remember = (e) => {
      lastClick.current = e.target
    }
    document.addEventListener('click', remember, true)
    return () => document.removeEventListener('click', remember, true)
  }, [])
  const openRecipeFromCard = useCallback((recipe) => {
    const target = lastClick.current
    openOrigin.current = { card: target?.closest?.('article') ?? null, focus: target?.closest?.('button, a') ?? document.activeElement }
    setOpenRecipe(recipe)
  }, [])
  // Same path the hero uses, guarded so "add" can never take something out of the pot.
  const addToPot = useCallback(
    (name) => {
      if (!selected.includes(name)) toggleIngredient(name)
    },
    [selected, toggleIngredient],
  )
  const cookAnother = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('browse')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  // Intro plays once per session; the hero holds its reveal until the intro wipe clears.
  const [introActive, setIntroActive] = useState(shouldPlayIntro)
  const [heroReady, setHeroReady] = useState(() => !introActive)

  return (
    <>
      {introActive && <Intro onReveal={() => setHeroReady(true)} onDone={() => setIntroActive(false)} />}
      <Navbar favoritesCount={favoriteIds.length} />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero selected={selected} onToggle={toggleIngredient} matches={matches} ready={heroReady} resultsId="browse" onOpenRecipe={openRecipeFromCard} />
        <Browse recipes={recipes} pantry={selected} onOpenRecipe={openRecipeFromCard} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
        <Favorites recipes={recipes} pantry={selected} favoriteIds={favoriteIds} onOpenRecipe={openRecipeFromCard} onToggleFavorite={toggleFavorite} />
      </main>
      <Footer />
      {openRecipe && (
        <RecipeModal
          key={openRecipe.id}
          recipe={openRecipe}
          pantry={selected}
          origin={openOrigin.current}
          onClose={() => setOpenRecipe(null)}
          onAddIngredient={addToPot}
          onCookAnother={cookAnother}
          isFavorite={favoriteIds.includes(openRecipe.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </>
  )
}
