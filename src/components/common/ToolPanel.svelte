<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Tool } from '$lib/tools';
  import { toolPanelLoader } from '$lib/workshop';

  type Props = {
    /** Tool to render. Its component is fetched on demand the first time it is shown. */
    tool: Tool;
  };

  const { tool }: Props = $props();

  const loadPanel = $derived(toolPanelLoader(tool.path));
</script>

<section class="tool-panel">
  {#if loadPanel}
    <!-- Keyed on the path so switching tools mounts a fresh component rather than reusing the
         previous one's state. -->
    {#key tool.path}
      {#await loadPanel()}
        <p class="tool-panel__status">Loading {tool.label}…</p>
      {:then panel}
        {@const ToolComponent = panel.default}
        <ToolComponent />
      {:catch}
        <p class="tool-panel__status">{tool.label} could not be loaded.</p>
      {/await}
    {/key}
  {:else}
    <p class="tool-panel__status">
      {tool.label} has no panel yet. It is available on its own page:
      <!-- `resolve` is typed against one specific route id at a time, so a value typed as the
           union of every route id does not satisfy it. Catalog paths are all parameterless
           static routes, so narrowing to an arbitrary member of the union is safe. -->
      <a href={resolve(tool.path as '/')}>{tool.path}</a>.
    </p>
  {/if}
</section>

<style>
  .tool-panel {
    /* The panel frame around this owns its width on the bench; this is only the content inside
       it. `min-width: 0` lets a wide generator wrap rather than setting a floor under the frame. */
    width: 100%;
    min-width: 0;
  }

  .tool-panel__status {
    padding: 0.75rem;
    font-style: italic;
    opacity: 0.8;
  }
</style>
