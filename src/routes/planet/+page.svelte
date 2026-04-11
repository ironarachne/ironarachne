<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import {
    getPlanetClassifications,
    searchPlanetClassificationByName,
  } from '$lib/astronomical_bodies/planet/planet_classifications';
  import * as WebGLPlanetRenderer from '$lib/renderers/planets/webgl_planet_renderer';
  import {
    convertAUToKM,
    type AstronomicalBody,
  } from '$lib/astronomical_bodies/astronomical_bodies';
  import * as Measurements from '$lib/measurements';
  import { formatNumber } from '$lib/formatting';

  import { onMount } from 'svelte';
  import {
    generatePlanet,
    getDefaultPlanetGenerationConfig,
  } from '$lib/astronomical_bodies/planet/planets';
  import {
    generateCivilization,
    getDefaultCivilizationGenerationConfig,
    getFriendlyPopulation,
  } from '$lib/civilizations/civilizations';
  import { getTechnologyLevelByLevel } from '$lib/technology_levels/technology_levels';
  import {
    generateMoon,
    getDefaultMoonGenerationConfig,
    getNumberOfMoonsForParent,
  } from '$lib/astronomical_bodies/moon/moons';
  import { browser } from '$app/environment';

  const planetTypes = getPlanetClassifications();

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let planetType = $state('random');
  let forceRings = $state(false);
  let planetGenConfig = getDefaultPlanetGenerationConfig();
  planetGenConfig.rng = rng;
  let planet: AstronomicalBody | undefined = $state();
  let planetImageSrc = $state('');

  let moonGenConfig = getDefaultMoonGenerationConfig();
  moonGenConfig.rng = rng;
  let moons: AstronomicalBody[] = $state([]);

  let is_inhabited = $state(false);

  let civilization_config = getDefaultCivilizationGenerationConfig();
  civilization_config.rng = rng;
  civilization_config.population_range = [100000, 1000000000];
  let civilization = $state(generateCivilization(civilization_config));

  const width = 400;
  const height = 400;

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    if (planetType === 'random') {
      planetGenConfig.possible_classifications = planetTypes;
    } else {
      const classification = searchPlanetClassificationByName(planetType, planetTypes);
      if (classification !== undefined) {
        planetGenConfig.possible_classifications = [classification];
      }
    }

    if (forceRings) {
      planetGenConfig.rings_chance = 100;
    } else {
      planetGenConfig.rings_chance = getDefaultPlanetGenerationConfig().rings_chance;
    }

    planet = generatePlanet(planetGenConfig);

    is_inhabited = rng.int(1, 100) < 30;

    if (is_inhabited) {
      civilization_config = getDefaultCivilizationGenerationConfig();
      civilization_config.rng = rng;
      civilization_config.population_range = [100000, 1000000000];
      civilization = generateCivilization(civilization_config);
    }

    moons = [];
    const moonChance = rng.int(1, 100);
    const moonCount = moonChance > 50 ? getNumberOfMoonsForParent(planet, rng) : 0;

    for (let i = 0; i < moonCount; i++) {
      moonGenConfig = getDefaultMoonGenerationConfig();
      moonGenConfig.rng = rng;
      moonGenConfig.parent_mass = planet.mass;
      moonGenConfig.parent_radius = planet.radius;
      moonGenConfig.parent_orbital_distance = planet.orbital_distance;

      const moon = generateMoon(moonGenConfig);
      moons.push(moon);
    }

    if (browser) {
      planetImageSrc = WebGLPlanetRenderer.render(
        document,
        planet,
        width,
        height,
        rng.randomString(13),
      );
    }
  }

  onMount(() => {
    planetGenConfig = getDefaultPlanetGenerationConfig();
    planetGenConfig.rng = rng;
    planet = generatePlanet(planetGenConfig);
    if (planet !== undefined) {
      planetImageSrc = WebGLPlanetRenderer.render(
        document,
        planet,
        width,
        height,
        rng.randomString(13),
      );
    }
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
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
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

  <div class="input-group">
    <input type="checkbox" name="forceRings" bind:checked={forceRings} id="forceRings" />
    <label for="forceRings">Force Rings</label>
  </div>

  <button onclick={generate}>Generate</button>

  {#if planet}
    <h2>{planet.name}</h2>

    {#if browser && planetImageSrc}
      <img alt="{planet.name} image" src={planetImageSrc} />
    {/if}

    <p>{planet.description}</p>

    <p><strong>Planet Type:</strong> {planet.classification}</p>

    {#if is_inhabited}
      <h3>Civilization</h3>
      <p><strong>Name:</strong> {civilization.name}</p>
      <p><strong>Population:</strong> {getFriendlyPopulation(civilization.population)}</p>
      <p><strong>Government:</strong> {civilization.government_type.name}</p>
      <p><strong>Economy:</strong> {civilization.economy_type.name}</p>
      <p>
        <strong>Technology Level:</strong>
        <span
          class="tooltip"
          title={getTechnologyLevelByLevel(civilization.technology_level).description}
          >{getTechnologyLevelByLevel(civilization.technology_level).name}</span
        >
      </p>
    {/if}

    <h3>Statistics</h3>

    <p>
      <strong>Distance from Star:</strong>
      {formatNumber(planet.orbital_distance)} AU
    </p>
    <p>
      <strong>Mass:</strong>
      {formatNumber(planet.mass)} &times; 10<sup>24</sup> kg ({formatNumber(
        Math.floor((planet.mass / 5.9722) * 100),
        0,
      )}% Earth's mass)
    </p>
    <p>
      <strong>Radius:</strong>
      {formatNumber(Math.floor(planet.radius))} km ({formatNumber(
        Math.floor((planet.radius / 6378) * 100),
        0,
      )}% Earth's radius)
    </p>
    <p>
      <strong>Gravity:</strong>
      {formatNumber(planet.gravity)} m/s<sup>2</sup>
      ({formatNumber(Math.floor((planet.gravity / 9.81) * 100), 0)}% Earth's gravity)
    </p>
    <p>
      <strong>Orbital Period:</strong>
      {formatNumber(Math.floor(planet.orbital_period), 0)} days
    </p>
    <p>
      <strong>Rotation Period (Length of Day):</strong>
      {formatNumber(Math.floor(planet.rotation_period), 0)} hours
    </p>
    <p>
      <strong>Surface Pressure:</strong>
      {formatNumber(planet.surface_pressure)} atm
    </p>
    <p>
      <strong>Average Temperature:</strong>
      {formatNumber(planet.surface_temperature)} K ({Math.round(
        Measurements.kToC(planet.surface_temperature),
      )} °C, {Math.round(Measurements.kToF(planet.surface_temperature))} °F)
    </p>
  {/if}

  {#if moons.length > 0}
    <h3>Moons</h3>
    <ul>
      {#each moons as moon}
        <li>
          <strong>{moon.name}</strong> - {moon.classification}
          <p>{moon.description}</p>
          <p>
            <strong>Orbital Distance:</strong>
            {formatNumber(convertAUToKM(moon.orbital_distance))} km
          </p>
          <p>
            <strong>Mass:</strong>
            {formatNumber(moon.mass)} &times; 10<sup>24</sup> kg ({formatNumber(
              Math.floor((moon.mass / 0.0735) * 100),
              0,
            )}% Moon's mass)
          </p>
          <p>
            <strong>Radius:</strong>
            {formatNumber(Math.floor(moon.radius))} km ({formatNumber(
              Math.floor((moon.radius / 1737.4) * 100),
              0,
            )}% Moon's radius)
          </p>
          <p>
            <strong>Gravity:</strong>
            {formatNumber(moon.gravity)} m/s<sup>2</sup> ({formatNumber(
              Math.floor((moon.gravity / 1.62) * 100),
              0,
            )}% Moon's gravity, {formatNumber(Math.floor((moon.gravity / 9.81) * 100), 0)}% Earth's
            gravity)
          </p>
          <p>
            <strong>Orbital Period:</strong>
            {formatNumber(Math.floor(moon.orbital_period), 0)} days
          </p>
          <p>
            <strong>Rotation Period (Length of Day):</strong>
            {formatNumber(Math.floor(moon.rotation_period), 0)} days
          </p>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/scifi.scss';

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
