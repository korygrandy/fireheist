import { test, expect, chromium } from '@playwright/test';
import * as path from 'path';

// --- Constants for Authentication ---
const AUTH_URL = 'https://practicetestautomation.com/practice-test-login/';
const USERNAME = 'student';
const PASSWORD = 'Password123';
// The path where the authentication state will be saved (relative to the framework root).
// FIX: Constructs the path using path.join and uses the escaped variable for cross-platform compatibility.
const STORAGE_STATE_PATH = path.join(process.cwd(), 'auth\\user.json');

/**
 * Global setup function to log in once and save the session state.
 * This runs before all tests start.
 */
async function globalSetup() {
    console.log('\n🔐 Running Playwright Global Setup: Logging in and saving session...');
    
    // 1. LAUNCH BROWSER: Use chromium to launch a headless browser (FIXED)
    const browser = await chromium.launch();
    
    // 2. CREATE PAGE: Get a Page object from the Browser Context
    const page = await browser.newPage();
    
    try {
        await page.goto(AUTH_URL);

        // Perform login
        await page.locator('#username').fill(USERNAME);
        await page.locator('#password').fill(PASSWORD);
        await page.getByRole('button', { name: 'Submit' }).click();

        // Wait for successful redirect and verify a protected element
        const protectedPageUrl = 'https://practicetestautomation.com/logged-in-successfully/';
        await page.waitForURL(protectedPageUrl);
        await expect(page.locator('.post-title')).toHaveText('Logged In Successfully');
        
        // 3. Save the session state (cookies, local storage, etc.)
        await page.context().storageState({ path: STORAGE_STATE_PATH });
        
        console.log(`✅ Authentication state saved to: ${STORAGE_STATE_PATH}`);

    } catch (error) {
        console.error('❌ Global Setup Failed: Could not login and save authentication state.');
        console.error('Check if the website is available and if credentials (student/Password123) are correct.');
        throw error;
    } finally {
        // 4. CLOSE BROWSER: It's critical to close the browser instance created in global setup
        await browser.close();
    }
}

export default globalSetup;
