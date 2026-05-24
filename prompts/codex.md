# Codex / GPT-5 Prompts (with Playwright Healer Agent rules)

> **Note:** Codex/GPT-5 don't have Claude's `@file` reference syntax. Instead you'll explicitly tell Codex to read the agent rules file and apply them.

## Prerequisites

- Playwright 1.56+ installed
- **Playwright agent files installed:** `npx playwright init-agents --loop=vscode` (creates `.github/agents/playwright-test-healer.agent.md`)
- OpenAI API access with GPT-5 (or Codex CLI: `npm install -g @openai/codex-cli`)
- Codex CLI authenticated: `codex login`
- Run from the repo root: `codex` (interactive session)

## Prompt 1 — Diagnose (don't fix yet)

```
You are the Healer agent in Playwright's test-healing workflow.

Step 1: Read the file `.github/agents/playwright-test-healer.agent.md` (or .vscode/agents/ if that's where init-agents placed it). These are your operating rules — follow them strictly throughout this session.

Step 2: Read every file in `tests/flakiness-suite/`.

Step 3: Read every file in `src/`.

Step 4: Read the trace from the last test run at `test-results/` (if it exists).

Step 5: For each failing test, output:
- Test filename
- Flakiness category (race condition, dynamic locator, network jitter, time-based, hover/focus, modal timing, animation, viewport, iframe, or auth)
- Root cause of the failure (NOT the symptom)
- The fix you propose in one sentence (do NOT write code yet)

Output as a markdown table. Do not modify any files yet.
```

## Prompt 2 — Apply fixes

```
Approved. Continue in the Healer role per the rules in playwright-test-healer.agent.md.

Step 1: For each test file, apply the fix you proposed in Prompt 1.
Step 2: Use your file-writing tool to edit each test file in place.
Step 3: After all 10 are patched, run: `npx playwright test`
Step 4: Report the results.

If any tests still fail, do NOT add waitForTimeout or fixed delays. Per the Healer rules, prefer resilient patterns (waitForLoadState, waitForResponse, waitForFunction).
```

## Prompt 3 — Push back on the band-aid

```
The fix you applied to Test 4 uses a fixed wait (waitForTimeout). Per the Healer agent rules in playwright-test-healer.agent.md, that is a symptom fix, not the root cause.

Step 1: Re-read `src/dashboard.html` and `src/dashboard.js` line by line.
Step 2: Identify the exact async race condition — which two operations are competing?
Step 3: Replace the waitForTimeout with the appropriate Playwright resilient pattern (waitForLoadState, waitForResponse, waitForFunction, or expect with auto-retry).

Output the diff before applying.
```

---

## What's different from the Claude flow

- **No `@file` syntax** — Codex needs explicit "read the file at this path" instructions
- **Codex's role-binding is weaker** — restate the Healer role at the start of every prompt to keep behavior consistent
- **Step-by-step instructions matter more** — Codex performs better with numbered steps than free-form requests
- **Diff preview before applying** — recommended for the push-back prompt because Codex is more aggressive about applying fixes immediately
- **No live shell command output streaming** — you'll see the full output at the end of each step

## Workaround if you don't have Codex CLI

Use ChatGPT (with Code Interpreter or web access) and paste the contents of `playwright-test-healer.agent.md` directly into the prompt as the system instruction. Then paste the test files + source files manually as attachments.

## When Codex wins

- Your company approved OpenAI but not Anthropic
- You want function-calling explicit rather than MCP-mediated
- You're already in the OpenAI ecosystem
