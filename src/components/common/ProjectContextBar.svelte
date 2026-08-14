<script lang="ts">
  import { onMount } from 'svelte';

  import { resolve } from '$app/paths';

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
    listProjects,
    renameProject,
    setActiveProject,
    type Project,
  } from '$lib/projects';
  import { ARTIFACT_KINDS } from '$lib/workshop';

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

  // Projects live in localStorage, which does not exist while the site is being prerendered.
  // Reading after mount keeps the server-rendered markup and the first client render identical.
  onMount(() => {
    // The root layout runs adoption too, and that is the call that matters — it is what adopts a
    // user's saved work whether or not they ever open the workshop. This one is here so the note
    // below is right the first time this bar renders: the layout's call is asynchronous and a
    // child's onMount runs before a parent's finishes, so waiting on it would show nothing until
    // the next navigation. Adoption is idempotent, so on every load after the first this reads
    // four storage entries and returns.
    try {
      adoptLegacySaves(ARTIFACT_KINDS);
    } catch (error: unknown) {
      // Same reasoning as the layout: a refused write must not take the project bar down with it.
      console.error(error);
    }
    refresh();
  });

  function refresh() {
    projects = listProjects();
    const active = getActiveProject();
    activeProjectId = active?.id;
    name = active?.name ?? '';
    adoption = legacyAdoptionNotice();
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

  function create() {
    // Creating a project from this bar is an explicit request to work in it, so it is opened.
    // The library deliberately does not do that on its own.
    const project = createProject({ name: newName });
    setActiveProject(project.id);
    newName = '';
    refresh();
  }

  function open(id: string) {
    setActiveProject(id);
    refresh();
  }

  function rename() {
    if (activeProjectId !== undefined) {
      renameProject(activeProjectId, name);
    }
    refresh();
  }

  function remove() {
    if (activeProjectId !== undefined) {
      deleteProject(activeProjectId);
    }
    refresh();
  }
</script>

<section class="project-context">
  <h2>Project</h2>

  {#if adoption !== null && adoptedProjectName !== undefined}
    <!-- Adoption happens on page load, wherever the user happens to be, so this is where they are
         told it happened. It says where the originals still are because that is the reassurance
         the message needs: nothing was moved out from under them. -->
    <div class="project-context__adoption" role="status">
      <p>
        {adoption.adoptedCount}
        {adoption.adoptedCount === 1 ? 'item you saved' : 'items you saved'} before projects existed
        {adoption.adoptedCount === 1 ? 'is' : 'are'} now in
        <strong>{adoptedProjectName}</strong>. Your originals are untouched, and still on the
        <a href={resolve('/saved-data')}>saved data</a> page.
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

  .project-context__empty,
  .project-context__count {
    margin: 0;
    font-size: 0.85rem;
    font-style: italic;
    opacity: 0.8;
  }
</style>
