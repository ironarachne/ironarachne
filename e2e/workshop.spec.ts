import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';
import { expectInteractiveControlsReachable, expectNoHorizontalOverflow } from './mobile_layout';

const projectContext = (page: Page) => page.locator('section.project-context');
const projectView = (page: Page) => page.locator('section.project-view');
const toolBrowser = (page: Page) => page.locator('section.tool-browser');
const panels = (page: Page) => page.locator('section.workshop-panel');
const panelTitles = (page: Page) => page.locator('.workshop-panel__title');

async function openWorkshop(page: Page): Promise<void> {
  await visitRoute(page, '/workshop', { title: 'Workshop | Iron Arachne' });
}

/** A workshop with nothing in it: each test starts from an origin no other run has touched. */
async function openEmptyWorkshop(page: Page): Promise<void> {
  await openWorkshop(page);
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('ironarachne.vault');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      }),
  );
  await page.reload({ waitUntil: 'load' });
}

async function createProject(page: Page, name: string): Promise<void> {
  await projectContext(page).getByLabel('New project').fill(name);
  await projectContext(page).getByRole('button', { name: 'Create project' }).click();
  await expect(projectContext(page).getByLabel('Name')).toHaveValue(name);
}

function mountTool(page: Page, label: string | RegExp) {
  return toolBrowser(page).getByRole('button', { name: label }).click();
}

/**
 * The bench as the database holds it.
 *
 * Read straight from IndexedDB rather than from the page, because the workshop deliberately does
 * not await the write that stores an arrangement — a bench is not work, and blocking a panel from
 * opening on a round trip would make the workshop feel broken. That makes "the record has landed"
 * the only sound thing to wait on before reloading; a click only says the handler started.
 */
async function storedPanels(page: Page): Promise<{ toolPath?: string; artifactId?: string }[]> {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('ironarachne.vault');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      if (!database.objectStoreNames.contains('workspaces')) {
        return [];
      }
      const records = await new Promise<{ value: { panels: { order: number }[] } }[]>(
        (resolve, reject) => {
          const request = database.transaction('workspaces').objectStore('workspaces').getAll();
          request.onsuccess = () =>
            resolve(request.result as { value: { panels: { order: number }[] } }[]);
          request.onerror = () => reject(request.error);
        },
      );
      return records.flatMap((record) =>
        [...record.value.panels].sort((a, b) => a.order - b.order),
      );
    } finally {
      database.close();
    }
  });
}

/**
 * The workshop shell: what is on the bench, and the controls that put it there and take it away.
 *
 * The assertions name tools rather than positions in the catalog wherever a name is what the user
 * would use, and the tools named are ones with an artifact kind, since those are the ones the rest
 * of the suite goes on to save from.
 */
test.describe('the workshop bench', () => {
  test.beforeEach(async ({ page }) => {
    await openEmptyWorkshop(page);
  });

  test('starts empty and mounts a tool when one is picked', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Workshop' })).toBeVisible();
    await expect(page.getByText('Nothing on the bench.')).toBeVisible();

    await mountTool(page, /^Culture/);

    await expect(panels(page)).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Culture Generator' })).toBeVisible();
    // The browser badges what is mounted, which is how a user tells the two lists apart.
    await expect(toolBrowser(page).getByRole('button', { name: /^Culture/ })).toContainText(
      'Loaded',
    );
  });

  test('holds several tools at once, which is the point of a bench', async ({ page }) => {
    await mountTool(page, /^Culture/);
    await mountTool(page, /^Heraldry/);

    await expect(panels(page)).toHaveCount(2);
    await expect(panelTitles(page)).toHaveText([/Culture/, /Heraldry/]);
  });

  test('does not mount a second copy of a tool already on the bench', async ({ page }) => {
    await mountTool(page, /^Culture/);
    await mountTool(page, /^Culture/);

    await expect(panels(page)).toHaveCount(1);
  });

  test('moves and closes panels from the keyboard-operable controls', async ({ page }) => {
    await mountTool(page, /^Culture/);
    await mountTool(page, /^Heraldry/);

    await page.getByRole('button', { name: /^Move Heraldry left$/ }).click();
    await expect(panelTitles(page)).toHaveText([/Heraldry/, /Culture/]);

    // The leftmost panel has nowhere further to go, and says so rather than wrapping around.
    await expect(page.getByRole('button', { name: /^Move Heraldry left$/ })).toBeDisabled();

    await page.getByRole('button', { name: /^Close Heraldry$/ }).click();
    await expect(panels(page)).toHaveCount(1);
    await expect(panelTitles(page)).toHaveText([/Culture/]);
  });

  test('restores the bench when the project is reopened', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await mountTool(page, /^Culture/);
    await mountTool(page, /^Heraldry/);

    await expect
      .poll(async () => (await storedPanels(page)).map((panel) => panel.toolPath))
      .toEqual(['/culture', '/heraldry']);

    await page.reload({ waitUntil: 'load' });

    await expect(panels(page)).toHaveCount(2);
    await expect(panelTitles(page)).toHaveText([/Culture/, /Heraldry/]);
  });

  test('keeps one project’s bench out of another’s', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await mountTool(page, /^Culture/);
    await expect.poll(async () => (await storedPanels(page)).length).toBe(1);

    await createProject(page, 'Dolmenwood');
    // A project with no bench of its own adopts what is in front of the user rather than sweeping
    // it away, so closing the panel is what proves the two benches are separate.
    await page.getByRole('button', { name: /^Close Culture$/ }).click();
    await expect(panels(page)).toHaveCount(0);

    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Ashfall' });
    await expect(panels(page)).toHaveCount(1);
    await expect(panelTitles(page)).toHaveText([/Culture/]);
  });
});

