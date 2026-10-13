import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { formatClock } from './parseDuration.js'

/**
 * Kitchen timer for one step. Counts from a fixed end time (so it stays right if the tab sleeps),
 * gives a gentle shake and a spoken "time's up" when done. Mount with a key per step to reset.
 */
export default function StepTimer({ seconds }) {
  const [endsAt, setEndsAt] = useState(null)
  const [left, setLeft] = useState(seconds)
  const [finished, setFinished] = useState(false)
  const card = useRef(null)

  useEffect(() => {
    if (!endsAt) return
    const tick = () => {
      const remaining = (endsAt - Date.now()) / 1000
      if (remaining <= 0) {
        setLeft(0)
        setEndsAt(null)
        setFinished(true)
      } else {
        setLeft(remaining)
      }
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endsAt])

  useEffect(() => {
    if (!finished || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.fromTo(
      card.current,
      { x: 0, rotation: 0 },
      { keyframes: { x: [0, -6, 6, -4, 4, -2, 0], rotation: [0, -1, 1, -0.6, 0.6, 0, 0] }, duration: 0.7, ease: 'power1.out', repeat: 1, repeatDelay: 0.6 },
    )
    return () => tween.kill()
  }, [finished])

  const running = endsAt !== null
  const start = () => {
    setFinished(false)
    setLeft(seconds)
    setEndsAt(Date.now() + seconds * 1000)
  }
  const stop = () => {
    setEndsAt(null)
    setLeft(seconds)
  }

  return (
    <div
      ref={card}
      className={`mt-5 flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 ${finished ? 'border-tomato-ink bg-tomato/10' : 'border-ink/25'}`}
    >
      <span role="timer" aria-label="Time left" className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
        {formatClock(left)}
      </span>
      {finished && <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-tomato-ink">Time’s up</span>}
      <span className="sr-only" aria-live="assertive">{finished ? 'Timer finished. Time’s up.' : ''}</span>
      <button
        type="button"
        onClick={running ? stop : start}
        className="ml-auto inline-flex h-11 items-center rounded-full bg-ink px-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper outline-none transition-colors duration-300 hover:bg-tomato-ink focus-visible:ring-2 focus-visible:ring-tomato-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
      >
        {running ? 'Stop timer' : finished ? `Restart ${formatClock(seconds)}` : `Start ${formatClock(seconds)} timer`}
      </button>
    </div>
  )
}
