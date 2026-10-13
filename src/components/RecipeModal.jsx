import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import DietMark from './DietMark.jsx'

gsap.registerPlugin(useGSAP)

const DIET_LABELS = { veg: 'Veg', nonveg: 'Non-veg' }

const iconButton =
  'flex h-11 w-11 items-center justify-center rounded-full bg-bg/70 ring-1 ring-cream/15 backdrop-blur-md outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-lime'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function IngredientChecklist({ ingredients, checked, onToggle }) {
  return (
    <section aria-labelledby="modal-ingredients">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="modal-ingredients" className="font-display text-lg font-semibold text-cream">Ingredients</h3>
        <p className="text-xs tabular-nums text-muted" aria-live="polite">
          {checked.length} of {ingredients.length} ready
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-1">
        {ingredients.map((item) => {
          const done = checked.includes(item)
          return (
            <li key={item}>
              <label
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm capitalize ring-1 transition-colors duration-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime ${
                  done ? 'bg-lime/10 text-lime ring-lime/30' : 'bg-bg/50 text-cream ring-cream/10 hover:ring-cream/25'
                }`}
              >
                <input type="checkbox" checked={done} onChange={() => onToggle(item)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ${done ? 'bg-lime text-bg ring-lime' : 'ring-cream/30'}`}
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m2.5 6.2 2.3 2.3 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={done ? 'line-through decoration-lime/50' : ''}>{item}</span>
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
        <h3 id="modal-steps" className="font-display text-lg font-semibold text-cream">Method</h3>
        <p className="text-xs tabular-nums text-muted">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Cooking progress"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={step + 1}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg/70"
      >
        <div
          className="h-full rounded-full bg-lime shadow-[0_0_12px_rgba(200,241,105,0.7)] transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="mt-5 flex min-h-36 gap-4 rounded-2xl bg-bg/50 p-5 ring-1 ring-cream/10" aria-live="polite">
        <span className="font-display text-4xl font-semibold leading-none text-lime/80" aria-hidden="true">
          {String(step + 1).padStart(2, '0')}
        </span>
        <p ref={text} className="text-base leading-relaxed text-cream md:text-lg">
          {steps[step]}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onStep(step - 1)}
          disabled={step === 0}
          className="h-11 rounded-full bg-cream/10 px-5 text-sm font-medium text-cream outline-none transition-colors duration-500 hover:bg-cream/15 focus-visible:ring-2 focus-visible:ring-lime disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => (isLast ? onFinish() : onStep(step + 1))}
          className="h-11 rounded-full bg-lime px-6 text-sm font-semibold text-bg shadow-[0_0_30px_-10px_rgba(200,241,105,0.8)] outline-none transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cream"
        >
          {isLast ? 'Done, time to eat' : 'Next step'}
        </button>
      </div>
    </section>
  )
}

/**
 * Step-by-step recipe view. Mount it with `key={recipe.id}` so progress resets per recipe.
 * A native <dialog> provides the focus trap, Escape to close and focus restore.
 */
export default function RecipeModal({ recipe, onClose, isFavorite, onToggleFavorite }) {
  const dialog = useRef(null)
  const panel = useRef(null)
  const [step, setStep] = useState(0)
  const [checked, setChecked] = useState([])
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
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-bg/80 backdrop:backdrop-blur-sm"
    >
      {/* Clicking the dimmed area outside the panel closes the dialog. */}
      <div
        className="flex min-h-full items-end justify-center md:items-center md:p-6"
        onClick={(event) => event.target === event.currentTarget && close()}
      >
        <div
          ref={panel}
          className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-surface text-cream shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)] ring-1 ring-cream/10 md:rounded-3xl"
        >
          <div className="relative h-44 overflow-hidden bg-[radial-gradient(120%_120%_at_20%_10%,#1e3226,#16251c_55%,#0f1a14)] md:h-56">
            {!imageFailed && (
              <img src={image} alt="" onError={() => setImageFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-bg/10" aria-hidden="true" />

            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite(recipe.id)}
                aria-pressed={isFavorite}
                aria-label={`${isFavorite ? 'Remove' : 'Save'} ${name} ${isFavorite ? 'from' : 'to'} favorites`}
                className={`${iconButton} ${isFavorite ? 'text-tomato' : 'text-cream'}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" onClick={close} aria-label="Close recipe" className={`${iconButton} text-cream`}>
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-5 pb-4 md:px-8">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5 text-cream">
                  <DietMark diet={diet} />
                  {DIET_LABELS[diet]}
                </span>
                <span>{time} min</span>
                <span className="capitalize">{difficulty}</span>
              </p>
              <h2 id="modal-title" className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                {name}
              </h2>
            </div>
          </div>

          <div className="grid gap-8 px-5 pb-8 pt-4 md:grid-cols-[14rem_1fr] md:px-8">
            <IngredientChecklist ingredients={ingredients} checked={checked} onToggle={toggleIngredient} />
            <StepPlayer steps={steps} step={step} onStep={setStep} onFinish={close} />
          </div>
        </div>
      </div>
    </dialog>
  )
}
