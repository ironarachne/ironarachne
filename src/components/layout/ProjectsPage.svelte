<script lang="ts">
  import { onMount, tick } from 'svelte';

  import { resolve } from '$app/paths';
  import { hydrateArtifacts, listArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import { getShortDate } from '$lib/dates';
  import {
    createProject,
    deleteProject,
    getActiveProject,
    hydrateProjects,
    listProjects,
    onProjectsChanged,
    setActiveProject,
    updateProject,
    type Project,
    type ProjectDraft,
  } from '$lib/projects';
  import {
    hasSeenStorageDisclosure,
    recordStorageDisclosureShown,
    requestPersistenceIfWarranted,
  } from '$lib/storage_status';
  import {
    GENRES,
    SYSTEMS,
    genreDisplayName,
    systemDisplayName,
    type GameSystem,
    type Genre,
  } from '$lib/tools';
  import { showConfirmModal } from '$lib/ui';
  import type { VaultResult } from '$lib/vault_db';
  import type { ImportSummary } from '$lib/vault_file';
  import ProjectTransferControls from '$components/common/ProjectTransferControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import StorageDisclosureNotice from '$components/common/StorageDisclosureNotice.svelte';
  import StoragePanel from '$components/common/StoragePanel.svelte';
  import VaultTransferControls from '$components/common/VaultTransferControls.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const uid = $props.id();
  const newNameId = `${uid}-new-name`;

  /**
   * What a project is set in, offered as the catalog's own vocabularies. The empty value is the
   * default and means unset — a project that is a box of tools rather than a campaign — and it is
   * also how a setting is cleared again, since neither choice is permanent (docs/workshop.md,
   * decision 7).
   */
  const GENRE_OPTIONS = [
    { value: '', label: 'Any genre' },
    ...GENRES.map((genre) => ({ value: genre, label: genreDisplayName(genre) })),
  ];
  const SYSTEM_OPTIONS = [
    { value: '', label: 'Any system' },
    ...SYSTEMS.map((system) => ({ value: system, label: systemDisplayName(system) })),
  ];

  /** The genre and system of a project, as the card's fact line says them. Empty when it has none. */
  function settingSummary(project: Project): string {
    return [
      project.genre === undefined ? undefined : genreDisplayName(project.genre),
      project.system === undefined ? undefined : systemDisplayName(project.system),
    ]
      .filter((name) => name !== undefined)
      .join(' · ');
  }

  type Row = {
    project: Project;
    artifactCount: number;
  };

  let rows: Row[] = $state([]);
  let activeProjectId: string | undefined = $state(undefined);
  let newName = $state('');
  let newGenre = $state('');
  let newSystem = $state('');
  let storageError: string | null = $state(null);
  /** The project whose name and description are being edited, if any. */
  let editingId: string | undefined = $state(undefined);
  let editName = $state('');
  let editDescription = $state('');
  let editGenre = $state('');
  let editSystem = $state('');
  /** The local-only disclosure, shown once ever and dismissible. See docs/storage-disclosure.md. */
  let showDisclosure = $state(false);

  /**
   * The anchor for a project's card, which the storage panel's table links each row to.
   *
   * Built from the project id rather than from `$props.id()`, because the table and the card have
   * to agree on it and a per-instance prefix would only make the two sides harder to read.
   */
  function cardId(projectId: string): string {
    return `project-${projectId}`;
  }

  function refresh(): void {
    const projects = listProjects();
    rows = projects.map((project) => ({
      project,
      artifactCount: listArtifacts(project.id).length,
    }));
    activeProjectId = getActiveProject()?.id;
  }

  onMount(async () => {
    // Both indexes, because this page reports on artifacts as well as projects: a size column that
    // read an unhydrated artifact index would say every project is empty.
    await hydrateProjects();
    await hydrateArtifacts();
    refresh();
  });

  onMount(() => onProjectsChanged(refresh));
  onMount(() => onArtifactsChanged(refresh));

  /**
   * Report a refused write rather than letting the page redraw as though it worked. Same contract
   * as the workshop's project bar: a store whose results the caller drops is one that loses work
   * silently.
   */
  function report<T>(result: VaultResult<T> | undefined): void {
    storageError =
      result === undefined || result.ok
        ? null
        : `That could not be saved (${result.reason}). Your work is still here; try again.`;
  }

  /**
   * Wait until the disclosure is actually on screen.
   *
   * `tick()` flushes the DOM update and the frame after it is when the browser has painted.
   * Firefox raises its permission prompt from `persist()`, and a prompt answered over a page that
   * has not yet said why is the one that gets denied — a denial being much harder to recover than a
   * request not yet made.
   */
  async function painted(): Promise<void> {
    await tick();
    if (typeof requestAnimationFrame !== 'function') {
      return;
    }
    await new Promise<void>((done) => requestAnimationFrame(() => done()));
  }

  /**
   * The paired moment: say that this browser holds the only copy, then ask the browser not to throw
   * it away. The order is the design — see docs/storage-disclosure.md.
   *
   * The stamp is written when the notice appears rather than when it is dismissed, because someone
   * who navigates away has still been told, and telling them again would make "exactly once" a lie.
   * A refused stamp is deliberately not reported: the project was created, the sentence is on
   * screen, and the only consequence is that it appears once more another day.
   */
  async function discloseThenRequestPersistence(): Promise<void> {
    const seen = await hasSeenStorageDisclosure();
    if (seen.ok && !seen.value) {
      showDisclosure = true;
      await recordStorageDisclosureShown();
      await painted();
    }
    // Every created project is a completion of real work, first or not. Whether anything is
    // actually asked is the policy's decision, not this page's.
    await requestPersistenceIfWarranted('projectCreated');
  }

  async function create(): Promise<void> {
    const requested = newName.trim();
    const draft: ProjectDraft = {};
    if (requested !== '') {
      draft.name = requested;
    }
    if (newGenre !== '') {
      draft.genre = newGenre as Genre;
    }
    if (newSystem !== '') {
      draft.system = newSystem as GameSystem;
    }
    const created = await createProject(draft);
    report(created);
    if (created.ok) {
      // Creating a project here is an explicit request to work in it, so it is opened. The library
      // deliberately does not do that on its own.
      setActiveProject(created.value.id);
      // Only what this call consumed: the write is asynchronous, and someone typing the next name
      // while it commits must not have it wiped from under them.
      if (newName === requested) {
        newName = '';
      }
      if (newGenre === (draft.genre ?? '')) {
        newGenre = '';
      }
      if (newSystem === (draft.system ?? '')) {
        newSystem = '';
      }
    }
    refresh();
    if (created.ok) {
      await discloseThenRequestPersistence();
    }
  }

  function open(id: string): void {
    setActiveProject(id);
    refresh();
  }

  function startEditing(project: Project): void {
    editingId = project.id;
    editName = project.name;
    editDescription = project.description ?? '';
    editGenre = project.genre ?? '';
    editSystem = project.system ?? '';
  }

  function cancelEditing(): void {
    editingId = undefined;
  }

  async function saveEdits(id: string): Promise<void> {
    // One call rather than a rename followed by a description write: `updateProject` takes both,
    // and two calls would bump `updatedAt` twice and reorder the list mid-edit for a single user
    // action. An empty description clears it, which is what the field's placeholder promises.
    // `null` clears rather than an empty string, which is what "Any genre" has to mean: the field
    // is an enum and there is no empty member of one to stand in for absent.
    report(
      await updateProject(id, {
        name: editName,
        description: editDescription.trim(),
        genre: editGenre === '' ? null : (editGenre as Genre),
        system: editSystem === '' ? null : (editSystem as GameSystem),
      }),
    );
    editingId = undefined;
    refresh();
  }

  async function remove(row: Row): Promise<void> {
    // Deleting a project takes its artifacts with it in the same transaction, and there is no
    // server copy to restore from — so the count is in the question, not in a toast afterwards.
    const confirmed = await showConfirmModal({
      title: 'Delete project',
      message:
        row.artifactCount === 0
          ? `Delete “${row.project.name}”? This cannot be undone.`
          : `Delete “${row.project.name}” and the ${row.artifactCount} ${
              row.artifactCount === 1 ? 'artifact' : 'artifacts'
            } in it? This cannot be undone, and there is no copy anywhere else.`,
      okLabel: 'Delete',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    report(await deleteProject(row.project.id));
    refresh();
  }

  /**
   * Open what an import brought in — importing a project is an explicit request to work in it.
   * An imported artifact went into the project already open, so there is nothing to move to.
   */
  function afterImport(summary: ImportSummary): void {
    if (summary.projectsAdded > 0 && summary.projectId !== undefined) {
      setActiveProject(summary.projectId);
    }
    refresh();
  }
</script>

<svelte:head>
  <title>Projects | Iron Arachne</title>
</svelte:head>

<section class="projects">
  <h1>Projects</h1>
  <p class="projects__lede">
    A project is one campaign, one setting, one world. Everything you keep belongs to exactly one of
    them, and the workshop always has one open.
  </p>

  {#if storageError !== null}
    <p class="projects__error" role="alert">{storageError}</p>
  {/if}

  <div class="projects__create">
    <div class="input-group input-group--inline">
      <label for={newNameId}>New project</label>
      <input
        id={newNameId}
        type="text"
        bind:value={newName}
        placeholder="Name"
        autocomplete="off"
      />
    </div>
    <SelectField id="{uid}-new-genre" label="Genre" bind:value={newGenre} options={GENRE_OPTIONS} />
    <SelectField
      id="{uid}-new-system"
      label="System"
      bind:value={newSystem}
      options={SYSTEM_OPTIONS}
    />
    <!-- The page's one primary action. Primary is a claim about the page rather than about the
         button: everything else here — rename, delete, export — acts on something that already
         exists, and this is the thing a visitor with no projects came to do. -->
    <BaseButton variant="primary" onclick={create}>Create project</BaseButton>
  </div>

  {#if showDisclosure}
    <StorageDisclosureNotice
      backupHref="#storage"
      onDismiss={() => {
        showDisclosure = false;
      }}
    />
  {/if}

  {#if rows.length === 0}
    <p class="projects__empty">
      No projects yet. Create one above, or import a project file below.
    </p>
  {:else}
    <ul class="projects__list">
      {#each rows as row (row.project.id)}
        <li
          class="project-card"
          class:project-card--active={row.project.id === activeProjectId}
          id={cardId(row.project.id)}
        >
          {#if editingId === row.project.id}
            <div class="project-card__edit">
              <div class="input-group">
                <label for="{uid}-name-{row.project.id}">Name</label>
                <input id="{uid}-name-{row.project.id}" type="text" bind:value={editName} />
              </div>
              <div class="input-group">
                <label for="{uid}-desc-{row.project.id}">Description</label>
                <input
                  id="{uid}-desc-{row.project.id}"
                  type="text"
                  bind:value={editDescription}
                  placeholder="Optional"
                />
              </div>
              <SelectField
                id="{uid}-genre-{row.project.id}"
                label="Genre"
                bind:value={editGenre}
                options={GENRE_OPTIONS}
              />
              <SelectField
                id="{uid}-system-{row.project.id}"
                label="System"
                bind:value={editSystem}
                options={SYSTEM_OPTIONS}
              />
              <div class="project-card__actions">
                <BaseButton onclick={() => saveEdits(row.project.id)}>Save</BaseButton>
                <BaseButton onclick={cancelEditing}>Cancel</BaseButton>
              </div>
            </div>
          {:else}
            <div class="project-card__header">
              <h2>{row.project.name}</h2>
              {#if row.project.id === activeProjectId}
                <span class="project-card__badge">Open</span>
              {/if}
            </div>

            {#if row.project.description !== undefined && row.project.description !== ''}
              <p class="project-card__description">{row.project.description}</p>
            {/if}

            <!-- No size here. The card answers "which project do I work in" and is ordered by
                 recency; the storage panel's table answers "which one is big" and is ordered by
                 size. The same number in two orders on one page is how a reader ends up trusting
                 neither, so it is said once, where it can be compared. -->
            <p class="project-card__facts">
              <!-- The setting leads, because it is what the project is rather than how much is in
                   it, and because a user who has just changed it needs to see that it took. -->
              {#if settingSummary(row.project) !== ''}{settingSummary(row.project)} ·{/if}
              {row.artifactCount}
              {row.artifactCount === 1 ? 'artifact' : 'artifacts'}
              · updated {getShortDate(new Date(row.project.updatedAt))}
            </p>

            <div class="project-card__actions">
              {#if row.project.id === activeProjectId}
                <a class="project-card__link" href={resolve('/workshop')}>Go to workshop</a>
              {:else}
                <BaseButton onclick={() => open(row.project.id)}>Open</BaseButton>
              {/if}
              <BaseButton onclick={() => startEditing(row.project)}>Rename</BaseButton>
              <BaseButton onclick={() => remove(row)}>Delete</BaseButton>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  <!-- One step from the projects themselves, and never behind a menu. With no server copy, a file
       is the only copy of this work that survives clearing site data, so export is the durability
       story rather than a convenience.

       Both granularities, because they answer different questions: the whole vault is the backup
       you take, one project is the thing you hand to someone else. Neither needs a project open,
       which is what makes this page the right home for them — a user restoring into a fresh
       browser has no project to start from, and a control that required one would be unreachable
       in exactly the case it exists for.

       They are section 4 of the storage panel rather than a region beside it, so that the account
       of what is stored and the actions that act on it are one thing. See docs/storage-panel.md. -->
  <StoragePanel projectAnchor={(projectId) => `#${cardId(projectId)}`}>
    <VaultTransferControls projectId={activeProjectId} onVaultChanged={afterImport} />

    <h2 class="projects__transfer-heading">This project</h2>
    <p>Take one project on its own, or bring one in from a file.</p>
    <ProjectTransferControls projectId={activeProjectId} onImported={afterImport} />
  </StoragePanel>
</section>

<style>
  .projects {
    padding: 0.5rem;
    max-width: 60rem;
  }

  .projects__lede,
  .projects__empty {
    max-width: var(--measure);
  }

  .projects__empty {
    font-style: italic;
    opacity: 0.8;
  }

  .projects__error {
    border: 1px solid var(--tan);
    border-radius: 4px;
    margin: 0 0 1rem;
    padding: 0.6rem 0.75rem;
  }

  .projects__create {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset and the room to shrink. */
  .projects__create .input-group {
    margin: 0;
    min-width: 0;
  }

  .projects__list {
    display: grid;
    gap: 0.75rem;
    /* Cards rather than a table: a project has a description of arbitrary length, and a table
       cell that wraps to four lines stops being a table. */
    grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
    margin: 0;
    padding: 0;
  }

  .projects__list li {
    list-style-type: none;
    margin-left: 0;
  }

  .project-card {
    background: var(--slate);
    border: 1px solid var(--granite);
    border-radius: 4px;
    padding: 0.75rem;
  }

  .project-card--active {
    border-color: var(--tan);
  }

  .project-card__header {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .project-card__header h2 {
    font-size: 1.2rem;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .project-card__badge {
    border: 1px solid var(--tan);
    border-radius: 999px;
    color: var(--gold);
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    padding: 0.05rem 0.5rem;
    text-transform: uppercase;
  }

  .project-card__description {
    margin: 0.4rem 0 0;
  }

  .project-card__facts {
    font-size: 0.85rem;
    margin: 0.4rem 0 0;
    opacity: 0.8;
  }

  .project-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.6rem;
  }

  .project-card__link {
    align-self: center;
  }

  .project-card__edit {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* A column with a hairline gap is exactly `.input-group`'s default now; only the margin
     reset is local. */
  .project-card__edit .input-group {
    margin: 0;
  }

  /* The panel supplies the rule above it and its own spacing; what is left here is the heading
     that separates the whole-vault controls from the one-project ones inside its actions. */
  .projects__transfer-heading {
    font-size: 1.1rem;
    margin: 1rem 0 0.25rem;
  }
</style>
