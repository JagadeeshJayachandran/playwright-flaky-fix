# Choose Your LLM

**Don't have Claude? Use the prompts in this folder for whichever LLM is approved at your company.**

The principle is the same across all of them. The exact wording, file references, and tool-call syntax differ. Pick yours below.

| LLM | Setup | Native MCP support? | Use these prompts |
|---|---|---|---|
| **Claude (Sonnet 4.6 / Opus)** — filmed in the video | Easy | ✅ Yes | [claude.md](./claude.md) |
| **OpenAI Codex / GPT-5** | Easy | ❌ No (uses function calling) | [codex.md](./codex.md) |
| **Gemini Pro / Gemini CLI** | Medium | ⚠️ Partial | [gemini.md](./gemini.md) |
| **Cursor** (any backend model) | Easy | ✅ Yes | [cursor.md](./cursor.md) |
| **Other** (Llama, Mistral, etc.) | DIY | Varies | Use `claude.md` as the template and adapt |

## What's the same across all of them

The 3-prompt sequence is identical in shape:

1. **Analyze** — read the 10 failing test files + source, diagnose root cause for each (not symptom)
2. **Fix** — apply patches, run the suite
3. **Push back** — when the LLM uses a symptom fix (e.g., `waitForTimeout`), you push back and demand a root-cause fix

That sequence is the actual transferable skill. The exact prompt wording is just the wrapper.

## Why these differ

- **Claude + MCP** can read files and run commands directly. Prompts can be conversational.
- **Codex / GPT-5** uses function calling. Prompts need to be more explicit about file paths.
- **Gemini** has 1M+ token context — you can paste all 10 test files into the prompt at once and skip MCP entirely.
- **Cursor** uses `@file` references and inline edit mode. Prompts are shorter, more directive.

## Found a bug or got it working with a different LLM?

Open a PR adding `prompts/<your-llm>.md`. The first 3 contributors get featured in a future video. (Seriously — comment on the YouTube video with your fork link.)
