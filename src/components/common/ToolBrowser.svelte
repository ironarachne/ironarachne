<script lang="ts">
  import {
    allTools,
    genreDisplayName,
    groupToolsByDomain,
    searchTools,
    systemDisplayName,
  } from '$lib/tools';
  import type { GameSystem, Genre, Tool } from '$lib/tools';
  import { DOMAIN_MARKS } from '$lib/tool_marks';
  import Badge from '$components/common/Badge.svelte';
  import Icon from '$components/common/Icon.svelte';
  import ListButton from '$components/common/ListButton.svelte';
  import Panel from '$components/common/Panel.svelte';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';

  type Props = {
    /** Tools to browse; the whole catalog by default. */
    tools?: Tool[];
    /** Panel heading. */
    title?: string;
    /**
     * Genre of the work in progress — in the workshop, the open project's. When set, tools written
     * for a different genre are hidden and genre-neutral tools are kept.
     */
    genre?: Genre;
    /** System of the work in progress. Narrows the list the same way `genre` does. */
    system?: GameSystem;
    /** Path of the tool currently loaded. Bindable, so a parent can drive or read it. */
    activeToolPath?: string;
    /**
     * Paths of every tool the caller has open, for the "Loaded" badge. A workshop has several
     * panels at once, so which tools are mounted is a list rather than the single
     * `activeToolPath` a one-panel caller tracks; left unset, the two are the same thing.
     */
    openToolPaths?: string[];
    /** Called when the user picks a tool other than the one already loaded. */
    onToolChange?: (tool: Tool) => void;
  };

  let {
    tools = allTools(),
    title = 'Tools',
    genre,
    system,
    activeToolPath = $bindable(undefined),
    openToolPaths,
    onToolChange,
  }: Props = $props();

  // One id per component instance, so two browsers side by side do not collide on label `for`.
  const uid = $props.id();
  const filterId = `${uid}-filter`;
  const showAllId = `${uid}-show-all`;

  let query = $state('');
  /**
   * Whether the setting filter is suspended. Per session and never persisted: looking at the rest
   * of the catalog is not a change to the project (docs/workshop.md, decision 8). One control
   * rather than one per filter — "show me everything" is a request users make, and "other genres
   * but not other systems" is not.
   */
  let showAll = $state(false);

  const loadedPaths = $derived(
    new Set(openToolPaths ?? (activeToolPath === undefined ? [] : [activeToolPath])),
  );

  const setting = $derived(showAll ? {} : { genre, system });
  const visibleTools = $derived(searchTools(tools, { query, ...setting }));
  const groups = $derived(groupToolsByDomain(visibleTools));

  /**
   * How many tools the project's setting takes out of the list, counted against the whole catalog
   * rather than against the current search — it describes the project, so it must not flicker as
   * the user types. Zero is why the notice can be absent entirely: with nothing hidden there is
   * nothing to explain and nothing to reveal.
   */
  const hiddenCount = $derived(tools.length - searchTools(tools, { genre, system }).length);
  const settingLabel = $derived(
    [
      genre === undefined ? undefined : genreDisplayName(genre),
      system === undefined ? undefined : systemDisplayName(system),
    ]
      .filter((name) => name !== undefined)
      .join(' · '),
  );

  function selectTool(tool: Tool) {
    // With several panels open, picking a tool that is already mounted is a request the caller
    // still has to see — it decides whether that means "move to it" or "nothing to do". Only the
    // single-panel case, where the caller tracks one path, short-circuits here.
    if (openToolPaths === undefined && tool.path === activeToolPath) {
      return;
    }

    activeToolPath = tool.path;
    onToolChange?.(tool);
  }
</script>

