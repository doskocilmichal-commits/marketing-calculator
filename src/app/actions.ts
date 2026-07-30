'use server'

import { interpret, SYSTEM_STYLE, type AiResult } from '@/lib/ai'
import { calculatePerformance, calculateSeo, type PerformanceInputs, type SeoInputs } from '@/lib/calc'
import { formatCurrency, formatNumber, formatPercent, formatRatio } from '@/lib/format'

/**
 * The results are recomputed here rather than trusted from the client — the
 * client sends inputs only, so the AI can never be handed numbers that don't
 * match the formulas.
 */

export async function interpretPerformance(input: PerformanceInputs): Promise<AiResult> {
  const r = calculatePerformance(input)

  const prompt = `${SYSTEM_STYLE}

Context: a paid media campaign.

Inputs:
- Budget: ${formatCurrency(input.budget)}
- CPC: ${formatCurrency(input.cpc)}
- CTR: ${formatPercent(input.ctr)}
- Conversion rate: ${formatPercent(input.conversionRate)}
- Average order value: ${formatCurrency(input.aov)}
- Margin: ${formatPercent(input.margin)}

Results:
- Clicks: ${formatNumber(r.clicks)}
- Conversions: ${formatNumber(r.conversions)}
- Revenue: ${formatCurrency(r.revenue)}
- Gross profit: ${formatCurrency(r.grossProfit)}
- Net profit after ad spend: ${formatCurrency(r.netProfit)}
- ROAS: ${formatRatio(r.roas)} (break-even ROAS: ${formatRatio(r.breakEvenRoas)})
- PNO: ${formatPercent(r.pno)}
- CPA: ${formatCurrency(r.cpa)} (break-even CPA: ${formatCurrency(r.breakEvenCpa)})
- Headroom against break-even CPA: ${formatPercent(r.headroom)}
- ROI: ${formatPercent(r.roi)}

Lead with whether the campaign is profitable, then the headroom against
break-even CPA, then what to do about it.`

  return interpret(prompt)
}

export async function interpretSeo(input: SeoInputs): Promise<AiResult> {
  const r = calculateSeo(input)

  const investmentLine =
    input.investment && input.investment > 0
      ? `- Monthly SEO investment: ${formatCurrency(input.investment)}
- ROI on that investment: ${formatPercent(r.roi ?? NaN)}`
      : '- No investment figure was entered, so do not comment on ROI.'

  const prompt = `${SYSTEM_STYLE}

Context: an SEO ranking opportunity. All figures are monthly.

Inputs:
- Search volume: ${formatNumber(input.searchVolume)} / month
- Current position: ${input.currentPosition} (CTR ${formatPercent(input.currentCtr)})
- Target position: ${input.targetPosition} (CTR ${formatPercent(input.targetCtr)})
- Conversion rate: ${formatPercent(input.conversionRate)}
- Average order value: ${formatCurrency(input.aov)}
- Margin: ${formatPercent(input.margin)}

Results:
- Current traffic: ${formatNumber(r.currentTraffic)} visits / month
- Potential traffic: ${formatNumber(r.potentialTraffic)} visits / month
- Additional traffic: ${formatNumber(r.trafficDelta)} visits / month
- Additional conversions: ${formatNumber(r.conversions)} / month
- Additional revenue: ${formatCurrency(r.revenue)} / month
- Additional profit: ${formatCurrency(r.profit)} / month
${investmentLine}

Lead with the traffic and revenue upside of the move, then say whether it is
worth prioritising.`

  return interpret(prompt)
}
