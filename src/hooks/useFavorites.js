import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'recipe-radar:favorites'

function readStored() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

/** Favorite recipe ids, persisted in localStorage. Storage failures (private mode) are ignored. */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
    } catch {
      // Favorites still work for this visit; they just will not persist.
    }
  }, [favoriteIds])

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds((current) => (current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id]))
  }, [])

  return { favoriteIds, toggleFavorite }
}
