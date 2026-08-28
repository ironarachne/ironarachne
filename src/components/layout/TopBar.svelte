<script lang="ts">
  import { onMount } from 'svelte';

  import { resolve } from '$app/paths';
  import { hydrateArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import { getShortDate } from '$lib/dates';
  import { readShellStatus, type ShellStatus } from '$lib/navigation';
  import { hydrateProjects, onProjectsChanged } from '$lib/projects';
  import lockup from '$lib/assets/images/logo/lockup-horizontal-green.svg';
  import BaseButton from '$components/common/BaseButton.svelte';

  type Props = {
    /** Whether the sidebar drawer is open. Only meaningful below the drawer breakpoint. */
    drawerOpen?: boolean;
    /** Asks the shell to open or close the drawer. Absent on a shell with no drawer. */
    onToggleDrawer?: () => void;
  };

  const { drawerOpen = false, onToggleDrawer }: Props = $props();

  /**
   * Null until mounted, and rendered as placeholders while it is.
   *
   * The counts come from the vault, which is an IndexedDB database that has not been opened when
   * this component first renders — `readShellStatus` would honestly answer zero, and a bar that
   * says "0 artifacts" for a moment before saying 12 is worse than one that says nothing yet.
   */
  let status: ShellStatus | null = $state(null);

  function refresh(): void {
    status = readShellStatus();
  }

  onMount(async () => {
    // Hydrate before reading, and this is not optional. `readShellStatus` answers from the indexes
    // in memory, which on a fresh page load are empty until someone reads the database — so a bar
    // that only read at mount would say "0 artifacts, no project" for the whole visit, and go right
    // only if the user happened to save something. Hydration publishes no event, so there is
    // nothing to subscribe to instead of awaiting it.
    //
    // Both calls are idempotent and cheap after the first: whichever page the user landed on is
    // probably hydrating too, and the second caller gets the same in-flight promise.
    try {
      await Promise.all([hydrateProjects(), hydrateArtifacts()]);
    } catch (error: unknown) {
      // A vault that will not open is the storage layer's problem to report, not the status bar's.
      // The counts stay at their placeholder rather than taking the page down.
      console.error(error);
    }
    refresh();
  });

  onMount(() => {
    // The counts are live: saving or deleting anything, and renaming or switching a project, all
    // have to reach the bar. Both libraries already publish exactly these events.
    const stopArtifacts = onArtifactsChanged(refresh);
    const stopProjects = onProjectsChanged(refresh);

    return () => {
      stopArtifacts();
      stopProjects();
    };
  });
</script>

<header class="top-bar">
  {#if onToggleDrawer !== undefined}
    <BaseButton
      variant="icon"
      class="top-bar__menu"
      aria-expanded={drawerOpen}
      aria-controls="shell-sidebar"
      onclick={onToggleDrawer}
    >
      <span aria-hidden="true">☰</span>
      <span class="visually-hidden">{drawerOpen ? 'Close navigation' : 'Open navigation'}</span>
    </BaseButton>
  {/if}

  <a class="top-bar__identity" href={resolve('/')}>
    <img src={lockup} alt="Iron Arachne" />
  </a>

  <dl class="top-bar__status">
    <div class="top-bar__stat top-bar__stat--tools">
      <dt>Tools</dt>
      <dd>{status?.toolCount ?? '—'}</dd>
    </div>
    <div class="top-bar__stat top-bar__stat--artifacts">
      <dt>Artifacts</dt>
      <dd>{status?.artifactCount ?? '—'}</dd>
    </div>
    <div class="top-bar__stat top-bar__stat--project">
      <dt>Project</dt>
      <dd>
        <!-- The one status that is also a control: it is the thing a user needs to act on from
             anywhere, and the page that acts on it is Projects. -->
        <a href={resolve('/projects')}>{status?.projectName ?? 'None'}</a>
      </dd>
    </div>
  </dl>

  <!-- Read once, at mount, from the clock in the visitor's browser. -->
  <p class="top-bar__date">{status === null ? '' : getShortDate(status.today)}</p>
</header>

<style>
  /* 44px tall at every width, which is the hit-target floor — a bar that is exactly one target
     tall needs no separate rule to be tappable. The block padding is what centres a 28px lockup
     in that height.

     No `--lift`, and that is not an omission: the bar is a grid row rather than an overlay, and
     scrolling happens inside the page region, so nothing ever passes underneath it. A shadow
     says "this is above that", and here there is no that — the keyline carries the separation.
     No notch either, for the reason the sidebar's outer edge has none. See
     docs/visual-design.md, "The shell". */
  .top-bar {
    align-items: center;
    background: var(--surface-raised);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--edge);
    box-sizing: border-box;
    display: flex;
    gap: var(--s6);
    height: 44px;
    padding: var(--s4) var(--s5);
  }

  .top-bar__identity {
    display: flex;
    flex: 0 0 auto;

    & img {
      display: block;
      height: 28px;
      width: auto;
    }
  }

  /* The drawer toggle is `BaseButton`'s icon variant, so the plate, the keyline, the hover and the
     focus ring all come from the control system and none of them are restated here. What is left
     is where it sits and when it exists: hidden rather than not rendered, so the button is present
     the instant the viewport narrows past the breakpoint.

     `:global`, because the element now lives inside `BaseButton` and a scoped selector cannot
     reach it; kept under `.top-bar` so the pair outranks `.btn-icon` in `main.css`. */
  .top-bar :global(.top-bar__menu) {
    display: none;
    flex: 0 0 auto;
  }

  /* The status items sit together in the middle; the date is pushed to the far right by this
     margin rather than by `justify-content`, which would spread the identity too. */
  .top-bar__status {
    display: flex;
    gap: var(--s6);
    margin: 0 auto 0 var(--s4);
  }

  .top-bar__stat {
    display: flex;
    align-items: baseline;
    gap: var(--s3);
    white-space: nowrap;
  }

  /* `--t-micro` carries the uppercasing and the tracking this rule used to set by hand, at the
     ramp's 0.08em rather than a local 0.04em. */
  .top-bar__stat dt {
    color: var(--ink-faint);
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    text-transform: uppercase;
  }

  .top-bar__stat dd {
    color: var(--ink);
    font: var(--t-small);
    margin: 0;
  }

  /* The one status that is also a control, so it takes the accent every other link on the site
     takes rather than reading as a value. */
  .top-bar__stat--project dd a {
    color: var(--accent);
  }

  .top-bar__date {
    color: var(--ink-faint);
    flex: 0 0 auto;
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    margin: 0;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .visually-hidden {
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  /* What drops, and the order it drops in, per docs/app-shell.md: the date first, then the
     counts. The identity and the open project never drop — they are the two things that say
     where you are. */
  @media (max-width: 1199px) {
    .top-bar__date {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .top-bar {
      gap: var(--s4);
    }

    .top-bar :global(.top-bar__menu) {
      display: inline-flex;
    }

    .top-bar__stat--tools,
    .top-bar__stat--artifacts {
      display: none;
    }

    .top-bar__identity img {
      height: 24px;
    }
  }

  /* The one control on the site that keeps its 28px body under a coarse pointer and grows an
     invisible target around it instead. Everywhere else the target is the control, because
     controls sit beside one another and two overlapping targets are a mis-tap; this button stands
     alone in a 44px row, where a 44px plate would fill the bar edge to edge and the overlay has
     nothing to collide with. It overrides `.btn-icon`'s coarse-pointer size to do it. */
  @media (pointer: coarse) {
    .top-bar :global(.top-bar__menu) {
      height: 28px;
      min-height: 28px;
      position: relative;
      width: 28px;
    }

    /* 8px either side of a 28px body fills a 44px bar exactly. */
    .top-bar :global(.top-bar__menu)::after {
      content: '';
      inset: calc(var(--s4) * -1) 0;
      position: absolute;
    }
  }
</style>
