import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { IngredientArt } from './hero/ingredients.jsx'

gsap.registerPlugin(useGSAP)

const INK = '#1C1915'
const SEEN_KEY = 'recipe-radar:intro-seen'
const DROPS = ['tomato', 'egg', 'chili']

/** Play once per tab session, never with reduced motion. Storage can throw (private mode): then just play. */
export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

function MiniPot() {
  return (
    <svg viewBox="0 0 360 300" className="block h-auto w-full overflow-visible" aria-hidden="true">
      {[140, 180, 220].map((x) => (
        <path key={x} data-intro-steam d={`M${x} 92c-10-12 10-20 0-32s10-20 0-32`} stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0" />
      ))}
      <g data-intro-pot>
        <path d="M36 132h-14a14 14 0 0 0 0 28h14M324 132h14a14 14 0 0 1 0 28h-14" stroke={INK} strokeWidth="6" fill="none" />
        <path d="M36 110v62a92 92 0 0 0 92 92h104a92 92 0 0 0 92-92v-62" fill="#E5432D" stroke={INK} strokeWidth="6" />
        <ellipse cx="180" cy="110" rx="146" ry="24" fill={INK} />
        <ellipse cx="180" cy="112" rx="130" ry="15" fill="#F2B23A" />
      </g>
    </svg>
  )
}

/**
 * Page-load intro: three stickers drop into a pot while the counter preheats to 100%,
 * then a tomato circle wipe floods the screen and slides away to reveal the hero.
 * `onReveal` fires as the wipe starts clearing (Hero starts its letters then); `onDone` unmounts.
 * One timeline, under 2s. Any click or key skips. Scroll is locked while it runs.
 */
export default function Intro({ onReveal, onDone }) {
  const root = useRef(null)
  const counterRef = useRef(null)
  const barRef = useRef(null)
  const finished = useRef({ revealed: false, done: false })
  const callbacks = useRef({ onReveal, onDone })
  callbacks.current = { onReveal, onDone }

  const reveal = () => {
    if (finished.current.revealed) return
    finished.current.revealed = true
    callbacks.current.onReveal?.()
  }
  const done = () => {
    if (finished.current.done) return
    reveal()
    finished.current.done = true
    callbacks.current.onDone?.()
  }

  // Lock scroll for the duration and remember that the intro has played this session.
  useEffect(() => {
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Storage blocked: the intro just plays again next load.
    }
    return () => {
      html.style.overflow = previous
    }
  }, [])

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root)
      const progress = { value: 0 }
      const potBox = () => q('[data-intro-stage]')[0].getBoundingClientRect()
      const wipeAt = (radius) => () => {
        const r = potBox()
        const x = r.left + r.width / 2
        const y = r.top + r.height * 0.55
        const full = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
        return `circle(${radius === 'full' ? full + 2 : radius}px at ${x}px ${y}px)`
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: done })

      // 0 to 1.05s: preheat counter runs across the drops and the steam.
      tl.to(
        progress,
        {
          value: 100,
          duration: 1.05,
          ease: 'none',
          onUpdate() {
            const v = Math.round(progress.value)
            counterRef.current.textContent = `${String(v).padStart(3, '0')}%`
            barRef.current.style.transform = `scaleX(${v / 100})`
          },
        },
        0,
      )

      // Three stickers fall in with a bounce off the broth; the pot squashes on each landing.
      q('[data-intro-token]').forEach((token, i) => {
        const at = 0.05 + i * 0.24
        tl.fromTo(token, { y: -150, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.18, ease: 'power2.in' }, at)
          .to(token, { y: -16, duration: 0.07, ease: 'power2.out' }, at + 0.18)
          .to(token, { y: 6, scale: 0.35, autoAlpha: 0, duration: 0.08, ease: 'power2.in' }, at + 0.25)
          .to(q('[data-intro-pot]'), { scaleY: 0.93, scaleX: 1.04, transformOrigin: '50% 100%', duration: 0.06, ease: 'power2.out' }, at + 0.18)
          .to(q('[data-intro-pot]'), { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'back.out(3)' }, at + 0.24)
      })

      // Steam rises once the last one is in.
      tl.fromTo(q('[data-intro-steam]'), { y: 12, autoAlpha: 0 }, { y: -14, autoAlpha: 1, duration: 0.3, stagger: 0.06 }, 0.72)

      // 100%: pot swells, the tomato circle floods out of it, then slides away to the hero.
      tl.to(q('[data-intro-stage]'), { scale: 1.15, duration: 0.12, ease: 'power2.out' }, 1.05)
        .fromTo(q('[data-intro-wipe]'), { clipPath: wipeAt(0) }, { clipPath: wipeAt('full'), duration: 0.32, ease: 'power3.in' }, 1.1)
        .set(q('[data-intro-panel]'), { autoAlpha: 0 }, 1.42)
        .call(reveal, null, 1.42)
        .to(q('[data-intro-wipe]'), { yPercent: -100, duration: 0.4, ease: 'power3.inOut' }, 1.42)

      const skip = contextSafe(() => {
        tl.kill()
        done()
      })
      window.addEventListener('pointerdown', skip)
      window.addEventListener('keydown', skip)
      return () => {
        window.removeEventListener('pointerdown', skip)
        window.removeEventListener('keydown', skip)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="fixed inset-0 z-[90] cursor-pointer" role="presentation">
      <div data-intro-panel className="absolute inset-0 flex flex-col items-center justify-center bg-paper px-4">
        <div data-intro-stage className="relative w-[min(46vw,190px)]">
          {DROPS.map((name, i) => (
            <span
              key={name}
              data-intro-token
              className="absolute left-1/2 top-[30%] flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-paper-2 opacity-0 shadow-[2px_2px_0_#1C1915]"
              style={{ marginLeft: `${(i - 1) * 22 - 24}px`, marginTop: '-24px', rotate: `${(i - 1) * 10}deg` }}
            >
              <IngredientArt name={name} className="h-8 w-8" />
            </span>
          ))}
          <MiniPot />
        </div>

        <div className="mt-6 w-[min(60vw,220px)]">
          <p className="flex justify-between font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink">
            <span>Preheating</span>
            <span ref={counterRef}>000%</span>
          </p>
          <div className="mt-2 h-[2px] overflow-hidden bg-ink/15">
            <div ref={barRef} className="h-full origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
        <p className="absolute bottom-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">Tap or press any key to skip</p>
      </div>

      <div data-intro-wipe aria-hidden="true" className="absolute inset-0 bg-tomato" style={{ clipPath: 'circle(0px at 50% 50%)' }} />
    </div>
  )
}
