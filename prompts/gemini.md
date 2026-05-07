# Gemini Pro / Gemini CLI Prompts

> **Gemini's superpower: 1M+ token context window.** You can paste all 10 test files + the source files into a single prompt and skip MCP entirely. Faster than Claude or Codex for this specific use case.

## Prerequisites

- Google AI Studio access (free tier works) OR Gemini CLI: `npm install -g @google/generative-ai-cli`
- A repo with the test files and source ready
- Recommended model: `gemini-2.5-pro` or newer

## Setup — Concatenate the files first

Run this in your repo root:

```bash
# Bundle all relevant files into one context block
{
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
} > /tmp/gemini-context.txt
```

Then paste the contents of `/tmp/gemini-context.txt` at the START of Prompt 1. Gemini handles the full context fine.

## Prompt 1 — Analyze (don't fix yet)

```
[PASTE THE CONTENTS OF /tmp/gemini-context.txt HERE]

---

You have above all 10 failing Playwright tests and the source files they test against.

For each test in tests/flakiness-suite/, give me:
- Test filename
- Flakiness category (race condition, dynamic locator, network jitter, time-based, hover/focus, modal timing, animation, viewport, iframe, or auth)
- Root cause of the failure — NOT the symptom
- The fix in one sentence (no code yet)

Output as a markdown table. Be specific about which line in the source file is the issue.
```

## Prompt 2 — Fix all 10

```
Now write the patched version of each test file. Output them as full file contents in code blocks, one per file, with the filename in the heading.

Format:
### tests/flakiness-suite/01-race-condition.spec.ts
```typescript
[full patched file]
```

### tests/flakiness-suite/02-dynamic-locator.spec.ts
```typescript
[full patched file]
```

(...and so on for all 10)

After all 10 patches, give me the exact bash command to run them all and verify.
```

## Prompt 3 — Push back on symptom fixes

```
The fix for Test 4 uses waitForTimeout. That is a symptom fix.

Re-read the source for src/dashboard.html and src/dashboard.js (above).
Find the actual race condition: which two async calls are competing?

Rewrite Test 4 with a resilient pattern (waitForLoadState, waitForResponse, waitForFunction, or expect with auto-retry). Output the full new file.
```

## What's different from the Claude/Codex flow

- **One-shot context** — Gemini's huge context window means you don't iterate file-by-file. Paste everything once.
- **Slower per-prompt response** — but fewer prompts needed overall (~3 total vs ~6-8 for Codex)
- **Better at code blocks output** — you get clean diffs without manual stitching
- **No MCP integration needed** — you handle file editing yourself by copy-pasting Gemini's output back to your editor

## Bash helper — apply all 10 patches at once

After running Prompt 2, copy each code block and save to its file. Or, if you trust the output, automate it with this:

```bash
# Save Gemini's response to a file, then split + apply
# (You'd need to write a small parser — leave that as exercise.)
```

## When Gemini wins this workflow

- You're on a slow internet connection (fewer round trips)
- Your repo is small enough to fit in 1M tokens (most are)
- You don't have Claude or Codex access
- Your company uses Google Workspace and Gemini is the approved AI tool

## When Gemini loses

- Your repo is huge (>500K lines) — context overflow
- You need streaming live edits — Gemini doesn't do that the way Claude+MCP does
