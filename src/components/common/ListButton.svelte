<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  /**
   * A row in a list of choices: the tool browser's tools, the vault's artifacts, a project's
   * contents, the session log's runs. Four lists had hand-rolled one of these each, with four sets
   * of literals and three different corner radii between them.
   *
   * It is a button and not a plate, so it takes none of `main.css`'s plate: no gradient, no
   * uppercase, no 28px body. What it does share with `BaseButton` is the two-layer edge — the
   * outer element paints the edge colour across its box and a liner one pixel inside paints the
   * fill, because a `clip-path` shaves a border off at the diagonals and a row is cut like every
   * other control. See docs/visual-design.md, "A list row".
   *
   * The fill is opaque rather than a mix with `transparent`, and that is forced by the two layers:
   * a translucent liner would let the edge colour through across the whole row and the row would
   * read as solid green. Mixing into `--surface-inset` instead also makes a row look the same on
   * the page as it does on a panel, which the old translucent version did not.
   */

  type Props = Omit<HTMLButtonAttributes, 'class'> & {
    /** The active choice: the gold edge, and a slightly taller row. */
    selected?: boolean;
    /** Content stacks rather than sitting name-left, detail-right. */
    stacked?: boolean;
    class?: string;
    children: Snippet;
    element?: HTMLButtonElement;
  };

  let {
    selected = false,
    stacked = false,
    class: extraClass = '',
    children,
    element = $bindable(),
    type = 'button',
    ...rest
  }: Props = $props();
</script>

<!-- `aria-current` follows `selected` rather than being passed in beside it: the visual state and
     the announced state came from two props in three of the four lists this replaces, which is one
     rename away from disagreeing. -->
<button
  bind:this={element}
  {type}
  class="list-button {extraClass}"
  class:list-button--selected={selected}
  aria-current={selected ? 'true' : undefined}
  {...rest}
>
  <span class="list-button__inner" class:list-button__inner--stacked={stacked}>
    {@render children()}
  </span>
</button>

<style>
  /* The edge, painted across the whole box — transparent at rest, so a row shows the surface it
     sits on and only takes an edge when it is worth one. `padding: 1px` is the band's width. */
  .list-button {
    --list-edge: transparent;
    --list-fill: none;
    --list-ring: 0 0 rgb(0 0 0 / 0%);

    background: var(--list-edge);
    border: 0;
    box-shadow: var(--list-ring);
    box-sizing: border-box;
    clip-path: var(--corner-control);
    color: var(--ink);
    cursor: pointer;
    display: block;
    /* Sentence case, in the body face: a row is a name someone reads, not a label they scan. The
       plate's `--t-micro` uppercase is for a control that says what it does; a list says what
       things are called, and a generated name in caps stops being the name. */
    font: var(--t-small);
    letter-spacing: normal;
    margin: 0 0 var(--s1);
    min-height: 0;
    padding: 1px;
    text-align: left;
    text-transform: none;
    transition:
      background-color var(--motion-swift) ease,
      box-shadow var(--motion-swift) ease,
      color var(--motion-swift) ease;
    width: 100%;
  }

  .list-button__inner {
    align-items: center;
    background: var(--list-fill);
    box-sizing: border-box;
    clip-path: var(--corner-control-inner);
    display: flex;
    gap: var(--s4);
    justify-content: space-between;
    /* `main.css` gives prose a 1.75 line height and it reaches a span inside a button; the ramp's
       own step, restated where the cascade took it. */
    line-height: var(--t-small-line);
    padding: var(--s2) var(--s4);
    transition: padding var(--motion-swift) ease;
    width: 100%;
  }

  .list-button__inner--stacked {
    align-items: stretch;
    flex-direction: column;
    gap: var(--s1);
    justify-content: flex-start;
  }

  .list-button:hover {
    --list-edge: var(--accent);
    --list-fill: color-mix(in srgb, var(--accent) 18%, var(--surface-inset));
  }

  /* The active choice: gold rather than green, because green is what the pointer is doing and gold
     is what the list *is*. It also stands a little taller — `--s3` where a resting row is `--s2` —
     so the current choice is findable down a long list without reading it, the way the sidebar's
     current destination is. */
  .list-button--selected {
    --list-edge: var(--accent-quiet);
    --list-fill: color-mix(in srgb, var(--accent-quiet) 22%, var(--surface-inset));
  }

  .list-button--selected .list-button__inner {
    padding: var(--s3) var(--s4);
  }

  /* Selected plus hover is selected. The row you are on is not a target worth lighting, and a
     hover state there teaches that clicking it does something. */
  .list-button--selected:hover {
    --list-edge: var(--accent-quiet);
  }

  .list-button:active:not(:disabled) .list-button__inner {
    box-shadow: inset 0 2px 4px rgb(0 0 0 / 45%);
  }

  /* Inside, like every clipped control: an outline at a positive offset lies outside the clip
     region and paints nothing at all. */
  .list-button:focus-visible {
    --list-ring: inset 0 0 0 2px var(--focus);

    outline: none;
  }

  .list-button:disabled {
    color: var(--ink-faint);
    cursor: not-allowed;
  }

  @media (pointer: coarse) {
    .list-button__inner {
      min-height: 42px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .list-button,
    .list-button__inner {
      transition: none;
    }
  }
</style>
