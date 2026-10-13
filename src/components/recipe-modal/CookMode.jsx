import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import StepTimer from './StepTimer.jsx'
import { parseDuration } from './parseDuration.js'

gsap.registerPlugin(useGSAP)

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Step number inside a pencil circle that redraws for every step. */
function StepBadge({ n }) {
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full overflow-visible">
        <path
          data-step-circle
          d="M30 5.5c11.8.6 21 9.6 20.6 21.4C50.2 39 40.8 50.3 28.4 50.6 15.6 51 5.6 41.4 5.4 28.8 5.2 16.4 14.6 6.8 26.8 6.2c4.2-.2 8.6.9 12 3.4"
          fill="none"
          stroke="#A8301D"
          strokeWidth="2.4"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="0"
        />
      </svg>
      <span className="font-display text-2xl font-extrabold tracking-tight">{n}</span>
    </span>
  )
}

/** Progress as pencil dots: filled for done, a ringed tomato dot for now, faint for later. */
function PencilDots({ total, current }) {
  return (
    <div
      role="progressbar"
      aria-label="Cooking progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-valuetext={`Step ${current + 1} of ${total}`}
      className="flex items-center gap-2.5"
    >
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 14 14" className={i === current ? 'h-4 w-4' : 'h-3 w-3'} aria-hidden="true">
          <path
            d="M7.3 1.6c3 .2 5.2 2.6 5 5.6-.2 3-2.6 5.2-5.5 5.1C3.8 12.2 1.6 9.8 1.8 6.8 2 3.9 4.4 1.5 7.3 1.6z"
            fill={i < current ? '#1C1915' : i === current ? '#E5432D' : 'none'}
            stroke={i <= current ? '#1C1915' : 'rgb(28 25 21 / 0.35)'}
            strokeWidth="1.4"
          />
        </svg>
      ))}
    </div>
  )
}

/** One step at a time: big type, timer when the step names a duration, Back / Next. */
export default function CookMode({ steps, step, onStep, onFinish }) {
  const scope = useRef(null)
  const lastStep = useRef(step)
  const isLast = step === steps.length - 1
  const seconds = parseDuration(steps[step])

  useGSAP(
    () => {
      const dir = step >= lastStep.current ? 1 : -1
      lastStep.current = step
      if (reduced()) return
      gsap.fromTo('[data-step-text]', { x: 24 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' })
      gsap.fromTo('[data-step-circle]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' })
    },
    { scope, dependencies: [step] },
  )

  return (
    <section ref={scope} aria-labelledby="sheet-cook" className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="sheet-cook" className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]">Cook mode</h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <div className="mt-4 flex min-h-40 gap-4" aria-live="polite">
        <StepBadge n={step + 1} />
        <p data-step-text className="pt-2 text-xl font-medium leading-snug md:text-2xl">
          {steps[step]}
        </p>
      </div>

      {seconds && <StepTimer key={step} seconds={seconds} />}

      <div className="mt-6 max-sm:sticky max-sm:bottom-0 max-sm:-mx-5 max-sm:mt-8 max-sm:border-t max-sm:border-ink/15 max-sm:bg-parchment max-sm:px-5 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] max-sm:pt-3">
        <div className="mb-3 flex justify-center sm:justify-start">
          <PencilDots total={steps.length} current={step} />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onStep(step - 1)}
            disabled={step === 0}
            className="h-14 flex-1 rounded-full font-medium text-ink outline-none ring-2 ring-ink transition-colors duration-300 hover:bg-ink/5 focus-visible:ring-tomato-ink disabled:cursor-not-allowed disabled:opacity-35 sm:h-12 sm:flex-none sm:px-6"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onFinish() : onStep(step + 1))}
            className="h-14 flex-[2] rounded-full bg-ink font-semibold text-paper outline-none transition-[background-color,transform] duration-300 hover:bg-tomato-ink active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-tomato-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2 sm:ml-auto sm:h-12 sm:flex-none sm:px-7"
          >
            {isLast ? 'Finish cooking →' : 'Next step →'}
          </button>
        </div>
      </div>
    </section>
  )
}
