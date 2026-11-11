import { test, expect } from '@playwright/test';

test('Главная страница открывается без ошибок', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  await page.goto('/');

  const heading = page.getByRole('heading', { level: 1 });

  await expect(heading).toBeVisible();
  await expect(heading).not.toHaveText(/^\s*$/);

  expect(errors).toEqual([]);
});
