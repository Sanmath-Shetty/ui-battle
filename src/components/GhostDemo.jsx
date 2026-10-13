import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const SEEN_KEY = 'recipe-radar:demo-seen'
const DEMO_TOKEN = 'tomato'
// Fingertip position inside the 44x48 hand, so the tip (not the corner) lands on targets.
const TIP = { x: 17, y: 5 }

/** Once per tab session, never with reduced motion. Blocked storage: play (worst case it repeats). */
function shouldPlayDemo() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

function center(el) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

function HandCursor() {
  return (
    <svg viewBox="0 0 44 48" className="h-12 w-11" aria-hidden="true">
      <path
        d="M14 26V8a3 3 0 0 1 6 0v9a3 3 0 0 1 6 0v2a3 3 0 0 1 6 0v3a3 3 0 0 1 6 0v10c0 8-5 13-12 13h-4c-5 0-8-2-11-6l-6-9a3 3 0 0 1 5-4l4 4z"
        fill="#FBF6EC"
        stroke="#1C1915"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M20 17v8M26 19v6M32 22v4" stroke="#1C1915" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * One-time guided demo, started by Hero once its load reveal settles. A hand drags the tomato
 * sticker along an arc into the pot (taps it on mobile, where the tray is tap-only) and runs the
 * real add via `onAdd`, so the count and match strip update. The tomato stays in as a starter.
 * Hovering a sticker, touching, clicking, scrolling or any key cancels it instantly; a cancel
 * before the drop puts the tomato back untouched.
 */
export default function GhostDemo({ active, rootRef, onAdd, onDropHover }) {
  const [eligible] = useState(shouldPlayDemo)
  const [done, setDone] = useState(false)
  const scope = useRef(null)

  useGSAP(
    () => {
      if (!active || !eligible || done) return
      const root = rootRef.current
      const token = root?.querySelector(`[data-token="${DEMO_TOKEN}"]`)
      const mouth = root?.querySelector('[data-pot-mouth]')
      // Bail if the sticker is not available (already in the pot, or layout not there).
      if (!token || !mouth || getComputedStyle(token).visibility === 'hidden') return setDone(true)

      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        // Storage blocked: fine, the demo may show again next load.
      }

      const hand = scope.current.querySelector('[data-hand]')
      const caption = scope.current.querySelector('[data-caption]')
      const slot = token.parentElement
      const desktop = window.matchMedia('(min-width: 768px)').matches
      const from = center(token)
      const to = center(mouth)
      const dx = to.x - from.x
      const dy = to.y - from.y
      const peak = Math.min(0, dy) - 90
      let dropped = false
      let finished = false
      let removeListeners = () => {}

      // Not a context revert: that would undo Hero's own styles on the sticker after the add.
      const finish = () => {
        if (finished) return
        finished = true
        removeListeners()
        onDropHover?.(false)
        slot.style.zIndex = ''
        setDone(true)
      }

      gsap.set(hand, { x: from.x - TIP.x + 90, y: from.y - TIP.y + 70, autoAlpha: 0 })
      gsap.set(caption, { x: from.x, y: from.y + (desktop ? 58 : 62), xPercent: -50, autoAlpha: 0 })

      const tl = gsap.timeline({ delay: 0.5, defaults: { ease: 'power3.out' }, onComplete: finish })
      tl.to(hand, { autoAlpha: 1, duration: 0.3 })
        .to(hand, { x: from.x - TIP.x, y: from.y - TIP.y, duration: 0.6, ease: 'power2.inOut' })
        // Grab: hand squeezes, sticker lifts.
        .to(hand, { scale: 0.88, duration: 0.12, transformOrigin: `${TIP.x}px ${TIP.y}px` })
        .set(slot, { zIndex: 30 }, '<')
        .call(() => desktop && token.setAttribute('data-dragging', ''), null, '<')
        .to(token, { scale: desktop ? 1.08 : 0.92, duration: 0.15 }, '<')

      if (desktop) {
        // Drag along an arc; hand and sticker move together. Pot shows its "Drop it!" state near the end.
        const d = 0.9
        tl.addLabel('drag')
          .to([token, hand], { x: (i) => (i === 0 ? dx : from.x - TIP.x + dx), duration: d, ease: 'power1.inOut' }, 'drag')
          .to([token, hand], { y: (i) => (i === 0 ? peak : from.y - TIP.y + peak), duration: d * 0.45, ease: 'power2.out' }, 'drag')
          .to([token, hand], { y: (i) => (i === 0 ? dy : from.y - TIP.y + dy), duration: d * 0.55, ease: 'power2.in' }, `drag+=${d * 0.45}`)
          .call(() => onDropHover?.(true), null, `drag+=${d * 0.7}`)
          .to({}, { duration: 0.2 })
      }

      // Release: the real add runs here (Hero flies the sticker in, splashes, updates count + strip).
      tl.to(token, { scale: 1, duration: 0.1 })
        .to(hand, { scale: 1, duration: 0.12 }, '<')
        .call(() => {
          dropped = true
          token.removeAttribute('data-dragging')
          onDropHover?.(false)
          slot.style.zIndex = ''
          onAdd(DEMO_TOKEN)
        })
        .to(caption, { autoAlpha: 1, y: '-=8', duration: 0.4 }, '+=0.45')
        .to(hand, { autoAlpha: 0, y: '+=24', duration: 0.4, ease: 'power2.in' }, '<')
        .to(caption, { autoAlpha: 0, duration: 0.4 }, '+=1.8')

      // Any sign of the user taking over cancels on the spot.
      const cancel = () => {
        if (finished) return
        tl.kill()
        gsap.set([hand, caption], { autoAlpha: 0 })
        token.removeAttribute('data-dragging')
        if (!dropped) gsap.to(token, { x: 0, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' })
        finish()
      }
      const onPointerOver = (e) => {
        if (e.pointerType === 'mouse' && e.target.closest?.('[data-token]')) cancel()
      }
      const opts = { capture: true, passive: true }
      window.addEventListener('pointerover', onPointerOver, opts)
      window.addEventListener('pointerdown', cancel, opts)
      window.addEventListener('touchstart', cancel, opts)
      window.addEventListener('wheel', cancel, opts)
      window.addEventListener('keydown', cancel, true)
      removeListeners = () => {
        window.removeEventListener('pointerover', onPointerOver, opts)
        window.removeEventListener('pointerdown', cancel, opts)
        window.removeEventListener('touchstart', cancel, opts)
        window.removeEventListener('wheel', cancel, opts)
        window.removeEventListener('keydown', cancel, true)
      }
      // Unmount mid-demo (e.g. dev StrictMode remount): stop without touching the sticker.
      return () => {
        if (finished) return
        finished = true
        tl.kill()
        removeListeners()
      }
    },
    { dependencies: [active, done], scope },
  )

  if (!eligible || done) return null

  return (
    <div ref={scope} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45]">
      <span data-hand className="absolute left-0 top-0 opacity-0 drop-shadow-[2px_2px_0_rgb(28_25_21/0.18)]">
        <HandCursor />
      </span>
      <span
        data-caption
        className="absolute left-0 top-0 -rotate-3 whitespace-nowrap rounded-full bg-paper-2 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-tomato-ink opacity-0 ring-1 ring-ink/15"
      >
        your turn
      </span>
    </div>
  )
}
