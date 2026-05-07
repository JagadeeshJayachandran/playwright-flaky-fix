import { test, expect } from '@playwright/test';

test('user-details endpoint responds in under 100ms', async ({ page }) => {
  const detailsResponsePromise = page.waitForResponse('**/api/users-details.json');

  const start = Date.now();
  await page.goto('/dashboard.html');

  const response = await detailsResponsePromise;
  expect(response.ok()).toBeTruthy();

  const elapsed = Date.now() - start;
  // Internal SLO for the details endpoint is 100ms.
  expect(elapsed).toBeLessThan(100);
});
