import { test, expect } from '@playwright/test';

test('Active filter button is reachable from the sidebar', async ({ page }) => {
  // Mobile-first regression check — many of our users are on tablets.
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto('/dashboard.html');

  const activeFilter = page.locator('#filter-active');
  await expect(activeFilter).toBeVisible({ timeout: 2_000 });

  await activeFilter.click();
  await expect(page.locator('#user-list .user-row')).toHaveCount(4);
});
