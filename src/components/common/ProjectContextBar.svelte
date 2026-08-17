<script lang="ts">
  import { onMount } from 'svelte';

  import {
    acknowledgeLegacyAdoptionNotice,
    adoptLegacySaves,
    legacyAdoptionNotice,
    type LegacyAdoptionNotice,
  } from '$lib/legacy_adoption';
  import {
    createProject,
    deleteProject,
    getActiveProject,
    hydrateProjects,
    listProjects,
    onProjectsChanged,
    renameProject,
    setActiveProject,
    type Project,
  } from '$lib/projects';
  import type { VaultResult } from '$lib/vault_db';
  import type { ImportSummary } from '$lib/vault_file';
  import { ARTIFACT_KINDS } from '$lib/workshop';
  import ProjectTransferControls from '$components/common/ProjectTransferControls.svelte';

  type Props = {
    /**
     * Told which project is open, whenever that answer changes or is re-read. Called with the
     * project itself rather than its id so a rename reaches the caller too — a workshop showing
     * a stale project name is the same failure as one showing the wrong project.
     */
    onProjectChange?: (project: Project | undefined) => void;
  };

  const { onProjectChange }: Props = $props();

  // One id per component instance, so two bars on a page do not collide on label `for`.
  const uid = $props.id();
  const openId = `${uid}-open`;
  const nameId = `${uid}-name`;
  const newNameId = `${uid}-new-name`;

  let projects: Project[] = $state([]);
  let activeProjectId: string | undefined = $state(undefined);
  let name = $state('');
  let newName = $state('');
  let adoption: LegacyAdoptionNotice | null = $state(null);
  let storageError: string | null = $state(null);

  // Projects live in the vault database, which does not exist while the site is being prerendered.
  // Reading after mount keeps the server-rendered markup and the first client render identical.
  onMount(async () => {
    // The root layout runs adoption too, and that is the call that matters — it is what adopts a
    // user's saved work whether or not they ever open the workshop. This one is here so the note
    // below is right the first time this bar renders: the layout's call is asynchronous and a
    // child's onMount runs before a parent's finishes, so waiting on it would show nothing until
    // the next navigation. Adoption is idempotent, so on every load after the first this reads a
    // handful of entries and returns.
    try {
      await adoptLegacySaves(ARTIFACT_KINDS);
    } catch (error: unknown) {
      // Same reasoning as the layout: a refused write must not take the project bar down with it.
      console.error(error);
    }
    // Nothing lists until the index is in memory, and adoption has already put it there — this is
    // what covers the case where it failed before it got that far.
    await hydrateProjects();
    refresh();
  });

  // A project can be created and opened from somewhere else entirely — a generator in a panel
  // saving its first culture — and a bar still reading "no project yet" over one the user has just
  // filled is the whole reason this subscription exists.
  onMount(() => onProjectsChanged(refresh));

  function refresh() {
    projects = listProjects();
    const active = getActiveProject();
    activeProjectId = active?.id;
    name = active?.name ?? '';
    adoption = legacyAdoptionNotice();
    onProjectChange?.(active);
  }

  /**
   * Report a write the database refused rather than letting the bar redraw as though it worked.
   *
   * The full treatment — a blocking dialog offering a download, an export, and the storage panel —
   * is the storage-status work. What is not deferred is saying that it failed: a store whose
   * writes return a result the caller drops is a store that loses work silently.
   */
  function report<T>(result: VaultResult<T> | undefined): void {
    storageError =
      result === undefined || result.ok
        ? null
        : `That could not be saved (${result.reason}). Your work is still here; try again.`;
  }

  // Undefined once the project the note names has been deleted, which is what hides the note: an
  // artifact the user has already thrown away is not something to announce as newly arrived.
  const adoptedProjectName = $derived(
    adoption === null
      ? undefined
      : projects.find((project) => project.id === adoption?.projectId)?.name,
  );

  function dismissAdoptionNotice() {
    acknowledgeLegacyAdoptionNotice();
    adoption = null;
  }

  async function create() {
    const requested = newName;
    const created = await createProject({ name: requested });
    report(created);
    if (created.ok) {
      // Creating a project from this bar is an explicit request to work in it, so it is opened.
      // The library deliberately does not do that on its own.
      setActiveProject(created.value.id);
      // Only what this call consumed. The write is asynchronous now, and someone typing the next
      // project's name while it commits must not have it wiped out from under them.
      if (newName === requested) {
        newName = '';
      }
    }
    refresh();
  }

  function open(id: string) {
    setActiveProject(id);
    refresh();
  }

  async function rename() {
    if (activeProjectId !== undefined) {
      report(await renameProject(activeProjectId, name));
    }
    refresh();
  }

  async function remove() {
    if (activeProjectId !== undefined) {
      report(await deleteProject(activeProjectId));
    }
    refresh();
  }

  /**
   * Open what an import brought in.
   *
   * An imported project is opened because importing one is an explicit request to work in it —
   * the same reasoning that opens a project created from this bar. An imported artifact went into
   * the project that was already open, so there is nothing to move to.
   */
  function afterImport(summary: ImportSummary) {
    if (summary.projectsAdded > 0 && summary.projectId !== undefined) {
      setActiveProject(summary.projectId);
    }
    refresh();
  }
