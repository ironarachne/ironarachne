import { expect, test, type Page } from '@playwright/test';
import { visitRoute } from './helpers';
import { expectInteractiveControlsReachable, expectNoHorizontalOverflow } from './mobile_layout';
import {
  createProject,
  deleteProject,
  expectOpenProject,
  expectProjectCount,
  onProjectsPage,
  renameProject,
} from './projects';

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

function mountTool(page: Page, label: string | RegExp) {
  return toolBrowser(page).getByRole('button', { name: label }).click();
}

/** A saved artifact's row in the project view, anchored so a row and its actions do not both match. */
function artifactRow(page: Page, name: string) {
  return projectView(page).getByRole('button', { name: new RegExp(`^${name}( |$)`) });
}

/**
 * Mounts the culture generator and keeps what it made, under a name of its own.
 *
 * Module scope because three describes need it. It leaves the Culture tool on the bench, which is
 * what callers wanting a tool *and* an artifact open rely on.
 */
async function saveACulture(page: Page, name: string): Promise<void> {
  await mountTool(page, /^Culture/);
  const saveArtifact = panels(page)
    .filter({ has: page.getByRole('heading', { name: /Culture Generator/ }) })
    .locator('.save-artifact');
  await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
  await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
  await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(artifactRow(page, name)).toBeVisible();
}

/**
 * A bench holding the Culture tool and one saved artifact — two panels, which is what the panel
 * controls need now that two tools cannot be open together.
 */
async function benchWithToolAndArtifact(page: Page, name: string): Promise<void> {
  await createProject(page, 'Ashfall');
  await saveACulture(page, name);
  await artifactRow(page, name).click();
  await expect(panels(page)).toHaveCount(2);
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

  test('holds one tool at a time, swapping the last one out', async ({ page }) => {
    await mountTool(page, /^Culture/);
    await mountTool(page, /^Heraldry/);

    await expect(panels(page)).toHaveCount(1);
    await expect(panelTitles(page)).toHaveText([/Heraldry/]);

    // The browser badges what is mounted, so the badge has to move with the tool rather than
    // accumulating on everything that was ever opened.
    await expect(toolBrowser(page).getByRole('button', { name: /^Heraldry/ })).toContainText(
      'Loaded',
    );
    await expect(toolBrowser(page).getByRole('button', { name: /^Culture/ })).not.toContainText(
      'Loaded',
    );
  });

  test('keeps open artifacts when the tool is swapped', async ({ page }) => {
    // What is single is the instrument. A settlement stays open beside whichever generator is
    // being built from it, which is the composition case docs/workshop.md argues for.
    await benchWithToolAndArtifact(page, 'The Emberfolk');

    await mountTool(page, /^Heraldry/);

    await expect(panels(page)).toHaveCount(2);
    await expect(panelTitles(page)).toHaveText([/The Emberfolk/, /Heraldry/]);
  });

  test('does not mount a second copy of a tool already on the bench', async ({ page }) => {
    await mountTool(page, /^Culture/);
    await mountTool(page, /^Culture/);

    await expect(panels(page)).toHaveCount(1);
  });

  test('swaps tools without asking when nothing was worked for', async ({ page }) => {
    // A generator rolls on mount, so "has output" is true from the first frame. Asking here would
    // be the always-confirm that trains people to click through the prompt that matters.
    await mountTool(page, /^Culture/);
    await mountTool(page, /^Heraldry/);

    // The dialog element is always in the DOM; ModalHost opens and closes it, so "not asked"
    // is hidden rather than absent.
    await expect(page.locator('dialog.ironarachne-modal')).toBeHidden();
    await expect(panelTitles(page)).toHaveText([/Heraldry/]);
  });

  test('asks before swapping away a tool the user rolled again', async ({ page }) => {
    await mountTool(page, /^Culture/);

    // A deliberate re-roll is the thing worth protecting: it is output that took a decision, and
    // switching tools would drop it with nothing to get it back from.
    const culture = panels(page).filter({
      has: page.getByRole('heading', { name: /Culture Generator/ }),
    });
    await culture.getByRole('button', { name: 'Generate', exact: true }).click();

    await mountTool(page, /^Heraldry/);

    const dialog = page.locator('dialog.ironarachne-modal');
    await expect(dialog).toContainText('you have not saved');

    // Refusing leaves the bench exactly as it was.
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(panelTitles(page)).toHaveText([/Culture/]);

    await mountTool(page, /^Heraldry/);
    await dialog.getByRole('button', { name: 'Switch' }).click();
    await expect(panelTitles(page)).toHaveText([/Heraldry/]);
  });

  test('does not ask about a tool whose output was saved', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');

    await mountTool(page, /^Heraldry/);

    // The dialog element is always in the DOM; ModalHost opens and closes it, so "not asked"
    // is hidden rather than absent.
    await expect(page.locator('dialog.ironarachne-modal')).toBeHidden();
    await expect(panelTitles(page)).toHaveText([/Heraldry/]);
  });

  test('moves and closes panels from the keyboard-operable controls', async ({ page }) => {
    // A tool and an artifact, since two tools can no longer be open together.
    await benchWithToolAndArtifact(page, 'The Emberfolk');
    await expect(panelTitles(page)).toHaveText([/Culture/, /The Emberfolk/]);

    await page.getByRole('button', { name: /^Move The Emberfolk left$/ }).click();
    await expect(panelTitles(page)).toHaveText([/The Emberfolk/, /Culture/]);

    // The leftmost panel has nowhere further to go, and says so rather than wrapping around.
    await expect(page.getByRole('button', { name: /^Move The Emberfolk left$/ })).toBeDisabled();

    await page.getByRole('button', { name: /^Close The Emberfolk$/ }).click();
    await expect(panels(page)).toHaveCount(1);
    await expect(panelTitles(page)).toHaveText([/Culture/]);
  });

  test('restores the bench when the project is reopened', async ({ page }) => {
    await benchWithToolAndArtifact(page, 'The Emberfolk');

    await expect
      .poll(async () => (await storedPanels(page)).map((panel) => panel.toolPath))
      .toEqual(['/culture', undefined]);

    await page.reload({ waitUntil: 'load' });

    await expect(panels(page)).toHaveCount(2);
    await expect(panelTitles(page)).toHaveText([/Culture/, /The Emberfolk/]);
  });

  test('keeps one project’s bench out of another’s', async ({ page }) => {
    // Both projects up front, then switched between with the bench's own control. Creating a
    // project is a trip to /projects now, and coming back is a fresh page — so this switches with
    // the switcher, which is the only way a bench changes project without reloading.
    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');

    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Ashfall' });
    await mountTool(page, /^Culture/);
    await expect.poll(async () => (await storedPanels(page)).length).toBe(1);

    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Dolmenwood' });
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

    // A tool and an artifact: the two-panel arrangement that is still reachable.
    await benchWithToolAndArtifact(page, 'The Emberfolk');

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
    await expect(artifactPanel.getByLabel('Name', { exact: true })).toHaveValue('The Emberfolk');
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
    await expectOpenProject(page, 'Ashfall');
    await expect(projectView(page).getByRole('button', { name: /^The Emberfolk/ })).toBeVisible();
  });
});

