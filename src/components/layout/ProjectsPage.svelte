<script lang="ts">
  import { onMount } from 'svelte';

  import { resolve } from '$app/paths';
  import { hydrateArtifacts, listArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import { getShortDate } from '$lib/dates';
  import { formatBytes } from '$lib/format';
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
  } from '$lib/projects';
  import { showConfirmModal } from '$lib/ui';
  import type { VaultResult } from '$lib/vault_db';
  import type { ImportSummary } from '$lib/vault_file';
  import ProjectTransferControls from '$components/common/ProjectTransferControls.svelte';
  import VaultTransferControls from '$components/common/VaultTransferControls.svelte';

  const uid = $props.id();
  const newNameId = `${uid}-new-name`;

  type Row = {
    project: Project;
    artifactCount: number;
    byteSize: number;
  };

  let rows: Row[] = $state([]);
  let activeProjectId: string | undefined = $state(undefined);
  let newName = $state('');
  let storageError: string | null = $state(null);
  /** The project whose name and description are being edited, if any. */
  let editingId: string | undefined = $state(undefined);
  let editName = $state('');
  let editDescription = $state('');

  function refresh(): void {
    const projects = listProjects();
    rows = projects.map((project) => {
      const artifacts = listArtifacts(project.id);
      return {
        project,
        artifactCount: artifacts.length,
        byteSize: artifacts.reduce((total, artifact) => total + artifact.byteSize, 0),
      };
    });
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

  async function create(): Promise<void> {
    const requested = newName.trim();
    const created = await createProject(requested === '' ? {} : { name: requested });
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
    }
    refresh();
  }

  function open(id: string): void {
    setActiveProject(id);
    refresh();
  }

  function startEditing(project: Project): void {
    editingId = project.id;
    editName = project.name;
    editDescription = project.description ?? '';
  }

  function cancelEditing(): void {
    editingId = undefined;
  }

  async function saveEdits(id: string): Promise<void> {
    // One call rather than a rename followed by a description write: `updateProject` takes both,
    // and two calls would bump `updatedAt` twice and reorder the list mid-edit for a single user
    // action. An empty description clears it, which is what the field's placeholder promises.
    report(await updateProject(id, { name: editName, description: editDescription.trim() }));
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

  {#if rows.length === 0}
    <p class="projects__empty">
      No projects yet. Create one above, or import a project file below.
    </p>
  {:else}
    <ul class="projects__list">
      {#each rows as row (row.project.id)}
        <li class="project-card" class:project-card--active={row.project.id === activeProjectId}>
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
              <div class="project-card__actions">
                <button type="button" onclick={() => saveEdits(row.project.id)}>Save</button>
                <button type="button" onclick={cancelEditing}>Cancel</button>
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

            <p class="project-card__facts">
              {row.artifactCount}
              {row.artifactCount === 1 ? 'artifact' : 'artifacts'}
              · {formatBytes(row.byteSize)}
              · updated {getShortDate(new Date(row.project.updatedAt))}
            </p>

            <div class="project-card__actions">
              {#if row.project.id === activeProjectId}
                <a class="project-card__link" href={resolve('/workshop')}>Go to workshop</a>
              {:else}
                <button type="button" onclick={() => open(row.project.id)}>Open</button>
              {/if}
              <button type="button" onclick={() => startEditing(row.project)}>Rename</button>
              <button type="button" onclick={() => remove(row)}>Delete</button>
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
       in exactly the case it exists for. -->
  <section class="projects__transfer">
    <h2>Backup</h2>
    <p>
      Everything you make lives in this browser and nowhere else. A file is the only copy that
      survives clearing site data, a new machine, or a browser deciding on its own to reclaim the
      space.
    </p>
    <VaultTransferControls projectId={activeProjectId} onVaultChanged={afterImport} />

    <h3>This project</h3>
    <p>Take one project on its own, or bring one in from a file.</p>
    <ProjectTransferControls projectId={activeProjectId} onImported={afterImport} />
  </section>
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

  .projects__create .input-group {
    align-items: center;
    display: flex;
    gap: 0.35rem;
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

  .project-card__edit .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin: 0;
  }

  .projects__transfer {
    border-top: 1px solid var(--granite);
    margin-top: 2rem;
    padding-top: 1rem;
    max-width: var(--measure);
  }
</style>
