<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A chip: a badge you can click. The tag filters in `ProjectView` are the first of them.
   *
   * It is a `<label>` wrapped around its own checkbox, which is what makes the whole pill the hit
   * target and keeps the native checked state — the alternative, a `<button aria-pressed>`, would
   * rebuild a state the platform already has. The box is visually hidden rather than removed:
   * `display: none` would take it out of the tab order and the chip would stop being reachable by
   * keyboard.
   *
   * Its states are `ListButton`'s, so the two filtering surfaces in the app agree. See
   * docs/visual-design.md, "Badges and chips".
   */

  type Props = {
    /** Whether the chip is on. Owned by the caller, like every other filter control here. */
    selected: boolean;
    onchange: () => void;
    children: Snippet;
  };

  const { selected, onchange, children }: Props = $props();
</script>

<label class="badge chip" class:chip--selected={selected}>
  <input class="chip__box" type="checkbox" checked={selected} {onchange} />
  {@render children()}
</label>

<style>
  /* Visually hidden, still focusable, and still the thing the label toggles. The chip carries the
     focus ring for it, through `:focus-within` in `main.css`. */
  .chip__box {
    block-size: 1px;
    clip-path: inset(50%);
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }
</style>
