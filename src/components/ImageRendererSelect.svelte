<script lang="ts">
  import { onMount } from 'svelte';
  import type { AstronomicalRendererKind } from '$lib/renderers/astronomical_renderer_kind';
  import {
    readStoredAstronomicalRendererKind,
    writeStoredAstronomicalRendererKind,
  } from '$lib/renderers/astronomical_renderer_storage';

  type Props = {
    renderer?: AstronomicalRendererKind;
    onchange?: (renderer: AstronomicalRendererKind) => void;
  };

  let { renderer = $bindable<AstronomicalRendererKind>('webgl'), onchange }: Props = $props();

  function setRenderer(next: AstronomicalRendererKind) {
    renderer = next;
    writeStoredAstronomicalRendererKind(next);
    onchange?.(next);
  }

  onMount(() => {
    renderer = readStoredAstronomicalRendererKind();
  });
</script>

<div class="input-group">
  <label for="imageRenderer">Renderer</label>
  <select id="imageRenderer" bind:value={renderer} onchange={() => setRenderer(renderer)}>
    <option value="webgl">WebGL</option>
    <option value="canvas2d">Canvas 2D</option>
  </select>
</div>
