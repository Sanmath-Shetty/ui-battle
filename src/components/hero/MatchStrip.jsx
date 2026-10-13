import { CARD_HAIRLINE, WashiTape, indexCardLook } from '../IndexCard.jsx'

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

/** A recipe index card: uneven cut edges, a strip of washi tape, a slight tilt that straightens on hover. */
function MatchCard({ match, best, onOpen }) {
  const { recipe, have, total, missing } = match
  const { clipPath: edge, tilt } = indexCardLook(recipe.id, 1.5)

  return (
    <li data-flip-id={recipe.id} className="group min-w-0 pt-2.5">
      <div
        className="relative h-full rotate-(--tilt) transition-[rotate,translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1 group-hover:rotate-0"
        style={{ '--tilt': tilt }}
      >
        <WashiTape />
        <div data-tilt className={`h-full ${CARD_HAIRLINE}`}>
          <article
            className="relative flex h-full items-center gap-3 bg-paper-2 p-2 pr-4"
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
                <h3 className="truncate text-base font-bold tracking-tight">
                  {/* The whole card is the hit area; the title stays the accessible name. */}
                  <button
                    type="button"
                    onClick={() => onOpen?.(recipe)}
                    className="block w-full truncate text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-tomato-ink"
                  >
                    {recipe.name}
                  </button>
                </h3>
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
export default function MatchStrip({ matches, resultsId, onOpenRecipe }) {
  const top = matches.slice(0, 3)
  const empty = Array.from({ length: 3 - top.length })

  return (
    <div className="mx-auto mt-4 w-full max-w-7xl md:mt-8 lg:mt-4 2xl:max-w-[1600px]">
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-ink/15 pb-2">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]">Top matches</h2>
        <button
          type="button"
          onClick={() => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            document.getElementById(resultsId)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
          }}
          className="-my-3 inline-flex h-11 items-center font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-tomato-ink underline-offset-4 hover:underline"
        >
          See all recipes
        </button>
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {top.map((match, i) => (
          <MatchCard key={match.recipe.id} match={match} best={i === 0} onOpen={onOpenRecipe} />
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
