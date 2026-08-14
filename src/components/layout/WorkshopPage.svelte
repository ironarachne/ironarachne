<script lang="ts">
  import ProjectContextBar from '$components/common/ProjectContextBar.svelte';
  import ToolBrowser from '$components/common/ToolBrowser.svelte';
  import ToolPanel from '$components/common/ToolPanel.svelte';
  import { allTools, findToolByPath, firstToolInBrowseOrder } from '$lib/tools';

  const tools = allTools();

  // The browser lists the catalog grouped by domain, so the tool it shows first is the one the
  // workshop opens with. Asking the same function the list is built from keeps the two in step.
  let activeToolPath: string | undefined = $state(firstToolInBrowseOrder(tools)?.path);
  const activeTool = $derived(activeToolPath ? findToolByPath(activeToolPath) : undefined);
</script>

<section class="main workshop">
  <h1>Workshop</h1>

  <ProjectContextBar />

  <div class="workshop__panels">
    <ToolBrowser {tools} bind:activeToolPath />

    {#if activeTool}
      <ToolPanel tool={activeTool} />
    {:else}
      <p class="workshop__empty">No tool loaded.</p>
    {/if}
  </div>
</section>

<style>
  .workshop {
    /* Every other page is a single reading column, which `html` caps at 70ch. Two panels side
       by side do not fit in that, so the workshop breaks out of it: it takes the viewport width
       (less a gutter, so a scrollbar cannot push the page sideways) and recentres itself on the
       viewport rather than on the column it sits in. Kept local to this page so the column
       everything else relies on is untouched. */
    --workshop-width: min(96rem, 100vw - 2rem);
    width: var(--workshop-width);
    margin-inline: calc(50% - var(--workshop-width) / 2);
  }

  .workshop h1 {
    margin: 0 0 0.5rem;
  }

  .workshop__panels {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-start;
  }

  .workshop__empty {
    font-style: italic;
    opacity: 0.8;
  }
</style>
