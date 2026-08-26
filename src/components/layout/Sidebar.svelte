<script lang="ts">
  import { base, resolve } from '$app/paths';
  import { page } from '$app/state';
  import { NAV_DESTINATIONS, activeDestination } from '$lib/navigation';

  type Props = {
    /** Whether the drawer is showing. Ignored above the drawer breakpoint, where it is always in. */
    open?: boolean;
    /** Called when a link is followed, so the shell can close the drawer behind it. */
    onNavigate?: () => void;
  };

  const { open = false, onNavigate }: Props = $props();

  const active = $derived(activeDestination(page.url.pathname, base));
</script>

<nav id="shell-sidebar" class="sidebar" class:sidebar--open={open} aria-label="Main">
  <ul>
    {#each NAV_DESTINATIONS as destination (destination.id)}
      <li>
        <!-- `resolve` is typed against one route id at a time, so a value typed as the union of
             every route id does not satisfy it. Every destination is a parameterless static
             route, so narrowing to an arbitrary member of the union is safe — the same narrowing
             the tool catalog's links use. -->
        <a
          href={resolve(destination.path as '/')}
          aria-current={active?.id === destination.id ? 'page' : undefined}
          onclick={onNavigate}
        >
          {destination.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  /* The sidebar is flush to the left edge of the screen and square on that side: the items run
     edge to edge and carry their own inset padding, which is why the inline padding here is zero
     at every width. No notch on the outer edge — `--notch` cuts a corner off a plate that sits on
     a surface, and a cut on an edge with nothing beyond it reads as damage rather than as a cut.
     See docs/visual-design.md, "The shell". */
  .sidebar {
    background: var(--surface-raised);
    border-right: 1px solid var(--border);
    box-shadow: var(--edge);
    overflow-y: auto;
    padding: var(--s5) 0;
  }

  .sidebar ul {
    display: flex;
    flex-direction: column;
    gap: var(--s1);
    margin: 0;
    padding: 0;
  }

  /* main.css sets `ul li { list-style-type: disc; margin-left: 2rem }` globally, which is right
     for prose and wrong for navigation — and it is on the `li`, so `list-style: none` on the `ul`
     above does not beat it. Undone here rather than there: every other list on the site wants the
     disc. */
  .sidebar li {
    list-style-type: none;
    margin-left: 0;
  }

  /* One size at every width. The 768–1199px band used to override `font-size` and `padding` to
     fit narrower labels; `--t-micro` is 11px uppercase Cinzel, and `RELEASE NOTES` — the longest
     label — clears the 128px column's usable width, so that override is deleted rather than
     restated.

     The transparent keyline is geometry rather than decoration: the current item takes a
     `--border-strong` edge on three sides, and an item that grew a border only on becoming
     current would shift its own label by a pixel. Rest still shows no keyline. */
  .sidebar a {
    border: 1px solid transparent;
    border-inline-start: 0;
    color: var(--ink-muted);
    display: block;
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    padding: var(--s3) var(--s3) var(--s3) var(--s5);
    text-decoration: none;
    text-transform: uppercase;
    transition:
      background-color var(--motion-swift) ease,
      color var(--motion-swift) ease;
  }

  /* No keyline on hover: one would compete with the current item's marker, which is the thing the
     eye is meant to find without reading. */
  .sidebar a:hover {
    background-color: var(--surface-inset);
    color: var(--ink);
  }

  .sidebar a:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  /* The current destination, marked by the same attribute a screen reader reads, so the visual
     state and the announced state cannot drift apart. It outranks the hover rule on specificity,
     which is the intent: current plus hover is current. The destination you are already on is not
     a target worth lighting, and a hover state there is how a user learns that clicking it does
     nothing.

     The marker is an inset shadow rather than a border or a pseudo-element because `--corner-nav`
     is a `clip-path`, and a clip cuts everything the element paints, borders included — a
     `border-inline-start` would be shaved at both ends by the very corners it needs to survive.
     An inset shadow is painted inside the clip, on the one edge the clip does not touch. */
  .sidebar a[aria-current='page'] {
    background: var(--plate);
    border-color: var(--border-strong);
    box-shadow:
      var(--edge),
      inset 3px 0 0 var(--accent);
    clip-path: var(--corner-nav);
    color: var(--ink);
  }

  /* Below 768px it is a drawer: off-canvas, over the page rather than beside it. The shell owns
     whether it is open; this owns where it sits. It is the one part of the shell that takes
     `--lift` — the one place where something genuinely overlaps content, which is the condition
     the elevation model states for a shadow. */
  @media (max-width: 767px) {
    .sidebar {
      bottom: 0;
      box-shadow: var(--edge), var(--lift);
      left: 0;
      position: fixed;
      top: 0;
      transform: translateX(-100%);
      /* `visibility` and not transform alone. A drawer parked off-canvas by a transform is still
         rendered: its links stay in the tab order and in the accessibility tree, so tabbing out of
         the top bar walks into six invisible destinations. `visibility: hidden` takes it out of
         both, and delaying it by exactly the slide's own duration keeps the animation — the two
         read the same token, or the drawer disappears mid-slide. */
      visibility: hidden;
      transition:
        transform var(--motion-swift) ease,
        visibility 0s linear var(--motion-swift);
      width: min(272px, 80vw);
      z-index: 20;
    }

    .sidebar--open {
      transform: translateX(0);
      visibility: visible;
      transition:
        transform var(--motion-swift) ease,
        visibility 0s;
    }
  }

  /* The hit target keys off the pointer rather than off the width: a touch laptop at 1280px wants
     the same 44px target, and a phone plugged into a mouse does not. */
  @media (pointer: coarse) {
    .sidebar a {
      align-items: center;
      display: flex;
      min-height: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar {
      transition: none;
    }
  }
</style>
