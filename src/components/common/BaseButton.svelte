<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  /**
   * The site's button, in the one markup that can draw its own edge.
   *
   * A control is cut at two corners (`--corner-control`), and a `clip-path` cuts everything the
   * element paints — a `border` included. On the two diagonal edges the border is therefore sliced
   * off, and the plate meets the page with no keyline at all. That is why this component exists:
   * the outer `<button>` paints the edge colour across its whole box, and a liner one pixel inside
   * it paints the fill over all of that except a one-pixel band. The band *is* the border, and it
   * follows the diagonal because both shapes are cut.
   *
   * The look still comes from `main.css` — every rule there is written against two custom
   * properties, `--btn-edge` and `--btn-fill`, so a variant sets two colours and both this markup
   * and a plain `<button>` elsewhere read them. What is scoped here is only what the liner adds.
   *
   * The liner is a `<span>` rather than a `<div>` because a button's content model is phrasing
   * content; a block-level child is invalid markup and browsers may reparent it.
   */

  type Variant = 'primary' | 'secondary' | 'quiet' | 'destructive' | 'icon';
  type Size = 'default' | 'sm';

  type Props = Omit<HTMLButtonAttributes, 'class'> & {
    /** Which of the five variants. `secondary` is the base plate and the default. */
    variant?: Variant;
    /** `sm` is the 24px control; the type does not shrink with it. */
    size?: Size;
    /** The label, for the common case. Ignored when `children` is given. */
    label?: string;
    children?: Snippet;
    /** Extra classes for the caller's own layout — never for the look, which is the variant's. */
    class?: string;
    /** For a caller that has to move focus by hand after the click unmounts something. */
    element?: HTMLButtonElement;
  };

  let {
    variant = 'secondary',
    size = 'default',
    label = '',
    children,
    class: extraClass = '',
    element = $bindable(),
    type = 'button',
    ...rest
  }: Props = $props();

  const VARIANT_CLASS: Record<Variant, string> = {
    primary: 'btn-primary',
    secondary: '',
    quiet: 'btn-quiet',
    destructive: 'btn-destructive',
    icon: 'btn-icon',
  };

  const classes = $derived(
    [VARIANT_CLASS[variant], size === 'sm' ? 'btn-sm' : '', extraClass]
      .filter((name) => name !== '')
      .join(' '),
  );
</script>

<button bind:this={element} {type} class={classes} {...rest}>
  <span class="button-inner-field">
    <span class="button-text">
      {#if children}{@render children()}{:else}{label}{/if}
    </span>
  </span>
</button>

<style>
  /* The edge, painted across the whole box. `padding: 1px` is what leaves the band visible around
     the liner, and it is the border's width — the two cannot drift apart, because there is only
     one number. */
  button {
    background: var(--btn-edge);
    border: 0;
    padding: 1px;
  }

  /* The fill, one pixel inside, cut to the same shape at a smaller radius so the two diagonals run
     parallel rather than converging. */
  .button-inner-field {
    align-items: center;
    background: var(--btn-fill);
    /* Border-box, or `width: 100%` resolves against the button's content box and then *adds* this
       padding — the liner comes out 24px wider than the plate it is meant to sit inside, and the
       label runs under the edge on the right. */
    box-sizing: border-box;
    clip-path: var(--corner-control-inner);
    display: flex;
    justify-content: center;
    min-height: 26px;
    padding: var(--s2) var(--s5);
    width: 100%;
  }

  /* `main.css` sets `body :not(:is(h1…h6)) { line-height: 1.75 }`, which reaches a span inside a
     button and does not reach the button itself — so a lined button would stand 3px taller than
     the plain one beside it. The ramp's own line height, restated where the cascade took it. */
  .button-inner-field,
  .button-text {
    line-height: var(--t-micro-line);
  }

  .button-text {
    display: block;
  }

  /* The press moves the fill, not the edge: the plate sinks into its own frame, which is what the
     frame is for. `--edge` is the highlight that says "raised", so it goes rather than dims. */
  button:active:not(:disabled) .button-inner-field {
    box-shadow: inset 0 2px 4px rgb(0 0 0 / 45%);
  }

  button:disabled .button-inner-field {
    box-shadow: none;
  }

  /* An icon button is square and unclipped — a 7px cut on a 28px square eats the glyph — so it has
     no diagonal to rescue and no band to draw. It is the plain single-layer control. */
  button.btn-icon {
    background: var(--btn-fill);
    border: 1px solid var(--btn-edge);
    padding: 0;
  }

  button.btn-icon .button-inner-field {
    background: none;
    clip-path: none;
    min-height: 0;
    padding: 0;
  }

  /* Quiet has no fill, and a band is only visible against one: a transparent liner would show the
     whole edge colour through instead of a pixel of it. So quiet stays single-layer — and it drops
     the cut with the liner, because a clipped border is shaved at the diagonals and a shaved edge
     reads as a rendering fault rather than as a shape. A control with nothing to paint over does
     not claim a cut edge; it is square, and square is in the corner vocabulary. */
  button.btn-quiet {
    background: var(--btn-fill);
    border: 1px solid var(--btn-edge);
    clip-path: none;
    padding: var(--s2) var(--s5);
  }

  button.btn-quiet .button-inner-field {
    background: none;
    clip-path: none;
    min-height: 0;
    padding: 0;
  }

  /* The inline padding does not shrink with the size: the cut corner eats into the top right, and
     at `--s4` the last letter of a short label sits under the diagonal. */
  button.btn-sm .button-inner-field {
    min-height: 22px;
    padding: var(--s1) var(--s5);
  }

  /* The tap target grows the control itself, per docs/visual-design.md — the liner has to grow
     with it or the fill stops filling. */
  @media (pointer: coarse) {
    .button-inner-field {
      min-height: 42px;
    }

    button.btn-icon .button-inner-field,
    button.btn-quiet .button-inner-field {
      min-height: 0;
    }
  }
</style>
