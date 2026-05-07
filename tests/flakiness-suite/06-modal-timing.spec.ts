import { test, expect } from '@playwright/test';

test('Add Employee modal opens when the toolbar button is clicked', async ({ page }) => {
  await page.goto('/dashboard.html');

  await page.click('#open-modal');

  const modal = page.locator('#modal');
  await expect(modal).toBeVisible({ timeout: 1_500 });
  await expect(modal.locator('h2')).toHaveText('Add Employee');
});
