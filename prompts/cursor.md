# Cursor Prompts (Agent Mode)

> **Cursor advantage:** Agent mode can edit files directly in your IDE without copy-pasting. The prompts here are shorter and more directive than the Claude version. Works with any backend model (Claude, GPT, Gemini, etc. — Cursor handles the routing).

## Prerequisites

- Cursor IDE installed
- This repo opened as a workspace
- Agent mode enabled (⌘K then click "Agent" or press ⌘I)
- Recommended backend: Claude Sonnet 4.6 (best for this task)

## Prompt 1 — Analyze (in chat, not agent)

Open Cursor's Chat (⌘L), select Claude/GPT-5/Gemini as the model, and paste:

```
@tests/flakiness-suite @src

Read all test files in tests/flakiness-suite/ and all source files in src/.

For each failing test, give me:
1. Flakiness category (race, dynamic locator, network, time-based, hover, modal, animation, viewport, iframe, auth)
2. Root cause (NOT symptom)
3. Fix in one sentence (no code yet)

Output as a table. Don't edit anything yet.
```

The `@` references pull the entire folders into context automatically.

## Prompt 2 — Fix all 10 (Agent Mode)

Switch to Agent mode (⌘I) and run:

```
@tests/flakiness-suite @src

Apply the fixes from the analysis above. Edit each test file directly.
After all 10 are patched, run: npx playwright test
Report the results.

Do NOT use waitForTimeout. Use resilient patterns only.
```

Agent mode will edit files in place and run the test command. You see each edit as a diff in the IDE before it applies.

## Prompt 3 — Push back (Agent Mode)

If Test 4 used waitForTimeout despite Prompt 2's instruction:

```
@tests/flakiness-suite/04-race-condition.spec.ts @src/dashboard.html @src/dashboard.js

The fix used a fixed wait. That's a symptom fix.

Find the actual race condition in dashboard.js — which two async calls are competing?
Rewrite the test with waitForLoadState or waitForResponse. Apply the edit directly.
```

## What's different from the Claude/Codex/Gemini flow

- **No copy-paste between LLM and editor** — Cursor handles everything inline
- **Diff preview is automatic** — every edit shows a green/red diff before you accept
- **`@file` and `@folder` references** — way more efficient than describing paths in plain English
- **Switch backend models freely** — same prompts work whether you're using Claude, GPT, or Gemini under Cursor's hood
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

If you're using Cursor with Claude Sonnet 4.6 as the backend, you get most of Claude's capabilities WITHOUT needing the standalone MCP setup. For QA engineers in companies that haven't approved Claude Desktop yet but have approved Cursor, this is the cleanest path.
