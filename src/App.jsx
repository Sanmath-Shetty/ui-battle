import { useCallback, useMemo, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Hero from './components/Hero.jsx'
import { recipes } from './data/recipes.js'
import { matchRecipes } from './utils/matchRecipes.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  // Shared with Hero and RadarFinder. Single source of truth for the pantry.
  const [selected, setSelected] = useState([])

  const toggleIngredient = useCallback((name) => {
    setSelected((current) => (current.includes(name) ? current.filter((n) => n !== name) : [...current, name]))
  }, [])

  const matches = useMemo(() => matchRecipes(recipes, selected), [selected])

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Hero selected={selected} onToggle={toggleIngredient} matchCount={matches.length} />
    </main>
  )
}
