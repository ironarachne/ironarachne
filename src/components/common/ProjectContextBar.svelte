<script lang="ts">
  import { onMount } from 'svelte';

  import {
    createProject,
    deleteProject,
    getActiveProject,
    listProjects,
    renameProject,
    setActiveProject,
    type Project,
  } from '$lib/projects';

  // One id per component instance, so two bars on a page do not collide on label `for`.
  const uid = $props.id();
  const openId = `${uid}-open`;
  const nameId = `${uid}-name`;
  const newNameId = `${uid}-new-name`;

  let projects: Project[] = $state([]);
  let activeProjectId: string | undefined = $state(undefined);
  let name = $state('');
  let newName = $state('');

  // Projects live in localStorage, which does not exist while the site is being prerendered.
  // Reading after mount keeps the server-rendered markup and the first client render identical.
  onMount(refresh);

  function refresh() {
    projects = listProjects();
    const active = getActiveProject();
    activeProjectId = active?.id;
    name = active?.name ?? '';
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
