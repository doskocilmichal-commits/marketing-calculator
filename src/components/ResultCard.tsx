type Tone = 'neutral' | 'good' | 'bad'

type Props = {
  label: string
  value: string
  hint?: string
  tone?: Tone
  /** Renders larger — for the two or three numbers that actually matter. */
  primary?: boolean
}

const TONE: Record<Tone, string> = {
  neutral: 'text-slate-900 dark:text-slate-100',
  good: 'text-emerald-600 dark:text-emerald-400',
  bad: 'text-rose-600 dark:text-rose-400',
}

export function ResultCard({ label, value, hint, tone = 'neutral', primary }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        primary
          ? 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={`mt-1 font-semibold tabular-nums ${primary ? 'text-2xl' : 'text-lg'} ${TONE[tone]}`}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  )
}
