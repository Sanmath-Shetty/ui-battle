// Sticker art for the hero pantry. One style for all: flat palette fills, ~2px ink outline
// at sticker size, bodies spanning roughly 28 of 48 units. Names match data/recipes.js exactly.
const INK = '#1C1915'
const TOMATO = '#E5432D'
const SAFFRON = '#F2B23A'
const BASIL = '#2E6A3C'
const CREAM = '#FBF6EC'
const CREAM_SHADE = '#EADCC4'

const outline = { stroke: INK, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
const shine = { stroke: CREAM, strokeWidth: 2.2, strokeLinecap: 'round', fill: 'none' }

function Tomato() {
  return (
    <>
      <circle cx="24" cy="27" r="13" fill={TOMATO} {...outline} />
      <path d="M24 15c-3-4-7-4-9-2 3 1 6 2 9 2zM24 15c3-4 7-4 9-2-3 1-6 2-9 2z" fill={BASIL} {...outline} />
      <path d="M24 15v-5" {...outline} fill="none" />
      <path d="M16 24c1-3 3-5 6-6" {...shine} />
    </>
  )
}

function Egg() {
  return (
    <>
      <path d="M24 9c7 0 12 10 12 18a12 12 0 0 1-24 0c0-8 5-18 12-18z" fill={CREAM} {...outline} />
      <circle cx="24" cy="28" r="6" fill={SAFFRON} {...outline} />
    </>
  )
}

function Onion() {
  return (
    <>
      <path d="M24 13c0-3 1-5 4-7" {...outline} fill="none" />
      <circle cx="24" cy="27" r="13" fill={TOMATO} {...outline} />
      <circle cx="24" cy="27" r="9" fill={CREAM} {...outline} />
      <circle cx="24" cy="27" r="5.5" fill="none" stroke={TOMATO} strokeWidth="2" />
      <circle cx="24" cy="27" r="2" fill={TOMATO} />
    </>
  )
}

function Paneer() {
  return (
    <>
      <path d="M10 19l14-7 14 7-14 7z" fill={CREAM} {...outline} />
      <path d="M10 19v13l14 7V26z" fill="#F4ECDF" {...outline} />
      <path d="M38 19v13l-14 7V26z" fill={CREAM_SHADE} {...outline} />
      <path d="M17 18l6 3M22 15.5l6 3M27 13l5 2.5" stroke={SAFFRON} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="15" cy="27" r="1" fill={INK} opacity="0.45" />
      <circle cx="19" cy="31" r="1" fill={INK} opacity="0.45" />
      <circle cx="31" cy="28" r="1" fill={INK} opacity="0.45" />
    </>
  )
}

function Rice() {
  return (
    <>
      <path d="M10 25c1-8 7-11 14-11s13 3 14 11z" fill={CREAM} {...outline} />
      <path d="M18 19l2 1M25 17l2 1M30 21l2 1M21 22l2 1" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 25h34a17 14 0 0 1-34 0z" fill={BASIL} {...outline} />
      <path d="M13 30c2 3 5 5 8 5" {...shine} />
    </>
  )
}

function Potato() {
  return (
    <>
      <path d="M11 22c2-8 13-11 21-8s9 12 4 18-16 7-21 3-6-8-4-13z" fill={SAFFRON} {...outline} />
      <circle cx="19" cy="22" r="1.4" fill={INK} />
      <circle cx="28" cy="19" r="1.4" fill={INK} />
      <circle cx="30" cy="29" r="1.4" fill={INK} />
      <path d="M15 27c0 2 1 4 3 5" {...shine} />
    </>
  )
}

function Chicken() {
  return (
    <>
      <path d="M18 31l-7 7" stroke={INK} strokeWidth="6.4" strokeLinecap="round" />
      <path d="M18 31l-7 7" stroke={CREAM} strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="37" r="2.8" fill={CREAM} {...outline} />
      <circle cx="12" cy="40" r="2.8" fill={CREAM} {...outline} />
      <path d="M18 31c-4-6-1-18 8-20s15 4 13 12-10 10-16 9z" fill={SAFFRON} {...outline} />
      <path d="M25 16c3-1 6 0 8 2" {...shine} />
    </>
  )
}

function Garlic() {
  return (
    <>
      <path d="M24 10c1 5 12 9 12 18a12 10.5 0 0 1-24 0c0-9 11-13 12-18z" fill={CREAM} {...outline} />
      <path d="M24 17v21M18 21c-2 5-2 11 1 16M30 21c2 5 2 11-1 16" {...outline} fill="none" />
      <path d="M24 10V6" {...outline} fill="none" />
    </>
  )
}

function Spinach() {
  return (
    <>
      <path d="M12 37C10 23 20 11 37 10c1 16-8 27-25 27z" fill={BASIL} {...outline} />
      <path d="M13 36L31 17M19 30v-6M24 25v-6M19 30h6M24 25h6" {...shine} strokeWidth="1.8" />
      <path d="M12 37l-3 3" {...outline} fill="none" />
    </>
  )
}

function Chili() {
  return (
    <>
      <path d="M9 36c10 4 23-2 27-18 1-3-3-5-5-2-4 10-11 15-22 14-2 0-2 5 0 6z" fill={TOMATO} {...outline} />
      <path d="M33 16c0-4 3-7 7-7" stroke={INK} strokeWidth="5.4" strokeLinecap="round" fill="none" />
      <path d="M33 16c0-4 3-7 7-7" stroke={BASIL} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M14 34c4 1 8 0 11-2" {...shine} />
    </>
  )
}

// `color` is used for the floating bits in the pot's broth.
export const INGREDIENTS = [
  { name: 'tomato', Art: Tomato, color: TOMATO, tilt: -8 },
  { name: 'egg', Art: Egg, color: CREAM, tilt: 6 },
  { name: 'onion', Art: Onion, color: TOMATO, tilt: -4 },
  { name: 'paneer', Art: Paneer, color: CREAM, tilt: 9 },
  { name: 'rice', Art: Rice, color: CREAM, tilt: -6 },
  { name: 'potato', Art: Potato, color: SAFFRON, tilt: 4 },
  { name: 'chicken', Art: Chicken, color: SAFFRON, tilt: -10 },
  { name: 'garlic', Art: Garlic, color: CREAM, tilt: 7 },
  { name: 'spinach', Art: Spinach, color: BASIL, tilt: -3 },
  { name: 'chili', Art: Chili, color: TOMATO, tilt: 8 },
]

export const INGREDIENT_BY_NAME = Object.fromEntries(INGREDIENTS.map((item) => [item.name, item]))

export function IngredientArt({ name, className }) {
  const item = INGREDIENT_BY_NAME[name]
  if (!item) return null
  const { Art } = item
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <Art />
    </svg>
  )
}
