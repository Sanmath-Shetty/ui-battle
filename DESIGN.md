# Recipe Radar: DESIGN.md

## Concept
A recipe finder that works like a radar. You tell it what's in your kitchen, it sweeps and "pings" the recipes you can cook.
Tagline: "Scan your pantry. Find dinner."

## Must-have features (from the chit)
1. Ingredient-based search: multi-select ingredient chips. Rank recipes by match ("You have 4/6").
2. Category tabs: All / Breakfast / Lunch & Dinner / Desserts, plus a Veg / Non-veg filter.
3. Step-by-step recipe view: modal or page, one step at a time, with progress bar and ingredient checklist.
4. Saved favorites: heart icon, saved in localStorage, with a Favorites tab/drawer.

## Signature moment (hero, pinned scroll story)
A radar sweep rotates over a dark pantry. As you scroll:
1. Ingredient blips (tomato, egg, rice, paneer, chili) appear one by one.
2. The sweep pings each blip and it lights up.
3. The blips pull toward the center and resolve into a plate and the headline "Find dinner."
4. Scroll hint changes to "Start scanning" and the finder section slides in.
One GSAP timeline, ScrollTrigger pin + scrub. Must work on mobile.

## Sections (in order)
1. Navbar (sticky, glass), logo "Recipe Radar", links, Favorites count badge
2. Hero (scroll story)
3. Radar Finder (ingredient chips + match results)
4. Browse (category tabs + veg/non-veg toggle + recipe grid)
5. Recipe detail (step-by-step modal)
6. Favorites (drawer or section)
7. Footer

## Visual style
Dark, modern, premium, with food-app warmth. Not a generic template.
- bg: #0f1a14 (pantry green-black)
- surface: #16251c
- surface-2: #1e3226
- text: #f4efe3 (cream)
- muted: #9fb0a3
- accent (radar lime): #c8f169
- accent-2 (tomato): #ff6b3d
- veg dot: #3ecf6e, non-veg dot: #e5484d (standard Indian convention)
Fonts: Fraunces (headings, serif) + Inter (body). Load from Google Fonts.
Style: rounded-2xl cards, soft glows on the accent, thin radar-ring line art, subtle noise. Hover: lift + glow.
Motion: GSAP only. ease "power3.out", durations 0.4-0.8s. Respect prefers-reduced-motion.

## Tech
Vite + React + Tailwind v4 + GSAP (@gsap/react). No backend.
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
- Person A (hero + finder): `Hero.jsx`, `RadarFinder.jsx`, `matchRecipes.js`
- Person B (everything else): `Navbar.jsx`, `Browse.jsx`, `RecipeCard.jsx`, `RecipeModal.jsx`, `Favorites.jsx`, `Footer.jsx`, `data/recipes.js`, `useFavorites.js`
- Shared (touch rarely, say it first): `App.jsx`, `index.css`

## Rules
- Mobile-first. Test at 390px.
- One GSAP timeline per section. Clean up in useGSAP.
- No console errors. No placeholder text. Real copy everywhere.
- Keep components small and well named (judges read the code).
- Commit every 15 min. Pull before push.