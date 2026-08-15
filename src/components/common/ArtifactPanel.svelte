<script lang="ts">
  import { onMount } from 'svelte';

  import { beforeNavigate } from '$app/navigation';

  import { onArtifactsChanged } from '$lib/artifacts';
  import { showConfirmModal } from '$lib/ui';
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
    name = opened.summary.name;
    draft = undefined;
    revision += 1;
    changedElsewhere = false;
    status = opened.migrated
      ? 'These contents were written by an older version and were brought forward on the way out. Saving stores them at the current version.'
      : null;
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
  }

  async function save() {
    const current = target;
    if (current === undefined || !dirty || saving) {
      return;
    }
    saving = true;
    error = null;
    try {
      // `$state.snapshot` because what an editor handed back is held in reactive state, and
      // reactive state is a proxy: IndexedDB structure-clones what it stores, and a proxy is not
      // something the structured clone algorithm will take.
      const result = await saveArtifactEdits(projectId, artifactId, {
        name,
        payload: draft === undefined ? undefined : $state.snapshot(draft),
      });
      if (!result.ok) {
        // What the user typed is still on screen and still saveable, whatever went wrong.
        error = `That could not be saved (${result.reason}). ${result.message}`;
        return;
      }
      target = {
        ...current,
        summary: result.summary,
        snapshot: result.snapshot ?? current.snapshot,
      };
      name = result.summary.name;
      draft = undefined;
      changedElsewhere = false;
      status = 'Saved.';
    } finally {
      saving = false;
    }
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
    <div class="input-group">
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

    <!-- Below the metadata and above the contents, because a link that has gone missing is
         something the user has to see on the way past rather than something to go looking for. -->
    <ArtifactReferences {projectId} {summary} />

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
    {:else}
      <!-- No editor registered for this kind: it opens read-only rather than not opening, and
           what is shown is the snapshot itself rather than a pretence at a view of it. -->
      <details class="artifact-panel__contents">
        <summary>Contents</summary>
        <ArtifactSnapshotView snapshot={editorSnapshot} />
      </details>
    {/if}

    <div class="artifact-panel__actions">
      <button type="button" onclick={save} disabled={!dirty || saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {#if dirty}
        <button type="button" onclick={discard} disabled={saving}>Discard changes</button>
      {/if}
      {#if reroll !== 'unsupported'}
        <button
          type="button"
          class="artifact-panel__destructive"
          onclick={rollAgain}
          disabled={reroll !== 'available' || saving}
          title={reroll === 'no-provenance'
            ? 'This artifact has no record of how it was made.'
            : 'Replaces the contents with a fresh roll from the original seed.'}
        >
          Roll again
        </button>
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

  .artifact-panel__meta dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .artifact-panel__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .artifact-panel__destructive {
    /* Named as destructive rather than only worded as such: 4.3 asks for a re-roll that is
       clearly the dangerous one of the controls beside it. */
    border-color: var(--gold);
  }

  .artifact-panel__contents summary {
    cursor: pointer;
    color: var(--gold);
  }

  .artifact-panel__status,
  .artifact-panel__problem {
    margin: 0;
    font-size: 0.9rem;
    font-style: italic;
    opacity: 0.9;
  }
</style>
