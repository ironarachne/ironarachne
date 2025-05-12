<script lang="ts">
  import * as RND from '@ironarachne/rng';
  import { getPlanetClassifications, searchPlanetClassificationByName } from '$lib/astronomical_bodies/planet/planet_classifications';
  import * as WebGLPlanetRenderer from '$lib/renderers/planets/webgl_planet_renderer';
  import random from 'random';
  import seedrandom from 'seedrandom';
  import { convertKMToAU, type AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';
  import * as Measurements from '$lib/measurements';

  import { onMount } from 'svelte';
  import { generatePlanet, getDefaultPlanetGenerationConfig, type PlanetGenerationConfig } from '$lib/astronomical_bodies/planet/planets';
  import { generateCivilization, getDefaultCivilizationGenerationConfig, getFriendlyPopulation } from '$lib/civilizations/civilizations';
  import { getTechnologyLevelByLevel } from '$lib/technology_levels/technology_levels';

  const planetTypes = getPlanetClassifications();

  let seed = $state(RND.randomString(13));
  let lockSeed = $state(false);
  random.use(seedrandom(seed));

  let planetType = $state('random');
  let planetGenConfig = getDefaultPlanetGenerationConfig();
  let planet: AstronomicalBody | undefined = $state();

  let is_inhabited = $state(false);

  let civilization_config = getDefaultCivilizationGenerationConfig();
  civilization_config.population_range = [100000, 1000000000];
  let civilization = $state(generateCivilization(civilization_config));

  const width = 400;
  const height = 400;

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));

    if (planetType === 'random') {
      planetGenConfig.possible_classifications = planetTypes;
    } else {
      const classification = searchPlanetClassificationByName(planetType, planetTypes);
      if (classification !== undefined) {
        planetGenConfig.possible_classifications = [
        classification,
      ];
      }
    }

    planet = generatePlanet(planetGenConfig);

    is_inhabited = RND.simple(100) < 30;

    if (is_inhabited) {
      civilization_config = getDefaultCivilizationGenerationConfig();
      civilization_config.population_range = [100000, 1000000000];
      civilization = generateCivilization(civilization_config);
    }
  }

  onMount(() => {
    planetGenConfig = getDefaultPlanetGenerationConfig();
		planet = generatePlanet(planetGenConfig);
	});
</script>

<svelte:head>
  <title>Planet Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Planet Generator</h1>

  <p>This lets you generate a planet. It uses WebGL and your graphics card.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>

  <div class="input-group">
    <label for="planetType">Planet Type</label>
    <select bind:value={planetType} id="planetType">
      <option>random</option>
      {#each planetTypes as pType}
        <option>{pType.name}</option>
      {/each}
    </select>
  </div>

  <button onclick={generate}>Generate</button>

  {#if planet}
    <h2>{planet.name}</h2>

    <img alt="{ planet.name } image" src="{ WebGLPlanetRenderer.render(planet, width, height) }" />

    <p>{planet.description}</p>

    <p><strong>Planet Type:</strong> {planet.classification}</p>

    {#if is_inhabited}
      <h3>Civilization</h3>
      <p><strong>Name:</strong> {civilization.name}</p>
      <p><strong>Population:</strong> {getFriendlyPopulation(civilization.population)}</p>
      <p><strong>Government:</strong> {civilization.government_type.name}</p>
      <p><strong>Economy:</strong> {civilization.economy_type.name}</p>
      <p><strong>Technology Level:</strong> <span class="tooltip" title="{getTechnologyLevelByLevel(civilization.technology_level).description}">{getTechnologyLevelByLevel(civilization.technology_level).name}</span></p>
    {/if}

    <h3>Statistics</h3>
    
    <p>
      <strong>Distance from Star:</strong>
      {new Intl.NumberFormat().format(planet.orbital_distance)} AU
    </p>
    <p>
      <strong>Mass:</strong>
      {new Intl.NumberFormat().format(planet.mass)} &times; 10<sup>24</sup> kg ({new Intl.NumberFormat().format(
        Math.floor((planet.mass / 5.9722) * 100),
      )}% Earth's mass)
    </p>
    <p>
      <strong>Radius:</strong>
      {new Intl.NumberFormat().format(Math.floor(planet.radius))} km ({new Intl.NumberFormat().format(
        Math.floor((planet.radius / 6378) * 100),
      )}% Earth's radius)
    </p>
    <p>
      <strong>Gravity:</strong>
      {new Intl.NumberFormat().format(planet.gravity)} m/s<sup>2</sup>
      ({new Intl.NumberFormat().format(Math.floor((planet.gravity / 9.81) * 100))}% Earth's gravity)
    </p>
    <p>
      <strong>Orbital Period:</strong>
      {new Intl.NumberFormat().format(Math.floor(planet.orbital_period))} days
    </p>
    <p>
      <strong>Rotation Period (Length of Day):</strong>
      {new Intl.NumberFormat().format(Math.floor(planet.rotation_period))} hours
    </p>
    <p>
      <strong>Surface Pressure:</strong>
      {new Intl.NumberFormat().format(planet.surface_pressure)} atm
    </p>
    <p>
      <strong>Average Temperature:</strong>
      {new Intl.NumberFormat().format(planet.surface_temperature)} K ({Math.round(Measurements.kToC(planet.surface_temperature))} °C, {Math.round(Measurements.kToF(planet.surface_temperature))} °F)
    </p>
  {/if}
</section>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/scifi.scss';

  canvas {
    display: block;
    width: 600px;
    height: 400px;
    margin: 1rem auto;
  }

  #planet-render {
    display: block;
    width: 600px;
    height: 400px;
    margin: 1rem auto;
  }
</style>
