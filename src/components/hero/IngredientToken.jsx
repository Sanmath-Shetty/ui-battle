import gsap from 'gsap'
import { IngredientArt } from './ingredients.jsx'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function wobble(face) {
  if (prefersReducedMotion()) return
  gsap.fromTo(face, { rotation: 0 }, { keyframes: { rotation: [0, -9, 7, -4, 2, 0] }, duration: 0.6, ease: 'power1.out', overwrite: true })
}

/** Hand-drawn dashed arrow from this sticker down-right into the pot (desktop only). */
function DragHint() {
  return (
    <span data-hint aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      <span className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 -rotate-6 whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
        drag me in
      </span>
      <svg viewBox="0 0 90 96" className="absolute left-[78%] top-[78%] h-24 w-[5.6rem]" fill="none">
        <path
          d="M4 6c22-4 48 4 62 26 9 14 10 30 8 50"
          stroke="#1C1915"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />
        <path d="M65 74l9 11 7-12" stroke="#1C1915" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/**
 * A round ingredient sticker. The <li> is the layout slot: a cell in the mobile tray, or a
 * point on the arc around the pot from md up (angle in --c / --s, radii set on the stage).
 * The button is what gets dragged, the float span bobs, and the face wobbles.
 */
export default function IngredientToken({ item, angle, hint, onPick }) {
  const rad = (angle * Math.PI) / 180
  return (
    <li
      className="relative shrink-0 snap-center md:absolute md:left-[calc(50%_+_var(--c)_*_var(--rx))] md:top-[calc(var(--cy)_-_var(--s)_*_var(--ry))] md:-translate-x-1/2 md:-translate-y-1/2"
      style={{ '--c': Math.cos(rad).toFixed(4), '--s': Math.sin(rad).toFixed(4) }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 m-auto h-[4.75rem] w-[4.75rem] rounded-full border-2 border-dashed border-ink/20"
      />
      {hint && <DragHint />}
      <button
        type="button"
        data-token={item.name}
        onClick={(e) => onPick(item.name, e)}
        onPointerEnter={(e) => wobble(e.currentTarget.querySelector('[data-face]'))}
        onFocus={(e) => wobble(e.currentTarget.querySelector('[data-face]'))}
        aria-label={`Add ${item.name} to the pot`}
        className="relative block cursor-grab rounded-full outline-none focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-4 focus-visible:ring-offset-paper active:cursor-grabbing"
      >
        <span data-float className="block">
          <span
            data-face
            className="flex h-[4.75rem] w-[4.75rem] flex-col items-center justify-center rounded-full border-2 border-ink bg-paper-2 shadow-[3px_3px_0_#1C1915]"
            style={{ rotate: `${item.tilt}deg` }}
          >
            <IngredientArt name={item.name} className="h-10 w-10" />
            <span className="mt-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-ink">
              {item.name}
            </span>
          </span>
        </span>
      </button>
    </li>
  )
}
