<script lang="ts">
  import type { SnapshotChoice } from '$lib/ui';
  import BaseButton from '$components/common/BaseButton.svelte';
  import ListButton from '$components/common/ListButton.svelte';

  /**
   * The body of the "load something you saved" dialog: a well of saved things, and a way out.
   *
   * The frame is `ModalHost`'s `<dialog>`, as it is for every other modal. Before #143 this
   * component carried a `<dialog>` of its own and was mounted from inside whichever panel opened
   * it — so the app had two, and since #117 made every dialog a `.panel`, `dialog.panel` and
   * `.panel__title` both stopped identifying anything while a heraldry tool was on the bench. That
   * cost three red CI runs. See docs/visual-design.md, "The message family".
   */

  type Props = {
    title: string;
    items: SnapshotChoice[];
    emptyMessage: string;
    onLoad: (choice: SnapshotChoice) => void;
    onDismiss: () => void;
  };

  const { title, items, emptyMessage, onLoad, onDismiss }: Props = $props();
</script>

<div class="panel__field">
  <header class="panel__header">
    <div class="panel__header-field">
      <h2 id="modal-dialog-title" class="panel__title">{title}</h2>
    </div>
  </header>

  <div class="panel__body">
    {#if items.length === 0}
      <p class="load-snapshot__empty">{emptyMessage}</p>
    {:else}
      <!-- A well of list rows: a saved thing is picked the same way an artifact or a tool is, and
           the row itself is the choice rather than a row with a button on the end of it. -->
      <ul class="well load-snapshot__list">
        {#each items as item, index (index)}
          <li>
            <ListButton onclick={() => onLoad(item)} class="load-snapshot__row">
              <span class="load-snapshot__name">{item.name}</span>
              <span class="load-snapshot__seed">Seed: {item.seed}</span>
            </ListButton>
          </li>
        {/each}
      </ul>
    {/if}

    <!-- A dialog is a question, so its answer sits where the eye finishes. -->
    <div class="panel__footer">
      <BaseButton onclick={onDismiss}>Cancel</BaseButton>
    </div>
  </div>
</div>

<style>
  /* The frame, the plate, the well and the rows are all the system's. What is left is how a row
     lays its two parts out. */

  .load-snapshot__empty {
    color: var(--ink-muted);
    font: var(--t-small);
    margin: 0;
  }

  .load-snapshot__list {
    display: flex;
    flex-direction: column;
    gap: var(--s1);
    list-style: none;
    margin: 0;
  }

  :global(.load-snapshot__row) {
    width: 100%;
  }

  .load-snapshot__name {
    overflow-wrap: anywhere;
  }

  .load-snapshot__seed {
    color: var(--ink-muted);
    font: var(--t-small);
    overflow-wrap: anywhere;
  }
</style>
