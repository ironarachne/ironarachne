<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The site's panel, in the one markup that can draw its own keyline.
   *
   * A panel is cut at two corners (`--notch`), and a `clip-path` cuts everything the element
   * paints — a `border` included. On the two diagonal edges the keyline is therefore sliced off,
   * at exactly the corners the treatment exists to make visible. That is why this component
   * exists, and it is the same reason `BaseButton` does: the outer element paints the edge colour
   * across its whole box, and a liner one pixel inside it paints the surface over all of that
   * except a one-pixel band. The band *is* the keyline, and it follows the diagonal because both
   * shapes are cut.
   *
   * The look comes from `main.css`, written against `--panel-edge` and `--panel-surface`, so a
   * level, a state and a genre skin each set two colours and none of them mentions this markup.
   * See docs/visual-design.md, "Panel language".
   */

  type Props = {
    /** Shown on the header plate, and the accessible name of the region. */
    title: string;
    /** What kind of thing the panel holds, beside the title in the header. */
    subtitle?: string;
    /**
     * No surface of its own: the panel holding the thing being worked on, so the work is not
     * competing with the furniture around it. Its header plate and the bench's `--s7` are what
     * identify it instead.
     */
    bare?: boolean;
    /** Takes the halo while something inside it has focus. Bench panels only. */
    focal?: boolean;
    /**
     * The region's accessible name, where it should differ from the title — "Tools panel" rather
     * than "Tools". Defaults to the title.
     */
    label?: string;
    /** The header plate's right-hand end: the controls that act on the panel itself. */
    actions?: Snippet;
    /** The caller's own layout — how wide the panel is, and what it sits in. Never the look. */
    class?: string;
    children: Snippet;
  };

  const {
    title,
    subtitle,
    bare = false,
    focal = false,
    label,
    actions,
    class: extraClass = '',
    children,
  }: Props = $props();
</script>

<!-- A labelled `section` is a region landmark, so a panel is reachable by landmark as well as by
     heading. -->
<section
  class="panel {extraClass}"
  class:panel--bare={bare}
  class:panel--focal={focal}
  aria-label={label ?? title}
>
  <div class="panel__field">
    <header class="panel__header">
      <div class="panel__header-field">
        <h2 class="panel__title">
          {title}
          {#if subtitle}
            <span class="panel__subtitle">{subtitle}</span>
          {/if}
        </h2>

        {#if actions}
          <div class="panel__actions">
            {@render actions()}
          </div>
        {/if}
      </div>
    </header>

    <div class="panel__body">
      {@render children()}
    </div>
  </div>
</section>

<style>
  /* The only thing scoped here. Everything else about a panel is `main.css`'s, so an unconverted
     surface reading the same classes gets the same panel. */
  .panel__subtitle {
    color: var(--accent-quiet);
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    text-transform: uppercase;
  }
</style>
