// FIX: Changed from '~/fixtures/baseTest' to relative path
import { test, expect, skipIfNoRetry } from '../fixtures/baseTest';

test.describe('Volatile Test Suite Demonstrating Conditional Retries', () => {

    test('should retry 2 times on failure (Default Global Behavior)', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('h1')).toBeVisible(); 
    });

    test('should skip on retry if tagged as volatile @no-retry', async ({ page, testInfo }) => {
        
        // --- CONDITIONAL RETRY LOGIC ---
        skipIfNoRetry(testInfo);
        // -------------------------------

        await page.goto('/status_codes');
        await page.getByRole('link', { name: '200' }).click();
        await expect(page.locator('p')).toContainText('This page returned a 200 status code.');
    });
});
