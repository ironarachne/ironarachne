<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Arms from '$lib/arms_manufacturer';
  import type { ArmsManufacturer } from '$lib/arms_manufacturer';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/arms-manufacturer';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. This page used to call `Date.now()`
   * three times and showed no seed at all, so nothing it produced could be reproduced — the
   * requirement 2.3 failure docs/readiness-factions.md calls most of the work here.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  /**
   * The rolled manufacturer.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`. The same trap is written up in `$lib/workshop`'s
   * README beside `saveToolArtifact`.
   */
  let manufacturer = $state.raw<ArmsManufacturer | null>(null);

  const manufacturerSnapshot = $derived(
    manufacturer === null ? null : Arms.toArmsManufacturerSnapshot(manufacturer),
  );

  const defaultArtifactName = $derived(
    manufacturer === null ? '' : Arms.armsManufacturerDisplayName(manufacturer),
  );

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    manufacturer = Arms.rollArmsManufacturer(seed);
  }

  function exportMarkdown() {
    if (manufacturer === null) {
      return;
    }
    downloadTextFile(
      Arms.armsManufacturerToMarkdown(manufacturer),
      `${Arms.armsManufacturerFileStem(manufacturer)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (manufacturer === null) {
      return;
    }
    await downloadTextPdf(
      Arms.armsManufacturerDisplayName(manufacturer),
      Arms.armsManufacturerToText(manufacturer),
      `${Arms.armsManufacturerFileStem(manufacturer)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Arms Manufacturer Generator">
  {#snippet description()}
    <p>This generator produces sci-fi arms manufacturing companies.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={Arms.ARMS_MANUFACTURER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={manufacturerSnapshot}
    {seed}
    defaultName={defaultArtifactName}
  />

  {#if manufacturer}
    <div class="manufacturer-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
    </div>

    <div class="manufacturer">
      <p>{manufacturer.description}</p>

      <h2>Models</h2>
      <p>The following are the manufacturer's most popular models.</p>
      {#each manufacturer.models as model}
        <div class="model">
          <h3>{model.name}</h3>
          <p>{model.description}</p>
        </div>
      {/each}
    </div>
  {/if}
</GeneratorPage>

<style>
  .manufacturer-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
