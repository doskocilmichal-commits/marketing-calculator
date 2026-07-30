import { describe, it, expect } from 'vitest'
import { calculatePerformance, calculateSeo } from '@/lib/calc'

/**
 * The formulas are the product. Every expected number below was worked out by
 * hand from the PRD, not copied from a previous run — otherwise a test only
 * proves the code still does whatever it did last time.
 */

describe('calculatePerformance', () => {
  // Budget 50 000, CPC 12, CTR 2 %, CVR 1.5 %, AOV 2 500, margin 35 %.
  const inputs = {
    budget: 50_000,
    cpc: 12,
    ctr: 0.02,
    conversionRate: 0.015,
    aov: 2_500,
    margin: 0.35,
  }

  it('derives clicks, conversions and revenue from the budget', () => {
    const r = calculatePerformance(inputs)

    expect(r.clicks).toBeCloseTo(4166.67, 1) // 50 000 / 12
    expect(r.impressions).toBeCloseTo(208_333.33, 1) // clicks / 0.02
    expect(r.conversions).toBeCloseTo(62.5, 4) // clicks × 0.015
    expect(r.revenue).toBeCloseTo(156_250, 4) // 62.5 × 2 500
  })

  it('reports profitability against break-even', () => {
    const r = calculatePerformance(inputs)

    expect(r.breakEvenCpa).toBeCloseTo(875, 4) // 2 500 × 0.35
    expect(r.cpa).toBeCloseTo(800, 4) // 50 000 / 62.5
    expect(r.headroom).toBeCloseTo(0.0857, 4) // (875 − 800) / 875
    expect(r.netProfit).toBeCloseTo(4_687.5, 4) // 54 687.5 − 50 000
    expect(r.roas).toBeCloseTo(3.125, 4)
    expect(r.breakEvenRoas).toBeCloseTo(2.857, 3) // 1 / 0.35
  })

  it('flags a loss when CPA sits above break-even', () => {
    // Same campaign, but the margin no longer covers the cost per conversion.
    const r = calculatePerformance({ ...inputs, margin: 0.2 })

    expect(r.breakEvenCpa).toBeCloseTo(500, 4) // below the 800 CZK CPA
    expect(r.headroom).toBeLessThan(0)
    expect(r.netProfit).toBeLessThan(0)
    expect(r.roas).toBeLessThan(r.breakEvenRoas)
  })

  it('returns NaN instead of Infinity when a divisor is missing', () => {
    // An empty form must render "—", never "Infinity" or "NaN CZK".
    const r = calculatePerformance({ ...inputs, budget: 0, cpc: 0 })

    expect(r.clicks).toBeNaN()
    expect(r.cpa).toBeNaN()
    expect(r.roas).toBeNaN()
    expect(Number.isFinite(r.clicks)).toBe(false)
  })
})

describe('calculateSeo', () => {
  // 8 000 searches, position 8 (1.5 %) → position 3 (5.5 %), CVR 1.5 %,
  // AOV 2 500, margin 35 %.
  const inputs = {
    searchVolume: 8_000,
    currentPosition: 8,
    targetPosition: 3,
    currentCtr: 0.015,
    targetCtr: 0.055,
    conversionRate: 0.015,
    aov: 2_500,
    margin: 0.35,
    investment: null,
  }

  it('turns a position change into traffic, revenue and profit', () => {
    const r = calculateSeo(inputs)

    expect(r.currentTraffic).toBeCloseTo(120, 4) // 8 000 × 0.015
    expect(r.potentialTraffic).toBeCloseTo(440, 4) // 8 000 × 0.055
    expect(r.trafficDelta).toBeCloseTo(320, 4)
    expect(r.conversions).toBeCloseTo(4.8, 4) // 320 × 0.015
    expect(r.revenue).toBeCloseTo(12_000, 4) // 4.8 × 2 500
    expect(r.profit).toBeCloseTo(4_200, 4) // 12 000 × 0.35
  })

  it('only reports ROI once an investment is given', () => {
    expect(calculateSeo(inputs).roi).toBeNull()

    // 4 200 profit on a 30 000 spend is a loss: (4 200 − 30 000) / 30 000.
    expect(calculateSeo({ ...inputs, investment: 30_000 }).roi).toBeCloseTo(-0.86, 4)
    // 4 200 profit on 2 000 more than doubles the money back.
    expect(calculateSeo({ ...inputs, investment: 2_000 }).roi).toBeCloseTo(1.1, 4)
  })

  it('goes negative when the target position is worse than the current one', () => {
    // Dropping from 3 to 8 is a loss of traffic, and the numbers should say so
    // rather than quietly reporting an upside.
    const r = calculateSeo({ ...inputs, currentCtr: 0.055, targetCtr: 0.015 })

    expect(r.trafficDelta).toBeCloseTo(-320, 4)
    expect(r.revenue).toBeLessThan(0)
  })
})
