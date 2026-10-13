import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

// Angle is clockwise from 12 o'clock; radius is a fraction of the radar's half-width.
const BLIPS = [
  { name: 'tomato', emoji: '🍅', angle: 12, radius: 0.78 },
  { name: 'egg', emoji: '🥚', angle: 52, radius: 0.5 },
  { name: 'onion', emoji: '🧅', angle: 84, radius: 0.8 },
  { name: 'paneer', emoji: '🧀', angle: 124, radius: 0.56 },
  { name: 'rice', emoji: '🍚', angle: 160, radius: 0.8 },
  { name: 'potato', emoji: '🥔', angle: 196, radius: 0.48 },
  { name: 'chicken', emoji: '🍗', angle: 232, radius: 0.8 },
  { name: 'garlic', emoji: '🧄', angle: 270, radius: 0.54 },
  { name: 'spinach', emoji: '🥬', angle: 304, radius: 0.8 },
  { name: 'chili', emoji: '🌶️', angle: 340, radius: 0.5 },
]

const SWEEP_SECONDS = 9

function polar(angle, radius) {
  const rad = (angle * Math.PI) / 180
  return { x: 50 + Math.sin(rad) * radius * 50, y: 50 - Math.cos(rad) * radius * 50 }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function RadarRings() {
  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {[98, 74, 50, 26].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#c8f169" strokeOpacity="0.16" strokeWidth="0.4" />
      ))}
      <line x1="100" y1="2" x2="100" y2="198" stroke="#c8f169" strokeOpacity="0.08" strokeWidth="0.3" />
      <line x1="2" y1="100" x2="198" y2="100" stroke="#c8f169" strokeOpacity="0.08" strokeWidth="0.3" />
      {Array.from({ length: 72 }, (_, i) => (
        <line
          key={i}
          x1="100" y1="2" x2="100" y2={i % 6 === 0 ? 6.5 : 4.5}
          stroke="#c8f169" strokeOpacity={i % 6 === 0 ? 0.4 : 0.18} strokeWidth="0.35"
          transform={`rotate(${i * 5} 100 100)`}
        />
      ))}
    </svg>
  )
}

