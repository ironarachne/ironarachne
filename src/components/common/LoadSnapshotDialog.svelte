<script lang="ts">
  import type { Snippet } from 'svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  type Props = {
    title: string;
    items: { name: string; seed: string }[];
    onLoad: (item: { name: string; seed: string }) => void;
    emptyMessage?: string;
    children?: Snippet;
  };

  const { title, items, onLoad, emptyMessage = 'No saved items yet.', children }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  export function open() {
    dialog?.showModal();
  }

  export function close() {
    dialog?.close();
  }
</script>

<dialog bind:this={dialog} class="load-snapshot-dialog">
  <form method="dialog" class="load-snapshot-dialog-content">
    <h2>{title}</h2>

    {#if items.length === 0}
      <p>{emptyMessage}</p>
    {:else}
      <ul class="load-snapshot-list">
        {#each items as item, index (index)}
          <li class="load-snapshot-item">
            <div class="load-snapshot-item-details">
              <p class="load-snapshot-item-name">{item.name}</p>
              <p class="load-snapshot-item-seed">Seed: {item.seed}</p>
            </div>
            <BaseButton onclick={() => onLoad(item)}>Load</BaseButton>
          </li>
        {/each}
      </ul>
    {/if}

    {#if children}
      {@render children()}
    {/if}

    <div class="load-snapshot-dialog-actions">
      <BaseButton value="cancel">Cancel</BaseButton>
    </div>
  </form>
</dialog>

<style>
  dialog.load-snapshot-dialog {
    border: 1px solid var(--gold, #c9a227);
    border-radius: 4px;
    padding: 0;
    max-width: 40rem;
    width: calc(100% - 2rem);
    background: var(--background, #1a1a1a);
    color: inherit;
  }

  dialog.load-snapshot-dialog::backdrop {
    background: rgb(0 0 0 / 50%);
  }

  .load-snapshot-dialog-content {
    padding: 1rem 1.25rem;
  }

  .load-snapshot-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .load-snapshot-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .load-snapshot-item:last-child {
    border-bottom: none;
  }

  .load-snapshot-item-details {
    min-width: 0;
  }

  .load-snapshot-item-name,
  .load-snapshot-item-seed {
    margin: 0;
  }

  .load-snapshot-item-name {
    font-weight: 600;
  }

  .load-snapshot-item-seed {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .load-snapshot-dialog-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
</style>
