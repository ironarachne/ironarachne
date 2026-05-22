import { defineConfig, devices } from '@playwright/test';

const previewPort = 4173;
const previewHost = '127.0.0.1';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: `http://${previewHost}:${previewPort}`,
    trace: 'on-first-retry',
    actionTimeout: 15_000,
  },
  expect: {
    timeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host ${previewHost} --port ${previewPort}`,
    url: `http://${previewHost}:${previewPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
