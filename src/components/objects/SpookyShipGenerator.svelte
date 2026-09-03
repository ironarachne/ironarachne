<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import BaseButton from '$components/common/BaseButton.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import * as SpookyShip from '$lib/spooky_ship';

  const TOOL_PATH = '/spooky-ship';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be reseeded from the seed
   * field inside an `$effect` *and* again inside `generate()`, so the next press's seed depended on
   * the text of the previous one — the same requirement 2.2 failure the rest of this domain had.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let ship = $state.raw<SpookyShip.SpookyShip | null>(null);
  const shipSnapshot = $derived(ship === null ? null : SpookyShip.toSpookyShipSnapshot(ship));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    ship = SpookyShip.rollSpookyShip(seed);
  }

  function exportMarkdown() {
    if (ship === null) return;
    downloadTextFile(
      SpookyShip.spookyShipToMarkdown(ship),
      `${SpookyShip.SPOOKY_SHIP_FILE_STEM}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (ship === null) return;
    await downloadTextPdf(
      SpookyShip.SPOOKY_SHIP_DISPLAY_NAME,
      SpookyShip.spookyShipToText(ship),
      `${SpookyShip.SPOOKY_SHIP_FILE_STEM}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Spooky Ship Generator">
  {#snippet description()}
    <p>Generate a spooky ship description.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={SpookyShip.SPOOKY_SHIP_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={shipSnapshot}
    {seed}
    defaultName={SpookyShip.SPOOKY_SHIP_DISPLAY_NAME}
  />

  {#if ship}
    <div class="ship-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
    </div>

    <p class="ship">{ship.text}</p>
  {/if}
</GeneratorPage>

<style>
  .ship-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
