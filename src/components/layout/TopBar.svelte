<script lang="ts">
  import { onMount } from 'svelte';

  import { resolve } from '$app/paths';
  import { hydrateArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import { getShortDate } from '$lib/dates';
  import { readShellStatus, type ShellStatus } from '$lib/navigation';
  import { hydrateProjects, onProjectsChanged } from '$lib/projects';
  import lockup from '$lib/assets/images/logo/lockup-horizontal-green.svg';

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
    <button
      type="button"
      class="top-bar__menu"
      aria-expanded={drawerOpen}
      aria-controls="shell-sidebar"
      onclick={onToggleDrawer}
    >
      <span aria-hidden="true">☰</span>
      <span class="visually-hidden">{drawerOpen ? 'Close navigation' : 'Open navigation'}</span>
    </button>
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
  .top-bar {
    align-items: center;
    background: var(--slate);
    border-bottom: 1px solid var(--granite);
    display: flex;
    gap: 1rem;
    padding: 0.35rem 0.75rem;
  }

  .top-bar__identity {
    display: flex;
    flex: 0 0 auto;

    & img {
      display: block;
      height: 2.25rem;
      width: auto;
    }
  }

  /* Only the drawer band has a drawer to toggle. Hidden rather than not rendered, so the button
     is present the instant the viewport narrows past the breakpoint. */
  .top-bar__menu {
    display: none;
    background: none;
    border: 1px solid var(--granite);
    border-radius: 6px;
    color: var(--iron-arachne-green);
    cursor: pointer;
    flex: 0 0 auto;
    font-size: 1.1rem;
    line-height: 1;
    padding: 0.35rem 0.5rem;
  }

  .top-bar__menu:hover {
    border-color: white;
    color: white;
  }

  /* The status items sit together in the middle; the date is pushed to the far right by this
     margin rather than by `justify-content`, which would spread the identity too. */
  .top-bar__status {
    display: flex;
    gap: 1.25rem;
    margin: 0 auto 0 0.5rem;
  }

  .top-bar__stat {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    white-space: nowrap;
  }

  /* Lightened off the raw tan, which at 0.7rem on the slate bar sat close enough to the
     background to read as disabled rather than as a label. */
  .top-bar__stat dt {
    color: color-mix(in srgb, var(--tan) 55%, white 45%);
    font-family: 'cinzel', system-ui, Helvetica, sans-serif;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .top-bar__stat dd {
    color: white;
    font-size: 0.9rem;
    margin: 0;
  }

  .top-bar__date {
    color: color-mix(in srgb, var(--tan) 55%, white 45%);
    flex: 0 0 auto;
    font-size: 0.8rem;
    margin: 0;
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
      gap: 0.5rem;
    }

    .top-bar__menu {
      display: block;
    }

    .top-bar__stat--tools,
    .top-bar__stat--artifacts {
      display: none;
    }

    .top-bar__identity img {
      height: 1.75rem;
    }
  }
</style>
