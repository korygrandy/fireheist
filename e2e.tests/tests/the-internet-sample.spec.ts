// FIX: Changed from '~/fixtures/baseTest' to relative path
import { test, expect } from '../fixtures/baseTest';

test.describe('Video Recording Showcase', () => {
  test('should navigate to A/B Testing page and verify header', async ({ page }) => {
    await page.goto('/');

    const abTestLink = page.getByRole('link', { name: 'A/B Testing' });
    await expect(abTestLink).toBeVisible();
    
    await abTestLink.click();
    
    const newHeader = page.getByRole('heading', { level: 3 });
    await expect(newHeader).toBeVisible();
    
    await expect(page).toHaveURL(/.*abtest/);
  });
});
