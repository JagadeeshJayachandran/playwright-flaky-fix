<!--
  Render to PowerPoint:
    npx @marp-team/marp-cli FLAKINESS-DECK.md --pptx
  Render to PDF:
    npx @marp-team/marp-cli FLAKINESS-DECK.md --pdf
  Live preview in VS Code:
    install the "Marp for VS Code" extension, then open this file
-->

---
marp: true
theme: default
paginate: true
size: 16:9
backgroundColor: #fff
style: |
  section {
    font-family: -apple-system, "Segoe UI", sans-serif;
    font-size: 24px;
    padding: 50px 60px;
  }
  section h1 { font-size: 40px; color: #1a365d; margin-bottom: 12px; }
  section h2 { font-size: 28px; color: #2b6cb0; }
  code { background: #f4f6fa; padding: 2px 6px; border-radius: 3px; font-size: 0.85em; }
  pre { background: #1a202c; color: #e2e8f0; padding: 16px; border-radius: 6px; font-size: 0.75em; }
  pre code { background: transparent; color: inherit; padding: 0; }
  table { font-size: 0.85em; }
  th { background: #f4f6fa; }
  .lead { font-size: 1.15em; color: #4a5568; }
  .tag { display: inline-block; padding: 2px 10px; border-radius: 12px; background: #ebf4ff; color: #2b6cb0; font-size: 0.75em; }
---

# 10 Categories of Playwright Flakiness

### A stress-test of the official `playwright-test-healer` agent

<br>

**The setup:** 10 deliberately broken tests, one per category.

**The question:** does the Healer fix the root cause, or reach for a band-aid?

**The honest answer:** mostly the former. Sometimes the latter. You have to know which.

<br>

<span class="tag">Episode 2 · Playwright 1.56 · Claude Sonnet 4.6 + MCP</span>

---

# The Subject Under Test

A single-page **employee dashboard** ([src/dashboard.html](src/dashboard.html))

| Feature | Hidden flake |
|---|---|
| User list loads via two async fetches | **Race condition** |
| Search re-renders rows with index-based IDs | **Dynamic locator** |
| Second fetch jitter: 500–1000 ms | **Network jitter** |
| Session expires at midnight tonight | **Time-based** |
| Hover-revealed Edit/Delete; auto-refresh every 1.5 s | **Hover state lost** |
| Modal handler attaches 2 s after page load | **Modal timing** |
| Stat cards have a continuous CSS pulse | **Animation mid-flight** |
| Filter sidebar `display: none` below 800 px | **Viewport-dependent** |
| Analytics iframe loads after 2.5 s | **Iframe load timing** |
| Session token expires 5 s after login | **Auth flake** |

---

# Test 01 — Race Condition

**Intent:** Read department after list renders.

```ts
const firstRow = page.locator('#user-list .user-row').first();
await firstRow.waitFor();
const meta = await firstRow.locator('.meta').textContent();
expect(meta).toContain('Engineering');
```

**Bug:** Row appears after fetch 1 (names only). Department arrives 500–1000 ms later from fetch 2.

**Error:**
```
Expected substring: "Engineering"
Received string:    "alice.chen@example.com"
```

**Root-cause fix:** `await page.waitForResponse('**/api/users-details.json')` before reading.

**Band-aid to push back on:** `waitForTimeout(2000)`.

---

# Test 02 — Dynamic Locator

**Intent:** Click row #3 (Dan Kumar) after a search.

```ts
await page.fill('#search', 'dan');
const targetRow = page.locator('#row-3');
await targetRow.scrollIntoViewIfNeeded();
```

**Bug:** Row IDs are render-index-based. After filtering, only Dan remains — at `#row-0`. `#row-3` no longer exists.

**Error:** `locator.scrollIntoViewIfNeeded: Test timeout of 30000ms exceeded`

**Root-cause fix:** Select by user identity, not list position.
```ts
const targetRow = page.locator('.user-row', { hasText: 'Dan Kumar' });
```

**Band-aid:** Renumber to `#row-0`. Breaks the next time data changes.

---

# Test 03 — Network Jitter

**Intent:** Enforce a 100 ms response-time SLO.

```ts
const start = Date.now();
await page.goto('/dashboard.html');
await page.waitForResponse('**/api/users-details.json');
expect(Date.now() - start).toBeLessThan(100);
```

**Bug:** Measures *"goto to response received"* — includes the app's 500 ms scheduled delay. Endpoint itself is fast.

**Error:** `Expected: < 100 · Received: 531`

**Root-cause fix:** This isn't a UI test. Move SLO to observability, or measure actual server time:
```ts
const t = response.request().timing();
expect(t.responseEnd - t.requestStart).toBeLessThan(100);
```

---

# Test 04 — Time-Based

**Intent:** Fresh login should have ~24 hours of session left.

```ts
const expiresAt = await page.evaluate(() => window.SESSION_EXPIRES_AT);
expect(expiresAt - Date.now()).toBeGreaterThan(23 * 60 * 60 * 1000);
```

**Bug:** App sets expiry to **midnight tonight**, not "now + 24h". Remaining time depends on wall clock.

| Run time | Remaining | Result |
|---|---|---|
| 12:30 AM | ~23.5 h | ✅ |
| 9:00 AM | ~15 h | ❌ |
| 5:00 PM | ~7 h | ❌ |

**Root-cause fix:** Either fix the app (`Date.now() + 24*3600*1000`) or freeze time in the test (`page.clock.install()`).

---

# Test 05 — Hover State Lost

**Intent:** Hover row, click Edit.

```ts
await firstRow.hover();
await page.waitForTimeout(2_000);   // "screenshot for bug report"
await firstRow.locator('.action-edit').click();
```

**Bug:** Auto-refresh re-renders the row every 1.5 s. New row has no `.is-hovered` class. Menu is `display: none`. Click waits 30 s for visibility.

**Error:** `locator.click: Test timeout of 30000ms exceeded`

**Root-cause fix:** Delete the `waitForTimeout`. It's the cause, not a wait *for* the bug.

**The smoking gun:** the comment ("for screenshot") reveals the author introduced the flake themselves.

---

# Test 06 — Modal Timing

**Intent:** Click "Add Employee", expect modal to open.

```ts
await page.goto('/dashboard.html');
await page.click('#open-modal');
await expect(page.locator('#modal')).toBeVisible({ timeout: 1_500 });
```

**Bug:** The click handler is attached 2 s after page load (`setTimeout(attachListener, 2000)`). The test clicks at ~50 ms — into a button with no handler.

**Error:** `Expected: visible / Received: hidden, Timeout: 1500ms`

**Root-cause fix:** Wait for the handler, not the button.
```ts
await page.waitForFunction(() => window.__modalReady === true);
await page.click('#open-modal');
```

**Band-aid:** `waitForTimeout(2500)`. Works until someone lazy-loads more.

---

# Test 07 — Animation Mid-Flight

**Intent:** Confirm stat card sits in a stable position.

```ts
const samples: number[] = [];
for (let i = 0; i < 5; i++) {
  samples.push(await card.evaluate(el => el.getBoundingClientRect().x));
  await page.waitForTimeout(70);
}
expect(new Set(samples).size).toBe(1);
```

**Bug:** Card has an infinite CSS pulse (`animation: card-live-pulse 1.4s linear infinite`). Position is never the same twice.

**Error:** `Expected: 1 · Received: 4` (4 distinct x values across 5 samples)

**Root-cause fix:** Don't assert on layout during an ongoing animation. Use `toHaveScreenshot()` with `animations: 'disabled'`, or assert on CSS transform reaching its final keyframe.

---

# Test 08 — Viewport-Dependent

**Intent:** Click the Active filter at mobile viewport.

```ts
await page.setViewportSize({ width: 500, height: 900 });
await page.goto('/dashboard.html');
await page.locator('#filter-active').click();
```

**Bug:** Filter sidebar is `display: none` below 800 px (CSS media query). The button exists in DOM but is invisible — and Playwright won't click invisible elements.

**Error:** `Expected: visible / Received: hidden, Timeout: 2000ms`

**Root-cause fix:** Either tap the mobile hamburger first to open the menu, or restructure: tests that exercise filters should run at desktop viewport; tests that exercise the mobile menu should run at mobile.

---

# Test 09 — Iframe Load Timing

**Intent:** Click "Export CSV" in the embedded analytics iframe.

```ts
const analytics = page.frameLocator('#analytics-iframe');
const exportBtn = analytics.locator('#analytics-export');
await expect(exportBtn).toBeVisible({ timeout: 1_500 });
```

**Bug:** Iframe `srcdoc` is injected by JS 2.5 s after page load. The 1.5 s assertion timeout fires first.

**Error:** `element(s) not found, Timeout: 1500ms`

**Root-cause fix:** Wait for the iframe to finish loading, then interact:
```ts
await page.locator('#analytics-iframe')
  .contentFrame()
  .waitForLoadState('domcontentloaded');
```

**Band-aid:** `waitForTimeout(3000)`. Couples your test to the iframe's load time.

---

# Test 10 — Auth Token Expiry

**Intent:** After reading the dashboard for a few seconds, click Refresh.

```ts
await page.goto('/dashboard.html');
await page.locator('.user-row').first().waitFor();
await page.waitForTimeout(6_000);   // "simulate user reading"
await page.click('#refresh');
await expect(page.locator('#status')).toContainText('Refreshed at');
```

**Bug:** Session token is set with a 5 s TTL on page load. The 6 s wait crosses it. Refresh button checks the token, finds it expired, shows "Session expired."

**Error:** `Expected: "Refreshed at" / Received: "Session expired. Please log in."`

**Root-cause fix:** Mock the auth state, or refresh the token mid-test. Don't simulate "user thinking time" with `waitForTimeout`.

---

# The Pattern

For every flake, the Healer agent faces three paths:

| Category | Band-aid (avoid) | Workaround | Root cause |
|---|---|---|---|
| Race (01) | `waitForTimeout` | wait for row text | `waitForResponse` |
| Locator (02) | `force: true` | nth-child | semantic selector |
| Jitter (03) | bump threshold | retry | move to observability |
| Time (04) | run only at midnight | mock `Date` | `page.clock.install` |
| Hover (05) | `force: true` | re-hover | delete the wait |
| Modal (06) | `waitForTimeout` | retry | `waitForFunction` |
| Animation (07) | bump tolerance | retry | disable animations |
| Viewport (08) | `force: true` | skip on mobile | reorganize suite |
| Iframe (09) | `waitForTimeout` | poll | `waitForLoadState` |
| Auth (10) | longer TTL | re-login | mock auth |

**Your job: spot the band-aid on the first try. Push back. Demand the root-cause fix.**

---

# What This Episode Demonstrates

**About the Healer agent**

- It diagnoses **flaky-test category** correctly almost every time.
- It writes the **right pattern** (waitForResponse, semantic locators, etc.) when nudged.
- It defaults to `waitForTimeout` on the **race condition** about 60% of the time — that's the trust earner.

**About QA in 2026**

- AI doesn't replace the judgment of *"is this fix actually solving the problem?"*
- The skill that matters is **reviewing AI-generated test fixes** with the same rigor you'd give a junior engineer.
- The Healer is a tool, not a teammate. You ratify its work.

**Try it yourself:** clone the repo, run `npm test`, then follow `prompts/claude.md` (or `codex.md`, `gemini.md`, `cursor.md`).

→ [github.com/JagadeeshJayachandran/playwright-flaky-fix](https://github.com/JagadeeshJayachandran/playwright-flaky-fix)
