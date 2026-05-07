import { test, expect } from '@playwright/test';

test('session has at least 23 hours remaining on a fresh load', async ({ page }) => {
  await page.goto('/dashboard.html');

  // SESSION_EXPIRES_AT is set to "today at 23:59:59" on init —
  // a fresh load should always have a full day ahead of it.
  const expiresAt: number = await page.evaluate(() => (window as any).SESSION_EXPIRES_AT);
  expect(typeof expiresAt).toBe('number');

  const remainingMs = expiresAt - Date.now();
  const twentyThreeHours = 23 * 60 * 60 * 1000;
  expect(remainingMs).toBeGreaterThan(twentyThreeHours);
});
