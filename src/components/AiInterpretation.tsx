'use client'

import { useState, useTransition } from 'react'
import type { AiResult } from '@/lib/ai'

type Props = {
  /** Server action bound to the current inputs by the parent. */
  onRequest: () => Promise<AiResult>
  /** Disabled until the form has enough numbers to say anything sensible. */
  disabled: boolean
}

export function AiInterpretation({ onRequest, disabled }: Props) {
  const [result, setResult] = useState<AiResult | null>(null)
  const [pending, startTransition] = useTransition()

  function run() {
    startTransition(async () => {
      setResult(await onRequest())
    })
  }

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
          AI interpretation
        </h3>
        <button
          type="button"
          onClick={run}
          disabled={disabled || pending}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition
                     hover:bg-indigo-500
                     disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
        >
          {pending ? 'Thinking…' : result ? 'Regenerate' : 'Explain these numbers'}
        </button>
      </div>

      {disabled && (
        <p className="mt-2 text-sm text-slate-500">
          Fill in the required fields and the interpretation unlocks.
        </p>
      )}

      {pending && !result && (
        <p className="mt-3 text-sm text-slate-500">Reading your numbers…</p>
      )}

      {result?.ok && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          {result.text}
        </p>
      )}

      {result && !result.ok && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
          {result.reason === 'no-key'
            ? 'No GEMINI_API_KEY found in .env.local — the numbers above are still correct, there is just no commentary.'
            : result.reason === 'invalid-input'
              ? 'Some inputs are missing or out of range. Fix the fields marked in red and try again.'
              : 'The AI call failed. The numbers above are unaffected — try again.'}
        </p>
      )}
    </section>
  )
}
