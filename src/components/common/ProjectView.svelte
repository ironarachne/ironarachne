<script lang="ts">
  import { onMount } from 'svelte';

  import {
    artifactTagsOf,
    deleteArtifact,
    groupArtifactsByKind,
    hydrateArtifacts,
    listArtifacts,
    onArtifactsChanged,
    searchArtifacts,
    type ArtifactSummary,
  } from '$lib/artifacts';
  import { showConfirmModal } from '$lib/ui';
  import { artifactKindEntry, registeredArtifactKinds } from '$lib/workshop';

  type Props = {
    /** The open project, or undefined when there is none. */
    projectId?: string;
    /** Ids of the artifacts already on the bench, so the list can say which are open. */
    openArtifactIds?: string[];
    /** Called when the user asks to put an artifact on the bench. */
    onOpenArtifact?: (artifactId: string) => void;
  };

  const { projectId, openArtifactIds = [], onOpenArtifact }: Props = $props();

  const uid = $props.id();
  const filterId = `${uid}-filter`;
  const kindId = `${uid}-kind`;

  /** Registry order, so kinds are grouped the way they are declared rather than alphabetically. */
  const kindOrder = registeredArtifactKinds().map((entry) => entry.kind);

  let artifacts: ArtifactSummary[] = $state([]);
  let query = $state('');
  let kindFilter = $state('');
  let selectedTags: string[] = $state([]);
  let error: string | null = $state(null);
  let notice: string | null = $state(null);

  const open = $derived(new Set(openArtifactIds));
  const tagOptions = $derived(artifactTagsOf(artifacts));
  // Derived rather than pruned in place. A tag whose last artifact has gone would otherwise leave
  // an empty list on screen with no checkbox left to explain it — and pruning it inside the
  // refresh would have this component writing the state its own filtering reads.
  const activeTags = $derived(selectedTags.filter((tag) => tagOptions.includes(tag)));
  const visible = $derived(
    searchArtifacts(artifacts, {
      query,
      kind: kindFilter === '' ? undefined : kindFilter,
      tags: activeTags,
    }),
  );
  const groups = $derived(groupArtifactsByKind(visible, kindOrder));
  const presentKinds = $derived(groupArtifactsByKind(artifacts, kindOrder));

  function refresh() {
    artifacts = projectId === undefined ? [] : listArtifacts(projectId);
  }

  // The vault database is not there while the site is being prerendered, so nothing is read until
  // after mount. The subscription is what keeps this list in step with a generator saving from
  // another panel — neither knows the other exists.
  onMount(() => {
    void hydrateArtifacts().then(refresh);
    return onArtifactsChanged(refresh);
  });

  // A project switch happens without this component being torn down, so the list follows it, and
  // the filters start clean rather than narrowing the new project by the old one's tags.
  $effect(() => {
    void projectId;
    selectedTags = [];
    error = null;
    notice = null;
    refresh();
  });

  function kindName(kind: string): string {
    return artifactKindEntry(kind)?.displayName ?? kind;
  }

  function toggleTag(tag: string) {
    selectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((selected) => selected !== tag)
      : [...selectedTags, tag];
  }

  /**
   * Deleting an artifact says what points at it before it goes.
   *
   * The store deletes and reports the referrers rather than refusing, per the settled policy in
   * docs/workshop.md — so the confirmation names what will be left pointing at nothing, and the
   * user decides.
   */
  async function remove(summary: ArtifactSummary) {
    if (projectId === undefined) {
      return;
    }
    const confirmed = await showConfirmModal({
      title: 'Delete artifact',
      message: `Delete “${summary.name}”? This cannot be undone.`,
      okLabel: 'Delete',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    const result = await deleteArtifact(projectId, summary.id);
    if (!result.ok) {
      error = `That could not be deleted (${result.reason}).`;
      return;
    }
    error = null;
    const referrers = result.value.referrers.map((referrer) => referrer.name);
    notice =
      referrers.length === 0
        ? null
        : `Deleted. These now point at something that is gone: ${referrers.join(', ')}.`;
    refresh();
  }
</script>

<section class="project-view">
  <h2>In this project</h2>

  {#if projectId === undefined}
    <p class="project-view__empty">No project open. Create one to start keeping what you make.</p>
  {:else}
    <div class="project-view__filters">
      <div class="input-group">
        <label for={filterId}>Find</label>
        <input
          id={filterId}
          type="search"
          bind:value={query}
          placeholder="Filter by name"
          autocomplete="off"
        />
      </div>

      {#if presentKinds.length > 1}
        <div class="input-group">
          <label for={kindId}>Kind</label>
          <select id={kindId} bind:value={kindFilter}>
            <option value="">All kinds</option>
            {#each presentKinds as group (group.kind)}
              <option value={group.kind}>{kindName(group.kind)} ({group.artifacts.length})</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    {#if tagOptions.length > 0}
      <fieldset class="project-view__tags">
        <legend>Tags</legend>
        {#each tagOptions as tag (tag)}
          <label>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onchange={() => toggleTag(tag)}
            />
            {tag}
          </label>
        {/each}
      </fieldset>
    {/if}

    {#if error !== null}
      <p class="project-view__error" role="alert">{error}</p>
    {/if}

    {#if notice !== null}
      <p class="project-view__error" role="status">{notice}</p>
    {/if}

    <p class="project-view__count">
      {#if visible.length === artifacts.length}
        {artifacts.length}
        {artifacts.length === 1 ? 'artifact' : 'artifacts'}
      {:else}
        {visible.length} of {artifacts.length} artifacts
      {/if}
    </p>

    <div class="project-view__list">
      {#each groups as group (group.kind)}
        <h3>{kindName(group.kind)}</h3>
        <ul>
          {#each group.artifacts as summary (summary.id)}
            {@const isOpen = open.has(summary.id)}
            <li>
              <button
                type="button"
                class="project-view__artifact"
                class:project-view__artifact--open={isOpen}
                aria-current={isOpen ? 'true' : undefined}
                onclick={() => onOpenArtifact?.(summary.id)}
              >
                <span class="project-view__name">{summary.name}</span>
                {#if isOpen}
                  <span class="project-view__badge">Open</span>
                {/if}
              </button>
              <button
                type="button"
                class="project-view__delete"
                aria-label="Delete {summary.name}"
                onclick={() => remove(summary)}
              >
                ×
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="project-view__empty">
          {artifacts.length === 0
            ? 'Nothing saved here yet. Generate something and save it.'
            : 'Nothing matches.'}
        </p>
      {/each}
    </div>
  {/if}
</section>

<style>
  .project-view {
    flex: 1 1 18rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    background: var(--slate);
  }

  .project-view h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  .project-view h3 {
    margin: 0.75rem 0 0.25rem;
    font-size: 0.85rem;
    color: var(--gold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .project-view h3:first-child {
    margin-top: 0;
  }

  .project-view__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .project-view .input-group {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    min-width: 0;
  }

  .project-view input[type='search'],
  .project-view select {
    min-width: 0;
    flex: 1 1 8rem;
  }

  .project-view__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
  }

  .project-view__tags legend {
    padding: 0 0.3rem;
    color: var(--gold);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .project-view__tags label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
  }

  .project-view__list {
    /* The list is what scrolls, so a project holding a hundred artifacts does not push the bench
       off the bottom of the page. */
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    max-height: var(--project-view-max-height, 20rem);
  }

  .project-view ul {
    margin: 0;
    padding: 0;
  }

  .project-view li {
    display: flex;
    align-items: stretch;
    gap: 0.25rem;
    list-style-type: none;
    margin: 0 0 0.15rem;
  }

  .project-view__artifact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    padding: 0.3rem 0.5rem;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    color: white;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.3;
    text-align: left;
  }

  .project-view__artifact:hover {
    border: 1px solid var(--iron-arachne-green);
    background: color-mix(in srgb, var(--iron-arachne-green) 15%, transparent);
  }

  .project-view__artifact--open {
    border: 1px solid var(--gold);
    background: color-mix(in srgb, var(--gold) 20%, transparent);
  }

  .project-view__delete {
    flex-shrink: 0;
    min-width: 2.75rem;
    margin: 0;
    padding: 0.2rem 0.5rem;
    line-height: 1;
  }

  .project-view__name {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .project-view__badge {
    flex-shrink: 0;
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--gold);
    border-radius: 999px;
    background: var(--charcoal);
    color: var(--gold);
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    line-height: 1.5;
    text-transform: uppercase;
  }

  .project-view__empty,
  .project-view__count {
    margin: 0;
    font-size: 0.85rem;
    font-style: italic;
    opacity: 0.8;
  }

  .project-view__error {
    margin: 0;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    font-size: 0.9rem;
  }
</style>
