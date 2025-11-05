import { test as baseTest, TestInfo } from '@playwright/test';
// FIX: Use relative paths for stable module resolution at runtime
import { LandingPage } from '../pages/LandingPage';
import { GlobalData } from '../utils/GlobalData';
import { TestUtils } from '../utils/TestUtils';

// EXPORTED MyFixtures to resolve "Unresolved variable/type MyFixtures" IDE error
export type MyFixtures = {
  landingPage: LandingPage;
  globalData: GlobalData;
  utils: TestUtils;
  testInfo: TestInfo; 
};

/**
 * Checks if the test is currently in a retry cycle AND has the '@no-retry' tag.
 * If both are true, it skips the test for the current retry attempt.
 * @param testInfo The current test information object.
 */
export function skipIfNoRetry(testInfo: TestInfo): void {
  const isVolatile = testInfo.title.includes('@no-retry');
  
  if (isVolatile && testInfo.retry > 0) {
    console.log(`\n⚠️ Skipping known volatile test: ${testInfo.title} (Retry #${testInfo.retry}). Retries disabled for this tag.`);
    // testInfo.skip() is the correct runtime method to skip the current test iteration
    testInfo.skip(); 
  }
}

// Extend baseTest to inject your Page Object Models (POMs) and Utils
export const test = baseTest.extend<MyFixtures>({
  
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  globalData: async ({ }, use) => {
    await use(GlobalData.getInstance());
  },
  
  utils: async ({ page }, use) => {
    await use(new TestUtils(page));
  },

  testInfo: [
    async ({}, use, testInfo) => {
      await use(testInfo);
    },
    { scope: 'test' }
  ]
});

// Re-export Playwright core elements
export { expect, ConsoleMessage, Request, APIRequestContext, APIResponse } from '@playwright/test';
// Re-export custom elements explicitly to satisfy IDEs
export { skipIfNoRetry };
