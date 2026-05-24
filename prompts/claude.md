# Claude Prompts (Sonnet 4.6 / Opus + Playwright Healer Agent)

> **What you'll do:** Stress test Playwright's official Healer agent on 10 flaky tests. Watch where it patches correctly, where it reaches for a band-aid, and how to push it to the root cause.
>
> **Filmed setup:** Claude inside VS Code (or Claude Desktop) with the Playwright MCP server enabled. The Healer agent file (`playwright-test-healer.agent.md`) is read by Claude as part of the prompt.

## Prerequisites

- Playwright 1.56+ installed: `npm install -D @playwright/test@latest`
- **The Playwright agent files installed:** `npx playwright init-agents --loop=vscode` (creates `.github/agents/` or `.vscode/agents/` with the three `.agent.md` files)
- **The Playwright MCP server installed AND configured:** `npm install -D @playwright/mcp` + edit your client config — full step-by-step in [MCP_SETUP.md](../MCP_SETUP.md) (60 seconds)
- This repo cloned locally with the 10 broken tests in `tests/flakiness-suite/`
- Claude in VS Code (or Claude Desktop with workspace allowed)

## What is the Healer agent?

`playwright-test-healer.agent.md` is one of three agent role-rule files Playwright generates via `init-agents` (Playwright 1.56+). It tells Claude how to behave when fixing failing tests — read traces, identify root causes, prefer resilient patterns over fixed waits, etc.

The other two are the Planner (designs new tests) and Generator (writes them). This workflow only needs the Healer — we already have 10 broken tests to fix.

---

## Prompt 1 — Diagnose (don't fix yet)

```
Act as the Orchestrator. Read the rules in @playwright-test-healer.agent.md.

Then for each failing test in tests/flakiness-suite/:
1. Read the test file
2. Read the corresponding source in src/
3. Read the trace from the last test run (test-results/)
4. As the Healer, identify the root cause of the failure
5. Output: test filename, flakiness category, root cause (NOT symptom), and the fix you propose in one sentence

Don't write the fix yet. Just diagnose. Stop and wait for my approval.
```

## Prompt 2 — Apply fixes

```
Approved. Stay in @playwright-test-healer.agent.md role.

For each test, apply the fix you proposed. Edit the test files in place.
After all 10 are patched, run: npx playwright test
Report the results.
```

## Prompt 3 — Push back on the band-aid

```
The waitForTimeout you added to Test 4 is a symptom fix, not the root cause.

Stay in @playwright-test-healer.agent.md role. Re-read src/dashboard.html and src/dashboard.js.
What is the actual async race condition? Which two operations are competing?

Replace the waitForTimeout with the appropriate Playwright resilient pattern — waitForLoadState, waitForResponse, or waitForFunction. No fixed waits.
```

---

## What to expect

The Healer agent will:
- Read each test + source via Playwright MCP
- Output structured diagnoses
- Edit files in place when you approve
- Run `npx playwright test` itself when prompted

**The honest moment:** on Test 4 (the race condition), the Healer's first instinct is usually `waitForTimeout(5000)` — a band-aid. That's the moment to use Prompt 3. **Don't accept the symptom fix.** This is the entire video's trust earner.

If the Healer happens to use a root-cause fix on every test on first try (rare), bias the prompt toward simplicity — *"apply the simplest fix"* — and it will reliably reach for the timeout.

## Common gotchas

- **"Agent file not found":** run `npx playwright init-agents --loop=vscode` first. Confirm the `.agent.md` files exist in `.github/agents/` or `.vscode/agents/`.
- **MCP not responding:** restart Claude Desktop or VS Code. Confirm the Playwright MCP server is in the config.
- **Healer refuses to edit files:** check Claude's allowed-directories settings include the project folder.
- **Suite hangs:** start the dev server first — `npm run dev`. The tests need `http://localhost:3000`.

## The skill this teaches

Knowing when the Healer is right and when to push it. The agent's first instinct on hard cases (especially race conditions) is often a fixed wait — a band-aid. Recognizing this and redirecting toward the root cause is what separates an engineer who *uses* AI tools from one who is *used by* them.
