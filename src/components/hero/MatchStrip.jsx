function DietMark({ diet }) {
  const color = diet === 'veg' ? 'border-veg' : 'border-nonveg'
  const dot = diet === 'veg' ? 'bg-veg' : 'bg-nonveg'
  return (
    <span
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${color}`}
      title={diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
    </span>
  )
}

// Hand-cut index-card outlines (a few px of wobble per edge). Picked per recipe so each card keeps its shape.
const CARD_EDGES = [
  'polygon(0.4% 1.6%, 22% 0.4%, 47% 1.2%, 71% 0.2%, 99.5% 1%, 100% 38%, 99.4% 71%, 99.8% 98.8%, 74% 99.7%, 49% 98.9%, 23% 99.8%, 0.2% 99%, 0.6% 64%, 0% 31%)',
  'polygon(0% 0.6%, 26% 1.3%, 53% 0.2%, 78% 1.1%, 99.7% 0%, 99.3% 33%, 100% 66%, 99.5% 99.4%, 72% 98.8%, 44% 99.8%, 19% 99%, 0.5% 99.7%, 0% 69%, 0.6% 36%)',
  'polygon(0.5% 0.2%, 31% 1%, 58% 0.3%, 83% 1.4%, 100% 0.5%, 99.6% 42%, 100% 77%, 99.2% 99.6%, 68% 99%, 39% 99.9%, 14% 98.9%, 0% 99.5%, 0.4% 58%, 0% 24%)',
]

// Stable pseudo-random number in [0, 1) from a recipe id.
function seeded(id) {
  let h = 2166136261
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0) / 4294967296
}

function WashiTape() {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-2.5 left-5 z-10 h-[18px] w-16 -rotate-[5deg] bg-saffron/55"
      style={{
        clipPath: 'polygon(0 10%, 4% 0, 96% 0, 100% 14%, 97% 32%, 100% 50%, 96% 68%, 100% 86%, 96% 100%, 4% 100%, 0 88%, 3% 70%, 0 50%, 3% 30%)',
        backgroundImage: 'repeating-linear-gradient(45deg, rgb(255 255 255 / 0.22) 0 4px, transparent 4px 9px)',
      }}
    />
  )
}

/** A recipe index card: uneven cut edges, a strip of washi tape, a slight tilt that straightens on hover. */
function MatchCard({ match, best }) {
  const { recipe, have, total, missing } = match
  const r = seeded(recipe.id)
  const tilt = ((r * 3 - 1.5)).toFixed(2)
  const edge = CARD_EDGES[Math.floor(r * 1000) % CARD_EDGES.length]

  return (
    <li data-flip-id={recipe.id} className="group pt-2.5">
      <div
        className="relative h-full rotate-(--tilt) transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1 group-hover:rotate-0"
        style={{ '--tilt': `${tilt}deg` }}
      >
        <WashiTape />
        <div data-tilt className="h-full [filter:drop-shadow(0_0_0.5px_rgb(28_25_21/0.45))_drop-shadow(0_2px_0_rgb(28_25_21/0.08))]">
          <article
            className="flex h-full items-center gap-3 bg-paper-2 p-2 pr-4"
            style={{
              clipPath: edge,
              backgroundImage: 'linear-gradient(to bottom, transparent 7px, rgb(229 67 45 / 0.35) 7px, rgb(229 67 45 / 0.35) 8px, transparent 8px)',
            }}
          >
            <div className="relative mt-1.5 h-20 w-20 shrink-0 overflow-hidden rounded-md bg-saffron/35">
              <img
                src={recipe.image}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
              />
            </div>
            <div className="mt-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DietMark diet={recipe.diet} />
                <h3 className="truncate text-base font-bold tracking-tight">{recipe.name}</h3>
              </div>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                {best && <span className="text-tomato-ink">Best match · </span>}
                {have}/{total} in the pot · {recipe.time} min
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full origin-left rounded-full bg-basil transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ transform: `scaleX(${have / total})` }}
                />
              </div>
              <p className="mt-1.5 truncate text-[13px] text-ink-soft">
                {missing.length === 0 ? (
                  <span className="font-medium text-basil">You have everything.</span>
                ) : (
                  <>Still need {missing.join(', ')}</>
                )}
              </p>
            </div>
          </article>
        </div>
      </div>
    </li>
  )
}

/** Top three matches. Hero runs the Flip animation on [data-flip-id] when the pot changes. */
export default function MatchStrip({ matches, resultsId }) {
  const top = matches.slice(0, 3)
  const empty = Array.from({ length: 3 - top.length })

  return (
    <div className="mx-auto mt-8 w-full max-w-7xl lg:mt-4 2xl:max-w-[1600px]">
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-ink/15 pb-2">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]">Top matches</h2>
        <button
          type="button"
          onClick={() => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            document.getElementById(resultsId)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
          }}
          className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-tomato-ink underline-offset-4 hover:underline"
        >
          See all recipes
        </button>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {top.map((match, i) => (
          <MatchCard key={match.recipe.id} match={match} best={i === 0} />
        ))}
        {empty.map((_, i) => (
          <li
            key={`slot-${i}`}
            className="mt-2.5 flex min-h-24 items-center justify-center rounded-2xl border-2 border-dashed border-ink/20 p-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft max-md:[&:not(:first-child)]:hidden"
          >
            {top.length === 0 && i === 0 ? 'Drop an ingredient in the pot to start' : 'More matches appear as you add'}
          </li>
        ))}
      </ol>
    </div>
  )
}
