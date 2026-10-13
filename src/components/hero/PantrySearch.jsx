import { useState } from 'react'

/** Typing fallback for the pot. Any ingredient name works, the stickers are just suggestions. */
export default function PantrySearch({ ref, selected, suggestions, onAdd }) {
  const [query, setQuery] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const name = query.trim().toLowerCase()
        if (name && !selected.includes(name)) onAdd(name)
        setQuery('')
      }}
      className="flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-paper-2 py-1.5 pl-5 pr-1.5 shadow-[3px_3px_0_#1C1915] transition-transform duration-300 focus-within:-translate-y-0.5"
    >
      <label htmlFor="pantry-search" className="sr-only">Type an ingredient to add it to the pot</label>
      <input
        ref={ref}
        id="pantry-search"
        list="pantry-suggestions"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Or type one: tomato, rice..."
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-soft/70 focus:outline-none"
      />
      <datalist id="pantry-suggestions">
        {suggestions.filter((s) => !selected.includes(s)).map((s) => <option key={s} value={s} />)}
      </datalist>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-full bg-ink px-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-300 hover:bg-tomato active:scale-[0.98]"
      >
        Add
      </button>
    </form>
  )
}
