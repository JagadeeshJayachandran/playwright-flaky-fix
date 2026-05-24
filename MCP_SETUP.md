# Playwright MCP Server — Setup (60 seconds)

> **What this is:** The Playwright MCP server gives your LLM (Claude, Cursor, etc.) direct browser-control tools. When the Healer agent wants to verify what's actually happening in a failing test, it can open the page, inspect elements, watch network requests — without you writing extra glue code.
>
> **Required?** Yes for the filmed setup (Claude in VS Code). Optional for the LLM workflows below — see "If you're using a different LLM" at the bottom.

---

## Step 1 — Install (universal)

The `@playwright/mcp` package is **already in this repo's `devDependencies`** — running `npm install` from the project root installs it automatically. No extra command needed.

If you're integrating MCP into a different project (not this repo), install manually:

```bash
npm install -D @playwright/mcp
```

The server doesn't run as a daemon — your LLM client launches it on demand via `npx`. The package install is the only required step.

Then, configure your LLM client to use it. Pick the section below that matches your setup.

---

## Step 2A — Claude in VS Code (Anthropic extension) — filmed setup

**This is what's filmed in the video. Zero config needed if you cloned this repo.**

1. Make sure the Anthropic Claude extension is installed in VS Code.
2. Open the project folder in VS Code: `playwright-flaky-fix`.
3. **The `.mcp.json` config is already in the repo root.** Verify it exists:

```bash
cat .mcp.json
```

You should see:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

4. Restart VS Code (or reload the Claude extension) so it picks up the config.
5. Open the Claude chat panel. You should see "playwright" listed under available MCP servers (icon in the chat header or status bar — depends on extension version).

✅ **Verify:** In a fresh chat, ask: *"What Playwright MCP tools do you have available?"* You should see tools like `browser_navigate`, `browser_click`, `browser_snapshot`, `browser_evaluate`, `browser_console_messages`.

**If you're starting a fresh project (not this repo):** create the `.mcp.json` file at your project root with the JSON above.

---

## Step 2B — Claude Desktop

1. Open the config file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - If it doesn't exist, create it.

2. Add the Playwright MCP server:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

If you already have other MCP servers, add `playwright` to the existing `mcpServers` object — don't replace.

3. Quit Claude Desktop completely (cmd+Q on macOS) and re-open it.
4. ✅ **Verify:** New chat → look for the 🔌 icon at the bottom of the input box → click → `playwright` should be in the list.

---

## Step 2C — Cursor

1. In your repo root, create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

2. Cursor → Settings → MCP → reload. The `playwright` server should show as connected.

3. ✅ **Verify:** Open a new chat with agent mode → ask *"List the Playwright MCP tools you have."*

---

## Step 3 — Smoke test the server (30 seconds)

Once configured, paste this in your LLM chat to confirm the server actually works:

```
Use the Playwright MCP browser tools to navigate to http://localhost:3000 (start npm run dev first if needed). Take a snapshot of the page and describe what you see.
```

If your LLM responds with a description of the dashboard page (employee list, search box, modal trigger, etc.) — MCP is working. You're ready to invoke the Healer.

If it responds with *"I don't have Playwright MCP tools available"* — restart the LLM client. If still failing, see Troubleshooting below.

---

## If you're using a different LLM

| LLM | MCP needed? | What to use instead |
|---|---|---|
| **Codex / GPT-5** | ❌ No | Codex uses OpenAI's function calling — `prompts/codex.md` has the workflow that doesn't need MCP |
| **Gemini Pro** | ❌ No | Gemini's 1M token context lets you paste everything in — `prompts/gemini.md` shows how |
| **GitHub Copilot Chat** | ⚠️ Partial | Copilot has limited tool access — paste files manually as needed |

The Healer agent rules (`@playwright-test-healer.agent.md`) work the same way across all of these. MCP is just the file-reading and browser-control mechanism — the Healer's *behavior* is identical regardless of how it gets context.

---

## Troubleshooting

### "MCP server is not responding" / Tools don't appear

1. Run manually to see errors: `npx -y @playwright/mcp@latest --version`
2. If that fails: `npm install -D @playwright/mcp` again to reinstall
3. Check Node version: `node --version` (should be 18+)

### "Server starts but Claude can't use the tools"

1. Quit and re-open the Claude client (full restart, not just reload)
2. Verify the JSON config has no syntax errors (paste into [jsonlint.com](https://jsonlint.com))
3. Check Claude's logs:
   - macOS: `~/Library/Logs/Claude/`
   - VS Code: View → Output → "Claude" channel

### "Playwright MCP works but the Healer can't read my test files"

That's a separate issue — the Healer reads files via Claude's filesystem tools (not MCP). Verify the project folder is in Claude's allowed-directories list:
- Claude Desktop: Settings → Filesystem → add the repo folder
- Claude in VS Code: should be automatic for the workspace folder

### "Healer keeps trying to use browsers I don't have installed"

The default config uses Chromium. If you want a different browser:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest", "--browser", "firefox"]
    }
  }
}
```

Then `npx playwright install firefox` to install it.

---

## What MCP enables specifically for Episode 2

Without MCP, the Healer can read your test code and propose fixes — but it has no way to verify the fix actually works in a real browser. With MCP, the Healer can:

- Navigate to `http://localhost:3000` (your local dev server)
- Snapshot the page state to see what's actually rendered
- Watch network requests during a test to identify the actual race condition
- Click + observe to validate that hover state, modal timing, etc. behave as expected

For the race condition test specifically (the one where the Healer reaches for `waitForTimeout`), MCP lets the Healer watch the actual second `fetch()` resolve in the browser. That's what enables the root-cause fix when you push back.

**Without MCP:** Healer guesses based on code reading.
**With MCP:** Healer observes the actual browser behavior.

The video's "honest mistake" beat is more credible with MCP because the Healer's correction is grounded in observed reality, not just code inference.
