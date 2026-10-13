import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import DietMark from './DietMark.jsx'

gsap.registerPlugin(useGSAP)

const DIET_LABELS = { veg: 'Veg', nonveg: 'Non-veg' }

const label = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em]'
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-tomato focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2'
const iconButton = `flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper-2 shadow-[2px_2px_0_#1C1915] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:translate-y-0 ${focusRing}`

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function IngredientChecklist({ ingredients, checked, onToggle }) {
  return (
    <section aria-labelledby="modal-ingredients">
      <div className="flex items-baseline justify-between gap-3 border-b border-ink/15 pb-2">
        <h3 id="modal-ingredients" className="text-lg font-bold tracking-tight text-ink">Ingredients</h3>
        <p className={`${label} tabular-nums text-ink-soft`} aria-live="polite">
          {checked.length} of {ingredients.length} ready
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-1">
        {ingredients.map((item) => {
          const done = checked.includes(item)
          return (
            <li key={item}>
              <label
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-3 text-base capitalize transition-colors duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tomato ${
                  done ? 'border-basil bg-basil/10 text-basil' : 'border-ink/15 bg-paper text-ink hover:border-ink/40'
                }`}
              >
                <input type="checkbox" checked={done} onChange={() => onToggle(item)} className="sr-only" />
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${done ? 'border-basil bg-basil text-paper-2' : 'border-ink/50 bg-paper-2'}`}
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m2.5 6.2 2.3 2.3 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={done ? 'line-through decoration-basil/50' : ''}>{item}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function StepPlayer({ steps, step, onStep, onFinish }) {
  const text = useRef(null)
  const isLast = step === steps.length - 1

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from(text.current, { y: 12, autoAlpha: 0, duration: 0.4, ease: 'power3.out' })
    },
    { dependencies: [step] },
  )

  return (
    <section aria-labelledby="modal-steps" className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="modal-steps" className="text-lg font-bold tracking-tight text-ink">Method</h3>
        <p className={`${label} tabular-nums text-ink-soft`}>
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Cooking progress"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={step + 1}
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-ink/10"
      >
        <div
          className="h-full rounded-full bg-basil transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 flex min-h-36 gap-4 rounded-2xl border border-ink/15 bg-paper p-5" aria-live="polite">
        <span className="font-display text-5xl font-extrabold leading-none tracking-tight text-tomato" aria-hidden="true">
          {String(step + 1).padStart(2, '0')}
        </span>
        <p ref={text} className="text-lg leading-snug text-ink">
          {steps[step]}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onStep(step - 1)}
          disabled={step === 0}
          className={`h-11 rounded-full border-[1.5px] border-ink bg-paper-2 px-5 text-ink transition-colors duration-300 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-35 ${label} ${focusRing}`}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => (isLast ? onFinish() : onStep(step + 1))}
          className={`h-11 rounded-full bg-ink px-6 text-paper transition-colors duration-300 hover:bg-tomato active:scale-[0.98] ${label} ${focusRing}`}
        >
          {isLast ? 'Done, time to eat' : 'Next step'}
        </button>
      </div>
    </section>
  )
}

/**
 * Step-by-step recipe sheet. Mount it with `key={recipe.id}` so progress resets per recipe.
 * A native <dialog> provides the focus trap, Escape to close and focus restore.
 */
export default function RecipeModal({ recipe, pantry = [], onClose, isFavorite, onToggleFavorite }) {
  const dialog = useRef(null)
  const panel = useRef(null)
  const [step, setStep] = useState(0)
  // Anything already in the pot starts ticked off.
  const [checked, setChecked] = useState(() => recipe.ingredients.filter((item) => pantry.includes(item)))
  const [imageFailed, setImageFailed] = useState(false)
  const { name, diet, time, difficulty, image, ingredients, steps } = recipe

  useEffect(() => {
    const el = dialog.current
    el.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (el.open) el.close()
    }
  }, [])

  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.from(panel.current, { y: 32, autoAlpha: 0, duration: 0.5, ease: 'power3.out' })
  })

  const close = () => dialog.current.close()

  const toggleIngredient = (item) => {
    setChecked((current) => (current.includes(item) ? current.filter((i) => i !== item) : [...current, item]))
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' && step < steps.length - 1) setStep(step + 1)
    if (event.key === 'ArrowLeft' && step > 0) setStep(step - 1)
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="modal-title"
      onClose={onClose}
      onKeyDown={onKeyDown}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/55"
    >
      {/* Clicking the dimmed area outside the sheet closes the dialog. */}
      <div
        className="flex min-h-full items-end justify-center md:items-center md:p-6"
        onClick={(event) => event.target === event.currentTarget && close()}
      >
        <div
          ref={panel}
          className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border-[1.5px] border-ink bg-paper-2 text-ink md:rounded-3xl md:shadow-[6px_6px_0_#1C1915]"
        >
          <div className="relative h-44 overflow-hidden border-b-[1.5px] border-ink bg-saffron/35 md:h-56">
            {!imageFailed && (
              <img src={image} alt="" onError={() => setImageFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite(recipe.id)}
                aria-pressed={isFavorite}
                aria-label={`${isFavorite ? 'Remove' : 'Save'} ${name} ${isFavorite ? 'from' : 'to'} favorites`}
                className={`${iconButton} ${isFavorite ? 'text-tomato' : 'text-ink'}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} stroke={isFavorite ? '#1C1915' : 'currentColor'} strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" onClick={close} aria-label="Close recipe" className={`${iconButton} text-ink`}>
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-5 pt-5 md:px-8 md:pt-6">
            <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft ${label}`}>
              <span className="inline-flex items-center gap-1.5 text-ink">
                <DietMark diet={diet} />
                {DIET_LABELS[diet]}
              </span>
              <span>{time} min</span>
              <span>{difficulty}</span>
            </p>
            <h2 id="modal-title" className="mt-2 font-display text-4xl font-extrabold leading-[0.95] tracking-tight md:text-5xl">
              {name}
            </h2>
          </div>

          <div className="grid gap-8 px-5 pb-8 pt-6 md:grid-cols-[14rem_1fr] md:px-8">
            <IngredientChecklist ingredients={ingredients} checked={checked} onToggle={toggleIngredient} />
            <StepPlayer steps={steps} step={step} onStep={setStep} onFinish={close} />
          </div>
        </div>
      </div>
    </dialog>
  )
}
