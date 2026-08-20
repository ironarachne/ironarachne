<script lang="ts">
  import { onMount } from 'svelte';

  import '$lib/styles/main.css';
  import Footer from '$components/layout/Footer.svelte';
  import ModalHost from '$components/layout/ModalHost.svelte';
  import Sidebar from '$components/layout/Sidebar.svelte';
  import TopBar from '$components/layout/TopBar.svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  const { children }: Props = $props();

  /**
   * Whether the sidebar drawer is showing. Only meaningful below 768px, where the sidebar is
   * off-canvas; above that the sidebar is simply part of the grid and this is ignored.
   */
  let drawerOpen = $state(false);

  function closeDrawer(): void {
    drawerOpen = false;
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && drawerOpen) {
      closeDrawer();
    }
  }

  // A drawer left open while the viewport grows past the breakpoint would leave the page inert
  // behind a sidebar that is no longer a drawer — visible, dismissable by nothing. Closing it on
  // the media query rather than on a resize handler means the state changes exactly when the CSS
  // does, from the same source of truth.
  onMount(() => {
    const drawerWidth = window.matchMedia('(max-width: 767px)');
    const sync = (): void => {
      if (!drawerWidth.matches) {
        closeDrawer();
      }
    };
    drawerWidth.addEventListener('change', sync);
    return () => drawerWidth.removeEventListener('change', sync);
  });

  // Heraldry, cultures, and religions saved under the old per-generator scopes are adopted into a
  // project here, on the first page of this build a user opens rather than only if they find the
  // workshop. Local-only means there is no server-side copy and no migration anyone can run after
  // the fact, so it does not wait for a surface that shows it.
  //
  // This is also what opens the vault database on an ordinary page load, which is what runs the
  // one-time copy of the workshop's own `localStorage` keys into it (see $lib/vault_db).
  //
  // Imported dynamically so none of it is in the chunk that renders the page, and cheap to call
  // repeatedly: with nothing new to take it reads a handful of entries and writes nothing.
  // ProjectContextBar shows the note it leaves. See src/lib/legacy_adoption/README.md.
  onMount(async () => {
    try {
      const [{ adoptLegacySaves }, { ARTIFACT_KINDS }] = await Promise.all([
        import('$lib/legacy_adoption'),
        import('$lib/workshop'),
      ]);
      await adoptLegacySaves(ARTIFACT_KINDS);
    } catch (error: unknown) {
      // A refused write is the realistic failure, and it must not take the page down with it. The
      // legacy scopes are untouched either way, and the record of what was adopted is written per
      // item, so the next load resumes from where this one stopped.
      console.error(error);
    }
  });

  // Answer other tabs asking whether anyone else has the site open, for as long as this one is.
  // A restore in one tab under a workshop open in another is how two tabs undo each other's
  // writes, and this is what lets the import warn before it happens. Registered explicitly rather
  // than as an import side effect: a tab that only answers once some module happened to load is a
  // tab that is invisible exactly when a restore is about to run.
  onMount(() => {
    let stop: (() => void) | undefined;
    void import('$lib/vault_db').then(({ announceVaultTab }) => {
      stop = announceVaultTab();
    });
    return () => stop?.();
  });
</script>

<svelte:window onkeydown={onKeydown} />

<div class="shell">
  <TopBar {drawerOpen} onToggleDrawer={() => (drawerOpen = !drawerOpen)} />
  <Sidebar open={drawerOpen} onNavigate={closeDrawer} />

  {#if drawerOpen}
    <!-- Dismisses the drawer on a tap outside it. `inert` on the page below is what actually keeps
         focus in the drawer, so this is a pointer affordance rather than the accessibility
         mechanism, and it is hidden from the accessibility tree accordingly. -->
    <div class="shell__scrim" onclick={closeDrawer} role="presentation" aria-hidden="true"></div>
  {/if}

  <!--
    `inert` while the drawer is open does the job a hand-written focus trap would: the page below
    stops taking focus, stops taking clicks, and disappears from the accessibility tree, so Tab
    cycles inside the drawer because there is nowhere else to go.
  -->
  <main class="shell__page" inert={drawerOpen}>
    {@render children?.()}
    <Footer />
  </main>
</div>

<ModalHost />

<style>
  /*
    The shell: a fixed-height bar across the top, a fixed-width sidebar down the left, and the page
    region taking everything that is left. The grid is the viewport, so the bar and the sidebar are
    pinned and scrolling happens inside the page region rather than carrying the shell away with
    it.

    `100dvh` rather than `100vh` because mobile browsers shrink the visual viewport as their own
    chrome slides in and out; `vh` there is the tallest it ever gets, which puts the bottom of the
    page under the browser's toolbar.
  */
  .shell {
    display: grid;
    grid-template-areas:
      'bar bar'
      'nav page';
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;
    height: 100dvh;
  }

  .shell > :global(.top-bar) {
    grid-area: bar;
  }

  .shell > :global(.sidebar) {
    grid-area: nav;
    width: 12rem;
  }

  .shell__page {
    grid-area: page;
    min-width: 0;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .shell__scrim {
    background: rgb(0 0 0 / 50%);
    inset: 0;
    position: fixed;
    z-index: 10;
  }

  @media (max-width: 1199px) {
    .shell > :global(.sidebar) {
      width: 8.5rem;
    }
  }

  /* The drawer band. The sidebar is `position: fixed` at this width, which takes it out of flow,
     so the grid is a single column and the page region has the viewport to itself. */
  @media (max-width: 767px) {
    .shell {
      grid-template-areas:
        'bar'
        'page';
      grid-template-columns: 1fr;
    }

    .shell > :global(.sidebar) {
      width: min(16rem, 80vw);
    }
  }
</style>
