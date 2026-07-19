# Handoff: Leading Groups — Vision feature shipped, aesthetic pass next

**For Cursor:** read this file first. The screenshot-reading feature described below is done and live — don't rebuild it. The next job is aesthetic/UI polish on `public/leading-groups.html` (see "Next job" at the bottom); confirm specifics with the user before making visual changes.

## Project

- **Repo:** TradeState.io (Svelte + Vite frontend, Supabase auth/Google, static pages in `public/`)
- **Feature:** Leading Groups — paste Deepvue Industry Ranks + Theme Tracker screenshots, Claude reads them, scores two boards, tags LEADING / REEMERGING / HEATING UP
- **Page:** [`public/leading-groups.html`](public/leading-groups.html) — live at `https://tradestate.io/leading-groups.html`, local dev at `http://localhost:3000/leading-groups.html` (`npm run dev`)
- **Nav:** Header / Dashboard card / Login page all link to `/leading-groups.html`

## What shipped (Claude Code session, 2026-07-18)

| Piece | Path | Status |
|-------|------|--------|
| Scoring (locked) | [`public/js/leading-groups-score.js`](public/js/leading-groups-score.js) | Live. **Do not change the formula without user approval.** Was untouched this session — only newly *published* to git (it had never been committed before, which silently broke the live page until fixed). |
| Vision Edge Function | [`supabase/functions/leading-groups-vision/index.ts`](supabase/functions/leading-groups-vision/index.ts) | Deployed to the real Supabase project via the **web dashboard** (not CLI — user prefers avoiding the Supabase CLI). Calls `claude-opus-4-8` server-side; `ANTHROPIC_API_KEY` lives only in Supabase secrets, never in client code. |
| Frontend caller | [`public/js/leading-groups-ocr.js`](public/js/leading-groups-ocr.js) | Sends staged screenshots to the Edge Function via `supabase.functions.invoke(...)`; requires a logged-in Supabase session (Google login). Batches in groups of 3 images per call, merges results by name. |
| Page | [`public/leading-groups.html`](public/leading-groups.html) | Tesseract removed entirely. **Manual "type ranks as CSV" entry box was removed at user's request (2026-07-18)** — screenshots via Claude are now the *only* input path. No logged-out fallback exists anymore. |

Verified end-to-end working: pasted real Industry Ranks + Theme Tracker screenshots, got 47 industries / 31 themes back correctly scored and tagged.

## Important constraints — read before touching anything

- **Scoring formula is locked.** Don't change weights, tag thresholds, or percentile math in `leading-groups-score.js` without explicit user sign-off.
- **No CSV / manual entry.** Don't re-add a text-input fallback unless the user asks for it again.
- **Login is required for the page to do anything** (no logged-out mode anymore). The auth banner at the top of the page reflects this.
- **User does not know how to code** — explain plainly, avoid jargon, confirm before running terminal commands or publishing changes.
- **User does not want the Supabase CLI used** — for anything involving Supabase config/secrets/functions, use the Supabase web dashboard instead.

## Known gotchas (from this session, may save you time)

- Local Google OAuth login on `localhost` silently redirects to the *production* Site URL instead of back to localhost unless `http://localhost:<port>/**` (with the wildcard) is added under Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
- `supabase/.temp` (CLI cache) is now gitignored — don't worry if it reappears locally, it's not meant to be committed.
- `.claude/launch.json` exists so Claude Code's browser preview can run `npm run dev` on port 3000 — Cursor won't need this, it's Claude-Code-specific tooling.
- The repo has a pile of **pre-existing, unrelated uncommitted changes** sitting in the working tree (OAuth backend docs, deleted `oauth-callback`/`oauth-initiate`/`tradovate-proxy` functions, some `src/` files, migration files, etc.) from earlier/other work sessions. These were deliberately left alone and not published during this session — don't assume they're safe to discard or that they're related to Leading Groups.

## Next job (aesthetic pass)

The user wants to switch to Cursor to make **aesthetic/UI changes** to the Leading Groups page. Specifics weren't defined yet in the Claude Code session — ask the user what they want changed (colors, spacing, typography, layout, mobile behavior, etc.) before making changes. The page's current visual style: dark theme, `#0a0f1e` background, blue/purple gradient accents, monospace labels — see the `<style>` block at the top of `public/leading-groups.html` for the full token set (`--bg`, `--panel`, `--teal`, `--blue`, `--purple`, etc.).

Do not touch the `<script type="module">` logic block (screenshot staging, paste handling, Compute Rankings flow, Supabase auth calls) unless the user specifically asks for a behavior change — this handoff is about looks, not function.
