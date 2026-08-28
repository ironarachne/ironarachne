<script lang="ts">
  import { downloadTextFile, saveSvgAsPng } from '$lib/download';
  // Through the entry point, deliberately, where the kind registry and `/saved-data` go deep.
  // Measured: this component's chunk already reaches the 18.9 MB charge art either way, because
  // drawing a stored device is what resolves charge names to glyphs. The deep import would buy
  // nothing and cost the rule an exception it did not earn.
  import {
    heraldryFromSnapshot,
    renderHeraldryDeviceSvg,
    validateHeraldrySnapshot,
  } from '$lib/heraldry';
  import type { ArtifactViewerProps } from '$lib/workshop';
  import BaseButton from '$components/common/BaseButton.svelte';

  const { snapshot }: ArtifactViewerProps = $props();

  /** The size the generator draws at, so a downloaded file matches what the generator produces. */
  const WIDTH = 600;
  const HEIGHT = 660;
  /** On screen it sits in a panel beside other panels, so it is drawn smaller and scaled by CSS. */
  const PREVIEW_WIDTH = 200;
  const PREVIEW_HEIGHT = 220;

  let error: string | null = $state(null);

  /**
   * The stored snapshot as arms this can draw, or undefined when it is not one.
   *
   * It goes through the kind's own `validate` rather than trusting the payload: this component is
   * handed whatever was stored, and a snapshot written by a build that has since changed shape is
   * a thing to say "cannot draw this" about rather than to throw inside a render.
   */
  const restored = $derived.by(() => {
    const validated = validateHeraldrySnapshot(snapshot);
    if (!validated.ok) {
      return undefined;
    }
    try {
      return heraldryFromSnapshot(validated.value);
    } catch {
      return undefined;
    }
  });

  const preview = $derived(
    restored === undefined
      ? null
      : renderHeraldryDeviceSvg(restored.arms.device, PREVIEW_WIDTH, PREVIEW_HEIGHT),
  );

  /** Redrawn at full size only when a file is actually asked for. */
  function fullSizeSvg(): string | undefined {
    return restored === undefined
      ? undefined
      : renderHeraldryDeviceSvg(restored.arms.device, WIDTH, HEIGHT);
  }

  function fileName(extension: string): string {
    return `heraldry-${restored?.seed ?? 'arms'}.${extension}`;
  }

  function downloadSvg() {
    const svg = fullSizeSvg();
    if (svg === undefined) {
      return;
    }
    error = downloadTextFile(svg, fileName('svg'), 'image/svg+xml')
      ? null
      : 'This browser would not save the file.';
  }

  async function downloadPng() {
    const svg = fullSizeSvg();
    if (svg === undefined) {
      return;
    }
    try {
      await saveSvgAsPng(svg, WIDTH, HEIGHT, fileName('png'));
      error = null;
    } catch (thrown: unknown) {
      // Rasterizing can fail on a canvas with no context, or an SVG the browser will not load.
      // Unlike the generator, this surface has somewhere to say so.
      console.error(thrown);
      error = 'This browser could not turn the arms into a PNG. The SVG still works.';
    }
  }
</script>

<div class="heraldry-artifact">
  {#if restored === undefined}
    <p class="heraldry-artifact__problem" role="alert">
      These arms were written in a shape this version cannot draw. They are still stored, and still
      travel in an export.
    </p>
  {:else}
    <!-- The blazon is the arms in words, and it is what a user reads out at the table. It is
         above the image because it is the part that can be searched, quoted, and copied. -->
    <p class="heraldry-artifact__blazon">{restored.blazon}</p>
    <div class="heraldry-artifact__device" role="img" aria-label={restored.blazon}>
      <!-- The SVG is built by our own renderer from a snapshot the kind's validator accepted,
           never from anything a user typed. -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html preview}
    </div>
    <div class="heraldry-artifact__actions">
      <BaseButton onclick={downloadSvg}>Download SVG</BaseButton>
      <BaseButton onclick={() => void downloadPng()}>Download PNG</BaseButton>
    </div>
    {#if error !== null}
      <p class="heraldry-artifact__problem" role="alert">{error}</p>
    {/if}
  {/if}
</div>

<style>
  .heraldry-artifact {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .heraldry-artifact__blazon {
    margin: 0;
    font-style: italic;
  }

  .heraldry-artifact__device {
    /* The drawing is scaled by its container rather than redrawn per width: it is an SVG, so it
       stays sharp, and a panel on a phone is narrower than the size it is drawn at. */
    max-width: 100%;
  }

  .heraldry-artifact__device :global(svg) {
    width: 100%;
    max-width: 12rem;
    height: auto;
  }

  .heraldry-artifact__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .heraldry-artifact__problem {
    margin: 0;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    font-size: 0.9rem;
  }
</style>
