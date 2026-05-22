import { test, expect } from '@playwright/test';
import { visitRoute } from './helpers';

test('error page: unknown route shows 404 and home link', async ({ page }) => {
  await visitRoute(page, '/this-route-does-not-exist');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
  await expect(page.getByRole('link', { name: 'Return to Home' })).toBeVisible();

  await page.getByRole('link', { name: 'Return to Home' }).click();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle('Iron Arachne');
});
