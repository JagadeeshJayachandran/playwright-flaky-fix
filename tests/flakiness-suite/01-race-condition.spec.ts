import { test, expect } from '@playwright/test';

test('first user row shows their department after the list renders', async ({ page }) => {
  await page.goto('/dashboard.html');

  const firstRow = page.locator('#user-list .user-row').first();
  await firstRow.waitFor();

  // Department comes from /api/users-details — we wait for the row to exist
  // before reading, so the data should be there by now.
  const meta = await firstRow.locator('.meta').textContent();
  expect(meta).toContain('Engineering');
});
