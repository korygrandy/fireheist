import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 8080);
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './tests',
  outputDir: '../test-results/playwright-artifacts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../test-results/playwright-report', open: 'never' }],
    ['json', { outputFile: '../test-results/america250-smoke-results.json' }]
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run serve',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ]
});
