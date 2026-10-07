<div align="center">

<img src="docs/banner.svg" alt="APEX: a number, and the receipts." width="100%">

# APEX

### A number, and the receipts.

**AI vehicle analyzer for people who buy, sell, and flip cars.**
Scan a VIN. Get a valuation grounded in listings it actually found, today, with the links to prove it.

[**Launch APEX →**](https://johnlaz.github.io/apex/app/) · [Landing page](https://johnlaz.github.io/apex/) · Installable PWA · No account · No backend · Your key never leaves your device

</div>

---

## Why APEX

Most "AI car value" tools hand you a confident number from a model that has never seen a listing. APEX is built the other way around: **evidence first, AI second.**

Every report carries a banner that tells you exactly how much to trust it:

<img src="docs/trust-levels.svg" alt="The four report banners: LIVE-SOURCED, PARTIAL, ESTIMATE ONLY, LEGACY SNAPSHOT" width="100%">

| Banner | Meaning |
|---|---|
| **LIVE-SOURCED** | At least 2 comparable listings were found, and each price was verified against the retrieved page text. |
| **PARTIAL** | Research ran, but fewer than 2 comps survived verification. Treat the range as softer. |
| **ESTIMATE ONLY** | Live research failed (rate limit, no results). The number is the AI's general knowledge, labeled as such. |
| **LEGACY SNAPSHOT** | A report saved by an older version. Shown with its age, never presented as current. |

Reports 3+ days old get an age warning. Dates come from your device clock, not from when the app was written.

## Features

- **Live-sourced comps + Evidence tab.** Real asking prices with links to the listings they came from.
- **Provenance banner.** Always shows the basis, the as-of date, and source chips.
- **NHTSA recalls.** Pulled from the official NHTSA API (model-level).
- **VIN barcode scan and decode.**
- **Photo ID.** Snap a car and identify it with a vision model.
- **Garage.** Track ROI, maintenance, and export CSV.
- **Compare.** Side-by-side vehicles.
- **Print-ready reports.**
- **Dealer Forms.** Curated form reference by state.
- **5 themes.**
- **Offline PWA.** Installs to your home screen; the shell works offline.
- **Auto-updating Groq models.** Paste your key and APEX pulls the newest chat models available to you, with a picker in Settings. Your saved choice is never swapped silently: if it drops off Groq's list it is kept and flagged. Only if Groq explicitly rejects a model as retired does APEX switch, and it tells you.
- **Resilient re-analysis.** If the AI returns an unreadable answer, APEX retries automatically, and the last attempt leaves out the trim (the report says so). **Edit & Re-run** brings you back to the form with every field filled in.
- **Local-only key.** Stored in your browser's localStorage and sent only to Groq.

## How it works

```mermaid
flowchart LR
    A[Vehicle: VIN / year / make / model] --> B{Parallel research}
    B --> C[gpt-oss + Groq browser_search<br/>live listings]
    B --> D[NHTSA recalls API]
    B --> E[Logo lookup]
    C --> F[Evidence block<br/>treated as untrusted]
    D --> F
    F --> G[Your selected Groq model<br/>JSON report, no tools]
    G --> H[Validation]
    H --> H1[Keep a comp only if its price appears<br/>in retrieved text and host was visited]
    H --> H2[Re-anchor prices if AI drifts >30%<br/>from verified comp median]
    H --> H3[Sanitize strings, clamp values]
    H1 --> I[Report + provenance banner]
    H2 --> I
    H3 --> I
```

## What's real, what's AI, what you'll never see

| Real (retrieved or computed) | AI knowledge (labeled) | Never shown |
|---|---|---|
| Comparable listings and prices that passed verification | General vehicle context, narrative, ownership notes | Fabricated KBB / Edmunds / Manheim / NADA values |
| NHTSA recall records | Estimate-only price ranges (flagged ESTIMATE ONLY) | Invented days-on-market or inventory counts |
| Dealer margin (computed from retail minus trade-in) | Photo identification | Made-up regional saturation stats |
| Report date and age (device clock) | Dealer form link suggestions (flagged unverified) | Anything stamped with the year the app was built |

When APEX can't measure something, it says **"No data"** instead of guessing.

## Quick start

1. Open **https://johnlaz.github.io/apex/app/** and install it to your home screen if you like.
2. Get a free API key at [console.groq.com](https://console.groq.com).
3. Open Settings, paste the key, and save. APEX loads your available models automatically.
4. Enter a VIN or year/make/model and run the analysis.

## Good to know

- **Rate limits.** Live research uses Groq's browser search on gpt-oss models. If your tier's limits are hit, APEX falls back to ESTIMATE ONLY and says so.
- **Listings are asking prices**, not sold prices. Use them as market signal, not appraisal.
- **Recalls are model-level**, not VIN-specific. Confirm a VIN at nhtsa.gov/recalls.
- **Privacy.** No accounts, no analytics, no server. Data lives in your browser. Backups you export include your API key, so keep them private.
- **Not financial advice.** APEX is a research aid. Inspect the car, verify the title, check the listings yourself.

## AI and model setup

- **Provider:** Groq only, bring your own key (free at [console.groq.com](https://console.groq.com)).
- **Text/analysis model:** whichever you pick in Settings. The list is fetched from Groq when you save your key and whenever you tap Refresh (and silently after 3 days).
- **Live research:** needs a GPT-OSS model, the only family with built-in `browser_search`. APEX uses the best GPT-OSS your key offers, even if you chose another model for analysis.
- **Photo ID:** uses a fixed vision model that isn't user-selectable.

## Repo layout

```
/index.html          landing page (plain page, not installable)
/README.md
/docs/               README visuals (SVG)
/app/index.html      the app: single file, no build step
/app/manifest.json   PWA manifest (scope /apex/app/)
/app/sw.js           service worker (cache name = apex-v + version)
/app/icon-192.png    icons (192 + 512 only)
/app/icon-512.png
/app/shot-*.png      install screenshots (add your own captures)
```

## Deploy and update

Hosted on GitHub Pages at `johnlaz.github.io/apex`. To release a change: edit `app/index.html`, then bump the version in **both** `APP_VERSION` (in `app/index.html`) and `CACHE_VERSION` (in `app/sw.js`) so installed copies pick up the new cache. Open apps show a "new version ready, Reload" toast.

## Tech

Single-file HTML PWA. Vanilla JS, no framework, no build step, no backend. Service worker for offline use. Groq API (bring your own key) and the NHTSA public API.

## Changelog

### v2.7.0
- Re-analysis reliability: free-text fields (trim, notes) are sanitized before they reach the prompt, Groq's strict-JSON rejection now falls back to plain parsing, and up to three attempts run automatically (the last without trim). Clear error messages with Try again / Try without trim.
- **Edit & Re-run** button on every report.
- Flatter repo, 192/512 icons only, manifest and service worker fixed; app file cut from ~960 KB to ~225 KB.
- One version constant drives the UI stamp and the cache name; update toast added.
- Backups no longer include your Groq key unless you opt in.
- Saved model is flagged, not swapped, when it leaves Groq's list.
- Mobile polish: compact header, form above the fold, safe-area support, bigger tap targets, 16px inputs (no iOS zoom), accessibility labels, reduced-motion support.
- New honest landing page.

### v2.6
- Retired Groq models replaced; model list now auto-refreshes with a user picker.
- Evidence-first valuation: verified comps, provenance banner, Evidence tab.
- Removed the fabricated KBB/Edmunds/MMR/NADA source table and invented market stats.
- Real NHTSA recall data.
- All dates driven by your device clock; no hardcoded year.
- Sanitized AI output; form links restricted to https on the same host or .gov.

## Ideas, not promises

- Optional licensed data feed for sold-price and days-on-market stats
- VIN-level recall lookup
- Saved-search price alerts
- Price history per Garage vehicle

---

<div align="center">

**Built by LAZLAB Creations**

</div>
