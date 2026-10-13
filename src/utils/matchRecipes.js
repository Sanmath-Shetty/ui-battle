/**
 * Rank recipes by how many of their ingredients are in the pantry.
 * With nothing selected, every recipe is returned (unranked) so browsing still works.
 * Otherwise only recipes with at least one match are returned, best first:
 * highest match ratio, then fewest missing ingredients, then quickest.
 */
export function matchRecipes(recipes, selected) {
  if (selected.length === 0) {
    return recipes.map((recipe) => ({ recipe, have: 0, total: recipe.ingredients.length, missing: recipe.ingredients }))
  }

  const pantry = new Set(selected)

  return recipes
    .map((recipe) => {
      const missing = recipe.ingredients.filter((item) => !pantry.has(item))
      const total = recipe.ingredients.length
      return { recipe, have: total - missing.length, total, missing }
    })
    .filter((match) => match.have > 0)
    .sort(
      (a, b) =>
        b.have / b.total - a.have / a.total ||
        a.missing.length - b.missing.length ||
        a.recipe.time - b.recipe.time,
    )
}
