<script lang="ts" module>
  /** What the badge is saying. The tone is the meaning; the colour is how it is said. */
  export type BadgeTone = 'notice' | 'info' | 'neutral' | 'danger';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A badge: non-interactive furniture naming what something is. A pill, `--t-micro`, an edge in
   * its own tone over `--surface-inset`.
   *
   * Three hand-rolled copies of this existed before — `ToolMaturityBadge`'s, `ToolBrowser`'s and
   * `ProjectView`'s — with the same six declarations written out three times and `--gold` in two
   * of them. See docs/visual-design.md, "Badges and chips".
   */

  type Props = {
    /** What the badge is saying, which is not the same as what colour it is. */
    tone?: BadgeTone;
    /**
     * Drops the pill for plain coloured text. For a list, where thirty bordered pills stop
     * annotating the names and start shouting over them.
     */
    plain?: boolean;
    class?: string;
    children: Snippet;
  };

  const { tone = 'neutral', plain = false, class: extraClass = '', children }: Props = $props();

  const TONE_CLASS: Record<BadgeTone, string> = {
    notice: 'badge--notice',
    info: 'badge--info',
    neutral: '',
    danger: 'badge--danger',
  };
</script>

<span class="badge {TONE_CLASS[tone]} {extraClass}" class:badge--plain={plain}>
  {@render children()}
</span>
