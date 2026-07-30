import { MAX_POSITION, MIN_POSITION } from './ctr-model'
import type { PerformanceInputs, SeoInputs } from './calc'

/**
 * Server-side input validation.
 *
 * TypeScript types are erased at runtime, so a server action receives whatever
 * the caller chose to send — the `<select>` in the UI is not a guarantee. Every
 * value is re-derived here before it reaches a prompt or a formula. Anything
 * that fails returns null, and the action refuses to run.
 */

/** A finite, non-negative number, or null. */
function amount(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/** A rate as a fraction: must be between 0 and 1 inclusive. */
function rate(value: unknown): number | null {
  const parsed = amount(value)
  return parsed !== null && parsed <= 1 ? parsed : null
}

/**
 * A SERP position. A number outside 1–10 is clamped — the CTR model clamps too,
 * so that is consistent. Something that isn't a number at all is refused: the UI
 * sends these from a <select>, so garbage here means the caller is not the UI,
 * and quietly substituting a position would put a figure in the prompt that
 * nobody asked for.
 */
function position(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.min(MAX_POSITION, Math.max(MIN_POSITION, Math.round(parsed)))
}

export function sanitizePerformance(input: unknown): PerformanceInputs | null {
  if (typeof input !== 'object' || input === null) return null
  const raw = input as Record<string, unknown>

  const budget = amount(raw.budget)
  const cpc = amount(raw.cpc)
  const ctr = rate(raw.ctr)
  const conversionRate = rate(raw.conversionRate)
  const aov = amount(raw.aov)
  const margin = rate(raw.margin)

  // CTR only feeds the impressions estimate, so it may be missing. The rest
  // must be present and positive or there is nothing to interpret.
  if (budget === null || cpc === null || conversionRate === null || aov === null || margin === null) {
    return null
  }
  if (budget <= 0 || cpc <= 0 || conversionRate <= 0 || aov <= 0 || margin <= 0) return null

  return { budget, cpc, ctr: ctr ?? NaN, conversionRate, aov, margin }
}

export function sanitizeSeo(input: unknown): SeoInputs | null {
  if (typeof input !== 'object' || input === null) return null
  const raw = input as Record<string, unknown>

  const searchVolume = amount(raw.searchVolume)
  const currentCtr = rate(raw.currentCtr)
  const targetCtr = rate(raw.targetCtr)
  const conversionRate = rate(raw.conversionRate)
  const aov = amount(raw.aov)
  const margin = rate(raw.margin)
  const currentPosition = position(raw.currentPosition)
  const targetPosition = position(raw.targetPosition)

  if (
    searchVolume === null ||
    currentCtr === null ||
    targetCtr === null ||
    conversionRate === null ||
    aov === null ||
    margin === null ||
    currentPosition === null ||
    targetPosition === null
  ) {
    return null
  }
  if (searchVolume <= 0 || conversionRate <= 0 || aov <= 0 || margin <= 0) return null

  // Optional — absent is fine, present but broken is not.
  const investmentRaw = raw.investment
  let investment: number | null = null
  if (investmentRaw !== null && investmentRaw !== undefined && investmentRaw !== '') {
    investment = amount(investmentRaw)
    if (investment === null) return null
  }

  return {
    searchVolume,
    currentPosition,
    targetPosition,
    currentCtr,
    targetCtr,
    conversionRate,
    aov,
    margin,
    investment,
  }
}
