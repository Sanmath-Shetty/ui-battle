import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

/** Wobbly hand-drawn box with a check that draws itself in (stroke-dashoffset 1 -> 0). */
function HandCheck({ on }) {
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7 shrink-0" aria-hidden="true">
      <path
        d="M5 6.5c5-1.2 12-1.3 17.6-.4.8 5.4.9 11.2.2 16.5-5.6.9-12.1.8-17.4.2C4.5 17.6 4.4 12 5 6.5z"
        fill="#FBF6EC"
        stroke="#1C1915"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        data-check={on ? 'on' : 'off'}
        d="M8.5 14.5c1.6 1.4 2.8 2.9 3.9 4.6 2.6-5 5.7-8.7 9.8-12"
        fill="none"
        stroke="#2E6A3C"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        className={`transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${on ? '[stroke-dashoffset:0]' : '[stroke-dashoffset:1]'}`}
      />
    </svg>
  )
}

/**
 * Ingredients as a hand-ticked list. Items already in the pot arrive ticked (their checks draw in);
 * missing ones get an "add" chip that puts them in the shared pot. Ticking strikes the line through.
 */
export default function IngredientChecklist({ ingredients, pantry, ticked, onTick, onAdd }) {
  const scope = useRef(null)

  // Pre-ticked rows draw their checks in once the sheet has landed.
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        '[data-check="on"]',
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.5, stagger: 0.09, delay: 0.5, ease: 'power2.out', clearProps: 'strokeDashoffset' },
      )
    },
    { scope },
  )

  return (
    <section ref={scope} aria-labelledby="sheet-ingredients">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="sheet-ingredients" className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]">
          Ingredients
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft" aria-live="polite">
          {ticked.length}/{ingredients.length} ready
        </p>
      </div>

      <ul className="mt-3 space-y-1">
        {ingredients.map((item) => {
          const on = ticked.includes(item)
          const inPot = pantry.includes(item)
          return (
            <li key={item} className="flex min-h-11 items-center gap-2">
              <label className="group flex min-h-11 flex-1 cursor-pointer items-center gap-2.5 rounded-md outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tomato">
                <input type="checkbox" checked={on} onChange={() => onTick(item)} className="sr-only" />
                <HandCheck on={on} />
                <span className={`relative text-base capitalize transition-colors duration-500 ${on ? 'text-ink-soft' : 'text-ink'}`}>
                  {item}
                  <span
                    aria-hidden="true"
                    className={`absolute -inset-x-1 top-1/2 h-[2px] origin-left -rotate-2 rounded-full bg-ink/70 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${on ? 'scale-x-100' : 'scale-x-0'}`}
                  />
                </span>
              </label>
              {inPot ? (
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-basil">in pot</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  aria-label={`Add ${item} to the pot`}
                  className="inline-flex h-11 items-center gap-1 rounded-full px-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-tomato-ink outline-none ring-1 ring-tomato-ink/40 transition-colors duration-300 hover:bg-tomato-ink hover:text-paper focus-visible:ring-2 focus-visible:ring-tomato-ink"
                >
                  <span aria-hidden="true">+</span> add
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
