<script lang="ts">
  import { onMount } from 'svelte';

  import { readStorageStatus, type StorageStatus } from '$lib/storage_status';

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

<div class="storage-failure">
  <h2 id="modal-dialog-title">{title}</h2>

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
    <button type="button" class="storage-failure__primary" onclick={download}>
      {downloaded ? 'Downloaded — download again' : downloadLabel}
    </button>
    {#if onExportVault !== undefined}
      <button type="button" onclick={exportVault}>
        {exported ? 'Exported — export again' : 'Export everything'}
      </button>
    {/if}
  </div>

  {#if problem !== null}
    <p class="storage-failure__problem" role="alert">{problem}</p>
  {/if}

  {#if downloaded}
    <p class="storage-failure__saved" role="status">
      Saved to your downloads. That file imports back into any project once there is room.
    </p>
  {/if}

  <div class="storage-failure__actions storage-failure__actions--closing">
    <!-- Freeing space happens outside this page, so retry is the point of keeping the value on
         screen: come back and press it. -->
    <button type="button" onclick={onRetry}>Try saving again</button>
    <button type="button" onclick={onDismiss}>Not now</button>
  </div>
</div>

<style>
  .storage-failure {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 32rem;
  }

  .storage-failure h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .storage-failure p {
    margin: 0;
    font-size: 0.95rem;
  }

  .storage-failure__usage,
  .storage-failure__saved {
    font-size: 0.85rem;
    opacity: 0.85;
  }

  .storage-failure__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .storage-failure__actions--closing {
    margin-top: 0.25rem;
  }

  .storage-failure__primary {
    border-color: var(--gold);
    font-weight: bold;
  }

  .storage-failure__problem {
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
  }
</style>
