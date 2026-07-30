'use client'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  /** Shown inside the field on the right — "CZK", "%", "×" … */
  suffix?: string
  hint?: string
  placeholder?: string
  step?: string
  min?: string
  max?: string
  required?: boolean
  /** Shown in place of the hint when the value can't be used. */
  error?: string
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  hint,
  placeholder,
  step = 'any',
  min,
  max,
  required,
  error,
}: Props) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>

      <div className="relative mt-1.5">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 tabular-nums
                     shadow-sm outline-none transition
                     placeholder:text-slate-400
                     dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 ${
                       error
                         ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-700'
                         : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700'
                     }`}
          style={suffix ? { paddingRight: `${suffix.length * 0.65 + 1.5}rem` } : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  )
}
