<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import * as Environments from '$lib/environment';
  import type { Environment, EnvironmentGeneratorConfigRecord } from '$lib/environment';

  const TOOL_PATH = '/environment';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be the generator's RNG as
   * well, reseeded from the seed box on every press and handed straight to the config — so the one
   * object was doing two jobs, and `randomizeParameters` drew its eleven numbers from the same
   * stream the environment was about to be rolled from. `environment_roll.ts` owns both draws now,
   * each from its own stream.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  const defaults = Environments.defaultEnvironmentGeneratorConfig();
  let latitude = $state(defaults.latitude);
  let elevation = $state(defaults.elevation);
  let erosionIterations = $state(defaults.erosionIterations);
  let erosionStrength = $state(defaults.erosionStrength);
  let reliefEnergy = $state(defaults.reliefEnergy);
  let terrainVectorX = $state(defaults.terrainVector[0]);
  let terrainVectorY = $state(defaults.terrainVector[1]);
  let currentX = $state(defaults.current[0]);
  let currentY = $state(defaults.current[1]);
  let waterDirectionX = $state(defaults.waterDirection[0]);
  let waterDirectionY = $state(defaults.waterDirection[1]);

  /**
   * The wind arrow's canvas.
   *
   * `bind:this`, and that is a fix rather than a tidy-up: this was
   * `document.getElementById('windArrow')`, which finds the *first* element with that id on the
   * page. A tool must work identically in a panel and on its own route (2.1), and the workshop can
   * mount two of anything — two of these would have drawn both arrows onto one canvas and left the
   * other blank.
   */
  let windCanvas = $state<HTMLCanvasElement | undefined>(undefined);

  /**
   * The rolled environment.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`.
   */
  let environment = $state.raw<Environment | undefined>(undefined);

  /** What the roll records about itself: the page's eleven controls, as provenance (3.6). */
  const generatorConfig = $derived<EnvironmentGeneratorConfigRecord>({
    latitude,
    elevation,
    erosionIterations,
    erosionStrength,
    reliefEnergy,
    terrainVector: [terrainVectorX, terrainVectorY],
    current: [currentX, currentY],
    waterDirection: [waterDirectionX, waterDirectionY],
  });

  const environmentSnapshot = $derived(
    environment === undefined ? null : Environments.toEnvironmentSnapshot(environment),
  );

  const document_ = $derived(
    environmentSnapshot === null ? null : Environments.environmentToDocument(environmentSnapshot),
  );

  const defaultArtifactName = $derived(
    environmentSnapshot === null ? '' : Environments.environmentDisplayName(environmentSnapshot),
  );

  function applyConfig(config: EnvironmentGeneratorConfigRecord): void {
    latitude = config.latitude;
    elevation = config.elevation;
    erosionIterations = config.erosionIterations;
    erosionStrength = config.erosionStrength;
    reliefEnergy = config.reliefEnergy;
    [terrainVectorX, terrainVectorY] = config.terrainVector;
    [currentX, currentY] = config.current;
    [waterDirectionX, waterDirectionY] = config.waterDirection;
  }

  /**
   * Draws the wind as an arrow, when there is a canvas to draw it on.
   *
   * A missing canvas is an ordinary state rather than a failure (2.5): the wind is printed as a
   * compass direction and a strength beside it, and the arrow is a picture of that.
   */
  async function drawWindArrow(): Promise<void> {
    await tick();
    const canvas = windCanvas;
    if (canvas === undefined || environment === undefined) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      return;
    }

    const wind = environment.climate.wind;
    const size = canvas.width;
    const centre = size / 2;
    const wedge = 3;
    const length = ((size / 2) * (wind[0] + wind[1])) / 2;

    ctx.reset();
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.save();
    ctx.translate(centre, centre);
    ctx.rotate(Math.atan2(wind[1], wind[0]));

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(length - wedge, -wedge);
    ctx.lineTo(length, 0);
    ctx.lineTo(length - wedge, wedge);
    ctx.stroke();

    ctx.restore();
  }

  async function generate(): Promise<void> {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    environment = Environments.rollEnvironment(seed, generatorConfig);
    await drawWindArrow();
  }

  /**
   * Draw a fresh set of physical parameters.
   *
   * Derived from the seed rather than from the page's RNG, so that pressing this twice with a
   * locked seed gives the same place twice — the button used to draw from the same stream the
   * environment was rolled from, which made what Generate produced depend on how many times this
   * had been pressed.
   */
  function randomizeParameters(): void {
    applyConfig(Environments.randomEnvironmentGeneratorConfig(seed));
  }

  function exportMarkdown(): void {
    if (environmentSnapshot === null) {
      return;
    }
    downloadTextFile(
      Environments.environmentToMarkdown(environmentSnapshot),
      `${Environments.environmentFileStem(environmentSnapshot)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf(): Promise<void> {
    if (environmentSnapshot === null) {
      return;
    }
    await downloadTextPdf(
      Environments.environmentDisplayName(environmentSnapshot),
      Environments.environmentToText(environmentSnapshot),
      `${Environments.environmentFileStem(environmentSnapshot)}.pdf`,
    );
  }

  onMount(() => {
    void generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Environment Generator">
  {#snippet description()}
    <p>
      The natural setting of a place: its biome, climate, terrain and water. Genre-neutral, and the
      land the dungeon and region generators build on.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <NumberField id="latitude" label="Latitude" bind:value={latitude} min={-90} max={90} />
  <NumberField id="elevation" label="Elevation" bind:value={elevation} step={0.05} />
  <NumberField
    id="erosionIterations"
    label="Erosion Iterations"
    bind:value={erosionIterations}
    min={0}
  />
  <NumberField id="erosionStrength" label="Erosion Strength" bind:value={erosionStrength} min={0} />
  <NumberField id="reliefEnergy" label="Relief Energy" bind:value={reliefEnergy} step={0.05} />
  <NumberField
    id="terrainVector0"
    label="Terrain Vector X"
    bind:value={terrainVectorX}
    step={0.1}
  />
  <NumberField
    id="terrainVector1"
    label="Terrain Vector Y"
    bind:value={terrainVectorY}
    step={0.1}
  />
  <NumberField id="current0" label="Current X" bind:value={currentX} step={0.1} />
  <NumberField id="current1" label="Current Y" bind:value={currentY} step={0.1} />
  <NumberField id="waterDirection0" label="Water Direction X" bind:value={waterDirectionX} />
  <NumberField id="waterDirection1" label="Water Direction Y" bind:value={waterDirectionY} />

  <div class="actions">
    <BaseButton onclick={() => void generate()}>Generate</BaseButton>
    <BaseButton onclick={randomizeParameters}>Randomize Parameters</BaseButton>
    <BaseButton onclick={exportMarkdown} disabled={!environment}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={!environment}>Download PDF</BaseButton>
  </div>

  <SaveArtifactButton
    kind={Environments.ENVIRONMENT_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={environmentSnapshot}
    {seed}
    config={generatorConfig}
    defaultName={defaultArtifactName}
  />

  {#if document_}
    <!-- The page renders the same document the exports do, so what a referee reads on screen and
         what they take away cannot drift, and an empty part is absent from both (6.4). -->
    <div class="environment">
      <h2>{document_.title}</h2>

      {#each document_.paragraphs as paragraph, index (index)}
        <p>{paragraph}</p>
      {/each}

      {#each document_.sections as section (section.heading)}
        <h3>{section.heading}</h3>
        <StatBlock>
          {#each section.lines.filter((line) => line.label !== undefined) as line, index (index)}
            <Stat label={line.label ?? ''}>{line.value}</Stat>
          {/each}
        </StatBlock>

        <!-- A biome feature is a sentence rather than a measurement, so it reads as one. -->
        {#each section.lines.filter((line) => line.label === undefined) as line, index (index)}
          <p>{line.value}</p>
        {/each}

        {#if section.heading === 'Climate'}
          <!-- The arrow is a picture of the wind line above it, which is why the canvas can be
               missing without anything being lost (2.5). -->
          <canvas
            bind:this={windCanvas}
            width="100"
            height="100"
            class="wind-arrow"
            aria-label="Wind direction: {Environments.describeVector(
              environmentSnapshot?.climate.wind ?? [],
            )}"
          >
            <p>
              The wind blows {Environments.describeVector(environmentSnapshot?.climate.wind ?? [])}.
            </p>
          </canvas>
        {/if}
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

  .wind-arrow {
    display: block;
    max-width: 100%;
  }
</style>
