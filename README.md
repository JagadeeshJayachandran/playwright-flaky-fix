# Playwright Flaky-Fix — AI Self-Healing Test Suite

> **Built live in this video:** [📺 Watch the full build →](https://www.youtube.com/watch?v=YOUR_VIDEO_ID) *(link goes live May 17, 2026)*
>
> No prerequisites. Standalone build. The Healer agent gets installed inline in the first 3 minutes of the video.
>
> If this is on your screen, you forked the right repo. By the end you'll have a Playwright suite that survives 10 categories of flakiness — race conditions, dynamic locators, network jitter, time-based assertions, hover/focus quirks, modal timing, animation glitches, viewport edge cases, third-party iframe delays, and authentication flakes — with a green CI badge on YOUR GitHub. **And you'll have an honest understanding of where Playwright's Healer agent needs human direction.**

[![CI](https://github.com/JagadeeshJayachandran/playwright-flaky-fix/actions/workflows/ci.yml/badge.svg)](https://github.com/JagadeeshJayachandran/playwright-flaky-fix/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What this is

10 deliberately broken Playwright tests, one per flakiness category. Your job: use an AI agent (Claude, Codex, Gemini, or Cursor) to **diagnose the root cause of each failure and fix it** — not paper over it with a `waitForTimeout`.

**The skill this teaches:** knowing when an AI agent's fix is real and when it's a band-aid. The agent will reach for a fixed wait on the hard cases. Recognizing that and pushing back is the actual 2026 QA skill.

The whole thing is a **3-step loop** you repeat until the suite is green:

```
  ┌─────────────────────────────────────────────────────────┐
  │  1. DIAGNOSE → 2. FIX → 3. PUSH BACK on band-aids  ↺      │
  └─────────────────────────────────────────────────────────┘
```

---

## Step 0 — Set up (one time, ~2 min)

```bash
git clone https://github.com/JagadeeshJayachandran/playwright-flaky-fix.git
cd playwright-flaky-fix
npm install        # Playwright + http-server
npm run setup      # installs Chromium + generates the Healer agent files
```

`npm run setup` runs `npx playwright init-agents --loop=vscode`, which creates the agent rule files (`.github/agents/playwright-test-healer.agent.md` and two others). **Confirm that file exists before continuing** — the healing workflow references it.

> The repo ships with `.mcp.json` pre-configured, so Claude in VS Code connects to the Playwright MCP server automatically. Using Claude Desktop or Cursor? See [MCP_SETUP.md](./MCP_SETUP.md).

---

## Step 1 — Watch all 10 tests fail

```bash
npm test
```

You'll get **10 reds**. That's the starting line — each failure is a different category of flakiness. The error messages are real and specific (wrong text, timeout, blown threshold), not generic syntax errors.

**Optional — see the broken app with your own eyes:**

```bash
npm run dev        # serves the dashboard at http://localhost:3000 (Ctrl+C to stop)
```

Open [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html) and you'll see the flakes live: a list that fills in late, stat cards that pulse, a modal that ignores early clicks, a session that expires after 5 seconds. This is what each test is fighting with.

---

## Step 2 — Pick your AI tool

Every prompt you need is in [`prompts/`](./prompts/), one file per LLM. **Start at [prompts/README.md](./prompts/README.md)** — it's a "choose your LLM" router.

| Your tool | Prompt file |
|---|---|
| **Claude** (Sonnet 4.6 / Opus) — *filmed setup* | [prompts/claude.md](./prompts/claude.md) |
| **OpenAI Codex / GPT-5** | [prompts/codex.md](./prompts/codex.md) |
| **Gemini Pro / Gemini CLI** | [prompts/gemini.md](./prompts/gemini.md) |
| **Cursor** (any backend model) | [prompts/cursor.md](./prompts/cursor.md) |
| Anything else (Llama, Mistral…) | Adapt [prompts/claude.md](./prompts/claude.md) |

The 3-step sequence below is identical across all of them — only the wording and file-reference syntax differ. Open your file and copy the prompts as you go.

---

## Step 3 — Diagnose (don't fix yet)

Paste **Prompt 1** from your LLM's prompt file. It tells the agent to:

1. Read each failing test in `tests/flakiness-suite/`
2. Read the matching source in `src/`
3. Read the trace from the last run in `test-results/`
4. Output, per test: **category · root cause · proposed fix** — in one line each

Stop here and read the diagnoses. This is where you confirm the agent actually *understands* each failure before it touches a single file.

---

## Step 4 — Apply the fixes

Paste **Prompt 2**. The agent patches the test files in place and re-runs `npx playwright test`.

Expect most tests to go green. But "green" is not the same as "fixed correctly" — which is the whole point of the next step.

---

## Step 5 — Push back on the band-aids ⭐

This is the step that matters. On the hard cases — **especially the race condition (test 01)** — the agent's first instinct is usually a fixed wait:

```ts
await page.waitForTimeout(5000);   // 🩹 makes it pass, doesn't fix it
```

That's a band-aid. It passes today and breaks under load tomorrow. Paste **Prompt 3** to redirect the agent to the *root cause* — a resilient pattern like `waitForResponse`, `waitForFunction`, or a web-first assertion, with no magic numbers.

**If you only learn one thing from this repo, it's Step 5.** An engineer who *uses* AI tools catches the band-aid. An engineer who is *used by* them ships it.

Repeat Steps 3–5 until every fix is a real one.

---

## Step 6 — Confirm it's genuinely green

```bash
npm test               # all 10 pass
npm run test:headed    # pass in a real browser window too (catches timing band-aids)
```

A real fix passes in **both** headless and headed mode. A band-aid often passes headless and flakes headed — so run both before you trust it. Push to GitHub and watch the CI badge go green.

---

## The 10 categories (your reference while diagnosing)

| # | Test | Why it fails | Root-cause fix |
|---|------|--------------|----------------|
| 01 | `race-condition` | Reads the row before the 2nd fetch fills in the data | `waitForResponse('**/users-details.json')` |
| 02 | `dynamic-locator` | Row ID is render-index-based; changes after a search | Select by user identity, not position |
| 03 | `network-jitter` | Asserts response < 100 ms; app delays it 500 ms+ | Drop the timing check or use `request().timing()` |
| 04 | `time-based` | Session expiry is "midnight tonight", not "now + 24h" | Freeze the clock (`page.clock`) or derive expected |
| 05 | `hover-focus` | Auto-refresh wipes hover state during a 2 s wait | Re-hover before the action / remove the wait |
| 06 | `modal-timing` | Clicks the button before its handler attaches (2 s) | Wait for readiness (`waitForFunction` / `toPass`) |
| 07 | `animation` | Asserts position during an infinite CSS pulse | `toHaveScreenshot({ animations: 'disabled' })` |
| 08 | `viewport` | Sidebar is `display:none` below 800 px | Run filter tests at desktop viewport |
| 09 | `iframe` | Iframe content loads at 2.5 s; assertion fires at 1.5 s | `contentFrame().waitForLoadState()` |
| 10 | `auth-flake` | Session token expires 5 s in; test waits 6 s | Mock auth or refresh the token mid-test |

Want a deeper walkthrough of each? See the companion deck **[FLAKINESS-DECK.md](./FLAKINESS-DECK.md)** (renders to slides with Marp; a `.pptx` is included).

---

## What's in here

```
.
├── src/                       # The deliberately flaky web app under test
│   ├── dashboard.html         #   10 categories of flakiness baked in
│   ├── dashboard.js
│   └── api/                   #   two JSON endpoints (one fast, one slow)
├── tests/flakiness-suite/     # 10 failing tests — one per category
│   ├── 01-race-condition.spec.ts
│   └── ... (9 more)
├── prompts/                   # ← AI prompts, one file per LLM (start here)
│   ├── README.md              #   "choose your LLM" router
│   ├── claude.md  codex.md  gemini.md  cursor.md
├── .github/                   # CI workflow (+ agents/ after `npm run setup`)
├── .mcp.json                  # Playwright MCP server config (auto-connects)
├── MCP_SETUP.md               # per-client MCP setup (Desktop / Cursor)
├── FLAKINESS-DECK.md / .pptx  # companion slide deck explaining all 10
└── PORTFOLIO.md               # ← if you're forking this for your portfolio
```

---

## Reset & re-run

The agent edits your test files. To get back to the pristine 10-red state:

```bash
git reset --hard && git clean -fd     # discard all fixes, back to broken
npm test                              # 10 reds again
```

Run a single category while iterating:

```bash
npx playwright test 01-race-condition
```

---

## Tech stack

- **Playwright 1.56+** — test framework **and** the official Healer agent (`npx playwright init-agents`)
- **Claude Sonnet 4.6 + Playwright MCP** — invoking the Healer (filmed setup); Codex / Gemini / Cursor prompts included
- **GitHub Actions** — the CI badge
- **TypeScript** — the test files

---

## Demo

![Demo](demo/demo.gif)

*30-second screen recording: 10 broken tests → AI diagnoses each → 10 green tests in CI.*

## Forking this for YOUR portfolio?

Read [PORTFOLIO.md](./PORTFOLIO.md) — LinkedIn copy, a résumé bullet, a 60-second interview pitch, and how to make it yours, not a clone.

## Found a bug? Got it working with another LLM?

[Open an issue](https://github.com/JagadeeshJayachandran/playwright-flaky-fix/issues) or add `prompts/<your-llm>.md` in a PR. First 5 contributors get featured in a future video.

## About me

I'm Jagadeesh — 14 years in QA, teaching engineers how to use AI to build better testing systems on YouTube. Every Sunday I ship a new project you can put on your portfolio.

- **YouTube:** [@JagadeeshJayachandran](https://www.youtube.com/@JagadeeshJayachandran)
- **LinkedIn:** [linkedin.com/in/jagadeesh-jayachandran](https://linkedin.com/in/jagadeesh-jayachandran)
- **All my projects:** [github.com/JagadeeshJayachandran](https://github.com/JagadeeshJayachandran?tab=repositories)

---

*MIT License. Ship it. Improve it. Make it yours.*
