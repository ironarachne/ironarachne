<script lang="ts" module>
  /** One column's heading, and whether it reads down its digits. */
  export type Column = {
    label: string;
    /** Right-aligns the column and its header. */
    numeric?: boolean;
  };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A table that knows what to do on a phone.
   *
   * See docs/visual-design.md, "The phone answer, which is where the two halves meet". Three
   * components each answered this differently before #154, which is two answers more than the
   * question has: `e2e/pages.mobile.spec.ts` forbids horizontal overflow at 320px, so a table
   * either becomes a stack of pairs or scrolls inside its own container.
   *
   * **Flip by default.** If a row makes sense read as key/value pairs it becomes one below 640px:
   * the head hides, each cell takes its key from `data-label`, and the row *is* a stat block. That
   * is why #153 and #154 are one design.
   *
   * **Scroll only when the columns are a matrix** — when they mean something only beside each
   * other, as the word-generator cheat sheet's do. Never the page.
   *
   * The component owns the `data-label` plumbing, which is where `StoragePanel`'s hand-rolled
   * version leaked: every cell had to remember its own label, and a cell that forgot lost its key
   * silently on exactly the screens nobody tests by hand.
   */

  type Props = {
    /** The head, and the labels the flip reads. */
    columns: Column[];
    /** `<tr>` rows. Use the `cell` snippet for each `<td>` so the labels stay in step. */
    rows: Snippet;
    /** What happens below 640px. `flip` unless the columns only mean something side by side. */
    narrow?: 'flip' | 'scroll';
    /** A caption for screen readers, where the surrounding heading does not name the table. */
    label?: string;
    class?: string;
  };

  const { columns, rows, narrow = 'flip', label, class: extraClass = '' }: Props = $props();
</script>

<!-- `data-scroll-x` is what excuses this wrapper from the mobile overflow guard, and it is set
     by the same condition that makes it scroll — see `DELIBERATE_SCROLLER` in e2e/mobile_layout.ts.
     The flipping variant must not carry it: a stack of labelled rows has nothing to scroll, so an
     exemption there would only hide a fault. -->
<div
  class="data-table {extraClass}"
  class:data-table--scroll={narrow === 'scroll'}
  data-scroll-x={narrow === 'scroll' ? '' : undefined}
>
  <table aria-label={label}>
    <thead>
      <tr>
        {#each columns as column (column.label)}
          <th class:numeric={column.numeric}>{column.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody class:data-table__flip={narrow === 'flip'}>
      {@render rows()}
    </tbody>
  </table>
</div>

<style>
  /* Only the scrolling variant needs a wrapper that scrolls; the flipping one must never make one,
     or a row that has become a stack would still be able to push the page sideways. */
  .data-table--scroll {
    overflow-x: auto;
  }

  @media (max-width: 40rem) {
    /* A stack of labelled rows rather than a table that scrolls sideways. The page must never
       scroll horizontally, and four columns cannot fit a phone honestly. */
    .data-table__flip {
      display: block;
    }

    .data-table:has(.data-table__flip) thead {
      display: none;
    }

    .data-table__flip :global(tr) {
      border-bottom: 1px solid var(--border);
      display: block;
      padding: var(--s3) 0;
    }

    .data-table__flip :global(td) {
      border: none;
      display: flex;
      gap: var(--s5);
      justify-content: space-between;
      padding: var(--s1) 0;
      text-align: left;
    }

    /* The key, in the same recipe `Stat` uses: below 640px a flipped row is a stat block, so it
       had better look like one. */
    .data-table__flip :global(td::before) {
      color: var(--ink-faint);
      content: attr(data-label);
      font: var(--t-micro);
      letter-spacing: var(--t-micro-tracking);
      text-transform: uppercase;
    }
  }
</style>
