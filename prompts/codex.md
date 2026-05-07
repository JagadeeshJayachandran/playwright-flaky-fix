# Codex / GPT-5 Prompts (OpenAI)

> **No native MCP** — Codex CLI uses function calling and can read/write files via its sandbox. Prompts here are more explicit about file paths than the Claude version.

## Prerequisites

- OpenAI API access with GPT-5 (or Codex CLI installed: `npm install -g @openai/codex-cli`)
- Codex CLI authenticated: `codex login`
- This repo cloned locally
- Run from the repo root: `codex` (opens an interactive session)

## Prompt 1 — Analyze (don't fix yet)

```
You have access to this repository. Use your file-reading tools.

Step 1: Read every file in `tests/flakiness-suite/`.
Step 2: Read every file in `src/`.
Step 3: For each test in tests/flakiness-suite/, output:
- Test filename
- Flakiness category (one of: race condition, dynamic locator, network jitter, time-based, hover/focus, modal timing, animation, viewport, iframe, auth)
- Root cause of the failure (NOT the symptom)
- The fix in one sentence (do NOT write code yet)

Output as a markdown table. Do not modify any files yet.
```

## Prompt 2 — Fix all 10

```
Now apply the fixes.

Step 1: For each test file, apply the fix you proposed in Prompt 1.
Step 2: Use your file-writing tool to edit each test file in place.
Step 3: After all 10 are patched, run: `npx playwright test`
Step 4: Report the results.

If any tests still fail, do NOT add waitForTimeout or fixed delays. Analyze the source again and propose a resilient pattern.
```

## Prompt 3 — Push back on symptom fixes

```
The fix you applied to Test 4 uses a fixed wait. That is a symptom fix.

Step 1: Read `src/dashboard.html` and `src/dashboard.js` line by line.
Step 2: Identify the exact async call that the test is racing against.
Step 3: Replace the waitForTimeout with the appropriate Playwright resilient pattern (waitForLoadState, waitForResponse, waitForFunction, or expect().toHaveText with auto-retry).

Output the diff before applying.
```

## What's different from the Claude flow

- **No MCP, so no live file editing in chat** — Codex CLI does it via its sandbox, but the syntax for tool calls is more explicit
- **Step-by-step instructions matter more** — Codex performs better with numbered steps
- **Diff preview before applying** — recommended for the push-back prompt because Codex is more aggressive about applying fixes immediately
- **No live shell command output streaming** — you'll see the full output at the end of each step

## Workaround if you don't have Codex CLI

Use ChatGPT (with Code Interpreter enabled) and paste the test files + source files manually as attachments. The same prompts work — just paste files into the chat instead of relying on file-reading tools.
