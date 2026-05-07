import { test, expect } from '@playwright/test';

test('first user row shows their department', async ({ page }) => {
  await page.goto('/dashboard.html');

  const firstRow = page.locator('#user-list .user-row').first();
  await firstRow.waitFor();

  // Department comes from the second fetch — expect it to be in the row meta.
  const meta = await firstRow.locator('.meta').textContent();
  expect(meta).toContain('Engineering');
});

test('active stat reflects the count from /api/users-details', async ({ page }) => {
  await page.goto('/dashboard.html');

  await page.locator('#user-list .user-row').first().waitFor();

  const activeValue = await page.locator('#stat-active [data-stat-value]').textContent();
  expect(parseInt(activeValue || '0', 10)).toBe(4);
});
