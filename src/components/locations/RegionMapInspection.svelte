<script lang="ts">
  import { regionMapDataUrl, type RegionSnapshot } from '$lib/regions';
  import BaseButton from '$components/common/BaseButton.svelte';

  const { snapshot }: { snapshot: RegionSnapshot } = $props();
  const uid = $props.id();
  let zoom = $state(1);
  const src = $derived(regionMapDataUrl(snapshot));
</script>

<section aria-label="Region map inspection">
  <h3>Inspect the map</h3>
  <p id="{uid}-help">Zoom in to read labels. Use the arrow keys in the map window to pan.</p>
  <div class="map-controls" role="group" aria-label="Map zoom">
    <BaseButton onclick={() => (zoom = Math.max(1, zoom - 0.5))} disabled={zoom === 1}>
      Zoom out
    </BaseButton>
    <BaseButton onclick={() => (zoom = Math.min(4, zoom + 0.5))} disabled={zoom === 4}>
      Zoom in
    </BaseButton>
    <BaseButton onclick={() => (zoom = 1)} disabled={zoom === 1}>Fit map</BaseButton>
    <span role="status">{zoom * 100}%</span>
  </div>
  <!-- The scroll viewport needs focus so keyboard users can pan the enlarged map. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="map-window"
    data-scroll-x
    role="region"
    aria-label="Map of {snapshot.name}"
    aria-describedby="{uid}-help"
    tabindex="0"
  >
    <div style:width="{zoom * 100}%">
      <img class="region-map" {src} alt="Map of {snapshot.name}" />
    </div>
  </div>
</section>

<style>
  section {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .map-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-block: 0.75rem;
  }

  .map-window {
    width: 100%;
    max-height: 70vh;
    overflow: auto;
  }

  .region-map {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
