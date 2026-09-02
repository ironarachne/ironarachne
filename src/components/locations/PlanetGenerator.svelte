<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import * as RNG from '@ironarachne/rng';
  import {
    getPlanetClassifications,
    searchPlanetClassificationByName,
    convertAUToKM,
    type AstronomicalBody,
    generatePlanet,
    getDefaultPlanetGenerationConfig,
    generateMoon,
    getDefaultMoonGenerationConfig,
    getNumberOfMoonsForParent,
  } from '$lib/astronomical_bodies';
  import { renderPlanetPreviewImage } from '$lib/renderers/astronomical_preview';
  import * as Measurements from '$lib/measurements';
  import { formatNumber } from '$lib/format';
  import { onMount } from 'svelte';
  import {
    generateCivilization,
    getDefaultCivilizationGenerationConfig,
    getFriendlyPopulation,
    type Civilization,
  } from '$lib/civilizations';
  import { getTechnologyLevelByLevel } from '$lib/technology_levels';
  import { browser } from '$app/environment';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import RendererOverrideControls from '$components/common/RendererOverrideControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const planetTypes = getPlanetClassifications();

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let planetType = $state('random');
  let forceRings = $state(false);
  let planetGenConfig = getDefaultPlanetGenerationConfig(rng);
  let planet: AstronomicalBody | undefined = $state();
  let planetImageSrc = $state('');
  let planetImageSeed = $state('');

  let moonGenConfig = getDefaultMoonGenerationConfig();
  moonGenConfig.rng = rng;
  let moons: AstronomicalBody[] = $state([]);

  let is_inhabited = $state(false);

  let civilization_config = getDefaultCivilizationGenerationConfig(rng);
  civilization_config.population_range = [100000, 1000000000];
  let civilization: Civilization | null = $state(null);

  const width = 400;
  const height = 400;

  const planetTypeOptions = $derived(['random', ...planetTypes.map((p) => p.name)]);

  function refreshPlanetImage() {
    if (!browser || planet === undefined || planetImageSeed === '') return;
    planetImageSrc = renderPlanetPreviewImage(document, planet, width, height, planetImageSeed);
  }

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
      planetGenConfig.rings_chance = getDefaultPlanetGenerationConfig(rng).rings_chance;
    }

    planet = generatePlanet(planetGenConfig);

    is_inhabited = rng.int(1, 100) < 30;

    if (is_inhabited) {
      civilization_config = getDefaultCivilizationGenerationConfig(rng);
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
      planetImageSeed = rng.randomString(13);
      refreshPlanetImage();
    }
  }

  onMount(() => {
    planetGenConfig = getDefaultPlanetGenerationConfig(rng);
    planet = generatePlanet(planetGenConfig);
    if (planet !== undefined) {
      planetImageSeed = rng.randomString(13);
      refreshPlanetImage();
    }
  });
</script>

<GeneratorPage toolPath="/planet" title="Planet Generator">
  {#snippet description()}
    <p>
      This lets you generate a planet. The preview picks how to draw itself from what this machine
      can do; the controls below override that if it gets it wrong, and an override is remembered in
      this browser.
    </p>
  {/snippet}

  <RendererOverrideControls onchange={refreshPlanetImage} />

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="planetType"
    label="Planet Type"
    bind:value={planetType}
    options={planetTypeOptions}
  />

  <CheckboxField id="forceRings" label="Force Rings" bind:checked={forceRings} />

  <BaseButton onclick={generate}>Generate</BaseButton>

  {#if planet}
    <h2>{planet.name}</h2>

    {#if browser && planetImageSrc}
      <img alt="{planet.name} image" src={planetImageSrc} />
    {/if}

    <p>{planet.description}</p>

    <StatBlock>
      <Stat label="Planet Type">{planet.classification}</Stat>
    </StatBlock>

    {#if is_inhabited && civilization}
      <h3>Civilization</h3>
      <StatBlock>
        <Stat label="Name">{civilization.name}</Stat>
        <Stat label="Population">{getFriendlyPopulation(civilization.population)}</Stat>
        <Stat label="Government">{civilization.government_type.name}</Stat>
        <Stat label="Economy">{civilization.economy_type.name}</Stat>
      </StatBlock>
      <Stat label="Technology Level">
        <span
          class="tooltip"
          title={getTechnologyLevelByLevel(civilization.technology_level).description}
          >{getTechnologyLevelByLevel(civilization.technology_level).name}</span
        >
      </Stat>
    {/if}

    <h3>Statistics</h3>

    <Stat label="Distance from Star">
      {formatNumber(planet.orbital_distance)} AU
    </Stat>
    <Stat label="Mass">
      {formatNumber(planet.mass)} &times; 10<sup>24</sup> kg ({formatNumber(
        Math.floor((planet.mass / 5.9722) * 100),
        0,
      )}% Earth's mass)
    </Stat>
    <Stat label="Radius">
      {formatNumber(Math.floor(planet.radius))} km ({formatNumber(
        Math.floor((planet.radius / 6378) * 100),
        0,
      )}% Earth's radius)
    </Stat>
    <Stat label="Gravity">
      {formatNumber(planet.gravity)} m/s<sup>2</sup>
      ({formatNumber(Math.floor((planet.gravity / 9.81) * 100), 0)}% Earth's gravity)
    </Stat>
    <Stat label="Orbital Period">
      {formatNumber(Math.floor(planet.orbital_period), 0)} days
    </Stat>
    <Stat label="Rotation Period (Length of Day)">
      {formatNumber(Math.floor(planet.rotation_period), 0)} hours
    </Stat>
    <Stat label="Surface Pressure">
      {formatNumber(planet.surface_pressure)} atm
    </Stat>
    <Stat label="Average Temperature">
      {formatNumber(planet.surface_temperature)} K ({Math.round(
        Measurements.kToC(planet.surface_temperature),
      )} °C, {Math.round(Measurements.kToF(planet.surface_temperature))} °F)
    </Stat>
  {/if}

  {#if moons.length > 0}
    <h3>Moons</h3>
    <ul>
      {#each moons as moon}
        <li>
          <strong>{moon.name}</strong> - {moon.classification}
          <p>{moon.description}</p>
          <Stat label="Orbital Distance">
            {formatNumber(convertAUToKM(moon.orbital_distance))} km
          </Stat>
          <Stat label="Mass">
            {formatNumber(moon.mass)} &times; 10<sup>24</sup> kg ({formatNumber(
              Math.floor((moon.mass / 0.0735) * 100),
              0,
            )}% Moon's mass)
          </Stat>
          <Stat label="Radius">
            {formatNumber(Math.floor(moon.radius))} km ({formatNumber(
              Math.floor((moon.radius / 1737.4) * 100),
              0,
            )}% Moon's radius)
          </Stat>
          <Stat label="Gravity">
            {formatNumber(moon.gravity)} m/s<sup>2</sup> ({formatNumber(
              Math.floor((moon.gravity / 1.62) * 100),
              0,
            )}% Moon's gravity, {formatNumber(Math.floor((moon.gravity / 9.81) * 100), 0)}% Earth's
            gravity)
          </Stat>
          <Stat label="Orbital Period">
            {formatNumber(Math.floor(moon.orbital_period), 0)} days
          </Stat>
          <Stat label="Rotation Period (Length of Day)">
            {formatNumber(Math.floor(moon.rotation_period), 0)} days
          </Stat>
        </li>
      {/each}
    </ul>
  {/if}
</GeneratorPage>
