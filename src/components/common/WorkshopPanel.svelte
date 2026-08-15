<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    /** What the panel holds, shown in its header and used to name its controls. */
    title: string;
    /** What kind of thing it holds, for the accessible names on the controls. */
    subtitle?: string;
    /** Position on the bench, 1-based, so the controls can say which panel they move. */
    position: number;
    /** How many panels are on the bench, so the end panels can drop the moves they cannot make. */
    total: number;
    onClose: () => void;
    onMoveLeft: () => void;
    onMoveRight: () => void;
    children: Snippet;
  };

  const { title, subtitle, position, total, onClose, onMoveLeft, onMoveRight, children }: Props =
    $props();

  // Panels are moved with buttons rather than dragged. A drag needs a keyboard equivalent built
  // alongside it to be operable at all, and two buttons are that equivalent without the drag.
  const canMoveLeft = $derived(position > 1);
  const canMoveRight = $derived(position < total);
</script>

<!-- A labelled `section` is a region landmark, so a panel is reachable by landmark as well as by
     heading. The heading itself is an `h2` and the tool mounted inside it still renders its own
     `h1`, because a tool must behave identically in a panel and on its own route — the cost of
     that is an inverted heading level here, and the alternative is a tool that is a different
     component in each place. -->
<section class="workshop-panel" aria-label="{title} panel">
  <header class="workshop-panel__header">
    <h2 class="workshop-panel__title">
      {title}
      {#if subtitle}
        <span class="workshop-panel__subtitle">{subtitle}</span>
      {/if}
    </h2>

    <div class="workshop-panel__controls">
      <button
        type="button"
        onclick={onMoveLeft}
        disabled={!canMoveLeft}
        aria-label="Move {title} left"
        title="Move left"
      >
        ←
      </button>
      <button
        type="button"
        onclick={onMoveRight}
        disabled={!canMoveRight}
        aria-label="Move {title} right"
        title="Move right"
      >
        →
      </button>
      <button type="button" onclick={onClose} aria-label="Close {title}" title="Close"> × </button>
    </div>
  </header>

  <div class="workshop-panel__body">
    {@render children()}
  </div>
</section>

<style>
  .workshop-panel {
    /* Panels share a row and give up width rather than pushing it into overflow; `min-width: 0`
       lets the contents wrap instead of setting a floor under the whole bench. One panel takes
       the row, two share it, and on a phone they stack. */
    flex: 1 1 26rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--tan);
    border-radius: 4px;
    background: var(--slate);
  }

  .workshop-panel__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid var(--tan);
  }

  .workshop-panel__title {
    margin: 0;
    min-width: 0;
    font-size: 1rem;
    overflow-wrap: anywhere;
  }

  .workshop-panel__subtitle {
    color: var(--gold);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .workshop-panel__controls {
    display: flex;
    flex-shrink: 0;
    gap: 0.25rem;
  }

  .workshop-panel__controls button {
    /* Sized to the 44px touch target the rest of the site uses, not to the glyph inside it. */
    min-width: 2.75rem;
    min-height: 2.75rem;
    margin: 0;
    padding: 0.2rem 0.5rem;
    line-height: 1;
  }

  .workshop-panel__body {
    min-width: 0;
    padding: 0.5rem;
    /* A generator can be far taller than the bench; the panel scrolls its own content so one
       long tool does not push everything beside it off the bottom of the page. */
    max-height: var(--workshop-panel-max-height, 40rem);
    overflow-y: auto;
  }
</style>
