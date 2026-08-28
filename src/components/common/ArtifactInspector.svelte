<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { renameArtifact, tagArtifact, type ArtifactSummary } from '$lib/artifacts';
  import { getShortDate } from '$lib/dates';
  import Download from '$lib/download';
  import { formatBytes } from '$lib/format';
  import { setActiveProject } from '$lib/projects';
  import { buildArtifactExportFile } from '$lib/vault_file';
  import {
    artifactKindEntry,
    openArtifactForEditing,
    type ArtifactEditingTarget,
  } from '$lib/workshop';
  import ArtifactReferences from '$components/common/ArtifactReferences.svelte';
  import ArtifactSnapshotView from '$components/common/ArtifactSnapshotView.svelte';

  type Props = {
    projectId: string;
    projectName: string;
    artifactId: string;
    /**
     * Asks the vault to delete this artifact. The listing owns the confirmation and the notice,
     * because it is the thing that has to drop the selection afterwards and say what went.
     */
    onDelete?: (summary: ArtifactSummary) => void;
  };

  const { projectId, projectName, artifactId, onDelete }: Props = $props();

  const uid = $props.id();
  const nameId = `${uid}-name`;
  const tagsId = `${uid}-tags`;

  let target = $state<ArtifactEditingTarget | undefined>(undefined);
  let loading = $state(true);
  let error: string | null = $state(null);
  let status: string | null = $state(null);
  /** Metadata being edited. Contents are never editable here — see the note below. */
  let name = $state('');
  let tags = $state('');

  const summary = $derived(target?.summary);
  const kindName = $derived(
    summary === undefined ? '' : (artifactKindEntry(summary.kind)?.displayName ?? summary.kind),
  );
  const metadataDirty = $derived(
    summary !== undefined &&
      (name.trim() !== summary.name || tags.trim() !== summary.tags.join(', ')),
  );

  function parseTags(value: string): string[] {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
  }

  async function load(): Promise<void> {
    loading = true;
    error = null;
    status = null;
    // The same reader the bench's panel uses, so the vault shows exactly what the workshop would
    // — including a payload this build cannot make sense of, which is reported rather than hidden.
    const opened = await openArtifactForEditing(projectId, artifactId);
    target = opened;
    if (opened !== undefined) {
      name = opened.summary.name;
      tags = opened.summary.tags.join(', ');
    }
    loading = false;
  }

  // Re-read whenever the selection changes. `$effect` rather than `onMount` because this component
  // is kept alive across selections: the listing beside it swaps the id, not the component.
  $effect(() => {
    void artifactId;
    void projectId;
    void load();
  });

  async function saveMetadata(): Promise<void> {
    if (summary === undefined) {
      return;
    }
    const renamed = await renameArtifact(projectId, artifactId, name.trim());
    if (renamed !== undefined && !renamed.ok) {
      error = `That could not be saved (${renamed.reason}).`;
      return;
    }
    const tagged = await tagArtifact(projectId, artifactId, parseTags(tags));
    if (tagged !== undefined && !tagged.ok) {
      error = `That could not be saved (${tagged.reason}).`;
      return;
    }
    error = null;
    status = 'Saved.';
    await load();
  }

  async function exportArtifact(): Promise<void> {
    const built = await buildArtifactExportFile(projectId, artifactId);
    if (!built.ok) {
      error = `That could not be exported (${built.reason}).`;
      return;
    }
    const url = URL.createObjectURL(new Blob([built.value.text], { type: 'application/json' }));
    Download(url, built.value.fileName);
    URL.revokeObjectURL(url);
    error = null;
    status = `Saved ${built.value.fileName}.`;
  }

  /**
   * Take this artifact to the bench, switching project first when it lives in another one.
   *
   * This is the Inspector's primary action and the reason it can stay read-only: the vault answers
   * "what do I have" and hands the user to the workshop to change it, which keeps editing inside
   * one project's context and out of a listing that spans every project.
   */
  async function openInWorkshop(): Promise<void> {
    setActiveProject(projectId);
    await goto(resolve('/workshop'));
  }
