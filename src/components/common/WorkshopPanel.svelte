<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import CloseButton from '$components/common/CloseButton.svelte';
  import MoveLeftButton from '$components/common/MoveLeftButton.svelte';
  import MoveRightButton from '$components/common/MoveRightButton.svelte';

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

  // `$state`, because these are bound through the button component's `element` prop rather than by
  // `bind:this` on an element: a component binding writes back through the reactive graph, and a
  // plain `let` is assigned without anything noticing.
  let moveLeftButton: HTMLButtonElement | undefined = $state();
  let moveRightButton: HTMLButtonElement | undefined = $state();

  /**
   * A move can disable the button that performed it: a panel arriving at either end of the bench
   * cannot go further. A disabled button loses the focus ring, and the browser drops focus to the
   * document, which on this page means tabbing through a whole generator to get back to the
   * bench. So focus follows the panel to the control that can still act on it.
   *
   * This works because the bench's `{#each}` is keyed by panel, so a panel keeps this component —
   * and these two buttons — as it moves. Positional reuse would leave them pointing at whichever
   * panel had taken this slot instead.
   */
  async function moveWithFocusKept(
    onMove: () => void,
    pressed: HTMLButtonElement | undefined,
    counterpart: HTMLButtonElement | undefined,
  ): Promise<void> {
    onMove();
    await tick();

    if (pressed?.disabled === true && counterpart?.disabled === false) {
      counterpart.focus();
    }
  }
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
      <MoveLeftButton
        bind:element={moveLeftButton}
        onclick={() => void moveWithFocusKept(onMoveLeft, moveLeftButton, moveRightButton)}
        disabled={!canMoveLeft}
        label="Move {title} left"
        title="Move left"
      />
      <MoveRightButton
        bind:element={moveRightButton}
        onclick={() => void moveWithFocusKept(onMoveRight, moveRightButton, moveLeftButton)}
        disabled={!canMoveRight}
        label="Move {title} right"
        title="Move right"
      />
      <CloseButton onclick={onClose} label="Close {title}" title="Close" />
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
    gap: var(--s2);
  }

  /* No sizing of its own. These were hand-set to a 44px square so they would be tappable; the
     control system grows every button to that under `(pointer: coarse)` and leaves it at the
     ramp's density under a mouse, which is the whole point of having the ramp. */
  .workshop-panel__controls :global(button) {
    margin: 0;
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
