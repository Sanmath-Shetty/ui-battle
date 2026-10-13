import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

/** Round rubber stamp in tomato ink, text set on a circle. */
function CookedStamp() {
  return (
    <svg viewBox="0 0 160 160" className="h-36 w-36" aria-hidden="true">
      <defs>
        <path id="stamp-ring" d="M80 80m-52 0a52 52 0 1 1 104 0a52 52 0 1 1-104 0" />
      </defs>
      <g fill="none" stroke="#A8301D" strokeWidth="3">
        <circle cx="80" cy="80" r="72" />
        <circle cx="80" cy="80" r="64" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="38" strokeWidth="1.5" />
      </g>
      <text fill="#A8301D" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="600" letterSpacing="3.2">
        <textPath href="#stamp-ring" startOffset="0">RECIPE RADAR · KITCHEN APPROVED ·</textPath>
      </text>
      <text x="80" y="87" textAnchor="middle" fill="#A8301D" fontFamily="Bricolage Grotesque, sans-serif" fontSize="20" fontWeight="800" letterSpacing="-0.5">
        COOKED
      </text>
    </svg>
  )
}

/** End of cook mode: stamp slams down, then save or go find the next dish. */
export default function FinishCard({ recipeName, isFavorite, onToggleFavorite, onCookAnother, onBack }) {
  const scope = useRef(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-finish-title]', { y: 18, autoAlpha: 0, duration: 0.45 })
        .fromTo('[data-stamp]', { scale: 2.4, rotation: -34, autoAlpha: 0 }, { scale: 1, rotation: -12, autoAlpha: 1, duration: 0.32, ease: 'power4.in' }, 0.15)
        .to('[data-stamp]', { keyframes: { scale: [1, 1.06, 1] }, duration: 0.28, ease: 'power2.out' })
        .from('[data-finish-actions] > *', { y: 14, autoAlpha: 0, duration: 0.4, stagger: 0.08 }, '-=0.1')
    },
    { scope },
  )

  return (
    <section ref={scope} aria-labelledby="sheet-finish" className="flex flex-col items-center py-4 text-center sm:items-start sm:text-left">
      <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">All steps done</p>
          <h3 id="sheet-finish" data-finish-title className="mt-2 font-display text-5xl font-extrabold leading-none tracking-[-0.04em] md:text-6xl">
            Bon appétit!
          </h3>
          <p className="mt-3 max-w-sm text-base text-ink-soft">{recipeName} is ready. Plate it up while it is hot.</p>
        </div>
        <div data-stamp className="shrink-0">
          <CookedStamp />
        </div>
      </div>

      <div data-finish-actions className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-tomato-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2 ${
            isFavorite ? 'bg-tomato-ink text-paper' : 'bg-ink text-paper hover:bg-tomato-ink'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
          </svg>
          {isFavorite ? 'Saved to favorites' : 'Save to favorites'}
        </button>
        <button
          type="button"
          onClick={onCookAnother}
          className="inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-ink outline-none ring-2 ring-ink transition-colors duration-300 hover:bg-ink/5 focus-visible:ring-tomato-ink"
        >
          Cook another →
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center justify-center px-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-tomato-ink sm:ml-auto"
        >
          ← Back to steps
        </button>
      </div>
    </section>
  )
}