/**
 * Composition (#37), end to end: one generator takes a saved artifact from another, the link is
 * recorded, and it is visible from both ends.
 *
 * This is the half no unit test can reach. The picker reads the open project, the kind registry
 * decides what it offers, and the codec that rebuilds the choice is a dynamic import — so what is
 * being proved here is that a real browser can go from "save a culture" to "a religion built from
 * it" without either generator knowing the other exists.
 */
test.describe('building one artifact from another', () => {
  const artifactPanel = (page: Page) => page.locator('.artifact-panel');
  const confirmDialog = (page: Page) => page.locator('dialog.ironarachne-modal');

  test.beforeEach(async ({ page }) => {
    await openEmptyWorkshop(page);
    await createProject(page, 'Ashfall');
  });

  /**
   * An artifact's row in the project view, by name.
   *
   * The trailing boundary matters: a row's accessible name picks up the badges beside it — "Open",
   * "Broken link" — so an anchored exact match would stop finding a row the moment it acquired one,
   * and a bare prefix would find "The Emberfolk" when asked for "The Ember".
   */
  /** Saves whatever the named panel has made, under a name of its own. */
  async function saveFromPanel(page: Page, panelTitle: RegExp, name: string): Promise<void> {
    const panel = panels(page).filter({ has: page.getByRole('heading', { name: panelTitle }) });
    // Scoped to the save control rather than the panel: a generator page carries controls of its
    // own, and "Save" should not have to be unique across a whole tool for this to find the right
    // button.
    const saveArtifact = panel.locator('.save-artifact');
    await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
    await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(artifactRow(page, name)).toBeVisible();
  }

  /** A culture, then a religion built from it through the shared picker. */
  async function buildAReligionFromACulture(page: Page): Promise<void> {
    await mountTool(page, /^Culture/);
    await saveFromPanel(page, /Culture Generator/, 'The Emberfolk');

    await mountTool(page, /^Fantasy Religion/);
    const religionPanel = panels(page).filter({
      has: page.getByRole('heading', { name: /Religion Generator/ }),
    });
    // The offer only appears because the project holds a culture: a picker with nothing to offer
    // shows nothing at all.
    await religionPanel.getByLabel('Use a saved culture for naming?').check();
    await religionPanel
      .getByLabel('Saved culture', { exact: true })
      .selectOption({ label: 'The Emberfolk' });
    await religionPanel.getByRole('button', { name: 'Generate' }).click();
    // The generator says outright whose tongue the gods are named in, and names the culture's own
    // name — which is what it was handed, not the name the artifact happens to be filed under.
    await expect(religionPanel.getByText(/^Named from the saved culture /)).toBeVisible();
    await saveFromPanel(page, /Religion Generator/, 'The Ember');
  }

  test('records the culture a religion was built from, and shows it from both ends', async ({
    page,
  }) => {
    await buildAReligionFromACulture(page);

    await artifactRow(page, 'The Ember').click();
    // The role is what makes the link legible: "naming culture", not "a culture".
    await expect(artifactPanel(page).filter({ hasText: 'Built from' })).toContainText(
      'Naming culture',
    );
    await expect(artifactPanel(page).filter({ hasText: 'Built from' })).toContainText(
      'The Emberfolk',
    );

    // And from the other end, which is the question a user actually asks of a culture.
    await artifactRow(page, 'The Emberfolk').click();
    await expect(artifactPanel(page).filter({ hasText: 'Used by' })).toContainText('The Ember');

    await page.reload({ waitUntil: 'load' });
    await expect(artifactRow(page, 'The Ember')).toBeVisible();
  });

  test('names what a delete will break, deletes anyway, and shows the break', async ({ page }) => {
    await buildAReligionFromACulture(page);

    await projectView(page).getByRole('button', { name: 'Delete The Emberfolk' }).click();

    // The prompt is the whole point of the settled policy: the user is told what they are about to
    // leave pointing at nothing, and then allowed to do it.
    await expect(confirmDialog(page)).toContainText('The Ember');
    await expect(confirmDialog(page)).toContainText('left pointing at something that is gone');
    await confirmDialog(page).getByRole('button', { name: 'Delete' }).click();

    await expect(artifactRow(page, 'The Emberfolk')).toBeHidden();
    // The religion survives its input being deleted, and says so where the user meets it.
    await expect(projectView(page).getByText('Broken link')).toBeVisible();

    await artifactRow(page, 'The Ember').click();
    await expect(artifactPanel(page).filter({ hasText: 'Built from' })).toContainText('missing');
  });

  /**
   * The other direction, and the one #40 turns on: a culture built around a saved religion keeps
   * no religion of its own. The proof that it is a link rather than a copy is that renaming the
   * religion changes what the culture shows, and that the culture's editor has no religion fields
   * to offer — there is nothing there to edit.
   */
  test('builds a culture around a saved religion, holding a link rather than a copy', async ({
    page,
  }) => {
    await mountTool(page, /^Fantasy Religion/);
    await saveFromPanel(page, /Religion Generator/, 'The Ember');

    await mountTool(page, /^Culture/);
    const culturePanel = panels(page).filter({
      has: page.getByRole('heading', { name: /Culture Generator/ }),
    });
    await culturePanel.getByLabel('Use a saved religion?').check();
    await culturePanel
      .getByLabel('Saved religion', { exact: true })
      .selectOption({ label: 'The Ember' });
    await culturePanel.getByRole('button', { name: 'Generate' }).click();
    // The generator says outright that this culture's faith is borrowed. It names the religion's
    // own name, which is what the payload carries — not the name the artifact was filed under.
    await expect(culturePanel.getByText(/^From the saved religion /)).toBeVisible();
    await saveFromPanel(page, /Culture Generator/, 'The Emberfolk');

    await artifactRow(page, 'The Emberfolk').click();
    const savedCulture = artifactPanel(page);
    await expect(savedCulture.filter({ hasText: 'Built from' })).toContainText('Religion');
    await expect(savedCulture.filter({ hasText: 'Built from' })).toContainText('The Ember');
    // No copy to edit: the payload carries no religion, so the editor offers none.
    await expect(savedCulture.getByLabel('Religion name')).toHaveCount(0);
    await expect(savedCulture.getByText('linked above')).toBeVisible();

    // Renaming the religion is reflected wherever it is referenced, which is what a link buys.
    await artifactRow(page, 'The Ember').click();
    const savedReligion = panels(page)
      .filter({ has: page.getByRole('heading', { name: 'The Ember Artifact', exact: true }) })
      .locator('.artifact-panel');
    // Named exactly, and with the "Artifact" the panel heading carries: "The Ember" is a prefix of
    // "The Emberfolk", and a panel of the wrong artifact would let the rest of this pass while
    // proving nothing.
    await expect(savedReligion).toContainText('Religion');
    await savedReligion.getByLabel('Name', { exact: true }).fill('The Ashen Path');
    await savedReligion.getByRole('button', { name: 'Save changes' }).click();

    await expect(savedCulture.filter({ hasText: 'Built from' })).toContainText('The Ashen Path');
  });

  /**
   * Two references of different kinds on one artifact (#20), and the reason `role` is required.
   *
   * A settlement takes a culture as an *input* — the tongue its town, organizations, and people
   * are named in — and records a religion as the faith practised there. Both are links by id, and
   * a picker that recorded only "a culture" and "a religion" would leave the panel unable to say
   * which was which.
   */
  test('builds a settlement from a saved culture and a saved religion', async ({ page }) => {
    await mountTool(page, /^Culture/);
    await saveFromPanel(page, /Culture Generator/, 'The Emberfolk');
    await mountTool(page, /^Fantasy Religion/);
    await saveFromPanel(page, /Religion Generator/, 'The Ember');

    await mountTool(page, /^Settlement/);
    const settlementPanel = panels(page).filter({
      has: page.getByRole('heading', { name: /Settlement Generator/ }),
    });
    await settlementPanel.getByLabel('Use a saved culture for all names').check();
    await settlementPanel
      .getByLabel('Saved culture', { exact: true })
      .selectOption({ label: 'The Emberfolk' });
    await settlementPanel.getByLabel('Record a saved religion as the local faith?').check();
    await settlementPanel
      .getByLabel('Saved religion', { exact: true })
      .selectOption({ label: 'The Ember' });
    await settlementPanel.getByRole('button', { name: 'Generate' }).click();

    // The page says outright where the names came from and whose faith is kept here. Both name the
    // referenced artifact's own name, which is what was handed over.
    await expect(settlementPanel.getByText(/^Naming: /)).toBeVisible();
    await expect(settlementPanel.getByText(/^From the saved religion /)).toBeVisible();
    await saveFromPanel(page, /Settlement Generator/, 'White Ridge');

    await artifactRow(page, 'White Ridge').click();
    const saved = page.locator('.artifact-panel').filter({ hasText: 'Built from' });
    await expect(saved).toContainText('Naming culture');
    await expect(saved).toContainText('The Emberfolk');
    await expect(saved).toContainText('Faith');
    await expect(saved).toContainText('The Ember');

    // And from the other end, which is the question a user asks of a religion they wrote.
    await artifactRow(page, 'The Ember').click();
    await expect(page.locator('.artifact-panel').filter({ hasText: 'Used by' })).toContainText(
      'White Ridge',
    );
  });

  /** Requirement 5.3: composition is opt-in, and a settlement handed nothing records nothing. */
  test('saves a settlement with no references when it was offered none', async ({ page }) => {
    await mountTool(page, /^Settlement/);
    await saveFromPanel(page, /Settlement Generator/, 'Oakhollow');

    await artifactRow(page, 'Oakhollow').click();
    await expect(page.locator('.artifact-panel').filter({ hasText: 'Built from' })).toHaveCount(0);
  });
});

