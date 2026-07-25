<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import * as Words from '@ironarachne/words';
  import { renderStarSystemPreviewImage } from '$lib/renderers/astronomical_preview';
  import type { AstronomicalRendererKind } from '$lib/renderers/astronomical_renderer_kind';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import {
    generateCivilization,
    getCivilizationDescription,
    getDefaultCivilizationGenerationConfig,
    getFriendlyPopulation,
    type Civilization,
  } from '$lib/civilizations/civilizations';
  import {
    generateStarSystem,
    getDefaultStarSystemGeneratorConfig,
    type StarSystem,
    type StarSystemGenerationConfig,
  } from '$lib/astronomical_bodies/star_systems';
  import {
    generateRegionOfControl,
    getDefaultRegionOfControlGenerationConfig,
    getRegionTypeByName,
    type RegionOfControl,
    type RegionOfControlGenerationConfig,
  } from '$lib/civilizations/regions_of_control';
  import { getTechnologyLevelByLevel } from '$lib/technology_levels/technology_levels';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import ImageRendererSelect from '$components/common/ImageRendererSelect.svelte';
  import SelectField from '$components/common/SelectField.svelte';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  const config = getDefaultCivilizationGenerationConfig();
  config.rng = rng;
  config.technology_level_range = [7, 9];
  const systemConfig: StarSystemGenerationConfig = $state(getDefaultStarSystemGeneratorConfig());
  const systemRegionConfig: RegionOfControlGenerationConfig =
    getDefaultRegionOfControlGenerationConfig();
  systemRegionConfig.region_types = [getRegionTypeByName('Star System')];
  systemRegionConfig.population_density_range = [0.05, 0.3];
  systemRegionConfig.technology_level = 7;
  systemRegionConfig.rng = rng;
  const homePlanetRegionConfig: RegionOfControlGenerationConfig =
    getDefaultRegionOfControlGenerationConfig();
  homePlanetRegionConfig.region_types = [getRegionTypeByName('Planet')];
  homePlanetRegionConfig.technology_level = 7;

  let nation: Civilization | null = $state(null);
  let homeSystem: StarSystem | null = $state(null);
  let homeSystemRegion: RegionOfControl | null = $state(null);
  let populatedPlanets = $state(1);
  let homeSystemPopulatedPlanets = $state(1);
  let extraDescription = $state('');

  let homePlanet: number = $state(0);
  let homePlanetRegion: RegionOfControl | null = $state(null);

  let homeSystemCompositeSrc = $state('');
  let homeSystemPreviewSeed = $state('');
  let imageRenderer = $state<AstronomicalRendererKind>('webgl');

  let planetCountControl: string = $state('random');

  const imageWidth = 64;
  const imageHeight = 64;

  const planetCountOptions = $derived([
    { value: 'random', label: 'Random' },
    ...Array.from({ length: 20 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    })),
  ]);

  function refreshHomeSystemComposite() {
    if (!browser || homeSystemPreviewSeed === '' || !homeSystem) return;
    homeSystemCompositeSrc = renderStarSystemPreviewImage(
      document,
      homeSystem,
      imageWidth * (homeSystem.stars.length + homeSystem.planets.length),
      imageHeight,
      homeSystemPreviewSeed,
      imageRenderer,
    );
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    extraDescription = '';

    if (planetCountControl !== 'random') {
      systemConfig.planet_count = parseInt(planetCountControl, 10);
    } else {
      systemConfig.planet_count = Math.max(1, Math.round(rng.bellFloat(1, 12)));
    }

    nation = generateCivilization(config);
    homeSystem = generateStarSystem(systemConfig);
    homePlanet = rng.int(0, homeSystem.planets.length - 1);
    homeSystemRegion = generateRegionOfControl(systemRegionConfig);
    homeSystemRegion.name = homeSystem.name;
    homePlanetRegion = generateRegionOfControl(homePlanetRegionConfig);
    homePlanetRegion.name = homeSystem.planets[homePlanet].name;
    const populated = rng.int(1, homeSystem.planets.length - 1);
    populatedPlanets = populated;
    homeSystemPopulatedPlanets = populated;
    nation.population = homeSystemRegion.population;

    if (nation.technology_level > 7) {
      const total_systems_controlled = rng.int(1, 20);
      const systems = [];
      let total_population = homeSystemRegion.population;
      for (let i = 0; i < total_systems_controlled; i++) {
        systems.push(generateStarSystem(systemConfig));
        populatedPlanets += rng.int(1, systems[i].planets.length - 1);
        total_population += rng.int(1, systems[i].planets.length - 1) * rng.int(100000, 10000000);
      }
      nation.population = total_population;
      extraDescription = `The nation controls ${total_systems_controlled + 1} star systems, with a total of ${populatedPlanets} planets.`;
    }

    nation.description = getCivilizationDescription(nation);
    homePlanetRegion.population = nation.population / populatedPlanets;

    if (browser) {
      homeSystemPreviewSeed = rng.randomString(13);
      refreshHomeSystemComposite();
    }
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage theme="scifi" title="Star Nation Generator">
  {#snippet description()}
    <p>
      Choose <strong>WebGL</strong> for full GPU previews or <strong>Simple</strong> for Canvas 2D (no
      WebGL). Your choice is remembered in this browser.
    </p>
  {/snippet}

  <ImageRendererSelect bind:renderer={imageRenderer} onchange={refreshHomeSystemComposite} />

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="planetCountControl"
    label="Planet Count"
    bind:value={planetCountControl}
    options={planetCountOptions}
  />

  <button onclick={generate}>Generate</button>

  {#if nation && homeSystem && homeSystemRegion && homePlanetRegion}
    <h2>{nation.name}</h2>

    <p>{nation.description}</p>
    {#if extraDescription}
      <p>{extraDescription}</p>
    {/if}

    <p><strong>Government Type:</strong> {nation.government_type.name}</p>
    <p><strong>Economy:</strong> {nation.economy_type.name}</p>
    <p><strong>Military:</strong> {nation.military.quality}</p>
    <p>
      <strong>Technology:</strong>
      {nation.technology_level} (<span
        class="tooltip"
        title={getTechnologyLevelByLevel(nation.technology_level).description}
        >{getTechnologyLevelByLevel(nation.technology_level).name}</span
      >)
    </p>
    <p><strong>Home Planet:</strong> {homeSystem.planets[homePlanet].name}</p>

    <h3>The {homeSystemRegion.name} System</h3>

    <p>
      There are {homeSystemPopulatedPlanets} populated planets in this system. {homePlanetRegion.name}
      is the {homePlanet + 1}{Words.getOrdinal(homePlanet + 1)} planet. It has a population of {getFriendlyPopulation(
        homePlanetRegion.population,
      )}.
    </p>

    <div class="star-system">
      {#if browser && homeSystemCompositeSrc}
        <div class="image-container-system" style="width: 100%;">
          <img
            alt="{homeSystem.name} system composite"
            style="max-width: 100%; height: auto; display: block;"
            src={homeSystemCompositeSrc}
          />
        </div>
      {/if}
    </div>
  {/if}
</GeneratorPage>

<style>
  .star-system {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
  }
</style>
