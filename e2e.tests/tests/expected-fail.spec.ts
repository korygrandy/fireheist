// This test is designed to FAIL intentionally to demonstrate Playwright's error logging, 
// automatic retries (if configured), and screenshot capture on failure.
// You should see this test retry and eventually fail in the console output.
import { test, expect } from '../fixtures/baseTest';

test.describe('Expected Failure Showcase', () => {
    test('should fail to demonstrate error reporting and retry behavior', async ({ page }) => {
        await page.goto('/');

        // This assertion is GUARANTEED to fail because the homepage title is 'The Internet'
        // and it will never be 'INTENTIONALLY FAILED TEST'.
        await expect(page).toHaveTitle('INTENTIONALLY FAILED TEST', { timeout: 1000 });
    });
});
