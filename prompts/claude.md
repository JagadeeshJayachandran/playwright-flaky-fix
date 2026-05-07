# Claude Prompts (Sonnet 4.6 / Opus 4.6 + Playwright MCP)

> **Filmed setup:** Claude Desktop with the Playwright MCP server enabled. Claude can read files in your repo and run shell commands directly through MCP.

## Prerequisites

- Claude Desktop or Claude.ai with Pro/Team
- Playwright MCP server installed: `npm install -g @playwright/mcp` (or via Claude's MCP config UI)
- This repo cloned locally

## Prompt 1 — Analyze (don't fix yet)

```
I have 10 failing Playwright tests in this repo. The tests are in /tests/flakiness-suite/.
Read each test file. Then read the corresponding HTML and JS source under /src/.
For each failure, tell me:
1. What flakiness category it is (race condition, dynamic locator, network jitter, time-based, hover/focus, modal timing, animation, viewport, iframe, auth)
2. What is causing it (root cause, not symptom)
3. What the fix should be (in one sentence — don't write code yet)

Don't write the fix yet. Just analyze.
```

## Prompt 2 — Fix all 10

```
Now write the fix for each test.
Apply the fixes directly to the test files.
After all 10 fixes are written, run the full suite with: npx playwright test
If anything still fails, analyze again and re-patch.
```

## Prompt 3 — Push back on symptom fixes

```
The waitForTimeout you added is a symptom fix, not a root-cause fix.
Read the application code at /src/dashboard.html.
What is the actual race condition?
Fix it properly — no fixed waits. Use waitForLoadState, waitForResponse, or another resilient pattern.
```

## What to expect

Claude will use MCP to read files directly. It will run `npx playwright test` itself when prompted. It will edit files in place. The full sequence runs in 4–6 minutes.

If Claude's first fix on Test 4 (the race condition) is `waitForTimeout(5000)` — that is the moment to use Prompt 3. Don't accept the symptom fix.

## Common gotchas

- If MCP isn't responding: restart Claude Desktop, check the MCP server is in the config
- If Claude refuses to edit files: re-confirm the project folder is added to Claude's allowed directories
- If the suite hangs: Playwright probably can't find the local server — start it with `npm run dev` first