/**
 * Editing (#39), end to end: the generic surface an artifact opens in, and the lifecycle around
 * what a kind plugs into it.
 *
 * Culture is the one kind with an editing component (#40); heraldry is the standing example of a
 * kind without one, which is the ordinary state for most of the site. Both are exercised here, so
 * what a browser settles is the framework itself: an artifact opens, changes, and keeps the change
 * across a reload; a kind with no editor opens read-only rather than breaking; and edits are not
 * lost quietly, whether the way out is the panel's close button or the site's own navigation.
 */
test.describe('editing a saved artifact', () => {
  const artifactPanel = (page: Page) => page.locator('.artifact-panel');
  const confirmDialog = (page: Page) => page.locator('dialog.ironarachne-modal');

  /** A project with one saved artifact of the named tool in it, open in a panel of its own. */
  async function openASavedArtifact(
    page: Page,
    tool: RegExp,
    name: string,
    project = 'Ashfall',
  ): Promise<void> {
    await createProject(page, project);
    await mountTool(page, tool);
    // Scoped to the save control: a generator page has fields of its own, and heraldry still
    // carries a per-generator save button beside the artifact one.
    const saveArtifact = panels(page).locator('.save-artifact');
    await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
    await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(artifactRow(page, name)).toBeVisible();

    await artifactRow(page, name).click();
    await expect(artifactPanel(page).getByLabel('Name', { exact: true })).toHaveValue(name);
  }

  /** A project with one saved culture in it, open in a panel of its own. */
  function openASavedCulture(page: Page, name: string): Promise<void> {
    return openASavedArtifact(page, /^Culture/, name);
  }

  /**
   * A project with one saved religion in it — one that has gods — open in a panel of its own.
   *
   * Every category but polytheism is unticked first, because a religion drawn from the whole table
   * may be animist and have no pantheon at all. What is being tested here is editing a list of
   * sub-objects, so the religion has to have the list.
   */
  async function openASavedReligion(page: Page, name: string): Promise<void> {
    await createProject(page, 'Ashfall');
    await mountTool(page, /^Fantasy Religion/);
    const generator = panels(page).filter({
      has: page.getByRole('heading', { name: /Religion Generator/ }),
    });
    for (const category of ['monotheism', 'animism', 'totemism', 'ancestor worship', 'shamanism']) {
      await generator.getByLabel(category, { exact: true }).uncheck();
    }
    await generator.getByRole('button', { name: 'Generate' }).click();

    const saveArtifact = generator.locator('.save-artifact');
    await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
    await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(artifactRow(page, name)).toBeVisible();

    await artifactRow(page, name).click();
    await expect(artifactPanel(page).getByLabel('Name', { exact: true })).toHaveValue(name);
  }

  /**
   * A project with one saved settlement in it — an enriched one — open in a panel of its own.
   *
   * Enrichment is ticked on first because it is the half of this kind worth editing: a settlement
   * rolled plain has a name and a description, where one with problems and notables has the lists
   * that requirement 4.4 is about. The size filter is forced large so notables and organizations
   * have a place big enough to appear in.
   */
  async function openASavedSettlement(page: Page, name: string): Promise<void> {
    await createProject(page, 'Ashfall');
    await mountTool(page, /^Settlement/);
    const generator = panels(page).filter({
      has: page.getByRole('heading', { name: /Settlement Generator/ }),
    });
    await generator.getByLabel('Size class filter').selectOption('large');
    await generator.getByLabel('Trade (imports / exports / blurb)').check();
    await generator.getByLabel('Acute and creeping problems').check();
    await generator.getByLabel(/^Important characters/).check();
    await generator.getByRole('button', { name: 'Generate' }).click();

    const saveArtifact = generator.locator('.save-artifact');
    await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact.getByLabel('Name', { exact: true }).fill(name);
    await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(artifactRow(page, name)).toBeVisible();

    await artifactRow(page, name).click();
    await expect(artifactPanel(page).getByLabel('Name', { exact: true })).toHaveValue(name);
  }

  test.beforeEach(async ({ page }) => {
    await openEmptyWorkshop(page);
  });

  /**
   * An editing form is where a mobile layout is easiest to get wrong, and the manifest sweep
   * visits `/workshop` with nothing on the bench — the one arrangement that cannot overflow. So
   * the narrowest screen the site supports is checked with an artifact actually open on it.
   */
  test('fits a 320px screen with an artifact open on it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openASavedCulture(page, 'The Emberfolk');
    // The culture editor, not a collapsed summary: a form of labelled text fields and textareas is
    // where a narrow layout actually goes wrong (requirement 6.1).
    await expect(artifactPanel(page).getByLabel('Culture name')).toBeVisible();

    await expectNoHorizontalOverflow(page);
    await expectInteractiveControlsReachable(page);
  });

  /**
   * The same at the other end of the range of editors: a religion's form is nested — fieldsets of
   * dimensions, realms, and a god per block — which is where a narrow layout gives out if it is
   * going to (requirement 6.1).
   */
  test('fits a 320px screen with a religion’s pantheon open on it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openASavedReligion(page, 'The Ember');
    await expect(
      artifactPanel(page).getByRole('textbox', { name: 'Deity 1 name', exact: true }),
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
    await expectInteractiveControlsReachable(page);
  });

  test('changes a saved artifact, and the change survives a reload', async ({ page }) => {
    await openASavedCulture(page, 'The Emberfolk');
    const panel = artifactPanel(page);

    // Nothing has been touched, so there is nothing to write.
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await panel.getByLabel('Name', { exact: true }).fill('The Saltmarch');
    await expect(panel.getByText('Unsaved changes.')).toBeVisible();
    await panel.getByRole('button', { name: 'Save changes' }).click();

    await expect(panel.getByText('Saved.')).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    // The project view is reading the same store, so the edit is visible where the user browses.
    await expect(artifactRow(page, 'The Saltmarch')).toBeVisible();

    // The bench write is deliberately not awaited, so wait for the record rather than the click.
    await expect
      .poll(async () =>
        (await storedPanels(page)).some((stored) => stored.artifactId !== undefined),
      )
      .toBe(true);
    await page.reload({ waitUntil: 'load' });

    await expect(artifactPanel(page).getByLabel('Name', { exact: true })).toHaveValue(
      'The Saltmarch',
    );
  });

  test('opens a kind with no editor read-only, and offers nothing destructive', async ({
    page,
  }) => {
    // Heraldry is the standing example of a kind that stores artifacts long before anything can
    // edit them. It draws itself (requirement 6.3) without having an editing view (4.1), and the
    // panel has to tell those two apart.
    await openASavedArtifact(page, /^Heraldry/, 'Emberhold arms');
    const panel = artifactPanel(page);

    // The arms, drawn — not a list of tincture names, which is what the generic view would give.
    // The direct child, because a charge is an SVG nested inside the device's own.
    await expect(panel.locator('.heraldry-artifact__device > svg')).toBeVisible();
    await expect(panel.locator('.heraldry-artifact__blazon')).not.toBeEmpty();
    await expect(panel.getByRole('alert')).toHaveCount(0);

    // Read-only all the same: nothing to save, and nothing that could overwrite the payload.
    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await expect(panel.getByRole('button', { name: 'Roll again' })).toHaveCount(0);
  });

  /**
   * The affordance `/saved-data` had and the project view did not (#44). Downloading a *saved*
   * coat of arms is not the same as downloading the one the generator happens to be showing, and
   * retiring that page without this would have taken a capability away from users.
   */
  test('downloads a saved coat of arms as SVG and as PNG', async ({ page }) => {
    await openASavedArtifact(page, /^Heraldry/, 'Emberhold arms');
    const panel = artifactPanel(page);

    const [svg] = await Promise.all([
      page.waitForEvent('download'),
      panel.getByRole('button', { name: 'Download SVG' }).click(),
    ]);
    expect(svg.suggestedFilename()).toMatch(/^heraldry-.+\.svg$/);

    const [png] = await Promise.all([
      page.waitForEvent('download'),
      panel.getByRole('button', { name: 'Download PNG' }).click(),
    ]);
    expect(png.suggestedFilename()).toMatch(/^heraldry-.+\.png$/);
    await expect(panel.getByRole('alert')).toHaveCount(0);
  });

  /**
   * Requirement 7.4, and the whole point of taking a tool to Release-ready: generate, save,
   * reopen, edit — with the edit landing in the payload rather than only on the label.
   */
  test('edits a saved culture’s contents, and the change survives a reload', async ({ page }) => {
    await openASavedCulture(page, 'The Emberfolk');
    const panel = artifactPanel(page);

    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await panel.getByLabel('Culture name').fill('The Saltmarch');
    await panel.getByLabel('Greetings').fill('They clasp forearms and say nothing.');
    await expect(panel.getByText('Unsaved changes.')).toBeVisible();

    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByText('Saved.')).toBeVisible();

    await expect
      .poll(async () =>
        (await storedPanels(page)).some((stored) => stored.artifactId !== undefined),
      )
      .toBe(true);
    await page.reload({ waitUntil: 'load' });

    await expect(artifactPanel(page).getByLabel('Culture name')).toHaveValue('The Saltmarch');
    await expect(artifactPanel(page).getByLabel('Greetings')).toHaveValue(
      'They clasp forearms and say nothing.',
    );
  });

  /** Requirement 4.4: one part changes and the rest of the payload does not move. */
  test('rewrites one taboo without disturbing the others', async ({ page }) => {
    await openASavedCulture(page, 'The Emberfolk');
    const panel = artifactPanel(page);

    // By role: the remove button beside each taboo carries "Remove taboo 2" as its label, which a
    // by-label lookup would match too.
    const taboo = (position: number) => panel.getByRole('textbox', { name: `Taboo ${position}` });
    const second = await taboo(2).inputValue();
    await taboo(1).fill('Speaking the old name aloud is forbidden.');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByText('Saved.')).toBeVisible();

    await expect(taboo(1)).toHaveValue('Speaking the old name aloud is forbidden.');
    await expect(taboo(2)).toHaveValue(second);
  });

  /**
   * Requirement 7.4 for religion (#41): generate, save, reopen, edit — where the edit lands inside
   * the pantheon rather than on a top-level field, because a list of sub-objects is the shape this
   * kind was chosen to test.
   */
  test('edits a saved religion’s pantheon, and the change survives a reload', async ({ page }) => {
    await openASavedReligion(page, 'The Ember');
    const panel = artifactPanel(page);

    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await panel.getByLabel('Religion name').fill('The Ashen Path');
    await panel.getByRole('textbox', { name: 'Deity 1 name', exact: true }).fill('Vethra');
    await panel.getByLabel('Deity 1 holy symbol').fill('a broken wheel');
    await expect(panel.getByText('Unsaved changes.')).toBeVisible();

    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByText('Saved.')).toBeVisible();
    // The project view reads the same store, and a religion's name is the name it is filed under.
    await expect(artifactRow(page, 'The Ember')).toBeVisible();

    await expect
      .poll(async () =>
        (await storedPanels(page)).some((stored) => stored.artifactId !== undefined),
      )
      .toBe(true);
    await page.reload({ waitUntil: 'load' });

    await expect(artifactPanel(page).getByLabel('Religion name')).toHaveValue('The Ashen Path');
    await expect(
      artifactPanel(page).getByRole('textbox', { name: 'Deity 1 name', exact: true }),
    ).toHaveValue('Vethra');
    await expect(artifactPanel(page).getByLabel('Deity 1 holy symbol')).toHaveValue(
      'a broken wheel',
    );
  });

  /**
   * Requirement 4.4, and the reason religion is one of the three tools: renaming one god must not
   * re-roll the pantheon around them.
   */
  test('renames one deity without re-rolling the pantheon', async ({ page }) => {
    await openASavedReligion(page, 'The Ember');
    const panel = artifactPanel(page);

    const deityName = (position: number) =>
      panel.getByRole('textbox', { name: `Deity ${position} name`, exact: true });
    const secondName = await deityName(2).inputValue();
    const secondDescription = await panel.getByLabel('Deity 2 description').inputValue();

    await deityName(1).fill('Vethra');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByText('Saved.')).toBeVisible();

    await expect(deityName(1)).toHaveValue('Vethra');
    await expect(deityName(2)).toHaveValue(secondName);
    await expect(panel.getByLabel('Deity 2 description')).toHaveValue(secondDescription);
  });

  /**
   * Requirement 4.3 for the second kind: a different roller, the same destructive confirmation.
   *
   * And requirement 2.2 for free, which is the more interesting half. A religion is reproducible
   * from its seed and the settings recorded beside it, so rolling one again from unchanged
   * provenance brings back the same gods — what the roll throws away is the *edits*, not the
   * religion. That there is a pantheon there at all is the roll reading the categories it was
   * saved with: falling back to the defaults could as easily have returned an animist tradition
   * with no gods in it.
   */
  test('warns before rolling a religion again, and rolls it when told to', async ({ page }) => {
    await openASavedReligion(page, 'The Ember');
    const panel = artifactPanel(page);
    const deity = panel.getByRole('textbox', { name: 'Deity 1 name', exact: true });
    const before = await deity.inputValue();

    await panel.getByLabel('Religion name').fill('An edit about to be thrown away.');
    await panel.getByRole('button', { name: 'Roll again' }).click();
    await expect(confirmDialog(page)).toContainText('unsaved changes go too');
    await confirmDialog(page).getByRole('button', { name: 'Roll again' }).click();

    await expect(panel.getByText('Rolled again from the original seed.')).toBeVisible();
    await expect(panel.getByLabel('Religion name')).not.toHaveValue(
      'An edit about to be thrown away.',
    );
    await expect(deity).toHaveValue(before);
  });

  /**
   * Requirement 4.3. Re-rolling is the one path that throws away what the user has, so it is
   * confirmed every time and says outright when there are unsaved edits in front of it.
   */
  test('warns before rolling a culture again, and rolls it when told to', async ({ page }) => {
    await openASavedCulture(page, 'The Emberfolk');
    const panel = artifactPanel(page);
    const before = await panel.getByLabel('Culture name').inputValue();

    await panel.getByLabel('Greetings').fill('An edit about to be thrown away.');
    await panel.getByRole('button', { name: 'Roll again' }).click();
    await expect(confirmDialog(page)).toContainText('unsaved changes go too');
    await confirmDialog(page).getByRole('button', { name: 'Cancel' }).click();

    // Cancelling changes nothing, including the edit that was at risk.
    await expect(panel.getByLabel('Greetings')).toHaveValue('An edit about to be thrown away.');

    await panel.getByRole('button', { name: 'Roll again' }).click();
    await confirmDialog(page).getByRole('button', { name: 'Roll again' }).click();
    await expect(panel.getByText('Rolled again from the original seed.')).toBeVisible();
    await expect(panel.getByLabel('Culture name')).not.toHaveValue(before);
  });

  test('asks before a panel holding unsaved changes is closed', async ({ page }) => {
    await openASavedCulture(page, 'The Emberfolk');
    await artifactPanel(page).getByLabel('Name', { exact: true }).fill('Half a thought');

    await page.getByRole('button', { name: /^Close The Emberfolk$/ }).click();
    await expect(confirmDialog(page)).toContainText('changes you have not saved');
    await confirmDialog(page).getByRole('button', { name: 'Cancel' }).click();

    // Cancelling keeps the panel and the edit in it.
    await expect(panels(page)).toHaveCount(2);
    await expect(artifactPanel(page).getByLabel('Name', { exact: true })).toHaveValue(
      'Half a thought',
    );

    await page.getByRole('button', { name: /^Close The Emberfolk$/ }).click();
    await confirmDialog(page).getByRole('button', { name: 'Close' }).click();
    await expect(panels(page)).toHaveCount(1);
  });

  test('warns before navigating away from unsaved changes', async ({ page }) => {
    await openASavedCulture(page, 'The Emberfolk');
    await artifactPanel(page).getByLabel('Name', { exact: true }).fill('Half a thought');

    // The browser's own prompt, because `beforeNavigate` is synchronous and the site's modal
    // answers through a promise. Dismissing it is refusing to leave.
    const prompts: string[] = [];
    page.on('dialog', (dialog) => {
      prompts.push(dialog.message());
      void (prompts.length === 1 ? dialog.dismiss() : dialog.accept());
    });

    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect.poll(() => prompts.length).toBe(1);
    await expect(page).toHaveURL(/\/workshop/);
    await expect(artifactPanel(page).getByLabel('Name', { exact: true })).toHaveValue(
      'Half a thought',
    );

    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).not.toHaveURL(/\/workshop/);
  });

  /**
   * Requirement 6.1 for the largest editing form on the site. A settlement's editor is nested
   * three deep — facets, trade, two problem lists, and a block per notable — which is where a
   * 320px layout gives out if it is going to.
   */
  test('fits a 320px screen with a settlement open on it', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openASavedSettlement(page, 'White Ridge');
    await expect(artifactPanel(page).getByLabel('Settlement name')).toBeVisible();
    await expect(
      artifactPanel(page).getByRole('textbox', { name: 'Acute problem 1', exact: true }),
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
    await expectInteractiveControlsReachable(page);
  });

  /**
   * Requirement 7.4 for settlement (#20): generate, save, reopen, edit — with the edit landing on
   * a field the settlement itself owns and on one inside a sub-object, since a settlement is both.
   */
  test('edits a saved settlement’s contents, and the change survives a reload', async ({
    page,
  }) => {
    await openASavedSettlement(page, 'White Ridge');
    const panel = artifactPanel(page);

    await expect(panel.getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await panel.getByLabel('Settlement name').fill('Saltmarch');
    await panel.getByLabel('Description', { exact: true }).fill('A wet town on a slow river.');
    await panel
      .getByRole('textbox', { name: 'Notable 1 title', exact: true })
      .fill('Harbourmaster');
    await expect(panel.getByText('Unsaved changes.')).toBeVisible();

    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByText('Saved.')).toBeVisible();

    await expect
      .poll(async () =>
        (await storedPanels(page)).some((stored) => stored.artifactId !== undefined),
      )
      .toBe(true);
    await page.reload({ waitUntil: 'load' });

    await expect(artifactPanel(page).getByLabel('Settlement name')).toHaveValue('Saltmarch');
    await expect(artifactPanel(page).getByLabel('Description', { exact: true })).toHaveValue(
      'A wet town on a slow river.',
    );
    await expect(
      artifactPanel(page).getByRole('textbox', { name: 'Notable 1 title', exact: true }),
    ).toHaveValue('Harbourmaster');
  });

  /** Requirement 4.4: one problem changes and the rest of the settlement does not move. */
  test('rewrites one problem without disturbing the settlement around it', async ({ page }) => {
    await openASavedSettlement(page, 'White Ridge');
    const panel = artifactPanel(page);

    const creeping = panel.getByRole('textbox', { name: 'Creeping problem 1', exact: true });
    const creepingBefore = await creeping.inputValue();
    const notable = panel.getByRole('textbox', { name: 'Notable 1 first name', exact: true });
    const notableBefore = await notable.inputValue();

    await panel
      .getByRole('textbox', { name: 'Acute problem 1', exact: true })
      .fill('The mill has stopped.');
    await panel.getByRole('button', { name: 'Save changes' }).click();
    await expect(panel.getByText('Saved.')).toBeVisible();

    await expect(panel.getByRole('textbox', { name: 'Acute problem 1', exact: true })).toHaveValue(
      'The mill has stopped.',
    );
    await expect(creeping).toHaveValue(creepingBefore);
    await expect(notable).toHaveValue(notableBefore);
  });

  /**
   * Requirement 4.3 for settlement. What makes this worth its own test rather than resting on the
   * culture one is that a settlement's roll reads four enrichment flags out of provenance: falling
   * back to the defaults would return a plain settlement with no problems in it at all, which
   * would read as a successful re-roll and be a silent loss.
   */
  test('warns before rolling a settlement again, and brings its enrichment back', async ({
    page,
  }) => {
    await openASavedSettlement(page, 'White Ridge');
    const panel = artifactPanel(page);
    const acute = panel.getByRole('textbox', { name: 'Acute problem 1', exact: true });
    const before = await acute.inputValue();

    await panel.getByLabel('Settlement name').fill('An edit about to be thrown away.');
    await panel.getByRole('button', { name: 'Roll again' }).click();
    await expect(confirmDialog(page)).toContainText('unsaved changes go too');
    await confirmDialog(page).getByRole('button', { name: 'Roll again' }).click();

    await expect(panel.getByText('Rolled again from the original seed.')).toBeVisible();
    await expect(panel.getByLabel('Settlement name')).not.toHaveValue(
      'An edit about to be thrown away.',
    );
    // The same seed and the same recorded settings give the same settlement back: what a re-roll
    // discards is the edits, not the place.
    await expect(acute).toHaveValue(before);
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

  test('sends someone with no project to the page that makes one', async ({ page }) => {
    // The bench no longer creates projects — the empty state has to say where they come from, or
    // a first-time visitor on the site's main screen is simply stuck.
    const empty = projectContext(page).getByText('No project yet.');
    await expect(empty).toBeVisible();
    await expect(empty.getByRole('link', { name: 'Create one' })).toHaveAttribute(
      'href',
      /\/projects\/?$/,
    );
  });

  test('follows a rename made on the projects page', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');
    await expectProjectCount(page, 2);

    // Creating a project opens it, so the second one is the one on the bench.
    await expectOpenProject(page, 'Dolmenwood');

    await renameProject(page, 'Dolmenwood', 'Dolmenwood Revised');
    await expectOpenProject(page, 'Dolmenwood Revised');

    await page.reload({ waitUntil: 'load' });
    await expectProjectCount(page, 2);
    await expectOpenProject(page, 'Dolmenwood Revised');
  });

  test('falls back to another project when the open one is deleted', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');

    await deleteProject(page, 'Dolmenwood');

    await expectProjectCount(page, 1);
    await expectOpenProject(page, 'Ashfall');

    await page.reload({ waitUntil: 'load' });
    await expectOpenProject(page, 'Ashfall');
  });

  test('opens exactly one project at a time, and that survives a reload', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await createProject(page, 'Dolmenwood');

    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Ashfall' });
    await expectOpenProject(page, 'Ashfall');

    // Ashfall is the older project, so if the selection had not persisted the workshop would
    // reopen Dolmenwood — the most recently updated one — instead.
    await page.reload({ waitUntil: 'load' });
    await expectOpenProject(page, 'Ashfall');
    await expect(projectContext(page).getByRole('option', { selected: true })).toHaveText(
      'Ashfall',
    );
  });
});

