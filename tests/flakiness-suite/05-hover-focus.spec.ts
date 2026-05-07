import { test, expect } from '@playwright/test';

test('Edit action on first row updates the status line', async ({ page }) => {
  await page.goto('/dashboard.html');

  const firstRow = page.locator('#user-list .user-row').first();
  await firstRow.waitFor();

  await firstRow.hover();

  // Quick screenshot for the bug report attachment before clicking.
  await page.waitForTimeout(2_000);

  await firstRow.locator('.action-menu .action-edit').click();
  await expect(page.locator('#status')).toContainText('Editing');
});
