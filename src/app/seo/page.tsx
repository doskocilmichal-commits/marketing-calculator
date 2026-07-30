'use client'

import { useState } from 'react'
import { NumberField } from '@/components/NumberField'
import { ResultCard } from '@/components/ResultCard'
import { AiInterpretation } from '@/components/AiInterpretation'
import { calculateSeo } from '@/lib/calc'
import { ctrForPosition, MAX_POSITION, MIN_POSITION } from '@/lib/ctr-model'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import { fieldError, parseAmount, parseRate } from '@/lib/inputs'
import { interpretSeo } from '../actions'

/** 0.055 → "5.5", so the model value lands in the field the way a person writes it. */
function ctrToField(position: number): string {
  return String(Number((ctrForPosition(position) * 100).toFixed(2)))
}

const POSITIONS = Array.from(
  { length: MAX_POSITION - MIN_POSITION + 1 },
  (_, i) => i + MIN_POSITION,
)

function PositionSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (position: number) => void
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        <span className="ml-1 text-rose-500">*</span>
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900
                   shadow-sm outline-none transition
                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                   dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {POSITIONS.map((p) => (
          <option key={p} value={p}>
            Position {p}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function SeoPage() {
  const [searchVolume, setSearchVolume] = useState('8000')
  const [currentPosition, setCurrentPosition] = useState(8)
  const [targetPosition, setTargetPosition] = useState(3)
  // Pre-filled from the position, but the user can overwrite it.
  const [currentCtr, setCurrentCtr] = useState(ctrToField(8))
  const [targetCtr, setTargetCtr] = useState(ctrToField(3))
  const [conversionRate, setConversionRate] = useState('1.5')
  const [aov, setAov] = useState('2500')
  const [margin, setMargin] = useState('35')
  const [investment, setInvestment] = useState('')

  // Picking a position resets its CTR to the model value — otherwise a hand-typed
  // number would silently stick to a position it no longer belongs to.
  function pickCurrentPosition(position: number) {
    setCurrentPosition(position)
    setCurrentCtr(ctrToField(position))
  }

  function pickTargetPosition(position: number) {
    setTargetPosition(position)
    setTargetCtr(ctrToField(position))
  }

  const inputs = {
    searchVolume: parseAmount(searchVolume),
    currentPosition,
    targetPosition,
    currentCtr: parseRate(currentCtr),
    targetCtr: parseRate(targetCtr),
    conversionRate: parseRate(conversionRate),
    aov: parseAmount(aov),
    margin: parseRate(margin),
    investment: investment.trim() === '' ? null : parseAmount(investment),
  }

  const errors = {
    searchVolume: fieldError(searchVolume, inputs.searchVolume, 'amount'),
    currentCtr: fieldError(currentCtr, inputs.currentCtr, 'rate'),
    targetCtr: fieldError(targetCtr, inputs.targetCtr, 'rate'),
    conversionRate: fieldError(conversionRate, inputs.conversionRate, 'rate'),
    aov: fieldError(aov, inputs.aov, 'amount'),
    margin: fieldError(margin, inputs.margin, 'rate'),
    investment: fieldError(investment, inputs.investment ?? NaN, 'amount'),
  }

  const r = calculateSeo(inputs)

  const ready =
    [inputs.searchVolume, inputs.currentCtr, inputs.targetCtr, inputs.conversionRate, inputs.aov, inputs.margin].every(
      (v) => Number.isFinite(v) && v > 0,
    ) && Number.isFinite(r.trafficDelta)

  const improving = Number.isFinite(r.trafficDelta) && r.trafficDelta > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Inputs</h2>
        <p className="mt-1 text-xs text-slate-500">Everything here is monthly.</p>

        <div className="mt-4 space-y-4">
          <NumberField
            label="Search volume"
            value={searchVolume}
            onChange={setSearchVolume}
            suffix="/ mo"
            required
            min="0"
            error={errors.searchVolume}
          />

          <div className="grid grid-cols-2 gap-3">
            <PositionSelect label="Current" value={currentPosition} onChange={pickCurrentPosition} />
            <PositionSelect label="Target" value={targetPosition} onChange={pickTargetPosition} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="CTR now"
              value={currentCtr}
              onChange={setCurrentCtr}
              suffix="%"
              min="0"
              max="100"
              error={errors.currentCtr}
            />
            <NumberField
              label="CTR target"
              value={targetCtr}
              onChange={setTargetCtr}
              suffix="%"
              min="0"
              max="100"
              error={errors.targetCtr}
            />
          </div>
          <p className="-mt-2 text-xs text-slate-500">
            Pre-filled from the position — conservative on purpose. Overwrite if you have your own data.
          </p>

          <NumberField
            label="Conversion rate"
            value={conversionRate}
            onChange={setConversionRate}
            suffix="%"
            required
            min="0"
            max="100"
            error={errors.conversionRate}
          />
          <NumberField
            label="Average order value"
            value={aov}
            onChange={setAov}
            suffix="CZK"
            required
            min="0"
            error={errors.aov}
          />
          <NumberField
            label="Margin"
            value={margin}
            onChange={setMargin}
            suffix="%"
            required
            min="0"
            max="100"
            error={errors.margin}
          />
          <NumberField
            label="Monthly SEO investment"
            value={investment}
            onChange={setInvestment}
            suffix="CZK"
            min="0"
            placeholder="optional"
            hint="Fill this in and you get ROI."
            error={errors.investment}
          />
        </div>
      </section>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            The opportunity
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard
              label="Additional traffic"
              value={formatNumber(r.trafficDelta)}
              hint={`Position ${currentPosition} → ${targetPosition}, per month`}
              tone={Number.isFinite(r.trafficDelta) ? (improving ? 'good' : 'bad') : 'neutral'}
              primary
            />
            <ResultCard
              label="Additional revenue"
              value={formatCurrency(r.revenue)}
              hint="Per month"
              tone={Number.isFinite(r.revenue) ? (r.revenue > 0 ? 'good' : 'bad') : 'neutral'}
              primary
            />
            <ResultCard
              label="ROI"
              value={r.roi === null ? '—' : formatPercent(r.roi)}
              hint={r.roi === null ? 'Enter an investment' : 'On your monthly investment'}
              tone={r.roi === null || !Number.isFinite(r.roi) ? 'neutral' : r.roi > 0 ? 'good' : 'bad'}
              primary
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            Breakdown
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResultCard
              label="Current traffic"
              value={formatNumber(r.currentTraffic)}
              hint={`Position ${currentPosition}`}
            />
            <ResultCard
              label="Potential traffic"
              value={formatNumber(r.potentialTraffic)}
              hint={`Position ${targetPosition}`}
            />
            <ResultCard label="Additional conversions" value={formatNumber(r.conversions)} />
            <ResultCard label="Additional profit" value={formatCurrency(r.profit)} hint="Revenue × margin" />
          </div>
        </section>

        <AiInterpretation disabled={!ready} onRequest={() => interpretSeo(inputs)} />
      </div>
    </div>
  )
}
