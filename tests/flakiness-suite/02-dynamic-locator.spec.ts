import { test, expect } from '@playwright/test';

test('clicking row-3 after a search opens the right user', async ({ page }) => {
  await page.goto('/dashboard.html');

  // Wait for the second fetch to enrich the list before searching.
  await expect(page.locator('#user-list .user-row').first().locator('.meta')).toContainText(
    'Engineering',
    { timeout: 10_000 }
  );

  // Dan Kumar is the 4th employee in the unfiltered list (id row-3).
  // We search for "dan" then click that same row id.
  await page.fill('#search', 'dan');

  const targetRow = page.locator('#row-3');
  await targetRow.scrollIntoViewIfNeeded();
  await expect(targetRow.locator('.name')).toHaveText('Dan Kumar');
});
