const UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60 }

function wordToNumber(word) {
  const w = word.toLowerCase()
  if (/^\d+$/.test(w)) return Number(w)
  if (w === 'a' || w === 'an') return 1
  if (UNITS.includes(w)) return UNITS.indexOf(w)
  if (w in TENS) return TENS[w]
  const [tens, unit] = w.split('-')
  if (tens in TENS && UNITS.includes(unit)) return TENS[tens] + UNITS.indexOf(unit)
  return null
}

const DURATION = /\b(\d+|an?|[a-z]+(?:-[a-z]+)?)(?:\s+more)?\s+(minutes?|mins?|seconds?|secs?)\b/gi

/**
 * First cooking duration mentioned in a step, in seconds, or null.
 * Handles "5 min", "ten minutes", "twenty-five minutes", "a minute", "one more minute", "thirty seconds".
 */
export function parseDuration(text) {
  for (const match of text.matchAll(DURATION)) {
    const amount = wordToNumber(match[1])
    if (!amount) continue
    const seconds = /^sec/i.test(match[2]) ? amount : amount * 60
    if (seconds > 0 && seconds <= 3 * 3600) return seconds
  }
  return null
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
