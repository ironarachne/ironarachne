<script lang="ts">
  import {
    allTools,
    genreDisplayName,
    groupToolsByDomain,
    searchTools,
    systemDisplayName,
  } from '$lib/tools';
  import type { GameSystem, Genre, Tool } from '$lib/tools';

  type Props = {
    /** Tools to browse; the whole catalog by default. */
    tools?: Tool[];
    /** Panel heading. */
    title?: string;
    /**
     * Genre of the work in progress. When set, the panel offers a checkbox to narrow the list
     * to that genre; when unset, no checkbox is shown and genre never narrows anything.
     */
    genre?: Genre;
    /**
     * System of the work in progress. Unlike genre this is not optional for the user: tools
     * written for another system are never listed, so a session cannot mix systems.
     */
    system?: GameSystem;
    /** Path of the tool currently loaded. Bindable, so a parent can drive or read it. */
    activeToolPath?: string;
    /** Called when the user picks a tool other than the one already loaded. */
    onToolChange?: (tool: Tool) => void;
  };

  let {
    tools = allTools(),
    title = 'Tools',
    genre,
    system,
    activeToolPath = $bindable(undefined),
    onToolChange,
  }: Props = $props();

  // One id per component instance, so two browsers side by side do not collide on label `for`.
  const uid = $props.id();
  const filterId = `${uid}-filter`;
  const genreFilterId = `${uid}-genre`;

  let query = $state('');
  let genreOnly = $state(false);

  const visibleTools = $derived(
    searchTools(tools, { query, genre: genreOnly ? genre : undefined, system }),
  );
  const groups = $derived(groupToolsByDomain(visibleTools));

  function selectTool(tool: Tool) {
    if (tool.path === activeToolPath) {
      return;
    }

    activeToolPath = tool.path;
    onToolChange?.(tool);
  }
</script>

<section class="tool-browser">
  <h2>{title}</h2>

  <div class="tool-browser__filters">
    <div class="input-group">
      <label for={filterId}>Filter</label>
      <input
        id={filterId}
        type="search"
        bind:value={query}
        placeholder="Filter by name"
        autocomplete="off"
      />
    </div>

    {#if genre}
      <div class="input-group tool-browser__genre">
        <input id={genreFilterId} type="checkbox" bind:checked={genreOnly} />
        <label for={genreFilterId}>{genreDisplayName(genre)} only</label>
      </div>
    {/if}
  </div>

  {#if system}
    <p class="tool-browser__system">
      {systemDisplayName(system)} — tools for other systems are hidden.
    </p>
  {/if}

  <div class="tool-browser__list">
    {#each groups as group (group.domain)}
      <h3>{group.heading}</h3>
      <ul>
        {#each group.tools as tool (tool.path)}
          {@const isActive = tool.path === activeToolPath}
          <li>
            <button
              type="button"
              class="tool-browser__tool"
              class:tool-browser__tool--active={isActive}
              aria-current={isActive ? 'true' : undefined}
              onclick={() => selectTool(tool)}
            >
              <span class="tool-browser__name">{tool.label}</span>
              {#if isActive}
                <span class="tool-browser__badge">Loaded</span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="tool-browser__empty">No tools match.</p>
    {/each}
  </div>
</section>

<style>
  .tool-browser {
    /* Sized to sit beside other panels in a flex row: it takes a fair share of the row but
       gives up width when the row is tight. `min-width: 0` lets it shrink past the width of
       its longest tool name instead of forcing the row to overflow. */
    flex: 1 1 18rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    background: var(--slate);
  }

  .tool-browser h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  .tool-browser h3 {
    margin: 0.75rem 0 0.25rem;
    font-size: 0.85rem;
    color: var(--gold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .tool-browser h3:first-child {
    margin-top: 0;
  }

  .tool-browser__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .tool-browser__filters .input-group {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    min-width: 0;
  }

  .tool-browser__filters input[type='search'] {
    min-width: 0;
    flex: 1 1 8rem;
  }

  .tool-browser__system {
    margin: 0;
    font-size: 0.85rem;
    font-style: italic;
    color: var(--gold);
  }

  .tool-browser__list {
    /* The list is the part that scrolls, so the panel as a whole stays the height its parent
       allows. Standalone there is no such limit, hence the fallback max height. */
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    max-height: var(--tool-browser-max-height, 24rem);
  }

  .tool-browser ul {
    margin: 0;
    padding: 0;
  }

  .tool-browser li {
    list-style-type: none;
    margin: 0;
  }

  .tool-browser__tool {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    margin: 0 0 0.15rem;
    padding: 0.3rem 0.5rem;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    color: white;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.3;
    text-align: left;
  }

  .tool-browser__tool:hover {
    border: 1px solid var(--iron-arachne-green);
    background: color-mix(in srgb, var(--iron-arachne-green) 15%, transparent);
  }

  .tool-browser__tool:active {
    transform: none;
    background: color-mix(in srgb, var(--iron-arachne-green) 30%, transparent);
    color: white;
  }

  .tool-browser__tool--active {
    border: 1px solid var(--gold);
    background: color-mix(in srgb, var(--gold) 20%, transparent);
  }

  .tool-browser__name {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .tool-browser__badge {
    flex-shrink: 0;
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--gold);
    border-radius: 999px;
    background: var(--charcoal);
    color: var(--gold);
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    line-height: 1.5;
    text-transform: uppercase;
  }

  .tool-browser__empty {
    margin: 0;
    font-style: italic;
    opacity: 0.8;
  }
</style>
