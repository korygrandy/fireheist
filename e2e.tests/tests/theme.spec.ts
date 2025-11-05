import { test, expect } from '@playwright/test';

test.describe('Theme Selector', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should allow the user to select the Desert Dunes theme', async ({ page }) => {
        // Click the Player tab to make sure the theme selector is visible
        await page.click('button[data-tab="player"]');

        // Select the "Desert Dunes" theme
        await page.selectOption('#themeSelector', { label: '🏜️ Desert Dunes' });

        // Wait for a brief moment to ensure the theme has been applied
        await page.waitForTimeout(500);

        // Get the background color of the canvas
        const canvasBackgroundColor = await page.evaluate(() => {
            const canvas = document.getElementById('gameCanvas');
            return window.getComputedStyle(canvas).getPropertyValue('background-color');
        });

        // The desert theme's sky color is '#F0E68C', which is rgb(240, 230, 140)
        expect(canvasBackgroundColor).toBe('rgb(240, 230, 140)');
    });
});
