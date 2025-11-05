import { Page } from '@playwright/test';

// Utility class for common, reusable actions.
export class TestUtils { 
    constructor(private page: Page) {} 

    /**
     * Example: Custom wait function
     */
    async customWait(ms: number) {
        await this.page.waitForTimeout(ms);
        console.log(`Waited for ${ms}ms.`);
    }
}