function Blip({ blip, active, onToggle }) {
  const { x, y } = polar(blip.angle, blip.radius)
  return (
    <button
      type="button"
      data-blip={blip.name}
      onClick={() => onToggle(blip.name)}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Add'} ${blip.name}`}
      className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lime"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span data-ping className="pointer-events-none absolute inset-1 rounded-full border border-lime opacity-0" />
      {active && <span data-pulse className="pointer-events-none absolute inset-0 rounded-full bg-lime/25" />}
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 ${
          active
            ? 'bg-lime/20 shadow-[0_0_24px_4px_rgba(200,241,105,0.55)] ring-1 ring-lime'
            : 'bg-surface-2/80 ring-1 ring-cream/10'
        }`}
      >
        <span aria-hidden="true">{blip.emoji}</span>
      </span>
      <span
        className={`pointer-events-none absolute top-full mt-0.5 whitespace-nowrap text-[10px] font-medium capitalize tracking-wide transition-colors duration-500 md:text-[11px] ${
          active ? 'text-lime' : 'text-muted'
        }`}
      >
        {blip.name}
      </span>
    </button>
  )
}

function Radar({ selected, onToggle, matchCount }) {
  const scope = useRef(null)
  const countRef = useRef(null)
  const shown = useRef({ value: matchCount })

  // Sweep, pings and cursor tilt.
  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(scope)
      const tilt = q('[data-tilt]')[0]
      const pings = BLIPS.map((b) => q(`[data-blip="${b.name}"] [data-ping]`)[0])
      let last = 0

      gsap.to(q('[data-sweep]'), {
        rotate: 360,
        duration: SWEEP_SECONDS,
        ease: 'none',
        repeat: -1,
        onUpdate() {
          const angle = (this.progress() * 360) % 360
          BLIPS.forEach((b, i) => {
            const crossed = last <= angle ? b.angle > last && b.angle <= angle : b.angle > last || b.angle <= angle
            if (crossed) {
              gsap.fromTo(pings[i], { scale: 0.7, autoAlpha: 0.8 }, { scale: 2, autoAlpha: 0, duration: 1.1, ease: 'power3.out' })
            }
          })
          last = angle
        },
      })

      const rotX = gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: 'power3.out' })
      const rotY = gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: 'power3.out' })
      const onMove = contextSafe((e) => {
        const r = scope.current.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        rotY(gsap.utils.clamp(-8, 8, px * 14))
        rotX(gsap.utils.clamp(-8, 8, -py * 14))
      })
      const onLeave = contextSafe(() => {
        rotX(0)
        rotY(0)
      })
      const el = scope.current
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope },
  )

  // Glow pulse on selected blips.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        gsap.utils.toArray('[data-pulse]', scope.current),
        { scale: 0.85, autoAlpha: 0.8 },
        { scale: 1.6, autoAlpha: 0, duration: 1.4, ease: 'power2.out', repeat: -1 },
      )
    },
    { scope, dependencies: [selected], revertOnUpdate: true },
  )

  // Animated live counter.
  useGSAP(
    () => {
      const render = () => {
        countRef.current.textContent = Math.round(shown.current.value)
      }
      if (prefersReducedMotion()) {
        shown.current.value = matchCount
        render()
        return
      }
      gsap.to(shown.current, { value: matchCount, duration: 0.6, ease: 'power3.out', onUpdate: render })
      gsap.fromTo(countRef.current, { scale: 1.15 }, { scale: 1, duration: 0.5, ease: 'power3.out' })
    },
    { dependencies: [matchCount] },
  )

  return (
    <div ref={scope} className="relative mx-auto w-[min(86vw,520px)] [perspective:1200px]">
      <div data-tilt className="relative aspect-square w-full [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-full bg-white/[0.03] p-1.5 ring-1 ring-cream/10">
          <div className="relative h-full w-full rounded-full bg-surface/70 shadow-[inset_0_1px_1px_rgba(244,239,227,0.08),0_0_90px_-25px_rgba(200,241,105,0.45)]">
            <RadarRings />
          </div>
        </div>

        <div
          data-sweep
          aria-hidden="true"
          className="pointer-events-none absolute inset-1.5 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(200,241,105,0) 0deg, rgba(200,241,105,0) 290deg, rgba(200,241,105,0.18) 350deg, rgba(200,241,105,0.55) 360deg)',
          }}
        >
          <span className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-gradient-to-t from-lime/0 to-lime/70" />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-bg/85 text-center ring-1 ring-lime/20">
          <span ref={countRef} aria-hidden="true" className="font-display text-3xl font-semibold leading-none text-lime md:text-5xl">
            {matchCount}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted md:text-[11px]">
            {matchCount === 1 ? 'recipe found' : 'recipes found'}
          </span>
        </div>
        <p className="sr-only" aria-live="polite">
          {matchCount} {matchCount === 1 ? 'recipe' : 'recipes'} found
        </p>

        {BLIPS.map((blip) => (
          <Blip key={blip.name} blip={blip} active={selected.includes(blip.name)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

function IngredientSearch({ selected, onToggle, suggestions }) {
  const [query, setQuery] = useState('')

  const add = (raw) => {
    const name = raw.trim().toLowerCase()
    if (name && !selected.includes(name)) onToggle(name)
    setQuery('')
  }

  return (
    <div className="rounded-[2rem] bg-white/[0.03] p-1.5 ring-1 ring-cream/10">
      <div className="rounded-[calc(2rem-0.375rem)] bg-surface p-4 shadow-[inset_0_1px_1px_rgba(244,239,227,0.08)] md:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            add(query)
          }}
          className="flex items-center gap-3 rounded-full bg-bg/70 py-1.5 pl-5 pr-1.5 ring-1 ring-cream/10 transition-shadow duration-500 focus-within:ring-lime/50"
        >
          <label htmlFor="pantry-search" className="sr-only">Add an ingredient</label>
          <input
            id="pantry-search"
            list="pantry-suggestions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add an ingredient, e.g. tomato"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-cream placeholder:text-muted/70 focus:outline-none md:text-base"
          />
          <datalist id="pantry-suggestions">
            {suggestions.filter((s) => !selected.includes(s)).map((s) => <option key={s} value={s} />)}
          </datalist>
          <button
            type="submit"
            className="h-11 shrink-0 rounded-full bg-cream/10 px-5 text-sm font-medium text-cream transition-colors duration-500 hover:bg-cream/15 active:scale-[0.98]"
          >
            Add
          </button>
        </form>

        <ul className="mt-4 flex min-h-11 flex-wrap gap-2" aria-label="Selected ingredients">
          {selected.length === 0 && (
            <li className="flex items-center text-sm text-muted">Tap a blip on the radar or type above.</li>
          )}
          {selected.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => onToggle(name)}
                aria-label={`Remove ${name}`}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-lime/10 pl-4 pr-2 text-sm font-medium capitalize text-lime ring-1 ring-lime/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-lime/15"
              >
                {name}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime/15 transition-transform duration-500 group-hover:rotate-90" aria-hidden="true">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M3 3l6 6M9 3l-6 6" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Controlled by App: `selected` and `onToggle` are the same state RadarFinder reads.
 * `matchCount` is computed in App (via matchRecipes) so both sections agree.
 */
export default function Hero({ selected, onToggle, matchCount, resultsId = 'finder' }) {
  const root = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-word]', { yPercent: 110, duration: 0.8, stagger: 0.08 })
        .from('[data-rise]', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, '-=0.4')
        .from('[data-radar-wrap]', { scale: 0.92, autoAlpha: 0, duration: 0.8 }, 0.2)
    },
    { scope: root },
  )

  const showRecipes = () => {
    document.getElementById(resultsId)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const headline = [['Scan', 'your', 'pantry.'], ['Find', 'dinner.']]

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="relative w-full overflow-x-clip px-4 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(45% 50% at 75% 45%, rgba(200,241,105,0.09), transparent 70%), radial-gradient(35% 40% at 10% 90%, rgba(255,107,61,0.07), transparent 70%)',
        }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="order-2 lg:order-1">
          <h1
            id="hero-title"
            className="font-display text-[clamp(2.6rem,6vw,5.25rem)] font-semibold leading-[1] tracking-tight text-cream"
          >
            {headline.map((line, li) => (
              <span key={li} className="block">
                {line.map((word) => (
                  <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                    <span data-word className={`inline-block ${word === 'dinner.' ? 'italic text-lime' : ''}`}>
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p data-rise className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            Tell the radar what is in your kitchen. It ranks every recipe by how much you already have, so dinner starts with zero extra shopping.
          </p>

          <div data-rise className="mt-8 max-w-xl">
            <IngredientSearch selected={selected} onToggle={onToggle} suggestions={BLIPS.map((b) => b.name)} />
          </div>

          <div data-rise className="mt-6">
            <button
              type="button"
              onClick={showRecipes}
              className="group inline-flex items-center gap-3 rounded-full bg-lime py-2 pl-6 pr-2 font-semibold text-bg shadow-[0_0_40px_-10px_rgba(200,241,105,0.7)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              Show recipes
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0.5 group-hover:scale-105" aria-hidden="true">
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div data-radar-wrap className="order-1 py-4 lg:order-2">
          <Radar selected={selected} onToggle={onToggle} matchCount={matchCount} />
        </div>
      </div>
    </section>
  )
}
