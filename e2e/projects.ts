import { expect, type Page } from '@playwright/test';

/**
 * Driving the projects page from a spec whose subject is somewhere else.
 *
 * Project management moved off the bench and onto `/projects` with the shell
 * (docs/app-shell.md, step 4), so a workshop test that needs a project has to go and make one the
 * way a user would. These helpers are that trip, in one place, so the forty-odd call sites in
 * workshop.spec.ts say what they mean rather than repeating a navigation.
 */

export const projectsPage = (page: Page) => page.locator('section.projects');

/**
 * Run something against the projects page and come back to where the caller was.
 *
 * The backup controls live there since the shell landed. What these tests are about — a file
 * genuinely leaving and genuinely coming back — is unaffected by which page holds the button, but
 * a user now takes a backup from the projects page, so the test does too.
 */
export async function onProjectsPage<T>(page: Page, act: () => Promise<T>): Promise<T> {
  const returnTo = new URL(page.url()).pathname;
  await page.goto('/projects/');
  const result = await act();
  await page.goto(returnTo);
  return result;
}
export const projectCard = (page: Page, name: string) =>
  projectsPage(page).locator('.project-card', { hasText: name });

/**
 * The card currently being edited.
 *
 * Not `projectCard`, because in edit mode the name is an input's *value* rather than the card's
 * text — `hasText` stops matching the moment Rename is clicked. Only one card can be editing at a
 * time, and only an editing card has a Save button, so that is what identifies it.
 */
export const editingCard = (page: Page) =>
  projectsPage(page)
    .locator('.project-card')
    .filter({ has: page.getByRole('button', { name: 'Save' }) });

/** Create a project, opening it, and return to the route the caller started on. */
export async function createProject(page: Page, name: string): Promise<void> {
  const returnTo = new URL(page.url()).pathname;

  await page.goto('/projects/');
  await projectsPage(page).getByLabel('New project').fill(name);
  await projectsPage(page).getByRole('button', { name: 'Create project' }).click();

  // The card carrying the name is drawn from what the page re-read after the write committed, so
  // its appearance is the signal that the database has it. A click only says the handler started,
  // and navigating on that would race the transaction.
  await expect(projectCard(page, name)).toBeVisible();

  await page.goto(returnTo);
}

/** Rename a project, from wherever the caller is, and come back. */
export async function renameProject(page: Page, from: string, to: string): Promise<void> {
  const returnTo = new URL(page.url()).pathname;

  await page.goto('/projects/');
  await projectCard(page, from).getByRole('button', { name: 'Rename' }).click();
  await editingCard(page).getByLabel('Name').fill(to);
  await editingCard(page).getByRole('button', { name: 'Save' }).click();
  await expect(projectCard(page, to)).toBeVisible();

  await page.goto(returnTo);
}

/** Delete a project, confirming the modal, and come back. */
export async function deleteProject(page: Page, name: string): Promise<void> {
  const returnTo = new URL(page.url()).pathname;

  await page.goto('/projects/');
  await projectCard(page, name).getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
  await expect(projectCard(page, name)).toHaveCount(0);

  await page.goto(returnTo);
}

/**
 * The project the bench currently has open, read off the switcher rather than off a name field.
 * The bench no longer has one — the switcher's selected option is what says which project is in
 * front of the user.
 */
export async function expectOpenProject(page: Page, name: string): Promise<void> {
  await expect(
    page.locator('section.project-context').getByRole('option', { selected: true }),
  ).toHaveText(name);
}

/**
 * How many projects exist, counted from the bench's switcher.
 *
 * The old bar printed "2 projects" and this asserted on that sentence. Counting the options says
 * the same thing without a second place for the number to be computed, and without leaving the
 * page under test.
 */
export async function expectProjectCount(page: Page, count: number): Promise<void> {
  await expect(page.locator('section.project-context').getByRole('option')).toHaveCount(count);
}