/**
 * Export and import (#35), end to end.
 *
 * The unit tests settle the format against real generator output. What only a browser can settle is
 * that a file actually leaves and actually comes back: a real download, a real file input, and a
 * vault that was genuinely emptied in between. In an application with no server copy this is the
 * whole durability story, so "the round trip works" is not something to infer from two libraries
 * that each pass their own tests.
 */
test.describe('project export and import', () => {
  const transfer = (page: Page) => page.locator('.project-transfer');

  test.beforeEach(async ({ page }) => {
    await openEmptyWorkshop(page);
  });

  test('a project survives being exported, deleted, and imported', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');

    const file = await onProjectsPage(page, async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        transfer(page).getByRole('button', { name: 'Export project' }).click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/^ironarachne-ashfall-\d{4}-\d{2}-\d{2}\.json$/);
      await expect(transfer(page).getByText(/^Saved ironarachne-ashfall-/)).toBeVisible();
      return download.path();
    });

    // The vault genuinely loses it. Everything after this comes out of the file.
    await deleteProject(page, 'Ashfall');
    await expect(page.getByText('No project yet.')).toBeVisible();

    await onProjectsPage(page, async () => {
      await transfer(page).locator('input[type=file]').setInputFiles(file);
      await expect(transfer(page).getByText('Added 1 project holding 1 artifact.')).toBeVisible();
    });
    // The import opens what it brought in, so the work is in front of the user rather than
    // somewhere in a project list.
    await expectOpenProject(page, 'Ashfall');
    await expect(artifactRow(page, 'The Emberfolk')).toBeVisible();

    // And it is in the database, not merely on screen.
    await page.reload({ waitUntil: 'load' });
    await expect(artifactRow(page, 'The Emberfolk')).toBeVisible();
  });

  test('one artifact can be carried to another project as a file', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      projectView(page).getByRole('button', { name: 'Export The Emberfolk' }).click(),
    ]);
    const file = await download.path();

    await createProject(page, 'Dolmenwood');
    await expect(artifactRow(page, 'The Emberfolk')).toBeHidden();

    await onProjectsPage(page, async () => {
      await transfer(page).locator('input[type=file]').setInputFiles(file);
      await expect(transfer(page).getByText('Added 1 artifact to this project.')).toBeVisible();
    });
    await expect(artifactRow(page, 'The Emberfolk')).toBeVisible();

    // The one it came from still has its own copy: an artifact travels, it does not move.
    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Ashfall' });
    await expect(artifactRow(page, 'The Emberfolk')).toBeVisible();
  });

  test('a file that is not ours is refused by name, and nothing is changed', async ({ page }) => {
    await createProject(page, 'Ashfall');

    await onProjectsPage(page, async () => {
      await transfer(page)
        .locator('input[type=file]')
        .setInputFiles({
          name: 'notes.json',
          mimeType: 'application/json',
          buffer: Buffer.from('{"just":"some other file"}'),
        });

      await expect(transfer(page).getByRole('alert')).toContainText(
        'not an Iron Arachne export file',
      );
    });
    await expectProjectCount(page, 1);
    await expectOpenProject(page, 'Ashfall');
  });
});

