# Gemini Pro / Gemini CLI Prompts (with Playwright Healer Agent rules)

> **Gemini's superpower:** 1M+ token context window. You can paste the Healer agent rules + all 10 test files + the source files into a single prompt and skip MCP entirely.

## Prerequisites

- Playwright 1.56+ installed
- **Playwright agent files installed:** `npx playwright init-agents --loop=vscode`
- Google AI Studio access (free tier works) OR Gemini CLI: `npm install -g @google/generative-ai-cli`
- Recommended model: `gemini-2.5-pro` or newer

## Setup — Bundle everything into one context block

Run this in your repo root:

```bash
{
  echo "=== HEALER AGENT RULES (follow these strictly) ==="
  cat .github/agents/playwright-test-healer.agent.md 2>/dev/null || cat .vscode/agents/playwright-test-healer.agent.md
  echo ""
  echo "=== TEST FILES ==="
  for f in tests/flakiness-suite/*.spec.ts; do
    echo "--- $f ---"
    cat "$f"
  done
  echo ""
  echo "=== SOURCE FILES ==="
  for f in src/*.html src/*.js; do
    echo "--- $f ---"
    cat "$f"
  done
  echo ""
  echo "=== TRACE FROM LAST RUN ==="
  cat test-results/*.txt 2>/dev/null || echo "(no trace yet — run npx playwright test first)"
} > /tmp/gemini-context.txt
```

Paste the contents of `/tmp/gemini-context.txt` at the START of Prompt 1.

## Prompt 1 — Diagnose (don't fix yet)

```
[PASTE THE CONTENTS OF /tmp/gemini-context.txt HERE]

---

You are the Healer agent. The rules above govern your behavior — follow them strictly.

For each failing test in tests/flakiness-suite/, give me:
- Test filename
- Flakiness category (race condition, dynamic locator, network jitter, time-based, hover/focus, modal timing, animation, viewport, iframe, or auth)
- Root cause of the failure — NOT the symptom
- The fix in one sentence (no code yet)

Output as a markdown table. Be specific about which line in the source file is the issue.
```

## Prompt 2 — Apply fixes

```
Stay in the Healer role per the rules at the top of this conversation.

Output the patched version of each test file as full file contents in code blocks, one per file, with the filename in the heading.

Format:
### tests/flakiness-suite/01-race-condition.spec.ts
```typescript
[full patched file]
```

### tests/flakiness-suite/02-dynamic-locator.spec.ts
```typescript
[full patched file]
```

(...all 10)

After all 10 patches, give me the exact bash command to run them and verify.
```

## Prompt 3 — Push back on the band-aid

```
The fix for Test 4 uses waitForTimeout. Per the Healer agent rules, that is a symptom fix — fixed waits are explicitly disallowed.

Re-read the source for src/dashboard.html and src/dashboard.js (in the context above).
Find the actual race condition: which two async operations are competing?

Rewrite Test 4 with a resilient pattern (waitForLoadState, waitForResponse, waitForFunction, or expect with auto-retry). Output the full new file.
```

---

## What's different from the Claude flow

- **One-shot context** — Gemini's 1M tokens means you don't iterate file-by-file. Paste everything once including the Healer rules.
- **Slower per-prompt response** — but fewer prompts needed overall (~3 total vs ~6-8 for Codex)
- **Better at code blocks output** — clean diffs without manual stitching
- **No MCP integration needed** — you handle file editing yourself by copy-pasting Gemini's output back to your editor
- **Healer role-binding via context, not protocol** — the agent rules are part of the prompt's preamble, not an external file reference

## When Gemini wins

- You're on a slow internet connection (fewer round trips)
- Your repo is small enough to fit in 1M tokens (most are)
- You don't have Claude or Codex access
- Your company uses Google Workspace and Gemini is the approved AI tool

## When Gemini loses

- Your repo is huge (>500K lines) — context overflow
- You need streaming live edits — Gemini doesn't do that the way Claude+MCP does
- You want the "agent applies edits in place" experience — Gemini outputs diffs, you apply them
