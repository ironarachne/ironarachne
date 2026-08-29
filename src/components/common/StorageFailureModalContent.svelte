<script lang="ts">
  import { onMount } from 'svelte';

  import { readStorageStatus, type StorageStatus } from '$lib/storage_status';
  import BaseButton from '$components/common/BaseButton.svelte';

  type Props = {
    /** What failed, in the user's terms. */
    message: string;
    title?: string;
    downloadLabel: string;
    onDownload: () => boolean | Promise<boolean>;
    onExportVault?: () => boolean | Promise<boolean>;
    onRetry: () => void;
    onDismiss: () => void;
  };

  const {
    message,
    title = 'There was no room to save that',
    downloadLabel,
    onDownload,
    onExportVault,
    onRetry,
    onDismiss,
  }: Props = $props();

  let downloaded = $state(false);
  let exported = $state(false);
  let problem: string | null = $state(null);
  let status: StorageStatus | null = $state(null);

  // Read rather than assumed. The numbers are what turn "there is no room" into something the user
  // can act on, and reading storage still works when writing to it does not.
  onMount(async () => {
    const read = await readStorageStatus();
    status = read.ok ? read.value : null;
  });

  const usage = $derived.by(() => {
    if (status?.usageBytes === undefined || status.quotaBytes === undefined) {
      return null;
    }
    const megabytes = (bytes: number) => (bytes / (1024 * 1024)).toFixed(0);
    return `${megabytes(status.usageBytes)} MB of about ${megabytes(status.quotaBytes)} MB`;
  });

  /** Whether any project accounts for measurable space — the place to make room, if so. */
  const hasLargeProject = $derived.by(() => {
    const current = status;
    return current !== null && current.projects.some((project) => project.byteSize > 0);
  });

  async function download() {
    downloaded = await onDownload();
    problem = downloaded ? null : 'This browser would not save the file.';
  }

  async function exportVault() {
    if (onExportVault === undefined) {
      return;
    }
    exported = await onExportVault();
    problem = exported ? null : 'This browser would not save the file.';
  }
</script>

<div class="panel__field">
  <header class="panel__header">
    <div class="panel__header-field">
      <h2 id="modal-dialog-title" class="panel__title">{title}</h2>
    </div>
  </header>

  <div class="panel__body storage-failure">
    <p class="storage-failure__what">{message}</p>

    <!-- Said before anything is asked of them. The transaction rolled back, so there is no
         half-written artifact to reconcile, and a user who thinks their whole project may be damaged
         will act very differently from one who knows only this save did not happen. -->
    <p class="storage-failure__safe">
      Everything you had already saved is unharmed — this write was undone completely. What is on
      screen has not been lost either; it is still there and still saveable.
    </p>

    {#if usage !== null}
      <p class="storage-failure__usage">
        This site is using {usage} in this browser.
        {#if hasLargeProject}
          Its largest project is one place to make room.
        {/if}
      </p>
    {/if}

    <div class="storage-failure__actions">
      <!-- The primary action, and the only one that needs no storage at all — which is precisely the
           situation the user is in. -->
      <BaseButton variant="primary" onclick={download}>
        {downloaded ? 'Downloaded — download again' : downloadLabel}
      </BaseButton>
      {#if onExportVault !== undefined}
        <BaseButton onclick={exportVault}>
          {exported ? 'Exported — export again' : 'Export everything'}
        </BaseButton>
      {/if}
    </div>

    {#if problem !== null}
      <p class="inset storage-failure__problem" role="alert">{problem}</p>
    {/if}

    {#if downloaded}
      <p class="storage-failure__saved" role="status">
        Saved to your downloads. That file imports back into any project once there is room.
      </p>
    {/if}

    <!-- A dialog is a question, so its answers sit where the eye finishes. Freeing space happens
         outside this page, so retry is the point of keeping the value on screen: come back and
         press it. -->
    <div class="panel__footer">
      <BaseButton onclick={onRetry}>Try saving again</BaseButton>
      <BaseButton onclick={onDismiss}>Not now</BaseButton>
    </div>
  </div>
</div>

<style>
  /* The frame, the plate and the spacing are the panel's. What is left here is the two things
     that are this dialog's own: how tightly its paragraphs sit, and which of them are asides. */
  .storage-failure {
    gap: var(--s5);
  }

  .storage-failure p {
    margin: 0;
    max-width: var(--measure);
  }

  /* The numbers and the receipt are asides beside the sentence that matters. */
  .storage-failure__usage,
  .storage-failure__saved {
    color: var(--ink-muted);
    font: var(--t-small);
  }

  .storage-failure__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
  }
</style>
