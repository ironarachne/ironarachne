<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { RNG } from '@ironarachne/rng';
  import { renderStarSystemPreviewImage } from '$lib/renderers/astronomical_preview';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import * as Nations from '$lib/civilizations';
  import type { StarNation } from '$lib/civilizations';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import RendererOverrideControls from '$components/common/RendererOverrideControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';

  const TOOL_PATH = '/star-nation';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. The roll itself is a pure function of
   * the seed box and the planet count control — `rollStarNation` in `$lib/civilizations` — so
   * the same seed gives the same nation here, in a panel, and on a re-roll from provenance.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  /**
   * The rolled nation.
   *
   * `$state.raw`, and not as a preference: deep-reactive `$state` wraps every object in a Proxy,
   * and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright. See the note
   * beside `saveToolArtifact` in `$lib/workshop`'s README.
   */
  let nation = $state.raw<StarNation | null>(null);

  let planetCountControl: string = $state('random');

  let homeSystemCompositeSrc = $state('');

  const imageWidth = 64;
  const imageHeight = 64;

  const planetCountOptions = [
    { value: 'random', label: 'Random' },
    ...Array.from({ length: Nations.STAR_NATION_MAX_PLANET_COUNT }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    })),
  ];

  /** The one control besides the seed, as the roll reads it and as provenance records it. */
  const generatorConfig = $derived<Nations.StarNationGeneratorConfigRecord>(
    planetCountControl === 'random' ? {} : { planetCount: parseInt(planetCountControl, 10) },
  );

  const nationSnapshot = $derived(nation === null ? null : Nations.toStarNationSnapshot(nation));
  const defaultArtifactName = $derived(
    nation === null ? '' : Nations.starNationDisplayName(nation),
  );

  const homePlanet = $derived(nation === null ? undefined : Nations.homePlanetOf(nation));
  const technology = $derived(
    nation === null ? undefined : Nations.starNationTechnologyLevel(nation),
  );
  const territory = $derived(nation === null ? '' : Nations.starNationTerritorySentence(nation));
  const homeSystemParagraph = $derived(
    nation === null ? '' : Nations.starNationHomeSystemParagraph(nation),
  );

  /**
   * The composite is drawn from the seed, not from a draw made after the roll: the seed control's
   * promise is that a seed reproduces what you saw, previews included.
   */
  function refreshHomeSystemComposite() {
    if (!browser || nation === null) return;
    const system = nation.homeSystem;
    homeSystemCompositeSrc = renderStarSystemPreviewImage(
      document,
      system,
      imageWidth * (system.stars.length + system.planets.length),
      imageHeight,
      Nations.starNationPreviewSeed(seed),
    );
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    nation = Nations.rollStarNation(seed, generatorConfig);
    refreshHomeSystemComposite();
  }

  function exportMarkdown() {
    if (nation === null) {
      return;
    }
    downloadTextFile(
      Nations.starNationToMarkdown(nation),
      `${Nations.starNationFileStem(nation)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (nation === null) {
      return;
    }
    await downloadTextPdf(
      Nations.starNationDisplayName(nation),
      Nations.starNationToText(nation),
      `${Nations.starNationFileStem(nation)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Star Nation Generator">
  {#snippet description()}
    <p>
      The previews pick how to draw themselves from what this machine can do; the controls below
      override that if it gets it wrong, and an override is remembered in this browser.
    </p>
  {/snippet}

  <RendererOverrideControls onchange={refreshHomeSystemComposite} />

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="planetCountControl"
    label="Planet Count"
    bind:value={planetCountControl}
    options={planetCountOptions}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={Nations.STAR_NATION_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={nationSnapshot}
    {seed}
    config={generatorConfig}
    defaultName={defaultArtifactName}
  />

  {#if nation}
    <div class="nation-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
    </div>

    <div class="nation">
      <h2>{Nations.starNationDisplayName(nation)}</h2>

      <p>{nation.civilization.description}</p>
      {#if territory}
        <p>{territory}</p>
      {/if}

      <StatBlock>
        <Stat label="Government Type">{nation.civilization.government_type.name}</Stat>
        <Stat label="Economy">{nation.civilization.economy_type.name}</Stat>
        <Stat label="Military">{nation.civilization.military.quality}</Stat>
      </StatBlock>
      {#if technology}
        <Stat label="Technology">
          {nation.civilization.technology_level} (<span
            class="tooltip"
            title={technology.description}>{technology.name}</span
          >)
        </Stat>
      {/if}
      {#if homePlanet}
        <StatBlock>
          <Stat label="Home Planet">{homePlanet.name}</Stat>
        </StatBlock>
      {/if}

      <h3>{Nations.starNationHomeSystemHeading(nation)}</h3>

      <p>{homeSystemParagraph}</p>

      <div class="star-system">
        {#if browser && homeSystemCompositeSrc}
          <div class="image-container-system" style="width: 100%;">
            <img
              alt="{nation.homeSystem.name} system composite"
              style="max-width: 100%; height: auto; display: block;"
              src={homeSystemCompositeSrc}
            />
          </div>
        {/if}
      </div>
    </div>
  {/if}
</GeneratorPage>

<style>
  .nation-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .star-system {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
  }
</style>
