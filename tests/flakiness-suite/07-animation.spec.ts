import { test, expect } from '@playwright/test';

test('stat card is in its final position right after render', async ({ page }) => {
  await page.goto('/dashboard.html');

  const card = page.locator('#stat-total');
  await card.waitFor();

  // Capture two positions in quick succession — a settled element shouldn't move.
  const first = await card.boundingBox();
  await page.waitForTimeout(120);
  const second = await card.boundingBox();

  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(second!.x).toBe(first!.x);
});
