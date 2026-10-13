import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { INGREDIENT_BY_NAME } from './ingredients.jsx'

const INK = '#1C1915'
const SAFFRON = '#F2B23A'
const DROP_COLORS = ['#E5432D', SAFFRON, '#2E6A3C', '#E5432D']

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Scatter floating bits across the broth surface (golden-angle spread, stays inside the ellipse).
function brothSpot(i) {
  const angle = i * 2.39996
  const reach = 0.25 + 0.6 * ((i * 0.618) % 1)
  return { cx: 180 + Math.cos(angle) * 112 * reach, cy: 112 + Math.sin(angle) * 12 * reach }
}

/** Squash the pot and throw a few coloured drops out of the broth. Called by Hero on landing. */
export function splashPot(potEl) {
  if (!potEl || prefersReducedMotion()) return
  const q = gsap.utils.selector(potEl)

  gsap.fromTo(q('[data-ripple]'), { scale: 0.3, autoAlpha: 1, transformOrigin: '50% 50%' }, { scale: 1.1, autoAlpha: 0, duration: 0.6, ease: 'power2.out' })
  gsap
    .timeline()
    .to(q('[data-pot-body]'), { scaleY: 0.94, scaleX: 1.04, transformOrigin: '50% 100%', duration: 0.12, ease: 'power2.out' })
    .to(q('[data-pot-body]'), { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' })

  const spread = [-82, -34, 38, 84]
  const lift = [-64, -92, -86, -58]
  q('[data-drop]').forEach((drop, i) => {
    gsap
      .timeline()
      .set(drop, { x: 0, y: 0, scale: 0, autoAlpha: 1, transformOrigin: '50% 50%' })
      .to(drop, { x: spread[i], duration: 0.7, ease: 'power1.out' }, 0)
      .to(drop, { scale: 1, duration: 0.15, ease: 'back.out(3)' }, 0)
      .to(drop, { y: lift[i], duration: 0.3, ease: 'power2.out' }, 0)
      .to(drop, { y: lift[i] + 46, duration: 0.4, ease: 'power2.in' }, 0.3)
      .to(drop, { autoAlpha: 0, scale: 0.5, duration: 0.2 }, 0.5)
  })
}

/** The hero pot. `ref` lands on the wrapper; the broth carries data-pot-mouth as the drop target. */
export default function Pot({ ref, items, count, over }) {
  const scope = useRef(null)
  const numberRef = useRef(null)
  const shown = useRef({ value: count })
  const hasItems = items.length > 0

  // Steam drifts up while something is cooking.
  useGSAP(
    () => {
      if (!hasItems || prefersReducedMotion()) return
      gsap.fromTo(
        '[data-steam]',
        { y: 14, autoAlpha: 0 },
        { keyframes: { y: [14, -6, -26], autoAlpha: [0, 0.8, 0] }, duration: 2.6, ease: 'none', stagger: { each: 0.7, repeat: -1 } },
      )
    },
    { scope, dependencies: [hasItems], revertOnUpdate: true },
  )

  // Saffron ring while a sticker hovers over the pot.
  useGSAP(
    () => {
      if (!over) return
      const ring = gsap.utils.toArray('[data-drop-ring]', scope.current)
      if (prefersReducedMotion()) return gsap.set(ring, { autoAlpha: 1 })
      gsap.fromTo(ring, { autoAlpha: 0, scale: 0.92, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out' })
      gsap.to(ring, { scale: 1.04, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.3 })
    },
    { scope, dependencies: [over], revertOnUpdate: true },
  )

  // Count rolls to its new value.
  useGSAP(
    () => {
      if (!numberRef.current) return
      const render = () => {
        if (numberRef.current) numberRef.current.textContent = Math.round(shown.current.value)
      }
      if (prefersReducedMotion()) {
        shown.current.value = count
        return render()
      }
      gsap.to(shown.current, { value: count, duration: 0.6, ease: 'power3.out', onUpdate: render })
    },
    { scope, dependencies: [count, hasItems, over] },
  )

  let label
  if (over) {
    label = <span className="font-display text-[clamp(1.2rem,4vw,1.9rem)] font-extrabold leading-none tracking-tight text-tomato">Drop it!</span>
  } else if (hasItems) {
    label = (
      <>
        <span ref={numberRef} className="font-display text-[clamp(1.3rem,4.5vw,2rem)] font-extrabold leading-none tracking-tight">
          {count}
        </span>
        <span className="mt-1 font-mono text-[8px] font-medium uppercase leading-tight tracking-[0.1em] text-ink-soft md:text-[9px]">
          {count === 1 ? 'recipe you can cook' : 'recipes you can cook'}
        </span>
      </>
    )
  } else {
    label = (
      <span className="font-mono text-[9px] font-medium uppercase leading-snug tracking-[0.14em] text-ink-soft md:text-[10px]">
        The pot is empty
      </span>
    )
  }

  return (
    <div
      ref={(el) => {
        scope.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      className={`relative transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${over ? 'scale-[1.04]' : ''}`}
    >
      <svg viewBox="0 0 360 300" className="pointer-events-none block h-auto w-full overflow-visible" aria-hidden="true">
        <ellipse cx="180" cy="288" rx="122" ry="8" fill={INK} opacity="0.12" />
        {[130, 180, 230].map((x) => (
          <path key={x} data-steam d={`M${x} 86c-10-12 10-20 0-32s10-20 0-32`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0" />
        ))}
        <ellipse data-drop-ring cx="180" cy="110" rx="174" ry="44" fill="none" stroke={SAFFRON} strokeWidth="5" opacity="0" />
        <ellipse data-drop-ring cx="180" cy="110" rx="162" ry="34" fill="none" stroke={SAFFRON} strokeWidth="10" strokeOpacity="0.45" opacity="0" />
        <g data-pot-body>
          <path d="M36 132h-14a14 14 0 0 0 0 28h14M324 132h14a14 14 0 0 1 0 28h-14" stroke={INK} strokeWidth="3" fill="none" />
          <path d="M36 110v62a92 92 0 0 0 92 92h104a92 92 0 0 0 92-92v-62" fill="#E5432D" stroke={INK} strokeWidth="3" />
          <path d="M60 140v34M72 150v12" stroke="#FBF6EC" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
          <rect x="94" y="166" width="172" height="62" rx="10" fill="#FBF6EC" stroke={INK} strokeWidth="2" />
          <ellipse cx="180" cy="110" rx="146" ry="24" fill={INK} />
          <ellipse data-pot-mouth cx="180" cy="112" rx="132" ry="17" fill={SAFFRON} />
          {items.map((name, i) => {
            const spot = brothSpot(i)
            return (
              <circle key={name} cx={spot.cx} cy={spot.cy} r="5" fill={INGREDIENT_BY_NAME[name]?.color ?? '#2E6A3C'} stroke={INK} strokeWidth="1.4" />
            )
          })}
          <ellipse data-ripple cx="180" cy="112" rx="118" ry="13" fill="none" stroke="#FBF6EC" strokeWidth="2.5" opacity="0" />
        </g>
        {DROP_COLORS.map((color, i) => (
          <circle key={i} data-drop cx="180" cy="108" r="7" fill={color} stroke={INK} strokeWidth="2" opacity="0" />
        ))}
      </svg>

      <div className="pointer-events-none absolute left-[26.1%] top-[55.3%] flex h-[20.7%] w-[47.8%] flex-col items-center justify-center px-1 text-center">
        {label}
      </div>
      <p className="sr-only" aria-live="polite">
        {hasItems ? `${count} ${count === 1 ? 'recipe' : 'recipes'} you can cook` : 'The pot is empty'}
      </p>
    </div>
  )
}
