<script lang="ts">
  import type { Snippet } from 'svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import ListButton from '$components/common/ListButton.svelte';

  /**
   * A dialog offering a saved thing to load.
   *
   * It is a raised panel that happens to be in the top layer, exactly as `ModalHost`'s dialog is,
   * and it wears the same classes. Before #117 it was a second dialog implementation with its own
   * frame, its own backdrop and its own keyline — written as `var(--gold, #c9a227)` over
   * `var(--background, #1a1a1a)`, and `--background` is declared nowhere in the app, so that
   * second fallback was not a fallback: this dialog painted `#1a1a1a`, a grey in no palette and
   * not `--charcoal`'s `#1b1e24`. See docs/visual-design.md, "The message family".
   *
   * Folding it into `modalState`, so the app has literally one `<dialog>`, is behaviour rather
   * than look and is left for whoever wants it.
   */

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

  function load(item: { name: string; seed: string }) {
    onLoad(item);
    close();
  }
</script>

<dialog bind:this={dialog} class="panel">
  <form method="dialog" class="panel__field">
    <header class="panel__header">
      <div class="panel__header-field">
        <h2 class="panel__title">{title}</h2>
      </div>
    </header>

    <div class="panel__body">
      {#if items.length === 0}
        <p class="load-snapshot__empty">{emptyMessage}</p>
      {:else}
        <!-- A well of list rows: a saved snapshot is picked the same way an artifact or a tool is,
             and the row itself is the choice rather than a row with a button on the end of it. -->
        <ul class="well load-snapshot__list">
          {#each items as item, index (index)}
            <li>
              <ListButton onclick={() => load(item)} class="load-snapshot__row">
                <span class="load-snapshot__name">{item.name}</span>
                <span class="load-snapshot__seed">Seed: {item.seed}</span>
              </ListButton>
            </li>
          {/each}
        </ul>
      {/if}

      {#if children}
        {@render children()}
      {/if}

      <!-- A dialog is a question, so its answer sits where the eye finishes. `submit` rather than
           the default `button`, because this form is `method="dialog"` and submitting it is what
           closes the dialog — as `value="cancel"` always meant it to. Until #117 neither this nor
           the rows closed anything, and Escape was the only way out. -->
      <div class="panel__footer">
        <BaseButton type="submit" value="cancel">Cancel</BaseButton>
      </div>
    </div>
  </form>
</dialog>

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
