<script lang="ts">
  import { resolve } from '$app/paths';
  import { allTools, groupToolsByDomain, searchTools } from '$lib/tools';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';

  const tools = allTools();

  const uid = $props.id();
  const filterId = `${uid}-filter`;

  let query = $state('');

  const visibleTools = $derived(searchTools(tools, { query }));
  const groups = $derived(groupToolsByDomain(visibleTools));

  /**
   * No genre or system filter, deliberately. Those exist on the workshop's `ToolBrowser` to narrow
   * the catalog against the open project's setting; this page has no project and no setting, so
   * they would be a second filtering UI answering a question nobody standing here has asked. The
   * name filter is the whole of it — thirty-odd tools in five groups is a page you read.
   */
  const isFiltering = $derived(query.trim() !== '');
</script>

<svelte:head>
  <title>All Tools | Iron Arachne</title>
</svelte:head>

<section class="all-tools">
  <h1>All Tools</h1>
  <p class="all-tools__lede">
    Every generator, editor, and reference on the site. Each one works on its own — pick one and
    start — or open it as a panel on the
    <a href={resolve('/workshop')}>workshop</a> bench to work alongside a project.
  </p>

  <div class="all-tools__filters">
    <div class="input-group input-group--inline">
      <label for={filterId}>Filter</label>
      <input
        id={filterId}
        type="search"
        bind:value={query}
        placeholder="Filter by name"
        autocomplete="off"
      />
    </div>
    <!-- Only while the list is actually narrowed. Announced, because on this page the list is the
         entire content: someone filtering by ear otherwise types into a box and hears nothing. -->
    {#if isFiltering}
      <p class="all-tools__count" role="status">
        {visibleTools.length} of {tools.length} tools
      </p>
    {/if}
  </div>

  <div class="all-tools__list">
    {#each groups as group (group.domain)}
      <section class="all-tools__group">
        <h2>{group.heading}</h2>
        <ul>
          {#each group.tools as tool (tool.path)}
            <li>
              <!-- A plain anchor to the tool's own route, which is the point of the page: it can be
                   opened in a new tab, bookmarked, and followed by a crawler. The workshop's
                   browser mounts a panel from a button instead, so before this page nothing on the
                   site linked to most of these routes at all.

                   The cast is the one `resolve` forces: it is typed against a single route id, so
                   a value typed as the union of every route id does not satisfy it. Every catalog
                   path is a parameterless static route, as the home page's featured links are. -->
              <a class="all-tools__tool inset" href={resolve(tool.path as '/')}>
                <span class="all-tools__name">{tool.label}</span>
                <!-- Same rule the workshop's browser follows, settled in #43: a release-ready tool
                     says nothing, because the level is a qualifier on what will happen to the
                     user's work rather than a grade. An unmarked row is a finished tool. -->
                <ToolMaturityBadge maturity={tool.maturity} plain />
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {:else}
      <p class="all-tools__empty">No tools match.</p>
    {/each}
  </div>
</section>

<style>
  /* Not `section.main`: the measure is for running text, and a list of thirty-four names read at
     70ch is a column of links with a screen of empty beside it. The lede below keeps the measure
     because it is prose; the list takes the width it can use. */
  .all-tools {
    padding: 0.5rem;
    max-width: 70rem;
  }

  .all-tools__lede {
    max-width: var(--measure);
  }

  .all-tools__filters {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset and the room to shrink. */
  .all-tools__filters .input-group {
    margin: 0;
    min-width: 0;
  }

  .all-tools__count {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .all-tools__group + .all-tools__group {
    margin-top: 1.5rem;
  }

  .all-tools__group h2 {
    color: var(--gold);
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    margin: 0 0 0.5rem;
    text-transform: uppercase;
  }

  .all-tools__group ul {
    display: grid;
    /* One column on a phone, more as the room appears. `min(...)` rather than a bare `18rem` is
       what keeps it from overflowing at 320px, where the track would otherwise be wider than the
       page. */
    grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
  }

  /* main.css sets `ul li { list-style-type: disc; margin-left: 2rem }` globally, which is right for
     prose and wrong for a grid of link targets — and it is on the `li`, so undoing it on the `ul`
     would not beat it. The sidebar undoes the same rule for the same reason. */
  .all-tools__group li {
    list-style-type: none;
    margin-left: 0;
  }

  /* An inset row: this page is a list of links on the page itself, not a panel of them, so a
     row sits in the surface rather than being raised off it. */
  .all-tools__tool {
    align-items: baseline;
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
    justify-content: space-between;
    text-decoration: none;
  }

  .all-tools__tool:hover,
  .all-tools__tool:focus-visible {
    border-color: var(--tan);
  }

  .all-tools__name {
    /* A name is one unbroken string on a 320px screen — "Species Height and Weight Calculator" is
       the long one — and the grid track is only as wide as the page there. */
    overflow-wrap: anywhere;
    min-width: 0;
  }

  .all-tools__empty {
    font-style: italic;
    opacity: 0.8;
  }
</style>