/**
 * Whole-vault export and import (#47), end to end.
 *
 * The library tests prove the format against real generator output; what only a browser can settle
 * is that a vault genuinely leaves and genuinely comes back — a real download, a real file input,
 * and storage that was actually cleared in between. In an application with no server copy, this is
 * the operation everything else depends on.
 */
test.describe('vault export and import', () => {
  const vaultTransfer = (page: Page) => page.locator('section.vault-transfer');
  // Export is the storage panel's primary action; what is left in the transfer controls is the way
  // back in. See docs/storage-panel.md.
  const storagePanel = (page: Page) => page.locator('section.storage');
  const confirmDialog = (page: Page) => page.locator('dialog.ironarachne-modal');

  test.beforeEach(async ({ page }) => {
    await openEmptyWorkshop(page);
  });

  async function exportVault(page: Page): Promise<string> {
    return onProjectsPage(page, async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        storagePanel(page).getByRole('button', { name: 'Export everything' }).click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/^ironarachne-vault-\d{4}-\d{2}-\d{2}\.json$/);
      await expect(storagePanel(page).getByText(/^Saved ironarachne-vault-/)).toBeVisible();
      return download.path();
    });
  }

  test('a whole vault survives export, clearing site data, and import', async ({ page }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    await createProject(page, 'Dolmenwood');
    await saveACulture(page, 'The Drune');

    const file = await exportVault(page);

    // Everything really goes: a new origin's worth of storage, not a soft reset.
    await openEmptyWorkshop(page);
    await expect(page.getByText('No project yet.')).toBeVisible();

    await onProjectsPage(page, async () => {
      await vaultTransfer(page).locator('input[type=file]').setInputFiles(file);
      await expect(
        vaultTransfer(page).getByText(/Added 2 projects holding 2 artifacts\./),
      ).toBeVisible();
    });

    await expectProjectCount(page, 2);
    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Ashfall' });
    await expect(artifactRow(page, 'The Emberfolk')).toBeVisible();
    await projectContext(page).getByLabel('Open project').selectOption({ label: 'Dolmenwood' });
    await expect(artifactRow(page, 'The Drune')).toBeVisible();

    // In the database, not merely on screen.
    await page.reload({ waitUntil: 'load' });
    await expectProjectCount(page, 2);
  });

  test('restoring replaces what is there, and downloads the undo first', async ({ page }) => {
    await createProject(page, 'Keeper');
    await saveACulture(page, 'The Emberfolk');
    const file = await exportVault(page);

    // Work done after the backup, which the restore is about to remove.
    await createProject(page, 'Doomed');
    await saveACulture(page, 'The Doomed');
    await expectProjectCount(page, 2);

    await onProjectsPage(page, async () => {
      await vaultTransfer(page)
        .getByLabel('Importing')
        .selectOption({ label: 'replaces everything (restore)' });

      // The confirmation counts what is about to go, in the user's terms rather than in the
      // abstract.
      const [backup] = await Promise.all([
        page.waitForEvent('download'),
        (async () => {
          await vaultTransfer(page).locator('input[type=file]').setInputFiles(file);
          await expect(confirmDialog(page)).toContainText('removing 2 projects and 2 artifacts');
          await confirmDialog(page).getByRole('button', { name: 'Restore' }).click();
        })(),
      ]);
      // The pre-restore export is the undo, and it is produced before anything is written.
      expect(backup.suggestedFilename()).toMatch(/^ironarachne-vault-/);

      await expect(
        vaultTransfer(page).getByText(/Restored 1 project holding 1 artifact/),
      ).toBeVisible();
      await expect(vaultTransfer(page).getByText(/That file is the undo/)).toBeVisible();
    });
    await expectProjectCount(page, 1);

    await page.reload({ waitUntil: 'load' });
    await expectOpenProject(page, 'Keeper');
    await expect(artifactRow(page, 'The Emberfolk')).toBeVisible();
    await expect(artifactRow(page, 'The Doomed')).toBeHidden();
  });

  test('re-importing this browser’s own backup says so before it duplicates anything', async ({
    page,
  }) => {
    await createProject(page, 'Ashfall');
    await saveACulture(page, 'The Emberfolk');
    const file = await exportVault(page);

    // Straight back in, with nothing cleared: merging this is legitimate and leaves two copies of
    // everything, so the one thing it must not be is silent.
    await onProjectsPage(page, async () => {
      await vaultTransfer(page).locator('input[type=file]').setInputFiles(file);
      await expect(confirmDialog(page)).toContainText('This file came out of this browser');
      await expect(confirmDialog(page)).toContainText('1 projects and 1 artifacts');
      await confirmDialog(page).getByRole('button', { name: 'Cancel' }).click();
    });

    await expectProjectCount(page, 1);
  });

  /**
   * `/saved-data` was retired (#44) and redirects rather than 404s. People have it bookmarked, and
   * the page that held their saved work is the worst possible place for a dead link.
   *
   * It pointed at the workshop while the workshop was the closest thing that existed. It points at
   * the vault now, which is what that page actually was: everything saved, in one list.
   */
  test('the retired saved-data page sends you to the vault', async ({ page }) => {
    await visitRoute(page, '/saved-data', { title: 'Result Vault | Iron Arachne' });

    await expect(page).toHaveURL(/\/vault\/?$/);
    await expect(page.getByRole('heading', { name: 'Result Vault', level: 1 })).toBeVisible();
  });

  test('the backup controls are there before there is any project to back up', async ({ page }) => {
    // A user restoring into a fresh browser has no project to start from, so a control that
    // needed one would be missing in exactly the case it exists for. That is why backup sits on
    // the projects page — a sidebar destination reachable with nothing saved — rather than behind
    // an open project.
    await expect(page.getByText('No project yet.')).toBeVisible();

    await page.goto('/projects/');
    // Export leads the storage panel, under the "last exported" figure that gives someone a
    // reason to press it; what is left in the transfer section is the way back in.
    // See docs/storage-panel.md.
    await expect(
      storagePanel(page).getByRole('button', { name: 'Export everything' }),
    ).toBeVisible();
    await expect(
      vaultTransfer(page).getByRole('button', { name: 'Import from file…' }),
    ).toBeVisible();
  });
});

