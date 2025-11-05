// FIX: Changed from '~/fixtures/baseTest' to relative path
import { test, expect } from '../fixtures/baseTest';

test.describe('Visual Regression Test', () => {
    test('should match the baseline screenshot of the homepage body', async ({ page }) => {
        // Removed 'waitUntil: domcontentloaded'
        await page.goto('/');

        const contentContainer = page.locator('#content');

        await expect(contentContainer).toHaveScreenshot('homepage-content-baseline.png', {
            maxDiffPixelRatio: 0.01
        });
    });
});
