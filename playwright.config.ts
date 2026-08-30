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

/**
 * Screenshot capture, off unless asked for. See `e2e/capture.spec.ts`.
 */
const captureProjects = process.env.CAPTURE
  ? [
      {
        name: 'capture',
        use: { ...devices['Desktop Chrome'] },
        testMatch: /capture\.spec\.ts/,
      },
      ...MOBILE_VIEWPORTS.map(({ name, width, height }) => ({
        name: `capture-${name}`,
        use: mobileUse(width, height),
        testMatch: /capture\.spec\.ts/,
      })),
    ]
  : [];

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
      testIgnore: [/pages\.mobile\.spec\.ts/, /capture\.spec\.ts/],
    },
    ...MOBILE_VIEWPORTS.map(({ name, width, height }) => ({
      name: `mobile-${name}`,
      use: mobileUse(width, height),
      testMatch: /pages\.mobile\.spec\.ts/,
    })),

    /* The capture projects, behind an env var because a project with no filter still runs on a
       bare `playwright test` — `testMatch` chooses a project's files, not whether the project
       runs at all, and adding these unguarded put two hundred and forty screenshot "tests" into
       `verify:all`. `CAPTURE=1 npx playwright test --project=capture` is the whole interface.

       See docs/visual-design.md, "The capture is a tool, not a gate": this is for a reviewer to
       look at and it asserts nothing, so it must not be able to fail a build or pad a suite. */
    ...captureProjects,
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host ${previewHost} --port ${previewPort}`,
    url: `http://${previewHost}:${previewPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
