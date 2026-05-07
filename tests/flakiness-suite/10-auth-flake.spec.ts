import { test, expect } from '@playwright/test';

test('Refresh succeeds after the user has been browsing for a while', async ({ page }) => {
  await page.goto('/dashboard.html');

  await page.locator('#user-list .user-row').first().waitFor();

  // Simulate the user reading the dashboard for a few seconds before
  // hitting Refresh — a common real-world flow.
  await page.waitForTimeout(6_000);

  await page.click('#refresh');
  await expect(page.locator('#status')).toContainText('Refreshed at');
});
