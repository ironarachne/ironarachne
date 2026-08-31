<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A block of stats: a grid of key/value pairs, as a character sheet reads them.
   *
   * See docs/visual-design.md, "The content language: stats and tables". Before #153 a stat was
   * `<strong>Label:</strong> value` — 229 times across 19 components — which is a sentence made to
   * look like data: it reads as prose to a screen reader, it cannot align with the stat above it,
   * and the colon does the work a layout should.
   *
   * A `<dl>`, because that is what a list of pairs is. `Stat` wraps each pair in a `<div>` rather
   * than putting `<dt>` and `<dd>` in here directly: a `dl` may hold nothing else between them,
   * and a bare pair cannot be laid out as one grid cell.
   *
   * **No borders and no rules between stats.** A block sits inside a panel, and a block that drew
   * its own box would be the nested box the panel language refuses; the space ramp separates them.
   * The grid is `auto-fill`, so a sheet is a grid at desktop width and one column on a phone
   * without a media query.
   */

  type Props = {
    /** `Stat` items. */
    children: Snippet;
    /** The caller's own layout — where the block sits. Never the look. */
    class?: string;
  };

  const { children, class: extraClass = '' }: Props = $props();
</script>

<dl class="stat-block {extraClass}">
  {@render children()}
</dl>

<style>
  .stat-block {
    display: grid;
    gap: var(--s5);
    /* `min(11rem, 100%)` and not a bare `11rem`. `auto-fill` lays down at least one track, and a
       bare minimum makes that track 11rem wide even when the block has less room than that — so a
       stat block nested a couple of levels in (a planet inside a star system, an age band inside a
       species) pushed its pairs off the side of a 320px phone while reporting a tidy 176px width.
       Wrapping the minimum in `min()` lets the track collapse to the space that actually exists.
       The same idiom is already what `AllToolsPage`, `HomePage` and `ProjectsPage` use. */
    grid-template-columns: repeat(auto-fill, minmax(min(11rem, 100%), 1fr));
    margin: 0;
  }
</style>
