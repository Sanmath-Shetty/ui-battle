// The Indian packaging convention: a dot inside a square, green for veg and red for non-veg.
export default function DietMark({ diet, className = '' }) {
  const color = diet === 'veg' ? 'border-veg text-veg' : 'border-nonveg text-nonveg'
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${color} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  )
}
