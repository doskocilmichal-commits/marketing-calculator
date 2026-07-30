/**
 * All the maths, as pure functions. No React, no I/O — so it stays easy to read
 * and easy to test.
 *
 * Rates (CTR, conversion rate, margin) are fractions everywhere: 0.02 = 2 %.
 * The UI takes percentages from the user and converts on the way in.
 */

export type PerformanceInputs = {
  budget: number
  cpc: number
  ctr: number
  conversionRate: number
  aov: number
  margin: number
}

export type PerformanceResults = {
  clicks: number
  impressions: number
  conversions: number
  revenue: number
  grossProfit: number
  roas: number
  pno: number
  cpa: number
  breakEvenCpa: number
  breakEvenRoas: number
  headroom: number
  netProfit: number
  roi: number
}

export type SeoInputs = {
  searchVolume: number
  currentPosition: number
  targetPosition: number
  currentCtr: number
  targetCtr: number
  conversionRate: number
  aov: number
  margin: number
  /** Monthly SEO investment. Optional — ROI is only shown when it is filled. */
  investment: number | null
}

export type SeoResults = {
  currentTraffic: number
  potentialTraffic: number
  trafficDelta: number
  conversions: number
  revenue: number
  profit: number
  /** null when no investment was entered. */
  roi: number | null
}

/**
 * Guards every division. An empty or zero input should show "—", not Infinity
 * or NaN — those leak into the UI and look like a broken app.
 */
function divide(a: number, b: number): number {
  return b === 0 ? NaN : a / b
}

export function calculatePerformance(input: PerformanceInputs): PerformanceResults {
  const { budget, cpc, ctr, conversionRate, aov, margin } = input

  const clicks = divide(budget, cpc)
  const impressions = divide(clicks, ctr)
  const conversions = clicks * conversionRate
  const revenue = conversions * aov
  const grossProfit = revenue * margin

  const breakEvenCpa = aov * margin
  const cpa = divide(budget, conversions)
  const netProfit = grossProfit - budget

  return {
    clicks,
    impressions,
    conversions,
    revenue,
    grossProfit,
    roas: divide(revenue, budget),
    pno: divide(budget, revenue),
    cpa,
    breakEvenCpa,
    breakEvenRoas: divide(1, margin),
    // How much room is left before the campaign stops paying for itself.
    headroom: divide(breakEvenCpa - cpa, breakEvenCpa),
    netProfit,
    roi: divide(netProfit, budget),
  }
}

export function calculateSeo(input: SeoInputs): SeoResults {
  const { searchVolume, currentCtr, targetCtr, conversionRate, aov, margin, investment } = input

  const currentTraffic = searchVolume * currentCtr
  const potentialTraffic = searchVolume * targetCtr
  // Can go negative if the "target" position is worse than the current one.
  const trafficDelta = potentialTraffic - currentTraffic

  const conversions = trafficDelta * conversionRate
  const revenue = conversions * aov
  const profit = revenue * margin

  return {
    currentTraffic,
    potentialTraffic,
    trafficDelta,
    conversions,
    revenue,
    profit,
    roi: investment && investment > 0 ? (profit - investment) / investment : null,
  }
}
