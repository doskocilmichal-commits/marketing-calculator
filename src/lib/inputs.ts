/**
 * Parsing user input, in one place for both calculators.
 *
 * The rule everywhere: anything unusable becomes NaN, and NaN renders as "—".
 * We deliberately do NOT clamp out-of-range values — silently turning a typed
 * 300 % into 100 % would show the user one number and calculate with another.
 * Better to refuse and say why.
 */

export const MAX_PERCENT = 100

/** Money or a count. Empty, negative or non-numeric → NaN. */
export function parseAmount(raw: string): number {
  if (raw.trim() === '') return NaN
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : NaN
}

/** A percentage field: "5" → 0.05. Outside 0–100 → NaN. */
export function parseRate(raw: string): number {
  if (raw.trim() === '') return NaN
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 && value <= MAX_PERCENT
    ? value / MAX_PERCENT
    : NaN
}

/**
 * Message for a field the user filled in that didn't parse. An empty field is
 * not an error — it just hasn't been filled in yet.
 */
export function fieldError(raw: string, parsed: number, kind: 'amount' | 'rate'): string | undefined {
  if (raw.trim() === '' || Number.isFinite(parsed)) return undefined
  return kind === 'rate'
    ? `Enter a percentage between 0 and ${MAX_PERCENT}.`
    : 'Enter a number of 0 or more.'
}
