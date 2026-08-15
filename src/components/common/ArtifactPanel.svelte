<script lang="ts">
  import { onMount } from 'svelte';

  import {
    onArtifactsChanged,
    readArtifact,
    renameArtifact,
    type Artifact,
    type ArtifactSummary,
  } from '$lib/artifacts';
  import { artifactKindEntry, ARTIFACT_KINDS } from '$lib/workshop';

  type Props = {
    projectId: string;
    artifactId: string;
  };

  const { projectId, artifactId }: Props = $props();

  const uid = $props.id();
  const nameId = `${uid}-name`;

  /**
   * How deep the generic view descends before it stops and says how much is below.
   *
   * This panel deliberately shows an artifact rather than editing it — per-kind views and editors
   * are their own work — so what it renders is the snapshot itself. A snapshot can be a culture's
   * six name generators and every pattern in them, which is not something to unroll on screen.
   */
  const MAX_DEPTH = 4;
  /** How many entries of a long list are shown before it says how many more there are. */
  const MAX_ENTRIES = 12;

  let artifact = $state<Artifact | undefined>(undefined);
  let summary = $state<ArtifactSummary | undefined>(undefined);
  let problem: string | null = $state(null);
  let name = $state('');
  let renameError: string | null = $state(null);

  const kindName = $derived(
    summary === undefined ? '' : (artifactKindEntry(summary.kind)?.displayName ?? summary.kind),
  );

  async function load() {
    const result = await readArtifact(ARTIFACT_KINDS, projectId, artifactId);
    if (result === undefined) {
      artifact = undefined;
      summary = undefined;
      problem = 'That artifact is no longer in this project.';
      return;
    }
    if (!result.ok) {
      // A payload this build cannot read is still an artifact the user has to be able to see and
      // rename, so the summary stays on screen and only the contents are missing.
      artifact = undefined;
      summary = result.summary;
      name = result.summary.name;
      problem = `This build cannot read the contents (${result.reason}). ${result.message}`;
      return;
    }
    artifact = result.artifact;
    summary = result.artifact;
    name = result.artifact.name;
    problem = result.migrated
      ? 'These contents were written by an older version and were brought forward on the way out. Saving an edit stores them at the current version.'
      : null;
  }

  onMount(() => {
    void load();
    // Another panel can rename or delete what this one is showing, and a stale panel claiming an
    // artifact still exists is the one thing this must not do.
    return onArtifactsChanged((change) => {
      if (change.artifactId === artifactId) {
        void load();
      }
    });
  });

  async function rename() {
    const result = await renameArtifact(projectId, artifactId, name);
    renameError =
      result === undefined
        ? 'That artifact is no longer in this project.'
        : result.ok
          ? null
          : `That could not be saved (${result.reason}).`;
  }

  function formatTimestamp(epochMilliseconds: number): string {
    return new Date(epochMilliseconds).toLocaleString();
  }

  function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /** Turns a snapshot's field name into something readable: `musicStyle` becomes "Music style". */
  function fieldLabel(key: string): string {
    const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }
</script>

{#snippet snapshotValue(value: unknown, depth: number)}
  {#if value === null || value === undefined || value === ''}
    <span class="artifact-panel__absent">—</span>
  {:else if Array.isArray(value)}
    {#if depth >= MAX_DEPTH}
      <span class="artifact-panel__absent">{value.length} entries</span>
    {:else}
      <ul class="artifact-panel__list">
        {#each value.slice(0, MAX_ENTRIES) as entry, index (index)}
          <li>{@render snapshotValue(entry, depth + 1)}</li>
        {/each}
        {#if value.length > MAX_ENTRIES}
          <li class="artifact-panel__absent">…and {value.length - MAX_ENTRIES} more</li>
        {/if}
      </ul>
    {/if}
  {:else if isPlainObject(value)}
    {#if depth >= MAX_DEPTH}
      <span class="artifact-panel__absent">{Object.keys(value).length} fields</span>
    {:else}
      <dl class="artifact-panel__fields">
        {#each Object.entries(value) as [key, nested] (key)}
          <dt>{fieldLabel(key)}</dt>
          <dd>{@render snapshotValue(nested, depth + 1)}</dd>
        {/each}
      </dl>
    {/if}
  {:else}
    {String(value)}
  {/if}
{/snippet}

<div class="artifact-panel">
  {#if summary === undefined}
    <p class="artifact-panel__status">{problem ?? 'Loading…'}</p>
  {:else}
    <div class="input-group">
      <label for={nameId}>Name</label>
      <input id={nameId} type="text" bind:value={name} autocomplete="off" />
      <button type="button" onclick={rename}>Rename</button>
    </div>

    {#if renameError !== null}
      <p class="artifact-panel__problem" role="alert">{renameError}</p>
    {/if}

    <dl class="artifact-panel__meta">
      <dt>Kind</dt>
      <dd>{kindName}</dd>
      <dt>Updated</dt>
      <dd>{formatTimestamp(summary.updatedAt)}</dd>
      {#if summary.tags.length > 0}
        <dt>Tags</dt>
        <dd>{summary.tags.join(', ')}</dd>
      {/if}
      {#if summary.provenance !== undefined}
        <dt>Made with</dt>
        <dd>{summary.provenance.toolPath}, seed {summary.provenance.seed}</dd>
      {/if}
    </dl>

    {#if problem !== null}
      <p class="artifact-panel__problem" role="status">{problem}</p>
    {/if}

    {#if artifact !== undefined}
      <!-- Collapsed by default: what an artifact looks like when its kind knows how to draw it is
           the editing work, and until then this is an honest view of what is actually stored
           rather than a pretence at one. -->
      <details class="artifact-panel__contents">
        <summary>Contents</summary>
        {@render snapshotValue(artifact.payload, 0)}
      </details>
    {/if}
  {/if}
</div>

<style>
  .artifact-panel {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    min-width: 0;
  }

  .artifact-panel .input-group {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    min-width: 0;
  }

  .artifact-panel input[type='text'] {
    min-width: 0;
    flex: 1 1 8rem;
  }

  .artifact-panel__meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.15rem 0.6rem;
    margin: 0;
    font-size: 0.9rem;
  }

  .artifact-panel__meta dt {
    color: var(--gold);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .artifact-panel__meta dd,
  .artifact-panel__fields dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .artifact-panel__fields {
    margin: 0;
  }

  .artifact-panel__fields dt {
    margin-top: 0.35rem;
    color: var(--gold);
    font-size: 0.8rem;
  }

  .artifact-panel__fields dd {
    padding-left: 0.75rem;
  }

  .artifact-panel__list {
    margin: 0;
    padding-left: 1.1rem;
  }

  .artifact-panel__contents summary {
    cursor: pointer;
    color: var(--gold);
  }

  .artifact-panel__absent {
    font-style: italic;
    opacity: 0.7;
  }

  .artifact-panel__status,
  .artifact-panel__problem {
    margin: 0;
    font-size: 0.9rem;
    font-style: italic;
    opacity: 0.9;
  }
</style>
