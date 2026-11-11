import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.APP_URL,
    channel: process.env.CI ? 'chromium' : 'chrome',
  },
});
