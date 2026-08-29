import { expect, test, type Page } from '@playwright/test';

import { visitRoute } from './helpers';
import { projectCard, projectsPage } from './projects';

/**
 * A dialog's words are readable.
 *
 * `docs/visual-design.md`, "The message family", says the tone is the edge and the wash and the
 * words are always `--ink`. Nothing asserted the second half, and #117 broke it: rewriting
 * `modal.css` dropped the `color: inherit` the old rule carried, and the user-agent stylesheet
 * sets `dialog { color: CanvasText }`. The app declares no `color-scheme`, so `CanvasText` is
 * black — black text on `--surface-raised`, in every dialog in the app.
 *
 * Checked as a computed style in a real browser, because it is exactly the kind of failure a
 * source sweep cannot see: every rule involved is valid, and the one that mattered is one nobody
 * wrote. A dialog inherits from `dialog` itself, so asserting the element's own colour covers the
 * toned dialogs too — a tone sets `--panel-edge` and `--panel-surface` and never touches text.
 */

/**
 * What `--ink` actually computes to, resolved in the page rather than written down here.
 *
 * A literal would have to be `color(srgb 0.955294 …)` today, because `--ink` is a `color-mix` and
 * Chromium computes those to `color()` rather than to `rgb()`. Pinning that string would make the
 * test a statement about a serialisation format instead of about the design, and it would fail the
 * next time the palette moves for a reason that is not a bug.
 */
async function inkColor(page: Page): Promise<string> {
  return page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--ink)';
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  });
}

async function colorOf(page: Page, selector: string): Promise<string> {
  return page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).color);
}

test.describe('a dialog is readable', () => {
  test('sets its words in --ink rather than inheriting the user agent black', async ({ page }) => {
    await visitRoute(page, '/projects', { title: 'Projects | Iron Arachne' });

    await projectsPage(page).getByLabel('New project').fill('Ashfall');
    await projectsPage(page).getByRole('button', { name: 'Create project' }).click();
    await expect(projectCard(page, 'Ashfall')).toBeVisible();

    // The delete confirmation is the ordinary dialog: a title, a message, two peer actions.
    await projectCard(page, 'Ashfall').getByRole('button', { name: 'Delete' }).click();

    const dialog = page.locator('dialog.modal-host');
    await expect(dialog).toBeVisible();

    const ink = await inkColor(page);

    // Stated as well as compared: whatever `--ink` resolves to, it is not the user agent's black,
    // which is the specific value this test exists to keep out.
    expect(ink).not.toBe('rgb(0, 0, 0)');

    // The element itself, so everything inheriting from it starts correct.
    expect(await colorOf(page, 'dialog.modal-host')).toBe(ink);

    // And the two things a reader actually reads.
    expect(await colorOf(page, 'dialog.modal-host .panel__title')).toBe(ink);
    expect(await colorOf(page, 'dialog.modal-host #modal-dialog-message')).toBe(ink);
  });
});