<Panel {title} class="tool-browser" label="{title} panel">
  <div class="tool-browser__filters">
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
  </div>

  <!-- Only when the setting actually costs the user something to see. The count is the honest part:
       a genre hides most of the catalog, so a panel that quietly showed five tools of thirty-five
       would look broken rather than filtered. The checkbox is the way back, because hiding here is
       a default and not a rule — nothing about generating a cyberpunk name in a fantasy campaign is
       unsafe. -->
  {#if hiddenCount > 0}
    <div class="tool-browser__setting">
      <p class="tool-browser__setting-note">
        {#if showAll}
          Showing every tool, including the {hiddenCount} for other settings.
        {:else}
          {settingLabel} — {hiddenCount}
          {hiddenCount === 1 ? 'tool' : 'tools'} for other settings hidden.
        {/if}
      </p>
      <div class="input-group input-group--inline tool-browser__show-all">
        <input id={showAllId} type="checkbox" bind:checked={showAll} />
        <label for={showAllId}>Show all tools</label>
      </div>
    </div>
  {/if}

  <div class="tool-browser__list well">
    {#each groups as group (group.domain)}
      <!-- The catalog's own classification, shown. Same marks the All Tools page uses, from the
           same map, because two lists of the same catalog disagreeing about what a domain looks
           like is worse than neither showing it. -->
      <h3><Icon icon={DOMAIN_MARKS[group.domain]} class="tool-browser__mark" />{group.heading}</h3>
      <ul>
        {#each group.tools as tool (tool.path)}
          {@const isActive = loadedPaths.has(tool.path)}
          <li>
            <ListButton
              class="tool-browser__tool"
              selected={isActive}
              onclick={() => selectTool(tool)}
            >
              <span class="tool-browser__label">
                <Icon icon={DOMAIN_MARKS[group.domain]} />
                <span class="tool-browser__name">{tool.label}</span>
              </span>
              <!-- The maturity rides along with every entry that has one to state. This list
                   used to mark all of them, on the grounds that marking only the unfinished tools
                   leaves the user reading absence; #43 settled it the other way, because
                   release-ready is an internal classifier and a promise the user never asked to
                   read. So an unmarked row is a finished tool, and the levels that remain are the
                   ones that qualify what will happen to their work — which is the only reason a
                   level was ever put in front of them. -->
              <span class="tool-browser__badges">
                {#if isActive}
                  <Badge tone="notice">Loaded</Badge>
                {/if}
                <ToolMaturityBadge maturity={tool.maturity} plain />
              </span>
            </ListButton>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="tool-browser__empty">No tools match.</p>
    {/each}
  </div>
</Panel>

<style>
  /* `:global`, because the element carrying it is `Panel`'s: the browser sits beside other panels
     in a flex row, taking a fair share and giving up width when the row is tight. `min-width: 0`
     is the panel's own. */
  :global(.tool-browser) {
    flex: 1 1 18rem;
  }

  .tool-browser__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s5);
    align-items: center;
  }

  /* The row layout is `--inline`'s. What is left is this panel's own business: the group sits in a
     wrapping flex row, so it needs to be allowed to shrink. */
  .tool-browser__filters .input-group {
    margin: 0;
    min-width: 0;
  }

  .tool-browser__filters input[type='search'] {
    min-width: 0;
  }

  .tool-browser__setting {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s2) var(--s5);
    align-items: baseline;
  }

  .tool-browser__setting-note {
    margin: 0;
    font: var(--t-small);
    font-style: italic;
    color: var(--accent-quiet);
  }

  /* The row layout and the gap are `--inline`'s; the margin reset is this panel's. */
  .tool-browser__show-all {
    margin: 0;
  }

  /* The well: the list is what scrolls, so the panel as a whole stays the height its parent
     allows. Standalone there is no such limit, hence the fallback max height. */
  .tool-browser__list {
    max-height: var(--tool-browser-max-height, 24rem);
  }

  h3 {
    margin: var(--s5) 0 var(--s2);
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    color: var(--accent-quiet);
    text-transform: uppercase;
  }

  h3:first-child {
    margin-top: 0;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    list-style-type: none;
    margin: 0;
  }

  /* The mark and the name are one thing, so the row's own layout pushes the badges away from the
     pair rather than the mark away from the name it classifies. */
  .tool-browser__label {
    align-items: baseline;
    display: flex;
    gap: var(--s3);
    min-width: 0;
  }

  .tool-browser__list :global(.tool-browser__mark) {
    margin-right: var(--s3);
  }

  .tool-browser__name {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .tool-browser__badges {
    /* Wraps under the name in a narrow rail rather than squeezing it; `flex-end` keeps the badges
       against the right edge when they do. */
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: var(--s2);
  }

  .tool-browser__empty {
    margin: 0;
    font-style: italic;
    color: var(--ink-muted);
  }
</style>
