<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  };

  const { children }: Props = $props();
</script>

<div class="controls inset">
  {@render children()}
</div>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s5);
    margin-bottom: var(--s6);
  }

  .controls :global(.input-group) {
    margin: 0;
  }

  .controls :global(.checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .controls :global(.checkbox-group label) {
    display: inline-flex;
    align-items: center;
    gap: var(--s3);
    margin: 0;
  }

  /* `.inline-label` carries its own row layout from main.css now; only the margin reset is this
     panel's business. */
  .controls :global(.inline-label) {
    margin: 0;
  }
</style>
