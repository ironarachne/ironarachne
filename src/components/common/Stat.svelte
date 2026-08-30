<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * One stat: a key and its value.
   *
   * The key is `--t-micro`, tracked and uppercase in `--ink-faint`; the value is `--t-body` in
   * `--ink`. **That is deliberately the recipe a control's label already uses** — a stat is a field
   * nobody can type in, and the app has already taught a reader that a small uppercase line above a
   * value names that value. Teaching that shape twice with two looks is the failure the design
   * document exists to prevent.
   *
   * The value is a snippet rather than a string because a stat's value is often not one: a number,
   * a name, a `Badge`, a link. Several of the sites #153 converted already carried markup.
   *
   * See docs/visual-design.md, "A stat is a pair, and it is not a sentence".
   */

  type Props = {
    /** The key. Does not repeat the heading above the block — "Attack Bonus", not "Combat Attack Bonus". */
    label: string;
    /** The value. */
    children: Snippet;
    class?: string;
  };

  const { label, children, class: extraClass = '' }: Props = $props();
</script>

<div class="stat {extraClass}">
  <dt>{label}</dt>
  <dd>{@render children()}</dd>
</div>

<style>
  .stat {
    min-width: 0;
  }

  .stat dt {
    color: var(--ink-faint);
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    text-transform: uppercase;
  }

  .stat dd {
    color: var(--ink);
    font: var(--t-body);
    margin: 0;
    margin-top: var(--s1);
    overflow-wrap: anywhere;
  }
</style>
