// Shared "recipe index card" look: hand-cut edges, washi tape, a small seeded tilt.
// Used by the hero top-matches strip and RecipeCard (Browse / Favorites).

// A few px of wobble per edge. Picked per recipe so a card keeps its shape across renders.
const CARD_EDGES = [
  'polygon(0.4% 1.6%, 22% 0.4%, 47% 1.2%, 71% 0.2%, 99.5% 1%, 100% 38%, 99.4% 71%, 99.8% 98.8%, 74% 99.7%, 49% 98.9%, 23% 99.8%, 0.2% 99%, 0.6% 64%, 0% 31%)',
  'polygon(0% 0.6%, 26% 1.3%, 53% 0.2%, 78% 1.1%, 99.7% 0%, 99.3% 33%, 100% 66%, 99.5% 99.4%, 72% 98.8%, 44% 99.8%, 19% 99%, 0.5% 99.7%, 0% 69%, 0.6% 36%)',
  'polygon(0.5% 0.2%, 31% 1%, 58% 0.3%, 83% 1.4%, 100% 0.5%, 99.6% 42%, 100% 77%, 99.2% 99.6%, 68% 99%, 39% 99.9%, 14% 98.9%, 0% 99.5%, 0.4% 58%, 0% 24%)',
]

const TAPE_CLIP = 'polygon(0 10%, 4% 0, 96% 0, 100% 14%, 97% 32%, 100% 50%, 96% 68%, 100% 86%, 96% 100%, 4% 100%, 0 88%, 3% 70%, 0 50%, 3% 30%)'

/** Hairline that follows the clipped edge (a border would be cut off by the clip-path). */
export const CARD_HAIRLINE = '[filter:drop-shadow(0_0_0.5px_rgb(28_25_21/0.45))_drop-shadow(0_2px_0_rgb(28_25_21/0.08))]'

// Stable pseudo-random number in [0, 1) from a recipe id.
function seeded(id) {
  let h = 2166136261
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0) / 4294967296
}

/** Edge clip-path and tilt (in degrees, within ±maxTilt) for a recipe id. */
export function indexCardLook(id, maxTilt) {
  const r = seeded(id)
  return {
    clipPath: CARD_EDGES[Math.floor(r * 1000) % CARD_EDGES.length],
    tilt: `${(r * 2 * maxTilt - maxTilt).toFixed(2)}deg`,
  }
}

export function WashiTape({ className = 'left-5' }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -top-2.5 z-10 h-[18px] w-16 -rotate-[5deg] bg-saffron/55 ${className}`}
      style={{
        clipPath: TAPE_CLIP,
        backgroundImage: 'repeating-linear-gradient(45deg, rgb(255 255 255 / 0.22) 0 4px, transparent 4px 9px)',
      }}
    />
  )
}