</script>

<section class="artifact-inspector" aria-label="Inspector">
  {#if loading}
    <p class="artifact-inspector__status">Loading…</p>
  {:else if summary === undefined}
    <p class="artifact-inspector__status">That artifact is no longer here.</p>
  {:else}
    <header class="artifact-inspector__header">
      <h2>{summary.name}</h2>
      <p class="artifact-inspector__facts">
        {kindName} · {projectName} · {formatBytes(summary.byteSize)} · updated
        {getShortDate(new Date(summary.updatedAt))}
      </p>
    </header>

    {#if error !== null}
      <p class="artifact-inspector__error" role="alert">{error}</p>
    {/if}
    {#if status !== null}
      <p class="artifact-inspector__status" role="status">{status}</p>
    {/if}

    <div class="artifact-inspector__actions">
      <button type="button" onclick={openInWorkshop}>Open in workshop</button>
      <button type="button" onclick={exportArtifact}>Export</button>
      <button type="button" onclick={() => onDelete?.(summary)}>Delete</button>
    </div>

    <!--
      Name and tags are editable; contents are not. What an artifact *is called* is a property of
      the artifact as an object, and renaming it here is what makes a vault of two hundred things
      navigable. Its contents belong to one project's context and are edited on the bench — an
      editable listing spanning every project is how cross-project references get built by
      accident, which docs/workshop.md forbids.
    -->
    <div class="artifact-inspector__metadata">
      <div class="input-group input-group--inline">
        <label for={nameId}>Name</label>
        <input id={nameId} type="text" bind:value={name} autocomplete="off" />
      </div>
      <div class="input-group input-group--inline">
        <label for={tagsId}>Tags</label>
        <input
          id={tagsId}
          type="text"
          bind:value={tags}
          placeholder="Comma separated"
          autocomplete="off"
        />
      </div>
      <button type="button" onclick={saveMetadata} disabled={!metadataDirty}>Save details</button>
    </div>

    <ArtifactReferences {projectId} {summary} />

    {#if target?.problem !== undefined}
      <p class="artifact-inspector__error" role="alert">
        This build cannot read the contents ({target.problem.reason}). {target.problem.message}
      </p>
    {:else if target?.loadViewer !== undefined}
      {#key artifactId}
        {#await target.loadViewer()}
          <p class="artifact-inspector__status">Loading…</p>
        {:then viewer}
          {@const ArtifactViewer = viewer.default}
          <ArtifactViewer snapshot={target.snapshot} />
        {:catch}
          <!-- The generic view is the floor and needs nothing loaded. A kind whose own view will
               not load still shows its contents rather than an apology. -->
          <ArtifactSnapshotView snapshot={target.snapshot} />
        {/await}
      {/key}
    {:else}
      <!--
        No registered view for this kind. Deliberately the snapshot rather than the kind's editor
        rendered inert: an editor is a page of inputs, and disabling them all produces something
        that looks broken rather than something that reads.
      -->
      <ArtifactSnapshotView snapshot={target?.snapshot} />
    {/if}
  {/if}
</section>

<style>
  .artifact-inspector {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }

  .artifact-inspector__header h2 {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .artifact-inspector__facts {
    font-size: 0.85rem;
    margin: 0.25rem 0 0;
    opacity: 0.8;
  }

  .artifact-inspector__actions,
  .artifact-inspector__metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset and the room to shrink. */
  .artifact-inspector__metadata .input-group {
    margin: 0;
    min-width: 0;
  }

  .artifact-inspector__error,
  .artifact-inspector__status {
    margin: 0;
    font-size: 0.9rem;
  }

  .artifact-inspector__error {
    border: 1px solid var(--tan);
    border-radius: 4px;
    padding: 0.6rem 0.75rem;
  }

  .artifact-inspector__status {
    font-style: italic;
    opacity: 0.8;
  }
</style>