/**
 * A save the browser has no room for (#180).
 *
 * Local-only means this browser holds the only copy, so a dropped save costs work that exists
 * nowhere else. The library tests prove storage is left untouched and memory does not claim a
 * phantom save; what only a browser can settle is the half the user meets — that they are stopped
 * rather than left to carry on, and that the way out produces a real file from a real download.
 *
 * The full disk is simulated by refusing every `put` with the one error that is authoritative,
 * installed before the app boots so the app's own code path is what meets it.
 */
test.describe('when the browser has no room to save', () => {
  const storageDialog = (page: Page) => page.locator('dialog.ironarachne-modal .storage-failure');

  /** Refuses writes to the artifact stores, leaving projects and reads alone. */
  async function fillTheDisk(page: Page): Promise<void> {
    await page.addInitScript(() => {
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function refusing(this: IDBObjectStore, ...args: unknown[]) {
        if (this.name === 'artifacts' || this.name === 'artifact_payloads') {
          throw new DOMException('the quota has been exceeded', 'QuotaExceededError');
        }
        return (put as (...args: unknown[]) => IDBRequest).apply(this, args);
      } as typeof put;
    });
  }

  test('stops the user, keeps their work, and hands them a file', async ({ page }) => {
    await openEmptyWorkshop(page);
    await createProject(page, 'Ashfall');
    await fillTheDisk(page);
    await page.reload({ waitUntil: 'load' });

    await mountTool(page, /^Culture/);
    const saveArtifact = panels(page).locator('.save-artifact');
    await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact.getByLabel('Name', { exact: true }).fill('The Emberfolk');
    await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();

    // Blocking, because carrying on quietly compounds the loss.
    await expect(storageDialog(page)).toBeVisible();
    await expect(storageDialog(page)).toContainText('no room left');
    // And it says the thing that changes what a user does next: nothing else was harmed.
    await expect(storageDialog(page)).toContainText('Everything you had already saved is unharmed');

    // The primary action needs no storage, which is exactly the situation they are in.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      storageDialog(page)
        .getByRole('button', { name: /^Download this/ })
        .click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^ironarachne-the-emberfolk-.*\.json$/);
    await expect(storageDialog(page)).toContainText('Saved to your downloads');

    await storageDialog(page).getByRole('button', { name: 'Not now' }).click();
    await expect(storageDialog(page)).toBeHidden();

    // No phantom save: nothing claims to be in the project, on screen or after a reload.
    await expect(artifactRow(page, 'The Emberfolk')).toBeHidden();
    await page.reload({ waitUntil: 'load' });
    await expect(artifactRow(page, 'The Emberfolk')).toBeHidden();
  });

  /**
   * A second browser context, because `addInitScript` stays registered for every later navigation
   * in the page it was installed on — so "there is room again" cannot be reached by reloading. A
   * fresh context is also the more honest staging of it: the rescue file is meant to survive the
   * browser it could not be saved in.
   */
  test('the rescued file imports once there is room again', async ({ page, browser }) => {
    await openEmptyWorkshop(page);
    await createProject(page, 'Ashfall');
    await fillTheDisk(page);
    await page.reload({ waitUntil: 'load' });

    await mountTool(page, /^Culture/);
    const saveArtifact = panels(page).locator('.save-artifact');
    await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact.getByLabel('Name', { exact: true }).fill('The Emberfolk');
    await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      storageDialog(page)
        .getByRole('button', { name: /^Download this/ })
        .click(),
    ]);
    const file = await download.path();
    await storageDialog(page).getByRole('button', { name: 'Not now' }).click();

    const roomy = await browser.newContext();
    try {
      const fresh = await roomy.newPage();
      await openEmptyWorkshop(fresh);
      await createProject(fresh, 'Ashfall');
      await onProjectsPage(fresh, async () => {
        await fresh.locator('.project-transfer input[type=file]').setInputFiles(file);
        // Waited for before navigating back. Setting the file only starts the read; leaving the
        // page on that would race the write and the artifact would never arrive.
        await expect(fresh.locator('.project-transfer').getByText(/^Added /)).toBeVisible();
      });

      await expect(artifactRow(fresh, 'The Emberfolk')).toBeVisible();
    } finally {
      await roomy.close();
    }
  });
});

