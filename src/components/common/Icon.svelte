<script lang="ts">
  /**
   * One icon from `src/lib/assets/icons`, inlined.
   *
   * See docs/visual-design.md, "Icons: the glyph that names, and the mark that decorates". An icon
   * here does one of two jobs and this component is told which by whether it is given a `label`:
   *
   * - **A glyph** stands in for a label there was no room for. It carries an accessible name, and
   *   deleting it would leave the thing it names unidentifiable.
   * - **A mark** gives a surface character it already reads without. It is `aria-hidden`, because a
   *   screen reader announcing "image" between a heading and its text is worse than the silence it
   *   replaces, and deleting it costs nothing but flavour.
   *
   * **Markup rather than a name**, which is not a convenience. A `name="set2/flag"` prop would need
   * a computed `import()`, a computed specifier cannot be statically analysed, and all 455 icons
   * would land in the bundle of any page that showed one — the same trap `TOOL_PANELS` documents
   * for the tool panels. Callers import with `?raw` and pass what they get.
   *
   * Sized at `1em`, so a mark inherits the ramp step of the text beside it and is on the type ramp
   * without declaring a size. Painted with `currentColor` through the icon's own mask, so it takes
   * the colour of whatever it sits in and survives all four genre skins without knowing they exist.
   */

  type Props = {
    /** The icon's markup, imported with `?raw`. */
    icon: string;
    /** The accessible name. Given, this is a glyph; omitted, it is a mark and is hidden. */
    label?: string;
    class?: string;
  };

  let { icon, label, class: extraClass = '' }: Props = $props();
</script>

<!-- Vendored icon markup from `src/lib/assets/icons`, never user input.

     A block directive rather than `eslint-disable-next-line`: this element carries enough
     attributes that Prettier wraps them, which moves the `{@html}` off the line after the comment
     and leaves the rule firing again. -->
<!-- eslint-disable svelte/no-at-html-tags -->
<span
  class="icon {extraClass}"
  class:icon--mark={label === undefined}
  role={label === undefined ? undefined : 'img'}
  aria-label={label}
  aria-hidden={label === undefined ? 'true' : undefined}>{@html icon}</span
>

<!-- eslint-enable svelte/no-at-html-tags -->

<style>
  /* `em` rather than a ramp step: the mark belongs to the text it accompanies, so it takes that
     text's size whatever step the caller is on. A pixel size here would be a sixth type ramp. */
  .icon {
    display: inline-flex;
    flex: 0 0 auto;
    height: 1em;
    width: 1em;
  }

  /* A mark is never the brightest thing on its surface, so it recedes to the role for things that
     are present without being read. Decided here rather than at each call site, because the same
     `label`-or-not that makes it a mark is what makes it decoration — and a mark inheriting a
     link's accent green, which is what happened the first time this shipped, is a mark competing
     with the label it classifies.

     A glyph is untouched: it takes `currentColor` from the control it names, which is how a
     pressed or disabled button carries its icon with it. */
  .icon--mark {
    color: var(--ink-faint);
  }

  /* The file's own `width`/`height` are a default to override in CSS, per the icon set's README. */
  .icon :global(svg) {
    display: block;
    height: 100%;
    width: 100%;
  }
</style>
