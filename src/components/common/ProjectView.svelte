<script lang="ts">
  import { onMount } from 'svelte';

  import {
    artifactTagsOf,
    deleteArtifact,
    groupArtifactsByKind,
    hasBrokenArtifactReferences,
    hydrateArtifacts,
    listArtifactBacklinks,
    listArtifacts,
    onArtifactsChanged,
    searchArtifacts,
    type ArtifactSummary,
  } from '$lib/artifacts';
  import Download from '$lib/download';
  import { showConfirmModal } from '$lib/ui';
  import { buildArtifactExportFile } from '$lib/vault_file';
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
  /**
   * The artifacts pointing at something that is gone.
   *
   * Computed over the whole list rather than per row so it follows `artifacts`, which is what the
   * change subscription refreshes: deleting a culture has to mark the regions that used it in the
   * same redraw, not the next time something else happens.
   */
  const withBrokenReferences = $derived(
    new Set(
      projectId === undefined
        ? []
        : artifacts
            .filter((summary) => hasBrokenArtifactReferences(projectId, summary))
            .map((summary) => summary.id),
    ),
  );

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

  /** How many referrers the prompt names before it starts counting. */
  const REFERRERS_SHOWN = 5;

  /**
   * What the user is being asked to break.
   *
   * The list is read before the delete, because after it there is nothing left to ask about. A
   * self-reference is left out — it goes with the artifact — and a long list is cut short rather
   * than filling the screen, since past a handful the answer is "a lot of things" either way.
   */
  function deletionMessage(projectId: string, summary: ArtifactSummary): string {
    const referrers = listArtifactBacklinks(projectId, summary.id)
      .map((backlink) => backlink.referrer)
      .filter((referrer) => referrer.id !== summary.id);
    if (referrers.length === 0) {
      return `Delete “${summary.name}”? This cannot be undone.`;
    }
    const named = referrers.slice(0, REFERRERS_SHOWN).map((referrer) => referrer.name);
    const rest = referrers.length - named.length;
    const list = rest === 0 ? named.join(', ') : `${named.join(', ')}, and ${rest} more`;
    return `Delete “${summary.name}”? This cannot be undone. ${list} ${
      referrers.length === 1 ? 'uses' : 'use'
    } it, and will be left pointing at something that is gone.`;
  }

  /**
   * Write one artifact to a file — what handing a single culture to another person looks like.
   *
   * Beside the delete button rather than inside the artifact's panel, because this list is where a
   * user meets an artifact and export is the only way one leaves this browser. It does not stamp
   * the project as exported: one artifact is not a backup of the project, and treating it as one
   * is how a user ends up believing work is covered when it is not.
   */
  async function exportArtifact(summary: ArtifactSummary) {
    if (projectId === undefined) {
      return;
    }
    const built = await buildArtifactExportFile(projectId, summary.id);
    if (!built.ok) {
      error = `“${summary.name}” could not be exported (${built.reason}).`;
      return;
    }
    const url = URL.createObjectURL(new Blob([built.value.text], { type: 'application/json' }));
    Download(url, built.value.fileName);
    URL.revokeObjectURL(url);
    error = null;
    notice =
      built.value.issues.length > 0
        ? built.value.issues.join(' ')
        : `Saved ${built.value.fileName}.`;
  }

  /**
   * Deleting an artifact says what points at it before it goes.
   *
   * The store deletes and reports the referrers rather than refusing, per the settled policy in
   * docs/workshop.md — so the confirmation names what will be left pointing at nothing, and the
   * user decides. Refusing the delete until every referrer was updated was the alternative, and
   * it collapses into never being able to delete anything.
   */
  async function remove(summary: ArtifactSummary) {
    if (projectId === undefined) {
      return;
    }
    const confirmed = await showConfirmModal({
      title: 'Delete artifact',
      message: deletionMessage(projectId, summary),
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
      <div class="input-group input-group--inline">
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
        <div class="input-group input-group--inline">
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
                {#if withBrokenReferences.has(summary.id)}
                  <!-- A dangling reference is tolerated, never silent: the listing is where a
                       user meets this artifact, so it is where the breakage has to show. -->
                  <span class="project-view__badge project-view__badge--broken">Broken link</span>
                {/if}
                {#if isOpen}
                  <span class="project-view__badge">Open</span>
                {/if}
              </button>
              <button
                type="button"
                class="project-view__row-action"
                aria-label="Export {summary.name}"
                title="Export"
                onclick={() => void exportArtifact(summary)}
              >
                ⤓
              </button>
              <button
                type="button"
                class="project-view__row-action"
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

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset and the room to shrink. */
  .project-view .input-group {
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

  .project-view__row-action {
    /* Two of these sit beside every row, so they are sized to the smallest comfortable tap target
       rather than to their glyph — a row on a 320px phone has to hold both without wrapping. */
    flex-shrink: 0;
    min-width: 2.5rem;
    margin: 0;
    padding: 0.2rem 0.4rem;
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

  .project-view__badge--broken {
    border-color: var(--tan);
    color: var(--tan);
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
