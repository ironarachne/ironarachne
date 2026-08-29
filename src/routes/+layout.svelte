<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';
  import '$lib/styles/main.css';
  import { resolveGenreSkin } from '$lib/genre_skin';
  import { getActiveProject, hydrateProjects, onProjectsChanged } from '$lib/projects';
  import type { Genre } from '$lib/tools';
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

  /**
   * The open project's genre, or `undefined` for none — held rather than read inline because
   * `getActiveProject` is a synchronous read of an index that has to be hydrated first.
   */
  let projectGenre = $state<Genre | undefined>(undefined);

  /**
   * Which genre the page region is wearing. Derived on every read and stored nowhere: decision 7
   * in docs/workshop.md promises that changing a project's genre invalidates nothing, and a
   * cached skin would make that a lie in the one place nobody would look for it.
   *
   * `page.route.id` rather than a pathname, because a catalog `path` *is* a route id — the two
   * compare exactly, and neither has to know whether the app is served under a base path.
   */
  const genre = $derived(resolveGenreSkin(projectGenre, page.route.id));

  function refreshProjectGenre(): void {
    projectGenre = getActiveProject()?.genre;
  }

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

  // The skin follows the project live rather than at load: a project can be created, opened, or
  // have its genre changed from the projects page, from the context bar, or from a generator in a
  // panel saving its first culture, and none of those reload the page. `onProjectsChanged` is the
  // same event `ProjectContextBar` keeps up with, for the same reason.
  //
  // The read is deferred until the index is hydrated, which the adoption pass below also does —
  // this is what covers a load where that pass failed before it got that far.
  onMount(() => onProjectsChanged(refreshProjectGenre));

  onMount(async () => {
    await hydrateProjects();
    refreshProjectGenre();
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
  <!-- The one place `data-genre` is written. The top bar and the sidebar are this element's
       *siblings* in the shell grid, not its descendants, so they are genre-neutral by position and
       there is no opt-out list for anyone to maintain. A dialog is neutral for the same kind of
       reason: `ModalHost` is outside `.shell` and a modal renders in the top layer, so the
       attribute cannot reach it however the selector is written — which is correct, and is not a
       gap to close later. A skin dresses the user's work, never the app's own voice.

       An attribute rather than a class: an element has exactly one `data-genre`, so "one genre on
       screen" is structurally true rather than a rule somebody has to keep, and it cannot collide
       with a component's own class names. See docs/visual-design.md, "Applying a skin". -->
  <main class="shell__page" data-genre={genre} inert={drawerOpen}>
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

  /* The shell's widths are stated in `px` and not in `rem`. `main.css` sets a fluid root —
     `clamp(1em, 0.909em + 0.45vmin, 1.25em)` — so every `rem` here would be relative to a moving
     target, and the sidebar would be a different fraction of a 1280px screen than of a 1920px
     one despite `width` being one number. The type ramp is already in `px`; this makes the frame
     agree with it. See docs/visual-design.md, "The shell". */
  .shell > :global(.sidebar) {
    grid-area: nav;
    width: 176px;
  }

  /* The Page level of the elevation model: flat, no border, no shadow. */
  .shell__page {
    background: var(--surface-page);
    grid-area: page;
    min-width: 0;
    overflow-y: auto;
    padding: var(--s7);
  }

  /* The shell and the modals dim the page for the same reason, so they dim it by the same amount
     from the same place. */
  .shell__scrim {
    background: var(--modal-backdrop);
    inset: 0;
    position: fixed;
    z-index: 10;
  }

  @media (max-width: 1199px) {
    .shell > :global(.sidebar) {
      width: 128px;
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
      width: min(272px, 80vw);
    }

    .shell__page {
      padding: var(--s5);
    }
  }
</style>
