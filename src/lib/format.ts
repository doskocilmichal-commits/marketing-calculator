/**
 * Formatting helpers. Every one of them returns "—" for a value that is not a
 * finite number, so an empty form shows dashes instead of NaN.
 */

const czk = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
})

const number0 = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 })
const number1 = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 1 })

export const EMPTY = '—'

function guard(value: number): boolean {
  return Number.isFinite(value)
}

export function formatCurrency(value: number): string {
  return guard(value) ? czk.format(value) : EMPTY
}

export function formatNumber(value: number): string {
  return guard(value) ? number0.format(value) : EMPTY
}

/** 0.234 → "23,4 %" */
export function formatPercent(value: number): string {
  return guard(value) ? `${number1.format(value * 100)} %` : EMPTY
}

/** 3.33 → "3,33×" — for ROAS, where a multiple reads better than a percentage. */
export function formatRatio(value: number): string {
  return guard(value) ? `${number1.format(value)}×` : EMPTY
}
