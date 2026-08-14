<script lang="ts">
  import type { Arms } from '$lib/heraldry';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry';
  import type { RNG } from '@ironarachne/rng';

  type Props = {
    arms: Arms | null | undefined;
    title: string;
    width?: number;
    height?: number;
    rng: RNG;
    onclick?: () => void;
  };

  const { arms, title, width = 200, height = 220, rng, onclick }: Props = $props();
</script>

{#if arms}
  <button
    type="button"
    class="heraldry-emblem heraldry-block-target"
    aria-label="View heraldry for {title}"
    {onclick}
  >
    <!-- Renders app-generated markup (no external or user-supplied input). -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html renderHeraldryDeviceSvg(arms.device, width, height, rng)}
  </button>
{/if}

<style>
  button.heraldry-emblem {
    margin-bottom: 0.5rem;
  }

  button.heraldry-block-target {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }

  button.heraldry-block-target:hover {
    opacity: 0.85;
  }
</style>
