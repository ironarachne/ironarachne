<script lang="ts" module>
  /**
   * What a message is saying, which is not the same as what colour it is.
   *
   * `plain` is a statement of fact, and it is the default because most of what the app says is
   * one. The other three are spent on the cases that differ.
   */
  export type Tone = 'plain' | 'notice' | 'success' | 'danger';

  /** The class that carries a tone. Shared with the dialog, so both read one vocabulary. */
  export const TONE_CLASS: Record<Tone, string> = {
    plain: '',
    notice: 'panel--notice',
    success: 'panel--success',
    danger: 'panel--danger',
  };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A notice: the app saying something beside the work rather than in front of it.
   *
   * A notice and a dialog are the same toned panel at two levels of interruption — the panel's
   * liner, keyline, notch, padding ramp and lift, with no new box and no second recipe. They
   * differ in how much they interrupt, and in one deliberate detail: a dialog's actions are
   * right-aligned because a dialog is a question, and a notice's follow the text from the left
   * because a notice is a sentence.
   *
   * This is not a `Panel`, and the reason is the element rather than the styling. A notice is a
   * live region — `role="status"` — and a landmark is not a live region. It is also titleless,
   * where `Panel` requires a title because a panel without a heading is a box. The panel is the
   * classes in `main.css`; `Panel`, `Notice` and the dialog are three assemblies of them, because
   * a region, a status message and a top-layer dialog are three different elements and the wrong
   * element is not a styling problem.
   *
   * See docs/visual-design.md, "The message family".
   */

  type Props = {
    /** What the notice is saying, which is not the same as what colour it is. */
    tone?: Tone;
    /** What may be done about the sentence. Follows the text from the left. */
    actions?: Snippet;
    /** The caller's own layout — where the notice sits. Never the look. */
    class?: string;
    children: Snippet;
  };

  const { tone = 'plain', actions, class: extraClass = '', children }: Props = $props();
</script>

<div class="panel notice {TONE_CLASS[tone]} {extraClass}" role="status">
  <div class="panel__field">
    <div class="panel__body">
      {@render children()}

      {#if actions}
        <div class="notice__actions">
          {@render actions()}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* The only things scoped here. Everything else about a notice is `main.css`'s, so it is the
     same panel the rest of the app is. */

  /* A notice is a sentence, so its text is capped at the measure however wide it is placed. */
  .notice :global(p) {
    margin: 0;
    max-width: var(--measure);
  }

  /* Left-aligned, unlike a dialog's footer: these follow the text rather than answering a
     question. `--s4` either way, because the buttons are one group. */
  .notice__actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
  }
</style>
