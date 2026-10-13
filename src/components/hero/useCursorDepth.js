import { useEffect } from 'react'

const clamp = (v) => Math.max(-1, Math.min(1, v))

/**
 * Feeds the cursor into CSS so depth stays CSS-only (see index.css):
 * - --mx / --my on <html>: cursor across the viewport, -1..1 (parallax layers).
 * - --tx / --ty on each [data-tilt] element: cursor relative to that element, -1..1 (tilt).
 * Fine pointers with hover only, and never with reduced motion; touch devices stay flat.
 * Writes at most once per animation frame.
 */
export function useCursorDepth() {
  useEffect(() => {
    const capable = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    if (!capable.matches) return

    const root = document.documentElement
    let frame = 0
    let px = window.innerWidth / 2
    let py = window.innerHeight / 2

    const update = () => {
      frame = 0
      const hw = window.innerWidth / 2
      const hh = window.innerHeight / 2
      root.style.setProperty('--mx', ((px - hw) / hw).toFixed(3))
      root.style.setProperty('--my', ((py - hh) / hh).toFixed(3))
      document.querySelectorAll('[data-tilt]').forEach((el) => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--tx', clamp((px - (r.left + r.width / 2)) / hw).toFixed(3))
        el.style.setProperty('--ty', clamp((py - (r.top + r.height / 2)) / hh).toFixed(3))
      })
    }

    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      px = e.clientX
      py = e.clientY
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
      root.style.removeProperty('--mx')
      root.style.removeProperty('--my')
    }
  }, [])
}
