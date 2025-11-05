// FIX: Changed from '~/fixtures/baseTest' to relative path
import { test, expect } from '../fixtures/baseTest';

const PROTECTED_URL = 'https://practicetestautomation.com/logged-in-successfully/';

test.describe('Storage State Verification (After Global Setup)', () => {
    
    /**
     * This test demonstrates that the session state saved by auth.setup.ts
     * is automatically loaded by the browser context. This allows the test
     * to start directly on the protected page, skipping the login UI.
     */
    test('should automatically access protected page using pre-loaded session', async ({ page }) => {
        
        await test.step('Navigate to Protected Page', async () => {
            // Note: No login actions required here!
            await page.goto(PROTECTED_URL);
        });

        // Verify successful access by checking for a protected element
        await test.step('Verify Authenticated State', async () => {
            const successMessage = page.locator('.post-title');
            
            await expect(successMessage).toBeVisible({ timeout: 10000 });
            await expect(successMessage).toHaveText('Logged In Successfully');
            await expect(page).toHaveURL(/.*logged-in-successfully/);
            
            console.log("✅ Successfully accessed protected page via pre-authenticated storage state.");
        });
    });
});
