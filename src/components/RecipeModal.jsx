import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { useGSAP } from '@gsap/react'
import DietMark from './DietMark.jsx'
import IngredientChecklist from './recipe-modal/IngredientChecklist.jsx'
import CookMode from './recipe-modal/CookMode.jsx'
import FinishCard from './recipe-modal/FinishCard.jsx'

gsap.registerPlugin(Draggable, useGSAP)

const DIET_LABELS = { veg: 'VEG', nonveg: 'NON-VEG' }

// Torn, uneven edges on all four sides as an SVG clip-path (objectBoundingBox, so it fits any size).
// Seeded so every sheet tears the same way; nibbles stay within ~1% of the edge.
const TORN_PATH = (() => {
  const nib = (i, salt) => ((Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1 + 1) % 1
  const n = 36
  const top = Array.from({ length: n + 1 }, (_, i) => [i / n, 0.002 + nib(i, 1) * 0.009])
  const right = Array.from({ length: n + 1 }, (_, i) => [0.996 - nib(i, 2) * 0.006, i / n])
  const bottom = Array.from({ length: n + 1 }, (_, i) => [1 - i / n, 0.998 - nib(i, 3) * 0.007])
  const left = Array.from({ length: n + 1 }, (_, i) => [0.004 + nib(i, 4) * 0.006, 1 - i / n])
  const pts = [...top, ...right, ...bottom, ...left].map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`)
  return `M${pts.join('L')}Z`
})()

const TAPE_CLIP = 'polygon(0 12%, 5% 0, 95% 0, 100% 14%, 97% 34%, 100% 52%, 96% 70%, 100% 88%, 95% 100%, 5% 100%, 0 86%, 3% 66%, 0 48%, 3% 28%)'

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isPhone() {
  return window.matchMedia('(max-width: 639px)').matches
}

function Tape({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 hidden h-7 w-28 bg-saffron/55 sm:block ${className}`}
      style={{ clipPath: TAPE_CLIP, backgroundImage: 'repeating-linear-gradient(45deg, rgb(255 255 255 / 0.22) 0 4px, transparent 4px 9px)' }}
    />
  )
}

function IconButton({ label, onClick, pressed, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-2 text-ink outline-none ring-2 ring-ink transition-transform duration-300 hover:scale-105 active:scale-95 focus-visible:ring-tomato-ink"
    >
      {children}
    </button>
  )
}

/** Paper placeholder with a line-drawn bowl, used when a recipe has no photo (or it fails). */
function PhotoPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-paper">
      <svg viewBox="0 0 64 64" className="h-16 w-16 text-ink/45" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M10 34h44a22 18 0 0 1-44 0z" />
        <path d="M22 54h20M26 10c-3 4 3 6 0 10M34 8c-3 4 3 6 0 10M42 12c-3 4 3 6 0 10" />
      </svg>
    </div>
  )
}

/**
 * Recipe sheet. One instance, opened from any card (hero matches, Browse, Favorites). Mount with
 * `key={recipe.id}`. Native <dialog> gives the focus trap and inert page; this adds the morph from
 * the clicked card's photo, the animated exit, scroll lock, swipe-to-close on phones, and returns
 * focus to the card. Ingredients "add" goes through the shared pot (`onAddIngredient`).
 */
