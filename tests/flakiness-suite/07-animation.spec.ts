import { test, expect } from '@playwright/test';

test('stat card sits in a stable position once it has rendered', async ({ page }) => {
  await page.goto('/dashboard.html');

  const card = page.locator('#stat-total');
  await card.waitFor();

  // A settled card shouldn't move — sample the x coordinate over a short window.
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    const x = await card.evaluate((el) => el.getBoundingClientRect().x);
    samples.push(x);
    await page.waitForTimeout(70);
  }

  expect(new Set(samples).size).toBe(1);
});
