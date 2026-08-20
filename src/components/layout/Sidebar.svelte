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
  .sidebar {
    background: var(--slate);
    border-right: 1px solid var(--granite);
    overflow-y: auto;
    padding: 0.75rem 0.5rem;
  }

  .sidebar ul {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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

  .sidebar a {
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--iron-arachne-green);
    display: block;
    font-family: 'cinzel', system-ui, Helvetica, sans-serif;
    padding: 0.5rem 0.6rem;
    text-decoration: none;
  }

  .sidebar a:hover {
    background: var(--granite);
    color: white;
  }

  /* The current destination, marked by the same attribute a screen reader reads, so the visual
     state and the announced state cannot drift apart. */
  .sidebar a[aria-current='page'] {
    background: linear-gradient(0deg, var(--granite) 0%, var(--tan) 100%);
    border-color: var(--tan);
    color: black;
  }

  /* 768–1199px: narrower, with the same labels at a smaller size. There is no icon rail — the
     brand repo has no icon set, and five marks drawn here would sit badly beside the wordmark.
     See docs/app-shell.md, decision 6. */
  @media (max-width: 1199px) {
    .sidebar a {
      font-size: 0.85rem;
      padding: 0.45rem 0.4rem;
    }
  }

  /* Below 768px it is a drawer: off-canvas, over the page rather than beside it. The shell owns
     whether it is open; this owns where it sits. */
  @media (max-width: 767px) {
    .sidebar {
      bottom: 0;
      left: 0;
      position: fixed;
      top: 0;
      transform: translateX(-100%);
      transition: transform 0.2s ease;
      width: min(16rem, 80vw);
      z-index: 20;
    }

    .sidebar--open {
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar {
      transition: none;
    }
  }
</style>
