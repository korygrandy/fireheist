import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// The baseURL is set to the value provided during the bootstrap process, 
// unless the BASE_URL environment variable is explicitly set.
const DEFAULT_BASE_URL = 'https://kgenterprises.com';
const storageStatePath = path.join(__dirname, '../auth/user.json');

export default defineConfig({
  testDir: path.join(__dirname, 'tests'),
  baseURL: process.env.BASE_URL || DEFAULT_BASE_URL,
  
  // 🔐 GLOBAL SETUP: Runs once before all tests to save the authentication state
  globalSetup: require.resolve('./auth.setup'),
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // --- Configurable Settings ---
  retries: 1,
  workers: 4, // Use undefined for auto
  // -----------------------------

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'html-report' }]
  ],
  
  timeout: 60000,
  
  use: {
    baseURL: process.env.BASE_URL || DEFAULT_BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry', 
    video: 'retain-on-failure', 
    // 🔐 GLOBAL USE: Automatically loads the saved authentication state for all tests
    storageState: storageStatePath, 
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ].filter(p => p !== ''),
  
  outputDir: 'test-artifacts',
});
