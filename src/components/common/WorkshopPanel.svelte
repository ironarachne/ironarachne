<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import CloseButton from '$components/common/CloseButton.svelte';
  import MoveLeftButton from '$components/common/MoveLeftButton.svelte';
  import MoveRightButton from '$components/common/MoveRightButton.svelte';
  import Panel from '$components/common/Panel.svelte';

  type Props = {
    /** What the panel holds, shown in its header and used to name its controls. */
    title: string;
    /** What kind of thing it holds, for the accessible names on the controls. */
    subtitle?: string;
    /** Position on the bench, 1-based, so the controls can say which panel they move. */
    position: number;
    /** How many panels are on the bench, so the end panels can drop the moves they cannot make. */
    total: number;
    /**
     * What the panel holds, which decides both its surface and its share of the bench.
     *
     * A **tool** is the thing being worked on: no surface of its own, and capped in width so a
     * wide bench has room for an artifact beside it rather than under it. An **artifact** is a
     * saved object the work refers to: it keeps its panel surface, because two surfaceless panels
     * side by side have nothing between them, and because a thing you are reading beside the work
     * is not the work.
     */
    holds: 'tool' | 'artifact';
    onClose: () => void;
    onMoveLeft: () => void;
    onMoveRight: () => void;
    children: Snippet;
  };

  const {
    title,
    subtitle,
    position,
    total,
    holds,
    onClose,
    onMoveLeft,
    onMoveRight,
    children,
  }: Props = $props();

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

<!-- The panel is `bare`: on the bench it holds the thing being worked on, and per
     docs/visual-design.md that panel has no border and no background of its own, so the work is
     not competing with the furniture around it. What identifies it instead is the header plate
     and the `--s7` the bench puts between two of them.

     `focal`, so the panel takes the halo while something inside it has focus — one per screen,
     which `:focus-within` gives for free.

     The heading inside `Panel` is an `h2` and the tool mounted here still renders its own `h1`,
     because a tool must behave identically in a panel and on its own route — the cost of that is
     an inverted heading level, and the alternative is a tool that is a different component in
     each place. -->
<Panel
  {title}
  {subtitle}
  bare={holds === 'tool'}
  focal
  class="workshop-panel workshop-panel--{holds}"
  label="{title} panel"
>
  {#snippet actions()}
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
  {/snippet}

  <div class="workshop-panel__body">
    {@render children()}
  </div>
</Panel>

<style>
  /* `:global`, because the element carrying it is `Panel`'s. Panels share a row and give up width
     rather than pushing it into overflow; `min-width: 0` lets the contents wrap instead of setting
     a floor under the whole bench. One panel takes the row, two share it, and on a phone they
     stack. The basis is wider than the rail's two lists by design: the bench is where the work
     happens, and a generator's controls wrap into a second row long before its output does. */
  :global(.workshop-panel) {
    flex: 1 1 32rem;
  }

  /* The cap is what makes a third column possible. Without it the tool takes the whole bench and
     an artifact opened beside it wraps underneath — which is the one arrangement the bench should
     never produce, because the artifact is *reference* for the work and reference below the fold
     is reference nobody reads. 32rem is measured rather than chosen: at 1920 the bench is a little
     over 52rem once the rail stops growing, and 32 + a 1rem gap + the artifact's 18rem basis is
     what fits inside that with room to spare. */
  :global(.workshop-panel--tool) {
    max-width: 32rem;
  }

  /* Narrower, and it takes whatever the capped tool leaves: an artifact panel is a column of
     facts about one object, not a workspace. */
  :global(.workshop-panel--artifact) {
    flex: 1 1 18rem;
  }

  /* No max height and no scroller of its own. It used to cap at 40rem so that one long tool could
     not push everything beside it off the bottom of the page — but that trades a problem nobody
     has for one everybody does: a panel with no surface reads as part of the page, and a scrollbar
     down the middle of the page contradicts that every time the tool is taller than the cap, which
     for a generator is most of the time. The page scrolls instead, which is what a page does. */
  .workshop-panel__body {
    min-width: 0;
  }
</style>
