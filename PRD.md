# PRD: Marketing Decision Calculator

## Problem

Marketers evaluate the economics of their campaigns in complicated spreadsheets
that are slow to build and easy to get wrong. This app turns a handful of
marketing inputs into business outcomes — revenue, profit, ROI — in seconds, and
adds a short AI interpretation so the numbers actually support a decision.

## Target user

Marketers, sales people and consultants — primarily the author, with the option
to share the app with the team later. No login, no accounts.

## User stories

- As a marketer I want to enter budget, CPC, CTR, conversion rate, AOV and margin
  so that I immediately see clicks, conversions, revenue, ROAS, PNO and CPA.
- As a marketer I want to see the break-even CPA and my headroom against it so
  that I know whether a campaign is still profitable.
- As an SEO consultant I want to enter search volume and a current vs target
  position so that I can quantify the traffic, revenue and profit upside of
  ranking higher.
- As a consultant I want to add my monthly SEO investment so that I get the ROI
  of that investment, not just the upside.
- As a user I want a short plain-language interpretation under the results so
  that I can paste it into a report or a client e-mail.

## MVP scope

### In scope

1. **Performance calculator** — paid media economics from budget, CPC, CTR,
   conversion rate, AOV and margin.
2. **SEO Opportunity calculator** — traffic and revenue upside from a position
   change, with an optional monthly investment input that yields ROI.
3. **CTR-by-position model** — conservative defaults pre-filled from the target
   position, editable by hand per calculation.
4. **AI interpretation** — 2–3 sentences under each module's results, generated
   by Gemini, explaining what the numbers mean and what to do about them.
5. **Responsive UI** — mobile-first, works on a phone.

### Out of scope

- Saving and history of calculations
- Side-by-side comparison of two scenarios
- PDF export / sharing a result by link
- Charts and visualisations
- Industry preset templates
- Multiple currencies (CZK only for now)

## Data model

**The app stores nothing.** Inputs live in component state, results are derived,
and nothing is written to disk. There are therefore no collections.

`data/app.json` is still created (as `{}`) so the data layer exists the day
history is wanted — that backlog item would add a single `calculations`
collection and nothing else would change.

```
data/app.json
──────────────────────────────
 {}          ← empty, the app writes nothing
```

### Not user data: the CTR model

The CTR-by-position curve is a **constant in the code**
(`src/lib/ctr-model.ts`), not a stored collection. Values are deliberately
conservative — the classic 27 %-on-position-1 curves predate ads above the fold,
featured snippets and AI Overviews.

| Position | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| CTR | 13 % | 8 % | 5.5 % | 4 % | 3 % | 2.2 % | 1.8 % | 1.5 % | 1.2 % | 1.1 % |

The value is pre-filled from the chosen position and can be overridden per
calculation.

## Formulas

Because this is a calculator, the formulas — not a schema — are the contract.

### Performance calculator

| Output | Formula |
|---|---|
| Clicks | `budget / CPC` |
| Impressions | `clicks / CTR` |
| Conversions | `clicks × conversionRate` |
| Revenue | `conversions × AOV` |
| Gross profit | `revenue × margin` |
| ROAS | `revenue / budget` |
| PNO | `budget / revenue` (%) |
| CPA | `budget / conversions` |
| Break-even CPA | `AOV × margin` |
| Break-even ROAS | `1 / margin` |
| Headroom | `(breakEvenCPA − CPA) / breakEvenCPA` |
| Net profit | `grossProfit − budget` |
| ROI | `(grossProfit − budget) / budget` |

### SEO Opportunity calculator

| Output | Formula |
|---|---|
| Current traffic | `searchVolume × CTR(currentPosition)` |
| Potential traffic | `searchVolume × CTR(targetPosition)` |
| Traffic delta | `potentialTraffic − currentTraffic` |
| Conversions | `trafficDelta × conversionRate` |
| Revenue | `conversions × AOV` |
| Profit | `revenue × margin` |
| ROI | `(profit − investment) / investment` — only when investment is filled |

### Required inputs

`margin` is **required** in both modules. Break-even CPA, break-even ROAS,
headroom, profit and ROI all derive from it, and the AI interpretation leans on
them.

## Assumptions

These are stated so results can be read correctly — the app does not model them.

- **Performance:** whatever period the budget covers, all outputs are for that
  same period. The app is period-agnostic.
- **SEO:** search volume is monthly, so traffic, revenue and profit are monthly.
  The investment input is therefore also monthly.
- **SEO:** incremental traffic is assumed to convert at the same rate as current
  traffic. In reality it usually converts slightly worse, but modelling that
  would make the estimate harder to read than it is worth.
- **PNO and ROAS are the same thing inverted** (`PNO = 1 / ROAS`). Both are shown
  because both are in common use; one rising while the other falls is correct,
  not a bug.

## AI interpretation

After each calculation, 2–3 sentences in plain language. Target style:

> "At the current margin the campaign is profitable. Break-even CPA is 815 CZK,
> actual CPA is 620 CZK, so you have roughly 24 % headroom."

> "Moving from position 8 to position 3 represents roughly 520 additional visits
> per month and an estimated revenue increase of 42,000 CZK. In return-on-
> investment terms this is a worthwhile priority."

The API key lives in `.env.local` and is read server-side only. If the key is
missing the app still works — it just renders the numbers without the commentary.

## External services

- **Gemini API** (AI interpretation) — https://aistudio.google.com → Get API Key
  → store as `GEMINI_API_KEY` in `.env.local`

No database, no hosting account, no e-mail service.

## Initial data shape

```json
{}
```
