# Recipe Radar: DESIGN.md

## Concept
A recipe finder that works like a radar. You tell it what's in your kitchen, it sweeps and "pings" the recipes you can cook.
Tagline: "Scan your pantry. Find dinner."

## Must-have features (from the chit)
1. Ingredient-based search: multi-select ingredient chips. Rank recipes by match ("You have 4/6").
2. Category tabs: All / Breakfast / Lunch & Dinner / Desserts, plus a Veg / Non-veg filter.
3. Step-by-step recipe view: modal or page, one step at a time, with progress bar and ingredient checklist.
4. Saved favorites: heart icon, saved in localStorage, with a Favorites tab/drawer.

## Signature moment (hero: "Drop it in the pot")
A big illustrated pot sits in the middle of the hero, ringed by 10 ingredient stickers
(tomato, egg, onion, paneer, rice, potato, chicken, garlic, spinach, chili).
1. Drag a sticker into the pot (desktop) or tap it (mobile / keyboard: Enter or Space).
2. It arcs in with a bounce, the broth ripples, steam rises.
3. The label on the pot updates live: "6 recipes you can cook".
4. Ingredients in the pot show as chips under it. Clicking a chip flies it back out.
5. Below the pot, the top 3 matching recipe cards reorder with a GSAP Flip animation.
Headline "What's in your kitchen?" with a staggered letter reveal on load. A search input stays as a typing fallback.
Mobile: stickers become a horizontal scroll tray above the pot. Tap targets at least 44px.
Selected ingredients live in App state and are shared with RadarFinder (no duplicate state).

## Sections (in order)
1. Navbar (sticky, glass), logo "Recipe Radar", links, Favorites count badge
2. Hero (scroll story)
3. Radar Finder (ingredient chips + match results)
4. Browse (category tabs + veg/non-veg toggle + recipe grid)
5. Recipe detail (step-by-step modal)
6. Favorites (drawer or section)
7. Footer

## Visual style
Warm editorial kitchen, like a modern cookbook. Light, printed, tactile. Not a generic template.
- paper (background): #F4ECDF, with a subtle fixed grain overlay
- paper-2 (cards, stickers): #FBF6EC
- ink (text, line art): #1C1915
- ink-soft (secondary text): #5E554A
- tomato (primary accent): #E5432D. Large text and fills only (3.5:1 on paper).
- tomato-ink (small tomato text): #A8301D. Use this for labels and links (5:1+ on paper, AA).
- saffron (secondary accent): #F2B23A
- basil (success, "you have it"): #2E6A3C
- veg mark: #2E6A3C, non-veg mark: #9A3B1E (standard Indian square-and-dot symbol)

Tailwind tokens (in `index.css`): `bg-paper`, `bg-paper-2`, `text-ink`, `text-ink-soft`, `text-tomato`, `text-tomato-ink`, `bg-saffron`, `text-basil`, `veg`, `nonveg`, `font-display`, `font-mono`.

Fonts (Google Fonts):
- Bricolage Grotesque: headlines (bold, tight tracking, huge) and body.
- JetBrains Mono: labels, meta and counters (small, uppercase, wide tracking).

Style rules:
- Illustrations are clean SVG line art (ink stroke, about 1.5 to 3px) with flat colour fills.
- Cards: paper-2 on paper, thin ink hairline (ink at 10 to 15% opacity), rounded-2xl.
- Stickers and chips may use a hard offset ink shadow (e.g. 3px 3px 0), never a blurry one.
- No glows, no dark gradients, no emoji. Flat colour only.
- Hover: small lift or wobble.
- Recipe-sheet paper: one fixed `body::after` overlay in `index.css` (feTurbulence grain, two faint fold creases, soft edge vignette). Do not add other page-wide textures.
- Recipe cards are index cards: hand-cut edges (clip-path), a strip of saffron washi tape, a seeded tilt of up to 1.5deg that straightens on hover. See `components/hero/MatchStrip.jsx`.
- Intro (`Intro.jsx`): plays once per session (sessionStorage), skipped with reduced motion, any click/key skips. Under 2s, ends in a tomato circle wipe into the hero.
Motion: GSAP only (core, ScrollTrigger, Draggable, Flip). ease "power3.out", 0.4 to 0.8s. Respect prefers-reduced-motion.

## Tech
Vite + React + Tailwind v4 + GSAP (@gsap/react, Draggable, Flip). No backend.
Data: local `src/data/recipes.js`, around 12 to 16 recipes.
Images: free Unsplash URLs with a gradient fallback.

## Data shape (shared contract. Do not change without telling the other person)
```js
{ id, name, category: "breakfast|main|dessert", diet: "veg|nonveg",
  time: 20, difficulty: "easy|medium", image: "url",
  ingredients: ["egg","onion","tomato"], steps: ["...", "..."] }
```
Ingredient names are lowercase singular strings, so matching is exact.

## File ownership (avoid merge conflicts)
- Person A (hero + finder): `Hero.jsx`, `components/hero/*`, `RadarFinder.jsx`, `utils/matchRecipes.js`
- Person B (everything else): `Navbar.jsx`, `Browse.jsx`, `RecipeCard.jsx`, `RecipeModal.jsx`, `Favorites.jsx`, `Footer.jsx`, `data/recipes.js`, `useFavorites.js`
- Shared (touch rarely, say it first): `App.jsx`, `index.css`

## Rules
- Mobile-first. Test at 390px.
- One GSAP timeline per section. Clean up in useGSAP.
- No console errors. No placeholder text. Real copy everywhere.
- Keep components small and well named (judges read the code).
- Commit every 15 min. Pull before push.