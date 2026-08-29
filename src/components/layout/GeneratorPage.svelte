<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { RouteId } from '$app/types';
  import { showsMaturityBadge, toolMaturityForPath } from '$lib/tools';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';

  type Props = {
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

  const { title, toolPath, description, children }: Props = $props();

  const maturity = $derived(toolMaturityForPath(toolPath));
</script>

<!-- No genre class. A tool's genre is the catalog's, and the page region wears it as `data-genre`
     — one writer instead of the thirty this prop had. The prop was a free string besides: three
     pages passed `"default"`, which names no stylesheet, and one of those three is a tool the
     catalog calls `fantasy`. See docs/visual-design.md, "Applying a skin". -->
<section class="main">
  <h1>{title}</h1>
  <!-- Directly under the title, above anything the tool renders: the point of the level is that a
       user reads it before they start, not after they have generated something they wanted to keep.

       A release-ready tool has nothing to warn about and loses the paragraph as well as the badge.
       The wrapper has to go with it: the badge rendering nothing would still leave an empty `<p>`
       and its margin pushing the tool down the page, which is exactly the shift
       `e2e/preview_goldens.spec.ts` warns about. -->
  {#if showsMaturityBadge(maturity)}
    <p class="generator-page__maturity">
      <ToolMaturityBadge {maturity} detailed />
    </p>
  {/if}
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
