import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PAGE_MANIFEST } from './page_manifest';
import { BUILD_DIR, ERROR_DOCUMENT, canonicalPath, startStaticHost } from './static_host';

/**
 * Guards the contract that #59 broke: the build must be servable from static
 * object storage, where the only resolution rules are "exact key" and
 * "<prefix>/index.html". These tests bypass the preview server entirely and run
 * against `build/` through a host with those semantics and nothing more.
 */

let host: Awaited<ReturnType<typeof startStaticHost>>;

test.beforeAll(async () => {
  host = await startStaticHost();
});

test.afterAll(async () => {
  await host?.close();
});

test('static hosting: every route in the manifest resolves to its own prerendered page', async () => {
  const failures: string[] = [];

  for (const entry of PAGE_MANIFEST) {
    const path = canonicalPath(entry.path);
    const response = await fetch(`${host.origin}${path}`);
    const body = await response.text();

    if (response.status !== 200) {
      failures.push(`${path} returned ${response.status}`);
      continue;
    }

    // The fallback would also return 200 here if it were being served in place
    // of a real route, so compare against the route's own prerendered file.
    const expected = await readFile(join(BUILD_DIR, path.slice(1), 'index.html'), 'utf8');
    if (body !== expected) {
      failures.push(`${path} did not serve its own ${path.slice(1)}index.html`);
    }
  }

  expect(failures, `routes unreachable from static hosting:\n${failures.join('\n')}`).toEqual([]);
});

test('static hosting: an unknown route falls back to the error document with a 404', async () => {
  const response = await fetch(`${host.origin}/this-route-does-not-exist/`);
  const body = await response.text();
  const errorDocument = await readFile(join(BUILD_DIR, ERROR_DOCUMENT), 'utf8');

  expect(response.status).toBe(404);
  expect(body).toBe(errorDocument);
});

test('static hosting: distributes the Open Game License used by rules data', async () => {
  const response = await fetch(`${host.origin}/legal/open-game-license-1.0a.txt`);
  const body = await response.text();

  expect(response.status).toBe(200);
  expect(body).toContain('OPEN GAME LICENSE Version 1.0a');
  expect(body).toContain('For Gold & Glory™, Copyright 2014; Justen Brown.');
  expect(body).toContain('END OF LICENSE');
});

test('static hosting: the error document renders the site error page in a browser', async ({
  page,
}) => {
  // Asserting the bytes are served is not the same as the shell booting from a
  // URL it was not prerendered for, so drive it with a real browser.
  const response = await page.goto(`${host.origin}/this-route-does-not-exist/`, {
    waitUntil: 'load',
  });

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
  await expect(page.getByRole('link', { name: 'Return to Home' })).toBeVisible();
});

test('static hosting: a deep link renders its page in a browser', async ({ page }) => {
  await page.goto(`${host.origin}/heraldry/`, { waitUntil: 'load' });

  await expect(page).toHaveTitle('Heraldry Generator | Iron Arachne');
  await expect(page.getByRole('heading', { level: 1, name: 'Heraldry Generator' })).toBeVisible();
});

test('static hosting: the error document is a self-contained app shell', async () => {
  // Served for URLs at any depth, so its asset references cannot be relative to
  // the requested path or they resolve against the wrong prefix.
  const errorDocument = await readFile(join(BUILD_DIR, ERROR_DOCUMENT), 'utf8');

  expect(errorDocument).toContain('/_app/');
  expect(errorDocument).not.toMatch(/import\("\.\.?\//);
});

test('static hosting: routes are emitted as directories, not flat .html files', async () => {
  // A flat `heraldry.html` is unreachable at `/heraldry` on a bucket. If this
  // fails, `trailingSlash` has been dropped from the root layout.
  const topLevel = await readdir(BUILD_DIR, { withFileTypes: true });
  const strayPages = topLevel
    .filter((item) => item.isFile() && item.name.endsWith('.html'))
    .map((item) => item.name)
    .filter((name) => name !== 'index.html' && name !== ERROR_DOCUMENT);

  expect(
    strayPages,
    `flat page files are not reachable on a bucket: ${strayPages.join(', ')}`,
  ).toEqual([]);
});
