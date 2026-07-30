'use client'

import { useState } from 'react'
import { NumberField } from '@/components/NumberField'
import { ResultCard } from '@/components/ResultCard'
import { AiInterpretation } from '@/components/AiInterpretation'
import { calculatePerformance } from '@/lib/calc'
import { formatCurrency, formatNumber, formatPercent, formatRatio } from '@/lib/format'
import { interpretPerformance } from './actions'

/** Empty string → NaN, so a blank field shows "—" instead of behaving like zero. */
function num(value: string): number {
  return value.trim() === '' ? NaN : Number(value)
}

/** Percentages are entered as 5, stored as 0.05. */
function pct(value: string): number {
  return num(value) / 100
}

export default function PerformancePage() {
  const [budget, setBudget] = useState('50000')
  const [cpc, setCpc] = useState('12')
  const [ctr, setCtr] = useState('2')
  const [conversionRate, setConversionRate] = useState('1.5')
  const [aov, setAov] = useState('2500')
  const [margin, setMargin] = useState('35')

  const inputs = {
    budget: num(budget),
    cpc: num(cpc),
    ctr: pct(ctr),
    conversionRate: pct(conversionRate),
    aov: num(aov),
    margin: pct(margin),
  }

  const r = calculatePerformance(inputs)

  // Enough to say something meaningful — CTR only affects impressions, so it is
  // not part of the gate.
  const ready = [inputs.budget, inputs.cpc, inputs.conversionRate, inputs.aov, inputs.margin].every(
    (v) => Number.isFinite(v) && v > 0,
  )

  const profitable = Number.isFinite(r.netProfit) && r.netProfit > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Inputs</h2>
        <p className="mt-1 text-xs text-slate-500">
          Outputs cover whatever period your budget covers.
        </p>

        <div className="mt-4 space-y-4">
          <NumberField label="Budget" value={budget} onChange={setBudget} suffix="CZK" required min="0" />
          <NumberField label="CPC" value={cpc} onChange={setCpc} suffix="CZK" required min="0" />
          <NumberField
            label="CTR"
            value={ctr}
            onChange={setCtr}
            suffix="%"
            min="0"
            hint="Only used to estimate impressions."
          />
          <NumberField
            label="Conversion rate"
            value={conversionRate}
            onChange={setConversionRate}
            suffix="%"
            required
            min="0"
          />
          <NumberField label="Average order value" value={aov} onChange={setAov} suffix="CZK" required min="0" />
          <NumberField
            label="Margin"
            value={margin}
            onChange={setMargin}
            suffix="%"
            required
            min="0"
            max="100"
            hint="Break-even CPA, ROI and profit all depend on this."
          />
        </div>
      </section>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            Verdict
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard
              label="Net profit"
              value={formatCurrency(r.netProfit)}
              hint="Gross profit minus ad spend"
              tone={Number.isFinite(r.netProfit) ? (profitable ? 'good' : 'bad') : 'neutral'}
              primary
            />
            <ResultCard
              label="ROAS"
              value={formatRatio(r.roas)}
              hint={`Break-even ${formatRatio(r.breakEvenRoas)}`}
              tone={
                Number.isFinite(r.roas) && Number.isFinite(r.breakEvenRoas)
                  ? r.roas >= r.breakEvenRoas
                    ? 'good'
                    : 'bad'
                  : 'neutral'
              }
              primary
            />
            <ResultCard
              label="Headroom"
              value={formatPercent(r.headroom)}
              hint="Room left below break-even CPA"
              tone={Number.isFinite(r.headroom) ? (r.headroom > 0 ? 'good' : 'bad') : 'neutral'}
              primary
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            Breakdown
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResultCard label="Impressions" value={formatNumber(r.impressions)} />
            <ResultCard label="Clicks" value={formatNumber(r.clicks)} />
            <ResultCard label="Conversions" value={formatNumber(r.conversions)} />
            <ResultCard label="Revenue" value={formatCurrency(r.revenue)} />
            <ResultCard label="Gross profit" value={formatCurrency(r.grossProfit)} />
            <ResultCard label="ROI" value={formatPercent(r.roi)} />
            <ResultCard label="CPA" value={formatCurrency(r.cpa)} />
            <ResultCard label="Break-even CPA" value={formatCurrency(r.breakEvenCpa)} />
            <ResultCard label="PNO" value={formatPercent(r.pno)} hint="Cost as a share of revenue" />
          </div>
        </section>

        <AiInterpretation disabled={!ready} onRequest={() => interpretPerformance(inputs)} />
      </div>
    </div>
  )
}
