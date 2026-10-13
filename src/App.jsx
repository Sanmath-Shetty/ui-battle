import { useCallback, useMemo, useState } from 'react'
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

  // Intro plays once per session; the hero holds its reveal until the intro wipe clears.
  const [introActive, setIntroActive] = useState(shouldPlayIntro)
  const [heroReady, setHeroReady] = useState(() => !introActive)

  return (
    <>
      {introActive && <Intro onReveal={() => setHeroReady(true)} onDone={() => setIntroActive(false)} />}
      <Navbar favoritesCount={favoriteIds.length} />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero selected={selected} onToggle={toggleIngredient} matches={matches} ready={heroReady} />
        <Browse recipes={recipes} pantry={selected} onOpenRecipe={setOpenRecipe} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
        <Favorites recipes={recipes} pantry={selected} favoriteIds={favoriteIds} onOpenRecipe={setOpenRecipe} onToggleFavorite={toggleFavorite} />
      </main>
      <Footer />
      {openRecipe && (
        <RecipeModal
          key={openRecipe.id}
          recipe={openRecipe}
          pantry={selected}
          onClose={() => setOpenRecipe(null)}
          isFavorite={favoriteIds.includes(openRecipe.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </>
  )
}
