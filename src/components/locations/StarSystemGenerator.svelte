<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import * as RNG from '@ironarachne/rng';
  import {
    renderPlanetPreviewImage,
    renderStarPreviewImage,
    renderStarSystemPreviewImage,
  } from '$lib/renderers/astronomical_preview';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import {
    generateStarSystem,
    getDefaultStarSystemGeneratorConfig,
    type StarSystem,
    getStarClassifications,
    searchStarClassificationsByName,
  } from '$lib/astronomical_bodies';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import RendererOverrideControls from '$components/common/RendererOverrideControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const width = 128;
  const height = 128;

  const starTypes = getStarClassifications();

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let config = getDefaultStarSystemGeneratorConfig();
  let system: StarSystem | undefined = $state();
  let systemCompositeSrc = $state('');
  let starImageSrcs = $state<string[]>([]);
  let planetImageSrcs = $state<string[]>([]);
  let planetCountControl: string = $state('random');
  let starType: string = $state('random');

  const planetCountOptions = $derived([
    { value: 'random', label: 'Random' },
    ...Array.from({ length: 20 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    })),
  ]);

  const starTypeOptions = $derived([
    { value: 'random', label: 'Random' },
    ...starTypes.map((s) => ({ value: s.name, label: s.name })),
  ]);

  /**
   * Image seeds come from the page's seed and each body's ordinal, not from a fresh RNG draw.
   *
   * They used to be drawn as this ran, so every rebuild produced different pictures of the same
   * system: changing the renderer redrew every body rather than redrawing it differently, and the
   * seed control — whose whole promise is that a seed reproduces what you saw — did not reproduce
   * the previews. Same shape of bug as the one the scene builder fixed underneath, one layer up.
   */
  function rebuildSystemPreviewImages() {
    if (!browser || system === undefined) return;
    const current = system;
    const compositeW = width * (current.stars.length + current.planets.length) * 0.5;
    systemCompositeSrc = renderStarSystemPreviewImage(
      document,
      current,
      compositeW,
      height,
      `${seed}:composite`,
    );
    starImageSrcs = current.stars.map((star, index) =>
      renderStarPreviewImage(document, star, width, height, `${seed}:star${index}`),
    );
    planetImageSrcs = current.planets.map((planet, index) =>
      renderPlanetPreviewImage(document, planet, width, height, `${seed}:planet${index}`),
    );
  }

  /**
   * Builds the config from the controls and, importantly, from this page's RNG.
   *
   * `getDefaultStarSystemGeneratorConfig` seeds itself from `Date.now()` and picks a planet count
   * with it. Left unwired, as it was, the seed control changed nothing about the system: the same
   * locked seed generated a different system on every click, and every reload. The mount path has
   * to do this too, or the first system on screen is the one nobody can reproduce.
   */
  function applySystemConfig() {
    config = getDefaultStarSystemGeneratorConfig();
    config.rng = rng;
    config.planet_count =
      planetCountControl === 'random'
        ? Math.max(1, Math.round(rng.bellFloat(1, 12)))
        : parseInt(planetCountControl, 10);
    config.star_classifications =
      starType === 'random' ? starTypes : searchStarClassificationsByName(starType, starTypes);
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    applySystemConfig();
    system = generateStarSystem(config);
    rebuildSystemPreviewImages();
  }

  onMount(() => {
    rng.setSeed(seed);
    applySystemConfig();
    system = generateStarSystem(config);
    rebuildSystemPreviewImages();
  });
</script>

<GeneratorPage toolPath="/star-system" title="Star System Generator">
  <RendererOverrideControls onchange={rebuildSystemPreviewImages} />

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="planetCountControl"
    label="Planet Count"
    bind:value={planetCountControl}
    options={planetCountOptions}
  />

  <SelectField id="starType" label="Star Type" bind:value={starType} options={starTypeOptions} />

  <BaseButton onclick={generate}>Generate</BaseButton>

  {#if system}
    <h2>The {system.name} System</h2>

    {#if browser && systemCompositeSrc}
      <div style="width: 100%; margin-bottom: 2rem;">
        <img
          alt="{system.name} composite"
          style="max-width: 100%; height: auto; display: block;"
          src={systemCompositeSrc}
        />
      </div>
    {/if}

    <p>{system.description}</p>

    <h3>Stars</h3>

    {#each system.stars as star, starIndex (star.name)}
      <article class="media-banner">
        <div class="image-container">
          <img alt="{star.name} image" src={starImageSrcs[starIndex] ?? ''} />
        </div>
        <div>
          <h5>{star.name}</h5>
          <p>{star.description}</p>
          <Stat label="Star Type">
            {star.classification}
          </Stat>
          <Stat label="Radius">
            {new Intl.NumberFormat().format(star.radius)} km
          </Stat>
          <Stat label="Mass">
            {new Intl.NumberFormat().format(star.mass)} &times; 10<sup>30</sup> kg
          </Stat>
          <Stat label="Luminosity">
            {new Intl.NumberFormat().format(star.luminosity)} &times; 10<sup>26</sup> W
          </Stat>
          <Stat label="Temperature">
            {new Intl.NumberFormat().format(star.surface_temperature)}K
          </Stat>
        </div>
      </article>
    {/each}

    <h3>Planets</h3>

    {#each system.planets as planet, planetIndex (planet.name)}
      <article class="media-banner">
        <div class="image-container">
          <img alt="{planet.name} image" src={planetImageSrcs[planetIndex] ?? ''} />
        </div>
        <div>
          <h5>{planet.name}</h5>
          <p>{planet.description}</p>
          <StatBlock>
            <Stat label="Planet Type">{planet.classification}</Stat>
          </StatBlock>
          <Stat label="Distance from Star">
            {new Intl.NumberFormat().format(planet.orbital_distance)} AU
          </Stat>
          <Stat label="Mass">
            {new Intl.NumberFormat().format(planet.mass)} &times; 10<sup>24</sup> kg
          </Stat>
          <Stat label="Radius">
            {new Intl.NumberFormat().format(Math.floor(planet.radius))} km
          </Stat>
          <Stat label="Gravity">
            {new Intl.NumberFormat().format(planet.gravity)} m/s<sup>2</sup>
          </Stat>
          <Stat label="Orbital Period">
            {new Intl.NumberFormat().format(Math.floor(planet.orbital_period))} days
          </Stat>
          <Stat label="Rotation Period (Length of Day)">
            {new Intl.NumberFormat().format(Math.floor(planet.rotation_period))} hours
          </Stat>
          <Stat label="Surface Pressure">
            {new Intl.NumberFormat().format(planet.surface_pressure)} atm
          </Stat>
          <Stat label="Average Temperature">
            {new Intl.NumberFormat().format(planet.surface_temperature)}K
          </Stat>
        </div>
      </article>
    {/each}
  {/if}
</GeneratorPage>

<style>
  article.media-banner {
    display: grid;
    grid-template-columns: 128px auto;
    column-gap: 1rem;
  }
</style>
