<script lang="ts">
  import {
    buildSettlementPanorama,
    renderSettlementPanorama,
    type PanoramaInput,
  } from '$lib/settlement_illustration';
  let { input, lazy = false }: { input: PanoramaInput; lazy?: boolean } = $props();
  const svg = $derived(renderSettlementPanorama(buildSettlementPanorama(input)));
</script>

<img
  class="settlement-panorama"
  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
  alt=""
  width="1000"
  height="300"
  loading={lazy ? 'lazy' : 'eager'}
/>

<style>
  .settlement-panorama {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 10 / 3;
    margin-block: 0.75rem 1.25rem;
  }
</style>
