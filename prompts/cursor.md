# Cursor Prompts (Agent Mode + Playwright Healer Rules)

> **Cursor advantage:** Agent mode can edit files directly in your IDE without copy-pasting. The `@file` references work natively. Use any backend model (Claude, GPT, Gemini).

## Prerequisites

- Playwright 1.56+ installed
- **Playwright agent files installed:** `npx playwright init-agents --loop=vscode`
- **Playwright MCP server installed AND configured for Cursor:** `npm install -D @playwright/mcp` + create `.cursor/mcp.json` — full step-by-step in [MCP_SETUP.md](../MCP_SETUP.md) (Section 2C)
- Cursor IDE installed
- This repo opened as a workspace
- Agent mode enabled (⌘K then click "Agent" or press ⌘I)
- Recommended backend: Claude Sonnet 4.6 (best for this task)

## Prompt 1 — Diagnose (use Chat, not Agent)

Open Cursor's Chat (⌘L), select your model, and paste:

```
@.github/agents/playwright-test-healer.agent.md
@tests/flakiness-suite
@src

Read the Healer agent rules above. Adopt that role for this entire conversation.

For each failing test in tests/flakiness-suite/, give me:
1. Flakiness category (race, dynamic locator, network, time-based, hover, modal, animation, viewport, iframe, auth)
2. Root cause (NOT symptom)
3. Fix in one sentence (no code yet)

Output as a table. Don't edit anything yet.
```

The `@` references pull the agent rules + entire folders into context automatically. Cursor handles this elegantly.

> **If your init-agents put the file in `.vscode/agents/` instead of `.github/agents/`** — adjust the @path accordingly. Look in your file tree.

## Prompt 2 — Apply fixes (Agent Mode)

Switch to Agent mode (⌘I) and run:

```
@.github/agents/playwright-test-healer.agent.md
@tests/flakiness-suite
@src

Stay in the Healer role per the agent file referenced above.

Apply the fixes from the analysis. Edit each test file directly.
After all 10 are patched, run: npx playwright test
Report the results.

Per the Healer rules — do NOT use waitForTimeout. Use resilient patterns only.
```

Agent mode will edit files in place and run the test command. Each edit shows as a diff in the IDE before it applies.

## Prompt 3 — Push back (Agent Mode)

If Test 4 used waitForTimeout despite Prompt 2's instruction:

```
@.github/agents/playwright-test-healer.agent.md
@tests/flakiness-suite/04-race-condition.spec.ts
@src/dashboard.html
@src/dashboard.js

The fix used a fixed wait. Per the Healer agent rules — that's a symptom fix.

Find the actual race condition in dashboard.js: which two async operations are competing?
Rewrite the test with waitForLoadState or waitForResponse. Apply the edit directly.
```

---

## What's different from the Claude/Codex/Gemini flow

- **No copy-paste between LLM and editor** — Cursor handles everything inline
- **Diff preview is automatic** — every edit shows a green/red diff before you accept
- **`@file` and `@folder` references** — way more efficient than describing paths
- **Switch backend models freely** — same prompts work whether Claude, GPT, or Gemini under Cursor's hood
- **Native agent-rule binding** — `@<agent-file>.agent.md` is read into context like any other file
- **Total flow time: 8–10 minutes** (vs 12–15 for Claude+MCP outside Cursor)

## When Cursor wins

- You live in your IDE
- You want to see every edit before it commits
- Your company approved Cursor but not Claude Desktop directly
- You want to A/B test different backend models for the same task

## When Cursor loses

- You want to film the workflow on YouTube — Cursor's diff overlay is harder to read on screen vs Claude Desktop's clean chat (this is why I filmed in Claude, not Cursor)
- Your company blocks Cursor entirely (some enterprise security policies do)

## Pro tip

If you're using Cursor with Claude Sonnet 4.6 as the backend, you get most of Claude's capabilities WITHOUT needing the standalone MCP setup. The Playwright agent rules still apply because Cursor reads the `.agent.md` file via `@file` reference. For QA engineers in companies that haven't approved Claude Desktop yet but have approved Cursor, this is the cleanest path.
