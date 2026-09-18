<script lang="ts">
  import { onMount } from 'svelte';

  import { beforeNavigate } from '$app/navigation';

  import { onArtifactsChanged, writeArtifactAsset } from '$lib/artifacts';
  import { downloadTextFile } from '$lib/download';
  import { showConfirmModal, showStorageFailureModal } from '$lib/ui';
  import { buildUnsavedArtifactExportFile, buildVaultExportFile } from '$lib/vault_file';
  import { ARTIFACT_KINDS, hasArtifactPreviewProvider, renderArtifactPreview } from '$lib/workshop';
  import {
    artifactKindEntry,
    artifactRerollAvailability,
    hasUnsavedArtifactEdits,
    openArtifactForEditing,
    rerollArtifact,
    saveArtifactEdits,
    trackUnsavedEdits,
    type ArtifactEditingTarget,
  } from '$lib/workshop';
  import ArtifactReferences from '$components/common/ArtifactReferences.svelte';
  import ArtifactSnapshotView from '$components/common/ArtifactSnapshotView.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  type Props = {
    projectId: string;
    artifactId: string;
  };

  const { projectId, artifactId }: Props = $props();

  const uid = $props.id();
  const nameId = `${uid}-name`;

  /** What the user is asked before edits are thrown away, wherever they are thrown away from. */
  const DISCARD_PROMPT = 'This artifact has changes you have not saved. Leave them behind?';

  let target = $state<ArtifactEditingTarget | undefined>(undefined);
  let name = $state('');
  /** The editor's replacement snapshot, or undefined while the payload is as it was read. */
  let draft = $state<unknown>(undefined);
  /**
   * Bumped when the payload is replaced from outside the editor — a load, a discard, a re-roll —
   * so the editing component is remounted around the new snapshot rather than being asked to
   * reconcile one it did not produce. A keystroke does not bump it.
   */
  let revision = $state(0);
  let gone = $state(false);
  let saving = $state(false);
  let error: string | null = $state(null);
  let status: string | null = $state(null);
  /** Set when another panel changed this artifact while there were edits here to protect. */
  let changedElsewhere = $state(false);
  let previewUrl = $state<string | null>(null);

  const summary = $derived(target?.summary);
  const kindName = $derived(
    summary === undefined ? '' : (artifactKindEntry(summary.kind)?.displayName ?? summary.kind),
  );
  const dirty = $derived(
    target !== undefined && hasUnsavedArtifactEdits(target, { name, payload: draft }),
  );
  const editorSnapshot = $derived(draft ?? target?.snapshot);
  const reroll = $derived(
    target === undefined ? 'unsupported' : artifactRerollAvailability(target),
  );

  function clearPreview(): void {
    if (previewUrl !== null) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  }

  function sameSnapshotForPreview(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  async function repairPreview(opened: ArtifactEditingTarget): Promise<void> {
    if (
      opened.snapshot === undefined ||
      !hasArtifactPreviewProvider(opened.summary.kind) ||
      previewUrl !== null
    ) {
      return;
    }
    status = 'Regenerating preview…';
    try {
      const asset = await renderArtifactPreview(opened.summary.kind, opened.snapshot, {
        document,
        seed: opened.summary.provenance?.seed,
      });
      if (
        asset === undefined ||
        target?.summary.id !== opened.summary.id ||
        dirty ||
        editorSnapshot !== opened.snapshot
      ) {
        return;
      }
      const written = await writeArtifactAsset(opened.summary.id, asset);
      previewUrl = URL.createObjectURL(asset.blob);
      status = written.ok ? 'Preview saved.' : 'Preview regenerated but could not be saved.';
    } catch {
      status = 'Preview could not be regenerated. The stored contents remain available.';
    }
  }

  /**
   * Read the artifact and adopt what is stored.
   *
   * Never called while there are unsaved edits: re-reading would overwrite them with the very
   * thing the user changed, which is the loss this whole surface exists to prevent.
   */
  async function load() {
    const opened = await openArtifactForEditing(projectId, artifactId);
    if (opened === undefined) {
      target = undefined;
      gone = true;
      return;
    }
    gone = false;
    target = opened;
    clearPreview();
    const preview = opened.assets?.find((asset) => asset.metadata.role === 'primary-preview');
    previewUrl = preview === undefined ? null : URL.createObjectURL(preview.blob);
    name = opened.summary.name;
    draft = undefined;
    revision += 1;
    changedElsewhere = false;
    status = opened.migrated
      ? 'These contents were written by an older version and were brought forward on the way out. Saving stores them at the current version.'
      : preview === undefined && hasArtifactPreviewProvider(opened.summary.kind)
        ? 'No saved preview is available. This artifact can still be edited and saved.'
        : null;
    if (preview === undefined) {
      void repairPreview(opened);
    }
  }

  onMount(() => {
    void load();

    const stopTracking = trackUnsavedEdits(artifactId, () => dirty);
    // The browser's own prompt, for the ways out of the page that no in-app handler sees: a
    // reload, a closed tab, a typed address.
    const warnOnUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', warnOnUnload);

    // Another panel can rename, edit, or delete what this one is showing, and a stale panel
    // claiming an artifact still exists is the one thing it must not do.
    const stopListening = onArtifactsChanged((change) => {
      if (change.artifactId !== artifactId) {
        return;
      }
      if (dirty) {
        changedElsewhere = true;
        return;
      }
      void load();
    });

    return () => {
      stopTracking();
      stopListening();
      window.removeEventListener('beforeunload', warnOnUnload);
      clearPreview();
    };
  });

  // Leaving the page inside the app is a navigation this can still stop, and the browser's own
  // confirm is what stops it: `beforeNavigate` is synchronous, so the site's modal — which
  // answers through a promise — could not reply before the navigation had already happened.
  beforeNavigate((navigation) => {
    if (!dirty || navigation.willUnload) {
      return;
    }
    if (!window.confirm(DISCARD_PROMPT)) {
      navigation.cancel();
    }
  });

  function editorChanged(snapshot: unknown) {
    draft = snapshot;
    status = null;
    if (target !== undefined && !sameSnapshotForPreview(snapshot, target.snapshot)) {
      clearPreview();
      if (hasArtifactPreviewProvider(target.summary.kind)) {
        status = 'Preview will be regenerated when you save.';
      }
    }
  }

  async function save() {
    const current = target;
    if (current === undefined || !dirty || saving) {
      return;
    }
    saving = true;
    error = null;
    try {
      const payloadChanged = draft !== undefined;
      // `$state.snapshot` because what an editor handed back is held in reactive state, and
      // reactive state is a proxy: IndexedDB structure-clones what it stores, and a proxy is not
      // something the structured clone algorithm will take.
      const result = await saveArtifactEdits(projectId, artifactId, {
        name,
        payload: draft === undefined ? undefined : $state.snapshot(draft),
      });
      if (!result.ok) {
        // What the user typed is still on screen and still saveable, whatever went wrong.
        if (result.reason === 'quota-exceeded') {
          // Blocking, because this is the one storage failure where carrying on quietly compounds
          // the loss — and the edit in front of the user is the copy that exists nowhere else.
          await offerToRescue();
          return;
        }
        error = `That could not be saved (${result.reason}). ${result.message}`;
        return;
      }
      if (payloadChanged) {
        await load();
        if (!hasArtifactPreviewProvider(current.summary.kind)) {
          status = 'Saved.';
        }
      } else {
        target = {
          ...current,
          summary: result.summary,
          snapshot: result.snapshot ?? current.snapshot,
        };
        name = result.summary.name;
        draft = undefined;
        changedElsewhere = false;
        status = 'Saved.';
      }
    } finally {
      saving = false;
    }
  }

  /**
   * Put an edit the browser had no room for in front of the user, with a way out that needs no
   * storage.
   *
   * What goes in the file is the **edited** value, not what is stored: the stored one is safe by
   * definition — the transaction rolled back — and the edit is the copy that exists nowhere else.
   */
  async function offerToRescue(): Promise<void> {
    const current = target;
    if (current === undefined) {
      return;
    }
    const result = await showStorageFailureModal({
      message: `“${name.trim() === '' ? current.summary.name : name.trim()}” could not be saved: this browser has no room left.`,
      downloadLabel: 'Download these changes so they are not lost',
      onDownload: async () => {
        const built = await buildUnsavedArtifactExportFile(ARTIFACT_KINDS, {
          kind: current.summary.kind,
          payload: draft === undefined ? current.snapshot : $state.snapshot(draft),
          name,
          projectId,
          tags: current.summary.tags,
          references: current.summary.references,
          ...(current.summary.provenance === undefined
            ? {}
            : { provenance: current.summary.provenance }),
        });
        return built.ok && downloadTextFile(built.value.text, built.value.fileName);
      },
      onExportVault: async () => {
        const built = await buildVaultExportFile();
        return built.ok && downloadTextFile(built.value.text, built.value.fileName);
      },
    });
    if (result.action === 'retry') {
      await save();
      return;
    }
    error = 'Not saved: this browser has no room left. Your changes are still here.';
  }

  async function discard() {
    if (!dirty) {
      return;
    }
    const confirmed = await showConfirmModal({
      title: 'Discard changes',
      message: DISCARD_PROMPT,
      okLabel: 'Discard',
      dangerous: true,
    });
    if (confirmed) {
      await load();
    }
  }

  /**
   * Roll the artifact again from the record of how it was made — the one path here that throws
   * away what the user has. It is confirmed every time, and says outright when there are edits in
   * front of it to lose.
   */
  async function rollAgain() {
    if (target === undefined || reroll !== 'available' || saving) {
      return;
    }
    const confirmed = await showConfirmModal({
      title: 'Roll again',
      message: dirty
        ? 'Rolling again replaces these contents with a fresh roll from the seed this artifact was made with. Your unsaved changes go too, and neither can be brought back.'
        : 'Rolling again replaces these contents with a fresh roll from the seed this artifact was made with. What is stored now cannot be brought back.',
      okLabel: 'Roll again',
      dangerous: true,
    });
    if (!confirmed) {
      return;
    }
    saving = true;
    error = null;
    try {
      const result = await rerollArtifact(projectId, target);
      if (!result.ok) {
        error = `That could not be rolled again (${result.reason}). ${result.message}`;
        return;
      }
      await load();
      status = 'Rolled again from the original seed.';
    } finally {
      saving = false;
    }
  }

  function formatTimestamp(epochMilliseconds: number): string {
    return new Date(epochMilliseconds).toLocaleString();
  }
</script>

<div class="artifact-panel">
  {#if summary === undefined}
    <p class="artifact-panel__status">
      {gone ? 'That artifact is no longer in this project.' : 'Loading…'}
    </p>
  {:else}
    <div class="input-group input-group--inline">
      <label for={nameId}>Name</label>
      <!-- Typing clears the last outcome, so "Saved." cannot sit under a field that has changed
           since it was true. -->
      <input
        id={nameId}
        type="text"
        bind:value={name}
        oninput={() => (status = null)}
        autocomplete="off"
      />
    </div>

    <dl class="artifact-panel__meta inset">
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

    <!-- Below the metadata and above the contents, because a link that has gone missing is
         something the user has to see on the way past rather than something to go looking for. -->
    <ArtifactReferences {projectId} {summary} />

    {#if previewUrl !== null}
      <figure class="artifact-panel__preview">
        <img src={previewUrl} alt="Saved preview of {summary.name}" />
        <figcaption>Saved preview</figcaption>
      </figure>
    {:else if hasArtifactPreviewProvider(summary.kind)}
      <p class="artifact-panel__status">
        Preview unavailable; the stored contents remain authoritative.
      </p>
    {/if}

    {#if target?.problem !== undefined}
      <!-- A payload this build cannot read is still an artifact the user can name and export, so
           the surface stays and only the contents are missing. -->
      <p class="artifact-panel__problem" role="alert">
        This build cannot read the contents ({target.problem.reason}). {target.problem.message}
      </p>
    {:else if target?.loadEditor !== undefined}
      {#key `${artifactId}:${revision}`}
        {#await target.loadEditor()}
          <p class="artifact-panel__status">Loading the editor…</p>
        {:then editor}
          {@const ArtifactEditor = editor.default}
          <ArtifactEditor snapshot={editorSnapshot} onChange={editorChanged} />
        {:catch}
          <p class="artifact-panel__problem" role="alert">
            The editor for this kind could not be loaded. The contents are unchanged.
          </p>
        {/await}
      {/key}
    {:else if target?.loadViewer !== undefined}
      <!-- A kind with no editing view that can still draw itself. Not a degenerate editor: it is
           handed the snapshot and has nothing to say back, so there is nothing here to save. -->
      {#key `${artifactId}:${revision}`}
        {#await target.loadViewer()}
          <p class="artifact-panel__status">Loading…</p>
        {:then viewer}
          {@const ArtifactViewer = viewer.default}
          <ArtifactViewer snapshot={editorSnapshot} />
        {:catch}
          <!-- The generic view is the floor, and it needs nothing loaded to render. A kind whose
               own view will not load still shows its contents rather than an apology. -->
          <ArtifactSnapshotView snapshot={editorSnapshot} />
        {/await}
      {/key}
    {:else}
      <!-- No editor registered for this kind: it opens read-only rather than not opening, and
           what is shown is the snapshot itself rather than a pretence at a view of it. -->
      <details class="artifact-panel__contents">
        <summary>Contents</summary>
        <ArtifactSnapshotView snapshot={editorSnapshot} />
      </details>
    {/if}

    <div class="artifact-panel__actions">
      <BaseButton onclick={save} disabled={!dirty || saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </BaseButton>
      {#if dirty}
        <BaseButton onclick={discard} disabled={saving}>Discard changes</BaseButton>
      {/if}
      {#if reroll !== 'unsupported'}
        <BaseButton
          variant="destructive"
          onclick={rollAgain}
          disabled={reroll !== 'available' || saving}
          title={reroll === 'no-provenance'
            ? 'This artifact has no record of how it was made.'
            : 'Replaces the contents with a fresh roll from the original seed.'}
        >
          Roll again
        </BaseButton>
      {/if}
    </div>

    {#if reroll === 'no-provenance'}
      <p class="artifact-panel__status">
        This artifact has no record of how it was made, so it cannot be rolled again.
      </p>
    {/if}

    {#if dirty}
      <p class="artifact-panel__status" role="status">Unsaved changes.</p>
    {/if}

    {#if changedElsewhere}
      <p class="artifact-panel__problem" role="alert">
        This artifact changed somewhere else while you were editing it. Saving overwrites that;
        discarding takes it.
      </p>
    {/if}

    {#if error !== null}
      <p class="artifact-panel__problem" role="alert">{error}</p>
    {/if}

    {#if status !== null}
      <p class="artifact-panel__status" role="status">{status}</p>
    {/if}
  {/if}
</div>

<style>
  .artifact-panel {
    display: flex;
    flex-direction: column;
    gap: var(--s5);
    min-width: 0;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset and the room to shrink. */
  .artifact-panel .input-group {
    margin: 0;
    min-width: 0;
  }

  .artifact-panel input[type='text'] {
    min-width: 0;
    flex: 1 1 8rem;
  }

  /* An inset: the artifact's own facts, held in the panel rather than laid on it. */
  .artifact-panel__meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--s1) var(--s5);
    margin: 0;
    font: var(--t-small);
  }

  .artifact-panel__meta dt {
    color: var(--accent-quiet);
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    text-transform: uppercase;
  }

  .artifact-panel__meta dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .artifact-panel__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
  }

  .artifact-panel__contents summary {
    cursor: pointer;
    color: var(--accent-quiet);
  }

  .artifact-panel__preview {
    margin: 0;
  }

  .artifact-panel__preview img {
    display: block;
    max-width: 100%;
    height: auto;
  }

  .artifact-panel__preview figcaption {
    font: var(--t-micro);
    color: var(--ink-muted);
  }

  .artifact-panel__status,
  .artifact-panel__problem {
    margin: 0;
    font: var(--t-small);
    font-style: italic;
    color: var(--ink-muted);
  }
</style>
