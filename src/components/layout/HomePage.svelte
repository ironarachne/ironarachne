<script lang="ts">
  import { resolve } from '$app/paths';
  import lockup from '$lib/assets/images/logo/lockup-stacked-green.svg';
  import ReleaseNotes from '$components/layout/ReleaseNotes.svelte';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';
  import { featuredTools } from '$lib/tools';

  const featured = featuredTools();
</script>

<svelte:head>
  <title>Iron Arachne</title>
</svelte:head>

<div class="home">
  <section class="home__hero">
    <!-- The mark is the page's h1. Its accessible name is the alt text, so the heading a screen
         reader announces and the one a sighted visitor sees are the same words. -->
    <h1 class="home__heading">
      <img class="home__mark" src={lockup} alt="Iron Arachne" />
    </h1>
    <p class="home__tagline">Weave Your Universe</p>
    <p class="home__lede">
      Iron Arachne is a workshop for building the worlds tabletop role-playing games happen in. Roll
      a culture, a religion, a settlement, or a star system, keep what you like in a project, edit
      it until it is yours, and build the next piece out of the last. Everything you make stays in
      your browser — there is no account to create and nothing is sent anywhere.
    </p>
    <p class="home__cta">
      <a href={resolve('/workshop')}>Open the workshop</a>
    </p>
  </section>

  <div class="home__columns">
    <section class="home__column">
      <h2>Featured tools</h2>
      <p>Generators that are unique to this site, or that I am particularly proud of.</p>
      <ul class="home__featured">
        {#each featured as tool (tool.path)}
          <li>
            <!-- `resolve` is typed against one route id at a time, so the union of every route id
                 does not satisfy it. Catalog paths are all parameterless static routes. -->
            <a href={resolve(tool.path as '/')}>{tool.label}</a>
            <ToolMaturityBadge maturity={tool.maturity} />
          </li>
        {/each}
      </ul>
    </section>

    <section class="home__column">
      <h2>Recent changes</h2>
      <p>
        The last two releases. <a href={resolve('/release-notes')}>See them all</a>.
      </p>
      <ReleaseNotes limit={2} />
    </section>
  </div>
</div>

<style>
  /* Not `section.main`: the hero and the two columns want the page region, and each column
     carries the measure itself so the columns spread while the text inside them does not. */
  .home {
    padding: 0.5rem;
  }

  .home__hero {
    align-items: center;
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem 2.5rem;
    text-align: center;
  }

  .home__heading {
    margin: 0;
    width: 100%;
  }

  .home__mark {
    height: auto;
    max-width: min(22rem, 70vw);
    width: 100%;
  }

  .home__tagline {
    color: var(--gold);
    font-family: 'cinzel', system-ui, Helvetica, sans-serif;
    font-size: clamp(1.1rem, 3.5vw, 1.6rem);
    letter-spacing: 0.08em;
    margin: 0.75rem 0 0;
    text-transform: uppercase;
  }

  .home__lede {
    margin: 1.25rem 0 0;
    max-width: var(--measure);
  }

  .home__cta {
    margin: 1.5rem 0 0;
  }

  /* A link that acts as a control, so it wears the control system: the plate, the strong keyline
     and `--t-micro`. Square rather than cut, because an `<a>` cannot carry `BaseButton`'s liner
     and a clipped border is shaved at the diagonals. `linear-gradient(--granite, --tan)` under
     `color: black` was the last of the pre-redesign controls. */
  .home__cta a {
    background: var(--plate);
    border: 1px solid var(--border-strong);
    box-shadow: var(--edge);
    color: var(--ink);
    display: inline-block;
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    padding: var(--s3) var(--s6);
    text-decoration: none;
    text-transform: uppercase;
    transition:
      border-color var(--motion-swift) ease,
      color var(--motion-swift) ease;
  }

  .home__cta a:hover {
    border-color: var(--focus);
    color: var(--ink);
  }

  .home__columns {
    display: grid;
    /* Two columns where both can hold a readable measure, one where they cannot. `auto-fit` with
       a `minmax` floor is what makes that a property of the space rather than of a breakpoint
       guessed in advance. */
    gap: 1.5rem 2.5rem;
    grid-template-columns: repeat(auto-fit, minmax(min(24rem, 100%), 1fr));
    border-top: 1px solid var(--granite);
    padding-top: 1.5rem;
  }

  .home__column {
    min-width: 0;
    /* Each column keeps its own measure, so a wide display spreads the columns rather than the
       lines inside them. */
    max-width: var(--measure);
  }

  .home__column h2 {
    margin-top: 0;
  }

  .home__featured li {
    align-items: baseline;
    display: flex;
    gap: 0.5rem;
  }
</style>
