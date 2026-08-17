<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { RouteId } from '$app/types';
  import { toolMaturityForPath } from '$lib/tools';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';

  type Props = {
    theme?: string;
    title: string;
    /**
     * Catalog path of the tool this page renders. Required rather than optional, because it is
     * what puts the tool's maturity in front of the user before they invest work in it: an
     * optional promise is one a page can be written without, and then is.
     */
    toolPath: RouteId;
    description?: Snippet;
    children: Snippet;
  };

  const { theme = '', title, toolPath, description, children }: Props = $props();

  const maturity = $derived(toolMaturityForPath(toolPath));
</script>

<section class="{theme} main">
  <h1>{title}</h1>
  <!-- Directly under the title, above anything the tool renders: the point of the level is that a
       user reads it before they start, not after they have generated something they wanted to keep. -->
  <p class="generator-page__maturity">
    <ToolMaturityBadge {maturity} detailed />
  </p>
  {#if description}
    {@render description()}
  {/if}
  {@render children()}
</section>

<style>
  .generator-page__maturity {
    margin: 0 0 0.75rem;
  }
</style>
