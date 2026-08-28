<script lang="ts">
  import { onMount } from 'svelte';

  import {
    artifactTagsOf,
    deleteArtifact,
    filterVaultEntriesByProject,
    groupArtifactsByKind,
    hydrateArtifacts,
    listAllArtifacts,
    onArtifactsChanged,
    searchArtifacts,
    toVaultEntries,
    vaultProjectNames,
    type ArtifactSummary,
    type VaultEntry,
  } from '$lib/artifacts';
  import { hydrateProjects, listProjects, onProjectsChanged } from '$lib/projects';
  import { showConfirmModal } from '$lib/ui';
  import { artifactKindEntry, registeredArtifactKinds } from '$lib/workshop';
  import ListButton from '$components/common/ListButton.svelte';
  import ArtifactInspector from '$components/common/ArtifactInspector.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const uid = $props.id();
  const queryId = `${uid}-query`;
  const projectId = `${uid}-project`;
  const kindId = `${uid}-kind`;

  /** Registry order, so kinds group the way they are declared rather than alphabetically. */
  const kindOrder = registeredArtifactKinds().map((entry) => entry.kind);

  let entries: VaultEntry[] = $state([]);
  let query = $state('');
  let projectFilter = $state('');
  let kindFilter = $state('');
  let selectedTags: string[] = $state([]);
  let selectedId: string | undefined = $state(undefined);
  let error: string | null = $state(null);
  let notice: string | null = $state(null);

  function refresh(): void {
    const names = new Map(listProjects().map((project) => [project.id, project.name]));
    entries = toVaultEntries(listAllArtifacts(), names);
  }

  onMount(async () => {
    // Both indexes: the listing is artifacts joined to project names, and an unhydrated project
    // index would label every row "Project missing".
    await hydrateProjects();
    await hydrateArtifacts();
    refresh();
  });

  onMount(() => onArtifactsChanged(refresh));
  onMount(() => onProjectsChanged(refresh));

  const projectOptions = $derived(vaultProjectNames(entries));
  const tagOptions = $derived(artifactTagsOf(entries.map((entry) => entry.artifact)));

  /**
   * Derived rather than pruned in place, for the same reason `ProjectView` does it: a tag whose
   * last artifact has gone would otherwise leave an empty list on screen with no checkbox left to
   * explain it, and pruning inside the refresh would have this component writing the state its own
   * filtering reads.
   */
  const activeTags = $derived(selectedTags.filter((tag) => tagOptions.includes(tag)));

  const visible = $derived.by(() => {
    const byProject = filterVaultEntriesByProject(entries, projectFilter);
    // The search itself is the shared one, so the vault filters by exactly the mechanism the
    // project view and the tool catalog already use rather than growing a second.
    const matched = searchArtifacts(
      byProject.map((entry) => entry.artifact),
      {
        query,
        kind: kindFilter === '' ? undefined : kindFilter,
        tags: activeTags,
      },
    );
    const kept = new Set(matched.map((summary) => summary.id));
    return byProject.filter((entry) => kept.has(entry.artifact.id));
  });

  const groups = $derived(
    groupArtifactsByKind(
      visible.map((entry) => entry.artifact),
      kindOrder,
    ),
  );

  const selected = $derived(
    selectedId === undefined
      ? undefined
      : entries.find((entry) => entry.artifact.id === selectedId),
  );

  function projectNameFor(id: string): string {
    return entries.find((entry) => entry.artifact.id === id)?.projectName ?? '';
  }

  function kindLabel(kind: string): string {
    return artifactKindEntry(kind)?.displayName ?? kind;
  }

  function toggleTag(tag: string): void {
    selectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((entry) => entry !== tag)
      : [...selectedTags, tag];
  }

  async function remove(summary: ArtifactSummary): Promise<void> {
    const confirmed = await showConfirmModal({
      title: 'Delete artifact',
      message: `Delete “${summary.name}”? This cannot be undone, and there is no copy anywhere else.`,
      okLabel: 'Delete',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    const result = await deleteArtifact(summary.projectId, summary.id);
    if (!result.ok) {
      error = `That could not be deleted (${result.reason}).`;
      return;
    }
    error = null;
    notice = `“${summary.name}” is gone.`;
    // The listing is what owns the selection, which is why the delete lands here rather than in
    // the Inspector: something has to drop the id the Inspector was showing.
    selectedId = undefined;
    refresh();
  }
</script>

<svelte:head>
  <title>Result Vault | Iron Arachne</title>
</svelte:head>

<section class="vault" class:vault--inspecting={selected !== undefined}>
  <h1>Result Vault</h1>

  {#if error !== null}
    <p class="vault__error" role="alert">{error}</p>
  {/if}
  {#if notice !== null}
    <p class="vault__notice" role="status">{notice}</p>
  {/if}

  <div class="vault__columns">
    <div class="vault__list">
      <div class="vault__filters">
        <div class="input-group input-group--inline">
          <label for={queryId}>Search</label>
          <input id={queryId} type="search" bind:value={query} placeholder="Name or kind" />
        </div>
        <div class="input-group input-group--inline">
          <label for={projectId}>Project</label>
          <select id={projectId} bind:value={projectFilter}>
            <option value="">All projects</option>
            {#each projectOptions as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>
        <div class="input-group input-group--inline">
          <label for={kindId}>Kind</label>
          <select id={kindId} bind:value={kindFilter}>
            <option value="">All kinds</option>
            {#each kindOrder as kind (kind)}
              <option value={kind}>{kindLabel(kind)}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if tagOptions.length > 0}
        <fieldset class="vault__tags">
          <legend>Tags</legend>
          {#each tagOptions as tag (tag)}
            <label>
              <input
                type="checkbox"
                checked={activeTags.includes(tag)}
                onchange={() => toggleTag(tag)}
              />
              {tag}
            </label>
          {/each}
        </fieldset>
      {/if}

      {#if entries.length === 0}
        <p class="vault__empty">
          Nothing saved yet. Anything you keep in the workshop shows up here, whichever project it
          went into.
        </p>
      {:else if visible.length === 0}
        <p class="vault__empty">Nothing matches that.</p>
      {:else}
        {#each groups as group (group.kind)}
          <h2>{kindLabel(group.kind)}</h2>
          <ul>
            {#each group.artifacts as artifact (artifact.id)}
              <li>
                <ListButton
                  selected={artifact.id === selectedId}
                  onclick={() => (selectedId = artifact.id)}
                >
                  <span class="vault__row-name">{artifact.name}</span>
                  <span class="vault__row-project">{projectNameFor(artifact.id)}</span>
                </ListButton>
              </li>
            {/each}
          </ul>
        {/each}
      {/if}
    </div>

    <div class="vault__inspector">
      {#if selected === undefined}
        <p class="vault__empty">Pick something on the left to look at it.</p>
      {:else}
        <!--
          On a phone the list and the Inspector are two views rather than one stacked on the other:
          a list above an inspector means every selection scrolls the page. This control is what
          gets back, and it is hidden above the breakpoint where both columns are on screen.
        -->
        <BaseButton class="vault__back" onclick={() => (selectedId = undefined)}>
          ← All results
        </BaseButton>
        {#key selected.artifact.id}
          <ArtifactInspector
            projectId={selected.artifact.projectId}
            projectName={selected.projectName}
            artifactId={selected.artifact.id}
            onDelete={remove}
          />
        {/key}
      {/if}
    </div>
  </div>
</section>

<style>
  /* Not `section.main`: the vault is two columns and wants the page region, the same opt-out the
     workshop takes. */
  .vault {
    padding: 0.5rem;
  }

  .vault h1 {
    margin: 0 0 0.5rem;
  }

  .vault__columns {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: minmax(18rem, 24rem) 1fr;
    align-items: start;
  }

  .vault__list {
    min-width: 0;
  }

  .vault__inspector {
    min-width: 0;
  }

  .vault__filters {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset and the room to shrink. */
  .vault__filters .input-group {
    margin: 0;
    min-width: 0;
  }

  .vault__filters input,
  .vault__filters select {
    flex: 1 1 8rem;
    min-width: 0;
  }

  .vault__tags {
    border: 1px solid var(--granite);
    border-radius: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0 0 0.75rem;
    padding: 0.5rem;
  }

  .vault__tags label {
    align-items: center;
    display: flex;
    font-size: 0.85rem;
    gap: 0.25rem;
  }

  .vault__list h2 {
    font-size: 1rem;
    margin: 0.75rem 0 0.25rem;
  }

  .vault__list ul {
    margin: 0;
    padding: 0;
  }

  .vault__list li {
    list-style-type: none;
    margin-left: 0;
  }

  .vault__row-name {
    overflow-wrap: anywhere;
  }

  .vault__row-project {
    flex: 0 0 auto;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .vault__empty {
    font-style: italic;
    opacity: 0.8;
  }

  .vault__error,
  .vault__notice {
    border: 1px solid var(--tan);
    border-radius: 4px;
    margin: 0 0 0.75rem;
    padding: 0.6rem 0.75rem;
  }

  :global(.vault__back) {
    display: none;
    margin-bottom: 0.5rem;
  }

  /* One column below the two-column breakpoint, and the list and the Inspector become two views:
     whichever one is not in use is not rendered, so a selection swaps the screen instead of
     scrolling past a list to reach what was picked. */
  @media (max-width: 63rem) {
    .vault__columns {
      grid-template-columns: 1fr;
    }

    :global(.vault__back) {
      display: inline-block;
    }

    .vault--inspecting .vault__list {
      display: none;
    }

    .vault:not(.vault--inspecting) .vault__inspector {
      display: none;
    }
  }
</style>
