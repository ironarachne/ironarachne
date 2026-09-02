<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import { browser } from '$app/environment';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import RendererOverrideControls from '$components/common/RendererOverrideControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import * as Planets from '$lib/astronomical_bodies';
  import type { PlanetGeneratorConfigRecord, PlanetRoll } from '$lib/astronomical_bodies';
  import { buildPlanetScene, renderSceneToSvg } from '$lib/renderers';
  import { renderPlanetPreviewImage } from '$lib/renderers/astronomical_preview';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';

  const TOOL_PATH = '/planet';

  const PREVIEW_WIDTH = 400;
  const PREVIEW_HEIGHT = 400;

  /** The size the SVG download is written at: four times the preview, and scalable past that. */
  const EXPORT_SIZE = 1600;

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be the generator's RNG as
   * well, reseeded from the seed box on every press and threaded through four configs — one of
   * which seeded itself from the clock regardless. `planet_roll.ts` owns the roll now.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let classification = $state(Planets.PLANET_ANY_CLASSIFICATION);
  let forceRings = $state(false);

  const classificationOptions = [
    Planets.PLANET_ANY_CLASSIFICATION,
    ...Planets.planetClassificationNames(),
  ];

  /**
   * The rolled planet, its moons and whoever lives there.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`.
   */
  let roll = $state.raw<PlanetRoll | undefined>(undefined);
  let previewSrc = $state('');

  /** What the roll records about itself: the page's two controls, as provenance (3.6). */
  const generatorConfig = $derived<PlanetGeneratorConfigRecord>({
    ...(classification === Planets.PLANET_ANY_CLASSIFICATION ? {} : { classification }),
    forceRings,
  });

  const snapshot = $derived(roll === undefined ? null : Planets.toPlanetSnapshot(roll));
  const document_ = $derived(snapshot === null ? null : Planets.planetToDocument(snapshot));
  const defaultArtifactName = $derived(
    snapshot === null ? '' : Planets.planetDisplayName(snapshot),
  );

  /**
   * Draws the preview, when this is a browser.
   *
   * The backend is chosen for us — WebGL where the machine can, Canvas2D where it cannot — so a
   * machine with no usable GPU still gets a picture, and a machine with no canvas at all still gets
   * every figure below it (2.5). Nothing here throws, and nothing below depends on it having run.
   */
  function refreshPreview(): void {
    if (!browser || roll === undefined) {
      return;
    }
    previewSrc = renderPlanetPreviewImage(
      document,
      roll.planet,
      PREVIEW_WIDTH,
      PREVIEW_HEIGHT,
      Planets.planetPreviewSeed(seed),
    );
  }

  function generate(): void {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    roll = Planets.rollPlanet(seed, generatorConfig);
    refreshPreview();
  }

  function exportMarkdown(): void {
    if (snapshot === null) {
      return;
    }
    downloadTextFile(
      Planets.planetToMarkdown(snapshot),
      `${Planets.planetFileStem(snapshot)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf(): Promise<void> {
    if (snapshot === null) {
      return;
    }
    await downloadTextPdf(
      Planets.planetDisplayName(snapshot),
      Planets.planetToText(snapshot),
      `${Planets.planetFileStem(snapshot)}.pdf`,
    );
  }

  /**
   * The planet as a scalable image — issue #17, arrived at from the other end.
   *
   * That issue asked for SVG as a *fallback* for machines without a GPU, and that need is already
   * met: the renderer probes the machine and falls back to Canvas2D on its own. What SVG is good
   * for is the thing 6.3 asks about — a file a referee can print at any size — so it is a download
   * rather than a backend, written from the same scene the preview is drawn from.
   */
  function exportSvg(): void {
    if (roll === undefined || snapshot === null) {
      return;
    }
    const scene = buildPlanetScene(
      roll.planet,
      EXPORT_SIZE,
      EXPORT_SIZE,
      Planets.planetPreviewSeed(seed),
    );
    downloadTextFile(
      renderSceneToSvg(scene, Planets.planetDisplayName(snapshot)),
      `${Planets.planetFileStem(snapshot)}.svg`,
      'image/svg+xml',
    );
  }

  onMount(() => {
    // Through `generate`, so the planet a visitor meets on arrival is the same kind of thing every
    // press produces. It used to call `generatePlanet` directly, which meant the first planet
    // anyone saw never had moons and was never inhabited, however the dice fell.
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Planet Generator">
  {#snippet description()}
    <p>
      This lets you generate a planet. The preview picks how to draw itself from what this machine
      can do; the controls below override that if it gets it wrong, and an override is remembered in
      this browser.
    </p>
  {/snippet}

  <RendererOverrideControls onchange={refreshPreview} />

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="planetType"
    label="Planet Type"
    bind:value={classification}
    options={classificationOptions}
  />

  <CheckboxField id="forceRings" label="Force Rings" bind:checked={forceRings} />

  <div class="actions">
    <BaseButton onclick={generate}>Generate</BaseButton>
    <BaseButton onclick={exportMarkdown} disabled={!roll}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={!roll}>Download PDF</BaseButton>
    <BaseButton onclick={exportSvg} disabled={!roll}>Download SVG</BaseButton>
  </div>

  <SaveArtifactButton
    kind={Planets.PLANET_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    {snapshot}
    {seed}
    config={generatorConfig}
    defaultName={defaultArtifactName}
  />

  {#if document_}
    <!-- The page renders the same document the exports do, so what a referee reads on screen and
         what they take away cannot drift, and an empty part is absent from both (6.4). -->
    <div class="planet">
      <h2>{document_.title}</h2>

      {#if browser && previewSrc}
        <!-- The alt ends with the word "image", which `e2e/preview_fixtures.ts` selects on
             (`img[alt$="image"]`) and `expectGeneratorOutput` matches: the preview harness finds a
             generated picture by its alt text, so the wording is a contract rather than prose. -->
        <img alt="{document_.title} preview image" src={previewSrc} />
      {/if}

      {#each document_.paragraphs as paragraph, index (index)}
        <p>{paragraph}</p>
      {/each}

      {#each document_.sections as section (section.heading)}
        <h3>{section.heading}</h3>

        {#each section.lines.filter((line) => line.label === undefined) as line, index (index)}
          <p>{line.value}</p>
        {/each}

        <StatBlock>
          {#each section.lines.filter((line) => line.label !== undefined) as line, index (index)}
            <Stat label={line.label ?? ''}>{line.value}</Stat>
          {/each}
        </StatBlock>
      {/each}
    </div>
  {/if}
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .planet img {
    display: block;
    max-width: 100%;
    height: auto;
  }
</style>
