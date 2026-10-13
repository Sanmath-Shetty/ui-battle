import { useCallback, useRef, useState } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import IngredientToken from './hero/IngredientToken.jsx'
import Pot, { splashPot } from './hero/Pot.jsx'
import PantrySearch from './hero/PantrySearch.jsx'
import MatchStrip from './hero/MatchStrip.jsx'
import GhostDemo from './GhostDemo.jsx'
import { useCursorDepth } from './hero/useCursorDepth.js'
import { INGREDIENTS, IngredientArt } from './hero/ingredients.jsx'

gsap.registerPlugin(Draggable, Flip, useGSAP)

// Stickers sit on a loose arc over the pot, from lower-left (200deg) to lower-right (-20deg).
const ARC = INGREDIENTS.map((_, i) => 200 - (i * 220) / (INGREDIENTS.length - 1))
// The sticker that carries the "drag me in" arrow and does the load nudge (upper-left of the arc).
const HINT_INDEX = 3

const HEADLINE = ['What’s', 'in', 'your', 'kitchen?']

// Stage geometry (md and up). Height tracks the viewport so hero + match strip fit in 100vh;
// pot width follows the stage height but never takes more than 44% of the stage width (cqw);
// the arc radii hug the pot.
const STAGE = [
  '@container relative',
  'md:h-(--stage-h)',
  'md:[--stage-h:clamp(400px,calc(100dvh_-_300px),660px)]',
  'md:[--pot-w:min(calc(var(--stage-h)_*_0.68),44cqw)]',
  'md:[--cy:calc(var(--stage-h)_*_0.53)]',
  'md:[--rx:calc(var(--pot-w)_*_0.5_+_64px)]',
  'md:[--ry:calc(var(--pot-w)_*_0.44_+_56px)]',
].join(' ')

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function centerOf(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

/** Fly a copy of a sticker face between two screen points along an arc. */
function flyFace(layer, face, from, to, direction) {
  const size = face.getBoundingClientRect()
  const clone = face.cloneNode(true)
  clone.removeAttribute('data-face')
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${from.x - size.width / 2}px`,
    top: `${from.y - size.height / 2}px`,
    margin: '0',
    transform: '',
  })
  layer.appendChild(clone)

  const into = direction === 'in'
  const d = 0.75
  const dx = to.x - from.x
  const dy = to.y - from.y
  const peak = Math.min(0, dy) - 110

  return new Promise((resolve) => {
    gsap
      .timeline({
        onComplete() {
          clone.remove()
          resolve()
        },
      })
      .to(clone, { x: dx, duration: d, ease: 'power1.inOut' }, 0)
      .to(clone, { y: peak, duration: d * 0.45, ease: 'power2.out' }, 0)
      .to(clone, { y: dy, duration: d * 0.55, ease: into ? 'power2.in' : 'bounce.out' }, d * 0.45)
      .fromTo(
        clone,
        { scale: into ? 1 : 0.4, rotation: into ? 0 : -140 },
        { scale: into ? 0.4 : 1, rotation: into ? 160 : 0, duration: d, ease: 'power1.inOut' },
        0,
      )
  })
}

function Headline() {
  return (
    <h1
      id="hero-heading"
      aria-label="What’s in your kitchen?"
      className="font-display text-[clamp(3rem,7vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em]"
    >
      {HEADLINE.map((word) => {
        const letters = (
          <span aria-hidden="true" className="inline-block overflow-hidden whitespace-nowrap pb-[0.06em] align-bottom">
            {[...word].map((letter, li) => (
              <span key={li} data-letter className={`inline-block ${word === 'kitchen?' ? 'text-tomato' : ''}`}>
                {letter}
              </span>
            ))}
          </span>
        )
        if (word !== 'kitchen?') return <span key={word} className="mr-[0.2em] inline-block align-bottom">{letters}</span>
        return (
          <span key={word} className="relative inline-block align-bottom">
            {letters}
            <ScribbleUnderline />
          </span>
        )
      })}
    </h1>
  )
}

/** Hand-drawn double-stroke underline under "kitchen" (not the question mark). Drawn in on load. */
function ScribbleUnderline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 30"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-[0.1em] left-[0.02em] h-[0.26em] w-[86%] overflow-visible"
    >
      <path
        data-scribble
        pathLength="1"
        d="M4 13C52 7 118 4 188 6c40 1 78 3 106 6M296 12C220 13 120 15 40 22c-12 1-22 3-30 5"
        fill="none"
        stroke="#F2B23A"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1"
        strokeDashoffset="0"
      />
    </svg>
  )
}

function PotChips({ selected, onRemove }) {
  if (selected.length === 0) return null
  return (
    <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="In the pot">
      {selected.map((name) => (
        <li key={name}>
          <button
            type="button"
            onClick={(e) => onRemove(name, e)}
            aria-label={`Take ${name} out of the pot`}
            className="group inline-flex h-11 items-center gap-1.5 rounded-full border-2 border-ink bg-paper-2 pl-1.5 pr-3 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tomato"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper">
              <IngredientArt name={name} className="h-6 w-6" />
            </span>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em]">{name}</span>
            <svg viewBox="0 0 12 12" className="ml-0.5 h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}

/**
 * "Drop it in the pot". Controlled by App: `selected` / `onToggle` are the shared pantry
 * state that RadarFinder also reads, and `matches` comes from matchRecipes in App.
 * `ready` holds the load reveal (letters already masked) until the Intro wipe starts clearing.
 */
export default function Hero({ selected, onToggle, matches, ready = true, resultsId = 'finder', onOpenRecipe }) {
  const root = useRef(null)
  const potRef = useRef(null)
  const layerRef = useRef(null)
  const searchRef = useRef(null)
  const prevSelected = useRef(selected)
  const flipState = useRef(null)
  const lastDragEnd = useRef(0)
  const overRef = useRef(false)
  const hintGone = useRef(false)
  const loadTl = useRef(null)
  const [dropReady, setDropReady] = useState(false)
  const [settled, setSettled] = useState(false)
  useCursorDepth()

  const tokenEl = (name) => root.current?.querySelector(`[data-token="${name}"]`)
  const mouthPoint = () => centerOf(potRef.current.querySelector('[data-pot-mouth]').getBoundingClientRect())

  // Every pot change goes through here so the match cards can be Flip-captured first.
  const toggle = useCallback(
    (name) => {
      flipState.current = Flip.getState(root.current.querySelectorAll('[data-flip-id]'))
      onToggle(name)
    },
    [onToggle],
  )
  const toggleRef = useRef(toggle)
  toggleRef.current = toggle

  const pickToken = (name, e) => {
    if (Date.now() - lastDragEnd.current < 250) return
    toggle(name)
    if (e.detail === 0) {
      // Keyboard: keep focus on the ring by moving to the next sticker still out of the pot.
      const order = INGREDIENTS.map((i) => i.name)
      const start = order.indexOf(name)
      const next = [...order.slice(start + 1), ...order.slice(0, start)].find((n) => !selected.includes(n))
      requestAnimationFrame(() => (next ? tokenEl(next)?.focus() : searchRef.current?.focus()))
    }
  }

  const removeChip = (name, e) => {
    toggle(name)
    if (e.detail === 0) requestAnimationFrame(() => (tokenEl(name) ?? searchRef.current)?.focus())
  }

  // Load: letters rise in, the stage settles, stickers pop, then the hint sticker nudges toward the pot.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const tl = gsap
        .timeline({ paused: !ready, defaults: { ease: 'power3.out' } })
        .from('[data-letter]', { yPercent: 105, rotation: 8, duration: 0.8, stagger: 0.028 })
        .from('[data-scribble]', { strokeDashoffset: 1, duration: 0.6, ease: 'power2.inOut' }, 0.7)
        // Animate the inner wrapper: the stage itself is centred with CSS `translate`, which GSAP would
        // otherwise bake into a fixed px transform that goes stale when the viewport changes.
        .from('[data-pot-enter]', { y: 40, autoAlpha: 0, duration: 0.8 }, 0.15)
        .from('[data-float]', { scale: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.04 }, 0.3)
        .from('[data-intro]', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.45)

      const hintToken = tokenEl(INGREDIENTS[HINT_INDEX].name)
      if (window.matchMedia('(min-width: 768px)').matches && selected.length === 0) {
        tl.from('[data-hint]', { autoAlpha: 0, duration: 0.5 }, '-=0.2')
        tl.add(() => {
          const from = centerOf(hintToken.getBoundingClientRect())
          const to = mouthPoint()
          const len = Math.hypot(to.x - from.x, to.y - from.y) || 1
          gsap
            .timeline()
            .to(hintToken, { x: ((to.x - from.x) / len) * 22, y: ((to.y - from.y) / len) * 22, duration: 0.35, ease: 'power2.out' })
            .to(hintToken, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
        }, '+=0.2')
      }

      gsap.utils.toArray('[data-float]', root.current).forEach((el, i) => {
        gsap.to(el, {
          y: -5 - (i % 3) * 2,
          duration: 2.2 + (i % 4) * 0.35,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.17,
        })
      })
      loadTl.current = tl
    },
    { scope: root },
  )

  // Play the reveal once the intro hands off; the guided demo waits for it to finish.
  useGSAP(() => {
    if (ready) loadTl.current?.play().then(() => setSettled(true))
  }, { dependencies: [ready] })

  // Drag into the pot (md and up; mobile and keyboard use tap / Enter / Space).
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const pot = potRef.current
        const setOver = (value) => {
          if (overRef.current === value) return
          overRef.current = value
          setDropReady(value)
        }
        const drags = Draggable.create(gsap.utils.toArray('[data-token]', root.current), {
          type: 'x,y',
          dragClickables: true,
          minimumMovement: 6,
          zIndexBoost: false,
          onDragStart() {
            this.target.parentElement.style.zIndex = '30'
            this.target.setAttribute('data-dragging', '')
            gsap.to(this.target, { scale: 1.08, duration: 0.2, ease: 'power3.out' })
          },
          onDrag() {
            setOver(this.hitTest(pot.querySelector('[data-pot-mouth]'), '20%'))
          },
          onDragEnd() {
            lastDragEnd.current = Date.now()
            const over = overRef.current
            setOver(false)
            this.target.parentElement.style.zIndex = ''
            this.target.removeAttribute('data-dragging')
            gsap.to(this.target, { scale: 1, duration: 0.25, ease: 'power3.out' })
            if (over) toggleRef.current(this.target.dataset.token)
            else gsap.to(this.target, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.55)' })
          },
        })
        return () => drags.forEach((d) => d.kill())
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // React to pot changes from anywhere (stickers, chips, search, RadarFinder).
  useGSAP(
    () => {
      const prev = prevSelected.current
      prevSelected.current = selected
      const reduce = prefersReducedMotion()
      const layer = layerRef.current
      const hint = root.current.querySelector('[data-hint]')

      if (selected.length > 0 && !hintGone.current) {
        hintGone.current = true
        if (prev === selected || reduce) gsap.set(hint, { autoAlpha: 0 })
        else gsap.to(hint, { autoAlpha: 0, duration: 0.3, overwrite: true })
      }

      if (prev === selected) {
        selected.forEach((name) => tokenEl(name) && gsap.set(tokenEl(name), { autoAlpha: 0 }))
        return
      }

      selected.filter((n) => !prev.includes(n)).forEach((name) => {
        const token = tokenEl(name)
        if (!token) return splashPot(potRef.current)
        const face = token.querySelector('[data-face]')
        const from = centerOf(face.getBoundingClientRect())
        gsap.set(token, { x: 0, y: 0, autoAlpha: 0 })
        if (reduce) return
        flyFace(layer, face, from, mouthPoint(), 'in').then(() => splashPot(potRef.current))
      })

      prev.filter((n) => !selected.includes(n)).forEach((name) => {
        const token = tokenEl(name)
        if (!token) return
        if (reduce) return gsap.set(token, { autoAlpha: 1 })
        const face = token.querySelector('[data-face]')
        gsap.set(token, { visibility: 'visible', opacity: 0 })
        flyFace(layer, face, mouthPoint(), centerOf(face.getBoundingClientRect()), 'out').then(() =>
          gsap.set(token, { opacity: 1 }),
        )
      })

      if (flipState.current) {
        Flip.from(flipState.current, {
          targets: gsap.utils.toArray('[data-flip-id]', root.current),
          duration: reduce ? 0 : 0.7,
          ease: 'power3.out',
          onEnter: (els) => !reduce && gsap.fromTo(els, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }),
        })
        flipState.current = null
      }
    },
    { scope: root, dependencies: [selected] },
  )

  const count = selected.length ? matches.length : 0

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex w-full flex-col overflow-x-clip px-4 pb-16 pt-24 md:px-8 lg:min-h-[100dvh] lg:justify-center lg:pb-6"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-12 lg:items-center lg:gap-8 2xl:max-w-[1600px]">
        <div className="lg:col-span-5">
          <Headline />
          <p data-intro className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-tomato-ink">
            Drop it in the pot
          </p>
          <p data-intro className="mt-2 max-w-md text-base leading-snug text-ink-soft lg:text-lg">
            Drag what you have into the pot. We line up the recipes you can cook right now, best match first.
          </p>
          <div data-intro className="mt-5 max-w-md">
            <PantrySearch ref={searchRef} selected={selected} suggestions={INGREDIENTS.map((i) => i.name)} onAdd={toggle} />
          </div>
        </div>

        <div className={`lg:col-span-7 ${STAGE}`}>
          <ul
            aria-label="Ingredients"
            className="depth-tokens -mx-4 flex gap-4 overflow-x-auto overscroll-x-contain px-4 py-4 [scrollbar-width:none] max-md:mb-4 max-md:[mask-image:linear-gradient(to_right,#000_80%,transparent)] md:absolute md:inset-0 md:mx-0 md:block md:overflow-visible md:p-0"
          >
            {INGREDIENTS.map((item, i) => (
              <IngredientToken key={item.name} item={item} angle={ARC[i]} hint={i === HINT_INDEX} onPick={pickToken} />
            ))}
          </ul>

          <div
            data-pot-stage
            className="relative z-10 mx-auto w-[min(80vw,300px)] max-md:pointer-events-none md:absolute md:left-1/2 md:top-(--cy) md:w-(--pot-w) md:-translate-x-1/2 md:-translate-y-1/2"
          >
            {/* Phones: tuck the pot into its own steam headroom (top ~29% of the SVG is sky). */}
            <div data-pot-enter className="max-md:-mt-[16%]">
              <div className="depth-pot">
                <div data-tilt>
                  <Pot ref={potRef} items={selected} count={count} over={dropReady} />
                </div>
              </div>
              <div className="pointer-events-auto md:absolute md:inset-x-[-4rem] md:top-full">
                <PotChips selected={selected} onRemove={removeChip} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <MatchStrip matches={selected.length ? matches : []} resultsId={resultsId} onOpenRecipe={onOpenRecipe} />

      <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40" />
      <GhostDemo active={settled} rootRef={root} onAdd={(name) => toggleRef.current(name)} onDropHover={setDropReady} />
    </section>
  )
}
