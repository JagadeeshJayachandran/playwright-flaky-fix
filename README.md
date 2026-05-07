# Playwright Flaky-Fix — AI Self-Healing Test Suite

> **Built live in this video:** [📺 Watch the full build →](https://www.youtube.com/watch?v=YOUR_VIDEO_ID) *(link goes live May 17, 2026)*
>
> If this is on your screen, you forked the right repo. By the end of this video you'll have a Playwright suite that survives 10 categories of flakiness — race conditions, dynamic locators, network jitter, time-based assertions, hover/focus quirks, modal timing, animation glitches, viewport edge cases, third-party iframe delays, and authentication flakes — with a green CI badge on YOUR GitHub.

[![CI](https://github.com/YOUR_USERNAME/playwright-flaky-fix/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/playwright-flaky-fix/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What this project does

An AI-augmented Playwright test suite that uses Claude (or your preferred LLM) to diagnose flakiness at the *root cause* — not the symptom. The repo contains 10 deliberately broken tests covering 10 categories of real-world flakiness, plus the AI prompts that walk through diagnosing and patching each one.

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
└── PORTFOLIO.md               # ← Read this if you're forking for your portfolio
```

## Run it locally

```bash
git clone https://github.com/YOUR_USERNAME/playwright-flaky-fix.git
cd playwright-flaky-fix
npm install
npm test                        # Initially: 10 fail. Follow the video to fix them.
```

If `npm test` doesn't run on a fresh clone, the project is broken — open an issue.

## Tech stack

- **Playwright** — for the test framework (resilient locators, auto-waiting)
- **Claude Sonnet 4.6 + Playwright MCP** — for the AI-assisted diagnosis (filmed setup)
- **GitHub Actions** — for the CI badge
- **TypeScript** — for the test files

Don't have Claude? See [`prompts/`](./prompts/) — there's a working prompt set for Codex, Gemini, and Cursor too.

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
