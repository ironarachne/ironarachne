<script lang="ts">
  import { onMount } from 'svelte';

  import { resolve } from '$app/paths';
  import { onArtifactsChanged } from '$lib/artifacts';
  import BaseButton from '$components/common/BaseButton.svelte';
  import Notice from '$components/common/Notice.svelte';
  import {
    dismissStorageWarning,
    hasDismissedStorageWarning,
    readStorageStatus,
    storageWarning,
    usageSentence,
    type StorageWarning,
  } from '$lib/storage_status';

  /**
   * Said where the user is working, once the browser is nearly full.
   *
   * Non-modal and dismissible, but not permanently silenceable: it states a true fact about a real
   * condition, so it comes back next session. A reload is a new session — the dismissal is module
   * state in `storage_status`, the same reading of "session" the persistence request takes.
   *
   * It cannot appear on an unknown estimate. A browser that will not say how full it is has not
   * said it is eighty per cent full, and warning someone about a risk the code cannot demonstrate
   * is how a storage display teaches people to ignore it. See docs/storage-panel.md.
   */
  let warning: StorageWarning | null = $state(null);
  let dismissed = $state(hasDismissedStorageWarning());

  /** The panel that can act on this, which is a section of /projects rather than a route. */
  const storagePanelHref = `${resolve('/projects')}#storage`;

  async function refresh(): Promise<void> {
    const read = await readStorageStatus();
    // A vault that will not open is the storage layer's problem to report. A banner that appeared
    // because the database was unhappy would be a warning about the wrong thing entirely.
    warning = read.ok ? storageWarning(read.value) : null;
  }

  onMount(() => {
    void refresh();
  });

  // Saving is what moves the number, and saving is what will start failing.
  onMount(() => onArtifactsChanged(() => void refresh()));

  function dismiss(): void {
    dismissStorageWarning();
    dismissed = true;
  }

  const shown = $derived.by(() => {
    const current = warning;
    return current !== null && current.warranted && !dismissed;
  });
</script>

{#if shown && warning !== null}
  <!-- `notice`-toned: a browser that is nearly full is a thing wanting attention, which is what
       that tone says. The gold is the edge and the wash; the sentence stays `--ink`, because a
       tone is never a word. -->
  <Notice tone="notice" class="storage-warning">
    <p>
      <strong>This browser is nearly full for this site.</strong>
      {usageSentence(warning.usage)} If it fills, saving will start to fail — and a file is the only copy
      of this work that survives anything happening to this browser.
    </p>

    {#snippet actions()}
      <!-- A fragment appended to a resolved route. -->
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
      <a href={storagePanelHref}>Storage and backup</a>
      <BaseButton onclick={dismiss}>Dismiss</BaseButton>
    {/snippet}
  </Notice>
{/if}

<style>
  /* Layout only: where the notice sits. The look is the panel's. */
  :global(.storage-warning) {
    margin-bottom: var(--s6);
  }
</style>