export default function RecipeModal({ recipe, pantry = [], origin, onClose, isFavorite, onToggleFavorite, onAddIngredient, onCookAnother }) {
  const dialog = useRef(null)
  const wrap = useRef(null)
  const sheet = useRef(null)
  const photo = useRef(null)
  const handle = useRef(null)
  const closing = useRef(false)
  const afterClose = useRef(null)
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [ticked, setTicked] = useState(() => recipe.ingredients.filter((item) => pantry.includes(item)))
  const [imageFailed, setImageFailed] = useState(!recipe.image)
  const { name, diet, time, difficulty, image, ingredients, steps } = recipe

  // Open as a modal and lock page scroll for as long as the sheet exists.
  useEffect(() => {
    const el = dialog.current
    el.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
      if (el.open) el.close()
    }
  }, [])

  // Entrance: the card photo morphs into the header; the sheet settles from -1deg (desktop)
  // or slides up as a bottom sheet (phone). No usable photo: scale + fade from the card instead.
  useGSAP(
    () => {
      if (reduced()) return
      const phone = isPhone()
      const card = origin?.card
      const cardRect = card?.isConnected ? card.getBoundingClientRect() : null
      const cardImg = card?.querySelector('img')
      const canMorph = cardRect && cardImg && cardImg.complete && cardImg.naturalWidth > 0 && !imageFailed && photo.current
      const target = photo.current?.getBoundingClientRect()

      // Unfold: up from 0.9 with a slight turn, then a quick crinkle as the paper settles.
      const box = wrap.current.getBoundingClientRect()
      const ox = cardRect ? cardRect.left + cardRect.width / 2 - box.left : box.width / 2
      const oy = cardRect ? cardRect.top + cardRect.height / 2 - box.top : box.height / 2
      const tl = gsap.timeline()
      if (phone) {
        tl.fromTo(wrap.current, { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: 'power3.out' })
      } else {
        tl.fromTo(
          wrap.current,
          { scale: 0.9, rotation: -2.5, autoAlpha: 0, transformOrigin: canMorph ? '50% 40%' : `${ox}px ${oy}px` },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' },
        )
      }
      tl.to(wrap.current, { keyframes: { scaleY: [1, 0.985, 1.006, 1], skewX: [0, 0.7, -0.35, 0] }, duration: 0.32, ease: 'power1.out', transformOrigin: '50% 0%' })

      if (!canMorph) return
      // Shared element: a copy of the card photo flies from the card to the header, then hands over.
      const headerImg = photo.current.querySelector('img')
      const from = cardImg.getBoundingClientRect()
      const clone = document.createElement('img')
      clone.src = cardImg.currentSrc || cardImg.src
      clone.alt = ''
      // Inside the dialog so it renders in the top layer; left/top/size tween so the crop never stretches.
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
        objectFit: 'cover',
        borderRadius: '12px',
        zIndex: '5',
        pointerEvents: 'none',
      })
      dialog.current.appendChild(clone)
      gsap.set(headerImg, { autoAlpha: 0 })
      gsap.to(clone, {
        left: target.left,
        top: target.top,
        width: target.width,
        height: target.height,
        borderRadius: 6,
        duration: phone ? 0.5 : 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(headerImg, { autoAlpha: 1 })
          clone.remove()
        },
      })
    },
    { scope: dialog },
  )

  // Phones: drag the sheet down by its handle or photo to dismiss it.
  useGSAP(
    () => {
      if (!isPhone()) return
      const [drag] = Draggable.create(wrap.current, {
        type: 'y',
        trigger: [handle.current, photo.current],
        bounds: { minY: 0, maxY: window.innerHeight },
        onDragEnd() {
          if (this.y > 120 || (this.y > 40 && this.getVelocity?.('y') > 600)) requestClose()
          else gsap.to(wrap.current, { y: 0, duration: 0.35, ease: 'power3.out' })
        },
      })
      return () => drag.kill()
    },
    { scope: dialog },
  )

  // Every close path (Esc, backdrop, x, swipe, Cook another) animates out, then really closes.
  const requestClose = (then) => {
    if (closing.current) return
    closing.current = true
    afterClose.current = then ?? null
    const done = () => dialog.current?.open && dialog.current.close()
    if (reduced()) return done()
    if (isPhone()) gsap.to(wrap.current, { y: 0, yPercent: 100, duration: 0.3, ease: 'power2.in', onComplete: done })
    else gsap.to(wrap.current, { autoAlpha: 0, scale: 0.97, rotation: -1, y: 12, duration: 0.22, ease: 'power2.in', onComplete: done })
  }

  const handleClosed = () => {
    // The close event is async. In dev StrictMode the effect cleanup closes the dialog and the
    // remount reopens it before this fires; a dialog that is open again was not closed by the user.
    if (dialog.current?.open) return
    origin?.focus?.isConnected && origin.focus.focus({ preventScroll: true })
    onClose()
    afterClose.current?.()
  }

  const tick = (item) => setTicked((t) => (t.includes(item) ? t.filter((i) => i !== item) : [...t, item]))
  const addToPot = (item) => {
    onAddIngredient(item)
    setTicked((t) => (t.includes(item) ? t : [...t, item]))
  }

  const goTo = (n) => setStep(Math.max(0, Math.min(steps.length - 1, n)))

  // Arrow keys step through cook mode. Listen on the document, not the dialog: when the focused
  // control unmounts (e.g. a step's timer button), focus drops to <body> and the dialog stops
  // receiving keys.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (closing.current || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowRight' && !finished) {
        e.preventDefault()
        if (step === steps.length - 1) setFinished(true)
        else setStep(step + 1)
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (finished) setFinished(false)
        else setStep(Math.max(0, step - 1))
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [step, finished, steps.length])

  // Portal to <body>: no ancestor overflow/transform can clip it (the dialog is in the top layer anyway).
  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby="sheet-title"
      onCancel={(e) => {
        e.preventDefault()
        requestClose()
      }}
      onClose={handleClosed}
      className="fixed inset-0 z-[100] m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-ink backdrop:bg-ink/45 backdrop:backdrop-blur-[3px]"
    >
      <div
        className="flex h-full items-end justify-center sm:items-center sm:p-6"
        onClick={(e) => e.target === e.currentTarget && requestClose()}
      >
        <div ref={wrap} className="relative w-full max-sm:h-full sm:max-w-3xl sm:[filter:drop-shadow(0_24px_40px_rgb(28_25_21/0.28))]">
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <clipPath id="torn-sheet" clipPathUnits="objectBoundingBox">
              <path d={TORN_PATH} />
            </clipPath>
          </svg>
          <Tape className="-left-6 top-3 -rotate-[38deg]" />
          <Tape className="-right-6 top-3 rotate-[38deg]" />

          <div
            ref={sheet}
            className="recipe-sheet relative h-full overflow-y-auto overscroll-contain px-5 pb-6 pt-4 sm:max-h-[90dvh] sm:rounded-b-md sm:px-8 sm:pb-8 sm:pt-6"
            style={{ clipPath: 'url(#torn-sheet)' }}
          >
            <div ref={handle} className="-mx-5 flex h-7 touch-none items-center justify-center sm:hidden" aria-hidden="true">
              <span className="h-1.5 w-12 rounded-full bg-ink/25" />
            </div>

            <header>
              <div ref={photo} className="relative h-48 touch-none overflow-hidden rounded-md ring-1 ring-ink/15 sm:h-60 sm:touch-auto">
                {imageFailed ? (
                  <PhotoPlaceholder />
                ) : (
                  <img src={image} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
                )}
                <div className="absolute right-3 top-3 flex gap-2">
                  <IconButton
                    label={`${isFavorite ? 'Remove' : 'Save'} ${name} ${isFavorite ? 'from' : 'to'} favorites`}
                    pressed={isFavorite}
                    onClick={() => onToggleFavorite(recipe.id)}
                  >
                    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${isFavorite ? 'text-tomato-ink' : ''}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M12 20.5s-7.5-4.4-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.7-7.5 10.1-7.5 10.1Z" strokeLinejoin="round" />
                    </svg>
                  </IconButton>
                  <IconButton label="Close recipe" onClick={() => requestClose()}>
                    <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" strokeLinecap="round" />
                    </svg>
                  </IconButton>
                </div>
              </div>

              <h2 id="sheet-title" className="mt-5 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
                {name}
              </h2>
              <p className="mt-2 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
                <DietMark diet={diet} />
                {time} min · {difficulty} · {DIET_LABELS[diet]}
              </p>
            </header>

            <div className="mt-6 grid gap-8 border-t border-dashed border-ink/20 pt-6 sm:grid-cols-[14rem_1fr]">
              <IngredientChecklist ingredients={ingredients} pantry={pantry} ticked={ticked} onTick={tick} onAdd={addToPot} />
              {finished ? (
                <FinishCard
                  recipeName={name}
                  isFavorite={isFavorite}
                  onToggleFavorite={() => onToggleFavorite(recipe.id)}
                  onCookAnother={() => requestClose(onCookAnother)}
                  onBack={() => setFinished(false)}
                />
              ) : (
                <CookMode steps={steps} step={step} onStep={goTo} onFinish={() => setFinished(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
