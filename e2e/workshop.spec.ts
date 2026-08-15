import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';

/**
 * The workshop is a prototype: it is reachable at /workshop but deliberately not linked from
 * navigation, so it has no PAGE_MANIFEST entry and the smoke suite never visits it.
 *
 * The default-tool assertions are structural rather than named after a particular tool, so
 * reordering the catalog does not break them.
 */
test.describe('the workshop', () => {
  const toolButtons = (page: Page) => page.locator('section.tool-browser button');
  const panelHeading = (page: Page) => page.locator('section.tool-panel h1');

  test('opens with the first tool in the browser already loaded', async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });

    await expect(page.getByRole('heading', { level: 1, name: 'Workshop' })).toBeVisible();
    await expect(toolButtons(page).first()).toContainText('Loaded');
    await expect(panelHeading(page)).toBeVisible();
  });

  test('swaps the panel when a different tool is picked', async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await expect(panelHeading(page)).toBeVisible();

    // Matched on the label as a prefix: picking a tool appends "Loaded" to its accessible name.
    const culture = page.getByRole('button', { name: /^Culture/ });
    await culture.click();

    await expect(page.getByRole('heading', { level: 1, name: 'Culture Generator' })).toBeVisible();
    await expect(culture).toContainText('Loaded');
    await expect(toolButtons(page).first()).not.toContainText('Loaded');
  });
});

/**
 * The project context bar is the proof that `$lib/projects` works against a real browser's
 * IndexedDB: unit tests run against an in-memory implementation, and "survives a reload" is a
 * claim only a browser can settle. Each test starts from a cleared origin so one run cannot
 * inherit another's projects.
 */
test.describe('workshop projects', () => {
  test.beforeEach(async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
  });

  const projectContext = (page: Page) => page.locator('section.project-context');

  async function createProject(page: Page, name: string): Promise<void> {
    await projectContext(page).getByLabel('New project').fill(name);
    await projectContext(page).getByRole('button', { name: 'Create project' }).click();
  }

  test('creates, renames, and deletes projects, and the set survives a reload', async ({
    page,
  }) => {
    await expect(page.getByText('No project yet. Create one to start building.')).toBeVisible();

    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');
    await expect(projectContext(page).getByText('2 projects')).toBeVisible();

    // The bar opens what it creates, so the second project is the one on show.
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Dolmenwood');

    await projectContext(page).getByLabel('Name').fill('Dolmenwood Revised');
    await projectContext(page).getByRole('button', { name: 'Rename' }).click();
    // The option list is redrawn from what the bar re-read after the write committed, so the new
    // name appearing there is the signal that the database has it. A click only says the handler
    // started, and reloading on that would race the transaction.
    await expect(
      projectContext(page).getByRole('option', { name: 'Dolmenwood Revised' }),
    ).toHaveCount(1);

    await page.reload({ waitUntil: 'load' });
    await expect(projectContext(page).getByText('2 projects')).toBeVisible();
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Dolmenwood Revised');

    await projectContext(page).getByRole('button', { name: 'Delete project' }).click();
    await expect(projectContext(page).getByText('1 project', { exact: true })).toBeVisible();

    await page.reload({ waitUntil: 'load' });
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Ashfall');
  });

  test('opens exactly one project at a time, and that survives a reload', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');

    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Ashfall' });
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Ashfall');

    // Ashfall is the older project, so if the selection had not persisted the workshop would
    // reopen Dolmenwood — the most recently updated one — instead.
    await page.reload({ waitUntil: 'load' });
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Ashfall');
    await expect(projectContext(page).getByRole('option', { selected: true })).toHaveText(
      'Ashfall',
    );
  });
});

/**
 * Legacy adoption (#34), proved end to end against data the site itself wrote.
 *
 * The unit tests cover the library against real generator output; what only a browser can settle is
 * the wiring — that adoption actually runs on a page load, against a real localStorage, and leaves
 * a note where a user will see it. So this test does not seed a fixture: it saves a culture through
 * the old Save button, which is exactly what is sitting in returning users' browsers, and then goes
 * to the workshop.
 */
test.describe('legacy save adoption', () => {
  const CULTURE_SCOPE_KEY = 'ironarachne.save.v1.generator.culture';

  async function savedLegacyCultureName(page: Page): Promise<string> {
    return page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      const payload = JSON.parse(raw ?? '{}') as { cultures?: { name: string }[] };
      return payload.cultures?.[0]?.name ?? '';
    }, CULTURE_SCOPE_KEY);
  }

  /**
   * The adopted artifacts, read out of the vault database itself.
   *
   * Straight from IndexedDB rather than through the library, because what this suite is for is the
   * half a unit test cannot reach: that a real browser's database holds the records after a real
   * page load.
   */
  async function adoptedArtifactNames(page: Page): Promise<string[]> {
    return page.evaluate(async () => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('ironarachne.vault');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        if (!database.objectStoreNames.contains('artifacts')) {
          return [];
        }
        return await new Promise<string[]>((resolve, reject) => {
          const request = database.transaction('artifacts').objectStore('artifacts').getAll();
          request.onsuccess = () =>
            resolve((request.result as { name: string }[]).map((record) => record.name));
          request.onerror = () => reject(request.error);
        });
      } finally {
        database.close();
      }
    });
  }

  test('adopts a culture saved the old way, and says so in the project bar', async ({ page }) => {
    await visitRoute(page, '/culture', { title: 'Culture Generator | Iron Arachne' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });

    // Saved through the real button, so what lands in `generator.culture` is a real snapshot.
    await page.getByRole('button', { name: 'Save Current Culture' }).click();
    const savedName = await savedLegacyCultureName(page);
    expect(savedName).not.toBe('');

    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });

    // The count is interpolated as its own text node, so this matches on the whole notice rather
    // than on a text node — `toContainText` walks the children the message is spread across.
    const notice = page.getByRole('status');
    await expect(notice).toContainText('1 item you saved before projects existed is now in');
    await expect(notice).toContainText('My Setting');
    await expect(page.locator('section.project-context').getByLabel('Name')).toHaveValue(
      'My Setting',
    );
    expect(await adoptedArtifactNames(page)).toEqual([savedName]);

    // The originals are the fallback and must survive adoption untouched.
    expect(await savedLegacyCultureName(page)).toBe(savedName);
  });

  test('does not adopt the same culture twice, and the note can be dismissed', async ({ page }) => {
    await visitRoute(page, '/culture', { title: 'Culture Generator | Iron Arachne' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await page.getByRole('button', { name: 'Save Current Culture' }).click();
    const savedName = await savedLegacyCultureName(page);

    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    const projectContext = page.locator('section.project-context');
    await expect(page.getByRole('status')).toContainText('1 item you saved');

    await projectContext.getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByRole('status')).toBeHidden();

    // A reload runs adoption again. One artifact, one project, and the note stays dismissed.
    await page.reload({ waitUntil: 'load' });
    await expect(projectContext.getByText('1 project', { exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toBeHidden();
    expect(await adoptedArtifactNames(page)).toEqual([savedName]);
  });

  test('leaves a browser with nothing saved alone', async ({ page }) => {
    await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });

    await expect(page.getByText('No project yet. Create one to start building.')).toBeVisible();
    expect(await adoptedArtifactNames(page)).toEqual([]);
  });
});
