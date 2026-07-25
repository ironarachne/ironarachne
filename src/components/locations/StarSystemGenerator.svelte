<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import {
    renderPlanetPreviewImage,
    renderStarPreviewImage,
    renderStarSystemPreviewImage,
  } from '$lib/renderers/astronomical_preview';
  import type { AstronomicalRendererKind } from '$lib/renderers/astronomical_renderer_kind';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import {
    generateStarSystem,
    getDefaultStarSystemGeneratorConfig,
    type StarSystem,
  } from '$lib/astronomical_bodies/star_systems';
  import {
    getStarClassifications,
    searchStarClassificationsByName,
  } from '$lib/astronomical_bodies/star/star_classifications';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import ImageRendererSelect from '$components/common/ImageRendererSelect.svelte';
  import SelectField from '$components/common/SelectField.svelte';

  const width = 128;
  const height = 128;

  const starTypes = getStarClassifications();

  let rng = new RNG.RNG(Date.now().toString());
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
  let imageRenderer = $state<AstronomicalRendererKind>('webgl');

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

  function rebuildSystemPreviewImages() {
    if (!browser || system === undefined) return;
    const current = system;
    const compositeW = width * (current.stars.length + current.planets.length) * 0.5;
    systemCompositeSrc = renderStarSystemPreviewImage(
      document,
      current,
      compositeW,
      height,
      rng.randomString(13),
      imageRenderer,
    );
    starImageSrcs = current.stars.map((star) =>
      renderStarPreviewImage(document, star, width, height, rng.randomString(13), imageRenderer),
    );
    planetImageSrcs = current.planets.map((planet) =>
      renderPlanetPreviewImage(
        document,
        planet,
        width,
        height,
        rng.randomString(13),
        imageRenderer,
      ),
    );
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    if (planetCountControl !== 'random') {
      config.planet_count = parseInt(planetCountControl, 10);
    } else {
      config.planet_count = Math.max(1, Math.round(rng.bellFloat(1, 12)));
    }

    if (starType !== 'random') {
      config.star_classifications = searchStarClassificationsByName(starType, starTypes);
    } else {
      config.star_classifications = starTypes;
    }

    system = generateStarSystem(config);
    rebuildSystemPreviewImages();
  }

  onMount(() => {
    config = getDefaultStarSystemGeneratorConfig();
    if (planetCountControl !== 'random') {
      config.planet_count = parseInt(planetCountControl, 10);
    }
    if (starType !== 'random') {
      config.star_classifications = searchStarClassificationsByName(starType, starTypes);
    }
    system = generateStarSystem(config);
    rebuildSystemPreviewImages();
  });
</script>

<GeneratorPage theme="scifi" title="Star System Generator">
  <ImageRendererSelect bind:renderer={imageRenderer} onchange={rebuildSystemPreviewImages} />

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="planetCountControl"
    label="Planet Count"
    bind:value={planetCountControl}
    options={planetCountOptions}
  />

  <SelectField id="starType" label="Star Type" bind:value={starType} options={starTypeOptions} />

  <button onclick={generate}>Generate</button>

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
          <p>
            <strong>Star Type:</strong>
            {star.classification}
          </p>
          <p>
            <strong>Radius:</strong>
            {new Intl.NumberFormat().format(star.radius)} km
          </p>
          <p>
            <strong>Mass:</strong>
            {new Intl.NumberFormat().format(star.mass)} &times; 10<sup>30</sup> kg
          </p>
          <p>
            <strong>Luminosity:</strong>
            {new Intl.NumberFormat().format(star.luminosity)} &times; 10<sup>26</sup> W
          </p>
          <p>
            <strong>Temperature:</strong>
            {new Intl.NumberFormat().format(star.surface_temperature)}K
          </p>
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
          <p><strong>Planet Type:</strong> {planet.classification}</p>
          <p>
            <strong>Distance from Star:</strong>
            {new Intl.NumberFormat().format(planet.orbital_distance)} AU
          </p>
          <p>
            <strong>Mass:</strong>
            {new Intl.NumberFormat().format(planet.mass)} &times; 10<sup>24</sup> kg
          </p>
          <p>
            <strong>Radius:</strong>
            {new Intl.NumberFormat().format(Math.floor(planet.radius))} km
          </p>
          <p>
            <strong>Gravity:</strong>
            {new Intl.NumberFormat().format(planet.gravity)} m/s<sup>2</sup>
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
            {new Intl.NumberFormat().format(planet.surface_temperature)}K
          </p>
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
