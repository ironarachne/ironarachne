<script lang="ts">
import * as RNG from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import * as WebGLStarRenderer from "$lib/renderers/stars/webgl_star_renderer";
import * as WebGLPlanetRenderer from "$lib/renderers/planets/webgl_planet_renderer";
import { browser } from '$app/environment';
import { onMount } from "svelte";
import {
  generateCivilization,
  getCivilizationDescription,
  getDefaultCivilizationGenerationConfig,
  getFriendlyPopulation,
  type Civilization,
} from "$lib/civilizations/civilizations";
import {
  generateStarSystem,
  getDefaultStarSystemGeneratorConfig,
  type StarSystem,
  type StarSystemGenerationConfig,
} from "$lib/astronomical_bodies/star_systems";
import {
  generateRegionOfControl,
  getDefaultRegionOfControlGenerationConfig,
  getRegionTypeByName,
  type RegionOfControl,
  type RegionOfControlGenerationConfig,
} from "$lib/civilizations/regions_of_control";
import { getTechnologyLevelByLevel } from "$lib/technology_levels/technology_levels";

let rng = new RNG.RNG(Date.now().toString());
let seed = $state(rng.randomString(13));
let lockSeed = $state(false);

const config = getDefaultCivilizationGenerationConfig();
config.rng = rng;
config.technology_level_range = [7, 9];
const systemConfig: StarSystemGenerationConfig = $state(
  getDefaultStarSystemGeneratorConfig(),
);
const systemRegionConfig: RegionOfControlGenerationConfig =
  getDefaultRegionOfControlGenerationConfig();
systemRegionConfig.region_types = [getRegionTypeByName("Star System")];
systemRegionConfig.population_density_range = [0.05, 0.3];
systemRegionConfig.technology_level = 7;
systemRegionConfig.rng = rng;
const homePlanetRegionConfig: RegionOfControlGenerationConfig =
  getDefaultRegionOfControlGenerationConfig();
homePlanetRegionConfig.region_types = [getRegionTypeByName("Planet")];
homePlanetRegionConfig.technology_level = 7;

let nation: Civilization = $state(generateCivilization(config));
let homeSystem: StarSystem = $state(generateStarSystem(systemConfig));
let homeSystemRegion: RegionOfControl = $state(
  generateRegionOfControl(systemRegionConfig),
);
let populatedPlanets = $state(1);
let homeSystemPopulatedPlanets = $state(1);
let extraDescription = $state("");

let homePlanet: number = $state(0);
let homePlanetRegion: RegionOfControl = $state(
  generateRegionOfControl(homePlanetRegionConfig),
);

const imageWidth = 64;
const imageHeight = 64;

function generate() {
  if (!lockSeed) {
    seed = rng.randomString(13);
  }
  rng.setSeed(seed);
  extraDescription = "";

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
      total_population +=
        rng.int(1, systems[i].planets.length - 1) * rng.int(100000, 10000000);
    }
    nation.population = total_population;
    extraDescription = `The nation controls ${total_systems_controlled + 1} star systems, with a total of ${populatedPlanets} planets.`;
  }

  nation.description = getCivilizationDescription(nation);
  homePlanetRegion.population = nation.population / populatedPlanets;
}

onMount(() => {
  generate();
});
</script>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/scifi.scss';

  .star-system { display: flex; width: 100%; flex-wrap: wrap; }
</style>

<svelte:head>
  <title>Star Nation Generator | Iron Arachne</title>
</svelte:head>

<section class="scifi main">
  <h1>Star Nation Generator</h1>

  <p>Generate a star nation.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>

  {#if nation}
  <h2>{ nation.name }</h2>

  <p>{ nation.description }</p>
  {#if extraDescription}
  <p>{ extraDescription }</p>
  {/if}

  <p><strong>Government Type:</strong> {nation.government_type.name}</p>
  <p><strong>Economy:</strong> {nation.economy_type.name}</p>
  <p><strong>Military:</strong> { nation.military.quality }</p>
  <p><strong>Technology:</strong> { nation.technology_level } (<span class="tooltip" title="{ getTechnologyLevelByLevel(nation.technology_level).description }">{ getTechnologyLevelByLevel(nation.technology_level).name}</span>)</p>
  <p><strong>Home Planet:</strong> { homeSystem.planets[homePlanet].name}</p>

  <h3>The { homeSystemRegion.name } System</h3>

  <p>There are { homeSystemPopulatedPlanets} populated planets in this system. { homePlanetRegion.name } is the { homePlanet + 1}{ Words.getOrdinal(homePlanet + 1) } planet. It has a population of { getFriendlyPopulation(homePlanetRegion.population) }.</p>

  <div class="star-system">
    {#if browser}
    <div class="image-container">
      <img alt="{ homeSystem.stars[0].name } image" src="{ WebGLStarRenderer.render(document, homeSystem.stars[0], imageWidth, imageHeight, rng) }" />
    </div>
    {#each homeSystem.planets as planet}
    <div class="image-container">
      <img alt="{ planet.name } image" src="{ WebGLPlanetRenderer.render(document, planet, imageWidth, imageHeight, rng) }" />
    </div>
    {/each}
    {/if}
  </div>
  {/if}
</section>
