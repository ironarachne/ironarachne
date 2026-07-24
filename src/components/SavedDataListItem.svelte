<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    name: string;
    meta?: string;
    previewHtml?: string | null;
    openLabel?: string;
    downloadLabel?: string;
    deleteLabel?: string;
    onOpen?: () => void;
    onDownload?: () => void;
    onDelete?: () => void;
    children?: Snippet;
  };

  let {
    name,
    meta,
    previewHtml,
    openLabel = 'Open',
    downloadLabel = 'Download',
    deleteLabel = 'Delete',
    onOpen,
    onDownload,
    onDelete,
    children,
  }: Props = $props();
</script>

<li class="saved-data-item">
  {#if previewHtml}
    <div class="saved-data-preview">{@html previewHtml}</div>
  {/if}
  <div class="saved-data-details">
    <p class="saved-data-name">{name}</p>
    {#if meta}
      <p class="saved-data-meta">{meta}</p>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>
  <div class="saved-data-actions">
    {#if onOpen}
      <button type="button" onclick={onOpen}>{openLabel}</button>
    {/if}
    {#if onDownload}
      <button type="button" onclick={onDownload}>{downloadLabel}</button>
    {/if}
    {#if onDelete}
      <button type="button" onclick={onDelete} class="danger">{deleteLabel}</button>
    {/if}
  </div>
</li>

<style>
  .saved-data-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .saved-data-item:last-child {
    border-bottom: none;
  }

  .saved-data-preview {
    flex-shrink: 0;
  }

  .saved-data-details {
    flex: 1;
    min-width: 0;
  }

  .saved-data-name {
    margin: 0;
    font-weight: 600;
  }

  .saved-data-meta {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .saved-data-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  button.danger {
    color: var(--danger, #e74c3c);
  }
</style>
