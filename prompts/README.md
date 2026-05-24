# Choose Your LLM

**Don't have Claude? Use the prompts in this folder for whichever LLM is approved at your company.**

The principle is the same across all of them — invoke Playwright's Healer agent, diagnose, fix, push back when it reaches for a band-aid. The exact wording, file references, and tool-call syntax differ. Pick yours below.

## Prerequisite — install the Playwright agent files (10 seconds)

This workflow depends on Playwright's official agent rule files. Run this from the repo root:

```bash
npx playwright init-agents --loop=vscode
```

This creates three files (location depends on your Playwright version):
- `.github/agents/playwright-test-planner.agent.md` (or `.vscode/agents/`)
- `.github/agents/playwright-test-generator.agent.md`
- `.github/agents/playwright-test-healer.agent.md`

**This video only uses the Healer.** Planner and Generator are for creating new tests from scratch — different workflow, separate video.

If `init-agents` fails, your Playwright version is too old. Upgrade: `npm install -D @playwright/test@latest`

## Choose your LLM

| LLM | Setup | Native MCP support? | Use these prompts |
|---|---|---|---|
| **Claude (Sonnet 4.6 / Opus)** — filmed in the video | Easy | ✅ Yes | [claude.md](./claude.md) |
| **OpenAI Codex / GPT-5** | Easy | ❌ No (uses function calling) | [codex.md](./codex.md) |
| **Gemini Pro / Gemini CLI** | Medium | ⚠️ Partial | [gemini.md](./gemini.md) |
| **Cursor** (any backend model) | Easy | ✅ Yes | [cursor.md](./cursor.md) |
| **Other** (Llama, Mistral, etc.) | DIY | Varies | Use `claude.md` as the template and adapt |

## What's the same across all of them

The 3-prompt sequence is identical in shape:

1. **Diagnose** — invoke the Healer agent (via `@playwright-test-healer.agent.md` or by reading the rules into context), have it analyze each of the 10 failing tests, output category + root cause + proposed fix
2. **Apply** — let the Healer patch the test files in place, then run `npx playwright test`
3. **Push back** — when the Healer reaches for `waitForTimeout` on Test 4 (it usually does), redirect it to find the root cause race condition

That sequence is the actual transferable skill. The exact prompt wording is just the wrapper for whichever LLM you're using.

## Why these differ

- **Claude + MCP** can read agent files and source files via Playwright MCP. Prompts use `@file` references natively.
- **Codex / GPT-5** doesn't have `@file` syntax — prompts explicitly tell Codex to read the agent file from its path.
- **Gemini** has 1M+ token context — you bundle the agent rules + all 10 test files + sources into one big context block.
- **Cursor** uses `@file` references and inline edit mode. Same as Claude but the IDE applies edits directly.

## Found a bug or got it working with a different LLM?

Open a PR adding `prompts/<your-llm>.md`. The first 5 contributors get featured in a future video.