/**
 * The bench at phone width.
 *
 * `pages.mobile.spec.ts` visits `/workshop` at every width in the manifest, but it visits it
 * empty — and an empty bench is the one arrangement that cannot overflow. Two panels side by side
 * is the layout this issue actually added, so it is checked with something on it.
 */
test.describe('the bench on a phone', () => {
  test('fits a 320px screen with two panels on it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openEmptyWorkshop(page);

    await mountTool(page, /^Culture/);
    await mountTool(page, /^Heraldry/);
    await expect(panels(page)).toHaveCount(2);

    await expectNoHorizontalOverflow(page);
    await expectInteractiveControlsReachable(page);
  });
});

/**
 * The acceptance path from #36, end to end: open a project, use a tool in a panel, save what it
 * made, and find it in the project view after a reload.
 *
 * It runs against the real culture generator rather than a fixture, because what is being proved
 * is the wiring between a generator, the kind registry, and the store — the part no unit test can
 * reach.
 */
test.describe('saving what a tool made', () => {
  test.beforeEach(async ({ page }) => {
    await openEmptyWorkshop(page);
  });

  async function saveTheCulture(page: Page, name: string): Promise<void> {
    await panels(page).getByRole('button', { name: 'Save to project' }).click();
    await page.getByLabel('Name', { exact: true }).last().fill(name);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  test('saves a generated culture into the open project and lists it there', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await mountTool(page, /^Culture/);
    await expect(page.getByRole('heading', { level: 1, name: 'Culture Generator' })).toBeVisible();

    await saveTheCulture(page, 'The Emberfolk');

    await expect(projectView(page).getByRole('button', { name: /^The Emberfolk/ })).toBeVisible();
    await expect(projectView(page).getByText('1 artifact', { exact: true })).toBeVisible();

    await page.reload({ waitUntil: 'load' });
    await expect(projectView(page).getByRole('button', { name: /^The Emberfolk/ })).toBeVisible();
  });

  test('opens a saved artifact in a panel of its own', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await mountTool(page, /^Culture/);
    await saveTheCulture(page, 'The Emberfolk');
    await expect(projectView(page).getByRole('button', { name: /^The Emberfolk/ })).toBeVisible();

    await projectView(page)
      .getByRole('button', { name: /^The Emberfolk/ })
      .click();

    await expect(panelTitles(page)).toHaveText([/Culture/, /The Emberfolk/]);
    const artifactPanel = page.locator('.artifact-panel');
    await expect(artifactPanel.getByLabel('Name')).toHaveValue('The Emberfolk');
    // Provenance is what makes a saved artifact traceable back to what rolled it.
    await expect(artifactPanel).toContainText('/culture');
  });

  test('filters a project’s contents by name', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await mountTool(page, /^Culture/);
    await saveTheCulture(page, 'The Emberfolk');
    await panels(page).getByRole('button', { name: 'Generate' }).click();
    await saveTheCulture(page, 'The Saltmarch');
    await expect(projectView(page).getByText('2 artifacts')).toBeVisible();

    await projectView(page).getByLabel('Find').fill('salt');

    await expect(projectView(page).getByText('1 of 2 artifacts')).toBeVisible();
    await expect(projectView(page).getByRole('button', { name: /^The Saltmarch/ })).toBeVisible();
    await expect(projectView(page).getByRole('button', { name: /^The Emberfolk/ })).toBeHidden();
  });

  test('prompts for a project when a tool is used on its own route', async ({ page }) => {
    await visitRoute(page, '/culture', { title: 'Culture Generator | Iron Arachne' });

    await page.getByRole('button', { name: 'Save to project' }).click();
    // With nothing to save into, the prompt offers to make somewhere rather than refusing.
    await page.getByLabel('New project name').fill('Ashfall');
    await page.getByLabel('Name', { exact: true }).fill('The Emberfolk');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText(/Saved “The Emberfolk” to Ashfall\./)).toBeVisible();

    await openWorkshop(page);
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('Ashfall');
    await expect(projectView(page).getByRole('button', { name: /^The Emberfolk/ })).toBeVisible();
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
    await openWorkshop(page);
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });
  });

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

    await openWorkshop(page);

    // The count is interpolated as its own text node, so this matches on the whole notice rather
    // than on a text node — `toContainText` walks the children the message is spread across.
    const notice = page.getByRole('status');
    await expect(notice).toContainText('1 item you saved before projects existed is now in');
    await expect(notice).toContainText('My Setting');
    await expect(projectContext(page).getByLabel('Name')).toHaveValue('My Setting');
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

    await openWorkshop(page);
    await expect(page.getByRole('status')).toContainText('1 item you saved');

    await projectContext(page).getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByRole('status')).toBeHidden();

    // A reload runs adoption again. One artifact, one project, and the note stays dismissed.
    await page.reload({ waitUntil: 'load' });
    await expect(projectContext(page).getByText('1 project', { exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toBeHidden();
    expect(await adoptedArtifactNames(page)).toEqual([savedName]);
  });

  test('leaves a browser with nothing saved alone', async ({ page }) => {
    await openEmptyWorkshop(page);

    await expect(page.getByText('No project yet. Create one to start building.')).toBeVisible();
    expect(await adoptedArtifactNames(page)).toEqual([]);
  });
});
