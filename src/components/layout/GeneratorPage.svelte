<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    theme?: string;
    title: string;
    description?: Snippet;
    children: Snippet;
  };

  let { theme = '', title, description, children }: Props = $props();
</script>

<section class="{theme} main">
  <h1>{title}</h1>
  {#if description}
    {@render description()}
  {/if}
  {@render children()}
</section>
