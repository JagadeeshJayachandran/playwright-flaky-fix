import { test, expect } from '@playwright/test';

test('analytics iframe shows the export button', async ({ page }) => {
  await page.goto('/dashboard.html');

  const analytics = page.frameLocator('#analytics-iframe');
  const exportBtn = analytics.locator('#analytics-export');

  // Iframe content is part of the initial render — no extra wait needed.
  await expect(exportBtn).toBeVisible({ timeout: 1_500 });
  await expect(exportBtn).toHaveText('Export CSV');
});