/**
 * Legacy adoption (#34), proved end to end against data the site itself wrote.
 *
 * The unit tests cover the library against real generator output; what only a browser can settle is
 * the wiring — that adoption actually runs on a page load, against a real localStorage, and leaves
 * a note where a user will see it. So this still does not seed a fixture. The old Save button that
 * used to write `generator.culture` is gone (#40), so `seedALegacyCulture` takes the long way round
 * to the same place: it saves a culture the current way and moves the payload the store wrote into
 * the old scope, which leaves a real snapshot from a real generator where a returning user's
 * browser has one.
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

  /**
   * A culture in the legacy scope, generated by the site rather than written out by hand.
   *
   * Saves one the way the site saves cultures now, lifts the stored payload straight out of
   * IndexedDB, writes it where the old build wrote its saves, and clears the vault so adoption
   * starts from nothing — which is the state a returning user is actually in.
   */
  async function seedALegacyCulture(page: Page): Promise<string> {
    await visitRoute(page, '/culture', { title: 'Culture Generator | Iron Arachne' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'load' });

    const saveArtifact = page.locator('.save-artifact');
    await saveArtifact.getByRole('button', { name: 'Save to project' }).click();
    await saveArtifact.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(saveArtifact.getByText(/^Saved /)).toBeVisible();

    const name = await page.evaluate(async (key) => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('ironarachne.vault');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      let stored: { payload: { name: string } }[] = [];
      try {
        stored = await new Promise((resolve, reject) => {
          const request = database
            .transaction('artifact_payloads')
            .objectStore('artifact_payloads')
            .getAll();
          request.onsuccess = () => resolve(request.result as { payload: { name: string } }[]);
          request.onerror = () => reject(request.error);
        });
      } finally {
        database.close();
      }
      const payload = stored[0]?.payload;
      localStorage.setItem(key, JSON.stringify({ payloadVersion: 1, cultures: [payload] }));
      return payload?.name ?? '';
    }, CULTURE_SCOPE_KEY);

    // The vault goes, the legacy scope stays: adoption has to find the culture and no record of
    // having already taken it.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const request = indexedDB.deleteDatabase('ironarachne.vault');
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
        }),
    );
    return name;
  }

  test('adopts a culture saved the old way, and says so in the project bar', async ({ page }) => {
    const savedName = await seedALegacyCulture(page);
    expect(savedName).not.toBe('');

    await openWorkshop(page);

    // The count is interpolated as its own text node, so this matches on the whole notice rather
    // than on a text node — `toContainText` walks the children the message is spread across.
    const notice = page.getByRole('status');
    await expect(notice).toContainText('1 item you saved before projects existed is now in');
    await expect(notice).toContainText('My Setting');
    await expectOpenProject(page, 'My Setting');
    expect(await adoptedArtifactNames(page)).toEqual([savedName]);

    // The originals are the fallback and must survive adoption untouched.
    expect(await savedLegacyCultureName(page)).toBe(savedName);
  });

  test('does not adopt the same culture twice, and the note can be dismissed', async ({ page }) => {
    const savedName = await seedALegacyCulture(page);

    await openWorkshop(page);
    await expect(page.getByRole('status')).toContainText('1 item you saved');

    await projectContext(page).getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByRole('status')).toBeHidden();

    // A reload runs adoption again. One artifact, one project, and the note stays dismissed.
    await page.reload({ waitUntil: 'load' });
    await expectProjectCount(page, 1);
    await expect(page.getByRole('status')).toBeHidden();
    expect(await adoptedArtifactNames(page)).toEqual([savedName]);
  });

  test('leaves a browser with nothing saved alone', async ({ page }) => {
    await openEmptyWorkshop(page);

    await expect(page.getByText('No project yet.')).toBeVisible();
    expect(await adoptedArtifactNames(page)).toEqual([]);
  });
});
