/**
 * Organic CTR by SERP position.
 *
 * Deliberately conservative. The classic curves (27 % on position 1) predate ads
 * above the fold, featured snippets and AI Overviews — using them makes every
 * SEO estimate look twice as good as it is.
 *
 * Pre-filled from the chosen position, but the user can override it per
 * calculation.
 */
export const CTR_BY_POSITION: Record<number, number> = {
  1: 0.13,
  2: 0.08,
  3: 0.055,
  4: 0.04,
  5: 0.03,
  6: 0.022,
  7: 0.018,
  8: 0.015,
  9: 0.012,
  10: 0.011,
}

export const MIN_POSITION = 1
export const MAX_POSITION = 10

/** CTR for a position, as a fraction (0.13 = 13 %). */
export function ctrForPosition(position: number): number {
  const clamped = Math.min(MAX_POSITION, Math.max(MIN_POSITION, Math.round(position)))
  return CTR_BY_POSITION[clamped]
}
