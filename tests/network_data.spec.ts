// FIX: Changed from '~/fixtures/baseTest' to relative path
import { test, expect } from '../fixtures/baseTest';

test.describe('Network and Console Data Showcase (v1.56 New APIs)', () => {
    
    // --- SHOWCASE: page.consoleMessages() and page.pageErrors() (v1.56) ---
    test('should capture and verify console log messages using new APIs', async ({ page }) => {
        
        await page.goto('/');

        // Trigger console messages and an error on the client side
        await page.evaluate(() => {
            console.log('CLIENT_LOG: Page is fully loaded and interactive.');
            console.error('CLIENT_ERROR: An expected non-fatal error occurred.');
            // Note: page.pageErrors() will catch unhandled exceptions, not console.error
        });
        
        // No manual listeners required! The new API gets recent messages.
        const consoleMessages = await page.consoleMessages();
        
        const logMessage = consoleMessages.find(msg => msg.text().includes('CLIENT_LOG:'));
        expect(logMessage, 'Expected console log message not found.').toBeDefined();
        expect(logMessage!.type()).toBe('log');

        const errorMessage = consoleMessages.find(msg => msg.text().includes('CLIENT_ERROR:'));
        expect(errorMessage, 'Expected console error message not found.').toBeDefined();
        expect(errorMessage!.type()).toBe('error');

        // Optional: Example of checking for unhandled exceptions (pageErrors)
        const pageErrors = await page.pageErrors();
        expect(pageErrors.length, 'No unhandled page errors should have occurred.').toBe(0);
    });

    // --- SHOWCASE: page.requests() (v1.56) ---
    test('should capture and verify network requests using new API', async ({ page }) => {
        
        // Navigating to the page generates network requests
        await page.goto('/');
        
        // Wait for all network activity to finish
        await page.waitForLoadState('networkidle');

        // No manual listeners required! The new API gets recent requests.
        const requests = await page.requests();

        const mainRequest = requests.find(req => req.url().endsWith('/') && req.method() === 'GET');
        expect(mainRequest, 'Main page request not found.').toBeDefined();
        
        // Await the response of the captured request
        expect(mainRequest!.response()).toBeTruthy();
        expect((await mainRequest!.response())!.status()).toBe(200);

        const cssRequest = requests.find(req => req.resourceType() === 'stylesheet');
        expect(cssRequest, 'A stylesheet request was expected.').toBeDefined();

        console.log(`Captured ${requests.length} total network requests during navigation (using page.requests()).`);
    });
});
