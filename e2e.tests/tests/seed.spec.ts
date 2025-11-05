// FIX: Changed from '~/fixtures/baseTest' to relative path
import { test, expect } from '../fixtures/baseTest';

test.describe('Initial Seed Test', () => {
    test('should verify the homepage is accessible', async ({ page }) => {
        // This test runs against the Base URL provided in playwright.config.ts 
        await page.goto('/');
        await expect(page).toHaveTitle(/The Internet/); 
    });
});