</script>

<section class="project-context">
  <h2>Project</h2>

  {#if adoption !== null && adoptedProjectName !== undefined}
    <!-- Adoption happens on page load, wherever the user happens to be, so this is where they are
         told it happened. It still says the originals are untouched, because that is the
         reassurance the message exists to give — but it no longer points at the saved data page,
         which has gone (#44). Naming a page that now redirects would be a worse answer than
         naming none. -->
    <div class="project-context__adoption" role="status">
      <p>
        {adoption.adoptedCount}
        {adoption.adoptedCount === 1 ? 'item you saved' : 'items you saved'} before projects existed
        {adoption.adoptedCount === 1 ? 'is' : 'are'} now in
        <strong>{adoptedProjectName}</strong>. Copied, not moved — the originals are untouched in
        this browser's storage.
      </p>
      {#if adoption.skippedCount > 0}
        <p>
          {adoption.skippedCount}
          {adoption.skippedCount === 1 ? 'item' : 'items'} could not be read by this version, and
          {adoption.skippedCount === 1 ? 'was' : 'were'} left where {adoption.skippedCount === 1
            ? 'it is'
            : 'they are'}.
        </p>
      {/if}
      <button type="button" onclick={dismissAdoptionNotice}>Got it</button>
    </div>
  {/if}

  {#if storageError !== null}
    <p class="project-context__error" role="alert">{storageError}</p>
  {/if}

  <div class="project-context__row">
    <div class="input-group">
      <label for={newNameId}>New project</label>
      <input
        id={newNameId}
        type="text"
        bind:value={newName}
        placeholder="Name"
        autocomplete="off"
      />
    </div>
    <button type="button" onclick={create}>Create project</button>
  </div>

  {#if activeProjectId === undefined}
    <p class="project-context__empty">No project yet. Create one to start building.</p>
  {:else}
    <div class="project-context__row">
      <div class="input-group">
        <label for={openId}>Open project</label>
        <select
          id={openId}
          value={activeProjectId}
          onchange={(event) => open(event.currentTarget.value)}
        >
          {#each projects as project (project.id)}
            <option value={project.id}>{project.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="project-context__row">
      <div class="input-group">
        <label for={nameId}>Name</label>
        <input id={nameId} type="text" bind:value={name} autocomplete="off" />
      </div>
      <button type="button" onclick={rename}>Rename</button>
      <button type="button" onclick={remove}>Delete project</button>
    </div>

    <p class="project-context__count">
      {projects.length}
      {projects.length === 1 ? 'project' : 'projects'}
    </p>
  {/if}

  <!-- One step from the project itself, and never behind a menu. In an application with no server
       copy, a file is the only copy of this work that survives clearing site data, so export is
       the durability story rather than a convenience. Import sits beside it and takes a project
       file or a single artifact — the file says which. -->
  <ProjectTransferControls projectId={activeProjectId} onImported={afterImport} />
</section>

<style>
  .project-context {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    background: var(--slate);
  }

  .project-context h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  .project-context__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .project-context__adoption {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
  }

  .project-context__adoption p {
    margin: 0;
    font-size: 0.9rem;
  }

  .project-context .input-group {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    min-width: 0;
  }

  .project-context input[type='text'],
  .project-context select {
    min-width: 0;
    flex: 1 1 10rem;
  }

  .project-context__error {
    margin: 0;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .project-context__empty,
  .project-context__count {
    margin: 0;
    font-size: 0.85rem;
    font-style: italic;
    opacity: 0.8;
  }
</style>
