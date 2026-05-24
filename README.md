# Playwright Flaky-Fix — AI Self-Healing Test Suite

> **Built live in this video:** [📺 Watch the full build →](https://www.youtube.com/watch?v=YOUR_VIDEO_ID) *(link goes live May 17, 2026)*
>
> No prerequisites. Standalone build. The Healer agent gets installed inline in the first 3 minutes of the video.
>
> If this is on your screen, you forked the right repo. By the end of this video you'll have a Playwright suite that survives 10 categories of flakiness — race conditions, dynamic locators, network jitter, time-based assertions, hover/focus quirks, modal timing, animation glitches, viewport edge cases, third-party iframe delays, and authentication flakes — with a green CI badge on YOUR GitHub. **And you'll have an honest understanding of where Playwright's Healer agent needs human direction.**

[![CI](https://github.com/YOUR_USERNAME/playwright-flaky-fix/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/playwright-flaky-fix/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What this project does

A stress test of **Playwright's official Healer agent** (`playwright-test-healer.agent.md`) on 10 categories of real-world test flakiness. The repo contains 10 deliberately broken tests, the AI prompts that invoke the Healer to diagnose and patch each one, and the honest reality of where the Healer reaches for a band-aid (`waitForTimeout`) versus the root-cause fix.

**The skill demonstrated:** knowing when to push back when an AI agent applies a symptom fix instead of solving the actual problem. That's a 2026 QA engineering skill recruiters specifically ask about.

## Demo

![Demo](demo/demo.gif)

*30-second screen recording showing 10 broken tests → AI diagnoses each → 10 green tests passing in CI.*

## Why this exists

Flaky tests cost engineering teams an average of 6 hours per week per developer. The traditional fix is to add `waitForTimeout()` calls everywhere — which is a band-aid, not a cure. AI-assisted diagnosis can identify the actual race conditions, dynamic locators, and async issues, and patch them with resilient patterns. **This repo is the demo.**

## What's in here

```
.
├── src/                       # The deliberately flaky web app being tested
│   ├── dashboard.html         # Has 10 categories of flakiness baked in
│   └── dashboard.js
├── tests/
│   └── flakiness-suite/       # 10 failing tests (one per category)
│       ├── 01-race-condition.spec.ts
│       ├── 02-dynamic-locator.spec.ts
│       └── ... (8 more)
├── prompts/                   # ← AI prompts for any LLM you use
│   ├── README.md              # "Choose your LLM" decision tree
│   ├── claude.md              # Filmed setup
│   ├── codex.md               # OpenAI Codex / GPT-5
│   ├── gemini.md              # Gemini Pro / Gemini CLI
│   └── cursor.md              # Cursor agent mode
├── docs/                      # Decisions log, architecture notes
├── demo/                      # Screen recordings + GIFs
├── .github/workflows/ci.yml   # GitHub Actions CI
├── FLAKINESS-DECK.pptx        # Animated 14-slide deck — click-by-click reveals on each test (YouTube companion)
└── PORTFOLIO.md               # ← Read this if you're forking for your portfolio
```

## Run it locally

```bash
git clone https://github.com/YOUR_USERNAME/playwright-flaky-fix.git
cd playwright-flaky-fix
npm install        # installs Playwright + the @playwright/mcp server in one go
npm run setup      # installs Chromium browser + the Healer agent rule files

npm test           # Initially: 10 fail. Follow the video to invoke the Healer.
```

**That's it.** The repo ships with `.mcp.json` pre-configured at the root, so if you're using Claude in VS Code (filmed setup), the MCP server connects automatically.

### Open the dashboard manually

To poke at the broken app in your browser (separate from running tests):

```bash
npm run dev        # serves src/ at http://localhost:3000 (Ctrl+C to stop)
```

Then open [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html). You should see:

- A countdown ticking from "Session expires in 5s" — click **Refresh** after it hits 0 to see the auth flake.
- A user list that fills in employee names first, then department/status pills 500–1000ms later (the race condition).
- Stat cards that subtly pulse left–right (the animation trap).
- Hover any row → Edit/Delete reveal; the list auto-refreshes every 1.5s and the menu vanishes (the hover flake).
- Click **Add Employee** within the first 2s — nothing happens (the modal listener hasn't attached); after 2s it works.

Useful for sanity-checking what each test is observing before you ask the Healer to fix it.

**Using Claude Desktop or Cursor instead?** See [MCP_SETUP.md](./MCP_SETUP.md) Section 2B (Desktop) or 2C (Cursor) for the 30-second client-specific config.

If `npm test` doesn't run on a fresh clone, the project is broken — open an issue.

If `npm run setup` fails on `init-agents`, your Playwright version is too old. Upgrade: `npm install -D @playwright/test@latest`

## Tech stack

- **Playwright 1.56+** — for the test framework AND the official Healer agent (`npx playwright init-agents`)
- **Claude Sonnet 4.6 + Playwright MCP** — for invoking the Healer agent (filmed setup)
- **GitHub Actions** — for the CI badge
- **TypeScript** — for the test files

Don't have Claude? See [`prompts/`](./prompts/) — there's a working prompt set for Codex, Gemini, and Cursor too. **All four use Playwright's same Healer agent rules** — just adapted for each LLM's tool-call syntax.

## What I'd add next

- [ ] Visual regression testing on top of the flakiness fixes
- [ ] Mobile viewport variants (next episode)
- [ ] AI-generated test data (Playwright + Claude generates fixtures)
- [ ] Self-healing locator fallback chains

## Forking this for YOUR portfolio?

Read [PORTFOLIO.md](./PORTFOLIO.md). It has:

- The exact LinkedIn post copy you can paste
- The résumé bullet you can add today
- A 60-second pitch for interviews
- How to customize this so it's yours, not a clone

## Found a bug? Want to contribute?

[Open an issue](https://github.com/YOUR_USERNAME/playwright-flaky-fix/issues) or PR. The first 5 contributors get featured in a future video.

## About me

I'm Jagadeesh — 14 years in QA, currently teaching engineers how to use AI to build better testing systems on YouTube. Every Sunday I ship a new project you can put on your portfolio. By July, you'll have 6 recruiter-grade projects on your GitHub.

- **YouTube:** [@JagadeeshJayachandran](https://www.youtube.com/@JagadeeshJayachandran)
- **LinkedIn:** [linkedin.com/in/jagadeesh-jayachandran](https://linkedin.com/in/jagadeesh-jayachandran)
- **All my projects:** [github.com/JagadeeshJayachandran](https://github.com/JagadeeshJayachandran?tab=repositories)

---

*MIT License. Ship it. Improve it. Make it yours.*
