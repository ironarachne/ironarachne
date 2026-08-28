<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  /**
   * A round, glyph-only control. `MoveLeftButton`, `MoveRightButton` and `CloseButton` are the
   * three of them; this is what they share, and nothing else in the app should reach for it
   * without a fourth of the same kind coming along.
   *
   * **Round rather than cut, and not `BaseButton`.** A plate acts on the content in front of you —
   * generate, save, export. These act on the frame that content sits in: which slot a panel is in,
   * and whether it is there at all. Giving them a different shape says that without a label, which
   * matters because they carry no label to say it with. Round also sidesteps the liner entirely: a
   * `border-radius` clips a border along with everything else, so the edge survives on its own and
   * there is nothing to paint a band with.
   *
   * The icon is inlined from `src/lib/assets/icons` with `?raw` rather than loaded through an
   * `<img>`: each file paints one `currentColor` rect through a mask, so inline it takes the
   * colour of the button around it — `--ink` at rest, `--accent` when pressed, `--ink-faint` when
   * disabled — and the plate shows through its holes. An `<img>` can do neither.
   */

  type Props = Omit<HTMLButtonAttributes, 'class'> & {
    /** The icon's markup, imported with `?raw`. */
    icon: string;
    /** The accessible name. Required — there is no visible text to fall back on. */
    label: string;
    class?: string;
    element?: HTMLButtonElement;
  };

  let {
    icon,
    label,
    class: extraClass = '',
    element = $bindable(),
    type = 'button',
    ...rest
  }: Props = $props();
</script>

<button
  bind:this={element}
  {type}
  class="round-icon-button {extraClass}"
  aria-label={label}
  {...rest}
>
  <!-- Vendored icon markup from `src/lib/assets/icons`, not user input; `aria-hidden` because the
       button's own label is the accessible name and the glyph would otherwise be read twice. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <span class="round-icon-button__icon" aria-hidden="true">{@html icon}</span>
</button>

<style>
  /* The plate's colours, in a circle. It reads `--btn-edge` and `--btn-fill` like every other
     control, so a hover, a press and a disabled state are the system's rather than this file's —
     what is local is the shape, and the shape is the whole point. */
  .round-icon-button {
    align-items: center;
    background: var(--btn-fill);
    border: 1px solid var(--btn-edge);
    border-radius: 50%;
    box-shadow: var(--edge), var(--btn-ring);
    box-sizing: border-box;
    clip-path: none;
    color: var(--ink);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 28px;
    justify-content: center;
    min-height: 0;
    padding: 0;
    width: 28px;
  }

  /* Round, so an outline at an offset follows the circle and is not shaved by a clip — this is one
     of the controls that keeps the ordinary outside ring. */
  .round-icon-button:focus-visible {
    --btn-ring: 0 0 rgb(0 0 0 / 0%);

    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  .round-icon-button:active:not(:disabled) {
    box-shadow: inset 0 2px 4px rgb(0 0 0 / 45%);
    color: var(--accent);
  }

  .round-icon-button:disabled {
    color: var(--ink-faint);
  }

  .round-icon-button__icon {
    display: flex;
    /* 14px in a 28px button: half the diameter leaves the glyph room to be a glyph rather than a
       disc with a shape scratched into it. */
    height: 14px;
    width: 14px;
  }

  /* The file's own `width`/`height` are a default to override in CSS, per the icon set's README. */
  .round-icon-button__icon :global(svg) {
    display: block;
    height: 100%;
    width: 100%;
  }

  @media (pointer: coarse) {
    .round-icon-button {
      height: 44px;
      width: 44px;
    }

    .round-icon-button__icon {
      height: 18px;
      width: 18px;
    }
  }
</style>
