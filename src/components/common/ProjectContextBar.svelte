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
    getActiveProject,
    hydrateProjects,
    listProjects,
    onProjectsChanged,
    setActiveProject,
    type Project,
  } from '$lib/projects';
  import { ARTIFACT_KINDS } from '$lib/workshop';

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

  let projects: Project[] = $state([]);
  let activeProjectId: string | undefined = $state(undefined);
  let adoption: LegacyAdoptionNotice | null = $state(null);

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

  // A project can be created and opened from somewhere else entirely — the projects page, or a
  // generator in a panel saving its first culture — and a bar still reading "no project yet" over
  // one the user has just filled is the whole reason this subscription exists.
  onMount(() => onProjectsChanged(refresh));

  function refresh() {
    projects = listProjects();
    const active = getActiveProject();
    activeProjectId = active?.id;
    adoption = legacyAdoptionNotice();
    onProjectChange?.(active);
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

  function open(id: string) {
    setActiveProject(id);
    refresh();
  }
</script>

<!--
  The bench's project control, and deliberately only that: which project is open, and switching
  it. Creating, renaming, describing, deleting, exporting and importing all moved to /projects
  with the shell (docs/app-shell.md, step 4). A bench cluttered with administration is a bench
  with less room for panels, and every one of those actions is something a user does between
  sessions rather than while building.
-->
<section class="project-context">
  <h2>Project</h2>

  {#if adoption !== null && adoptedProjectName !== undefined}
    <!-- Adoption happens on page load, wherever the user happens to be, so this is where they are
         told it happened. It still says the originals are untouched, because that is the
         reassurance the message exists to give. -->
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
      <!-- The local-only disclosure, for the one cohort that would otherwise never see it: adoption
           creates their project for them on page load, so they may never press Create and never
           reach the notice on /projects. Said here rather than given its own trigger, in a message
           that is already on screen and already dismissible. See docs/storage-disclosure.md. -->
      <p>
        It is saved in this browser only — there is no account and no server.
        <a href={resolve('/projects')}>Export a copy</a> to keep work that outlives this browser.
      </p>
      <button type="button" onclick={dismissAdoptionNotice}>Got it</button>
    </div>
  {/if}

  {#if activeProjectId === undefined}
    <p class="project-context__empty">
      No project yet. <a href={resolve('/projects')}>Create one</a> to start building.
    </p>
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
      <a class="project-context__manage" href={resolve('/projects')}>Manage projects</a>
    </div>
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

  .project-context select {
    min-width: 0;
    flex: 1 1 10rem;
  }

  .project-context__manage {
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .project-context__empty {
    margin: 0;
    font-size: 0.85rem;
    font-style: italic;
    opacity: 0.8;
  }
</style>
