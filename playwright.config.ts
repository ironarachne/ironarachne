import { defineConfig, devices } from '@playwright/test';
import { MOBILE_VIEWPORTS } from './e2e/mobile_viewports';

const previewPort = 4173;
const previewHost = '127.0.0.1';

/** Chromium-backed phone emulation: mobile user agent, touch, device pixel ratio. */
const mobileDevice = devices['Pixel 7'];

const mobileUse = (width: number, height: number) => ({
  ...mobileDevice,
  viewport: { width, height },
  screen: { width, height },
});

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
      testIgnore: /pages\.mobile\.spec\.ts/,
    },
    ...MOBILE_VIEWPORTS.map(({ name, width, height }) => ({
      name: `mobile-${name}`,
      use: mobileUse(width, height),
      testMatch: /pages\.mobile\.spec\.ts/,
    })),
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host ${previewHost} --port ${previewPort}`,
    url: `http://${previewHost}:${previewPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
