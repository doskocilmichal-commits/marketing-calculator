import 'server-only'

/**
 * Thin Gemini client. Server-side only — the API key must never reach the
 * browser, which is why this file imports `server-only`: if anything in a client
 * component ever imports it, the build fails instead of leaking the key.
 */

// gemini-2.5-flash is closed to new API keys, so this is the current stable
// small model. Verified against this project's key.
const MODEL = 'gemini-3.1-flash-lite'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export type AiResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'no-key' | 'failed' }

export async function interpret(prompt: string): Promise<AiResult> {
  const apiKey = process.env.GEMINI_API_KEY
  // A missing key is not an error. The calculators work without it — the user
  // just doesn't get the commentary.
  if (!apiKey) return { ok: false, reason: 'no-key' }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400,
          // Minimal thinking — this is a three-sentence summary, and deeper
          // reasoning would add seconds to something that should feel instant.
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
      // Never let a slow API hang the UI.
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) return { ok: false, reason: 'failed' }

    const data = await response.json()
    // Gemini 3 can return reasoning parts alongside the answer, so take the
    // first part that actually carries text rather than assuming index 0.
    const parts: Array<{ text?: string }> = data?.candidates?.[0]?.content?.parts ?? []
    const text = parts.find((part) => typeof part.text === 'string' && part.text.trim())?.text

    return text?.trim() ? { ok: true, text: text.trim() } : { ok: false, reason: 'failed' }
  } catch {
    return { ok: false, reason: 'failed' }
  }
}

/**
 * Shared framing so both modules sound like the same analyst.
 *
 * The instructions are in English (the model follows them more reliably that
 * way) but the output must be Czech — that is what the reader gets.
 */
export const SYSTEM_STYLE = `You are a senior performance marketing analyst.
Write 2-3 sentences of plain-language interpretation of the numbers below.

Rules:
- WRITE IN CZECH. The entire answer must be in Czech, no English words.
- Use standard Czech marketing terminology: ROAS, PNO, CPA, konverze, tržby,
  marže, návštěvnost. Do not translate the metric acronyms.
- State whether this is worth doing, and why, using the actual numbers.
- Quote specific figures — a reader should be able to check you.
- No bullet points, no headings, no markdown. Plain prose only.
- No greeting, no sign-off, no restating the inputs back.
- Amounts are in Czech koruna. Write them as "815 Kč".
- Be direct. If the numbers are bad, say so.

Example of the tone and length expected:
"Při současné marži je kampaň zisková. Break-even CPA je 875 Kč, aktuální CPA je
800 Kč, takže máte přibližně 9% rezervu — prostor pro škálování je ale úzký."`
