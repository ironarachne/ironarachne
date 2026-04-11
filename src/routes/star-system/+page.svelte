<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import * as WebGLStarRenderer from '$lib/renderers/stars/webgl_star_renderer';
  import * as WebGLPlanetRenderer from '$lib/renderers/planets/webgl_planet_renderer';

  import * as WebGLStarSystemRenderer from '$lib/renderers/star_systems/webgl_star_system_renderer';
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

  function rebuildSystemPreviewImages() {
    if (!browser || system === undefined) return;
    const current = system;
    systemCompositeSrc = WebGLStarSystemRenderer.render(
      document,
      current,
      width * (current.stars.length + current.planets.length) * 0.5,
      height,
      rng.randomString(13),
    );
    starImageSrcs = current.stars.map((star) =>
      WebGLStarRenderer.render(document, star, width, height, rng.randomString(13)),
    );
    planetImageSrcs = current.planets.map((planet) =>
      WebGLPlanetRenderer.render(document, planet, width, height, rng.randomString(13)),
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

<svelte:head>
  <title>Star System Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Star System Generator</h1>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="planetCountControl">Planet Count</label>
    <select bind:value={planetCountControl} id="planetCountControl">
      <option value="random">Random</option>
      {#each Array.from({ length: 20 }, (_, i) => i + 1) as i}
        <option value={i.toString()}>{i}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="starType">Star Type</label>
    <select bind:value={starType} id="starType">
      <option value="random">Random</option>
      {#each starTypes as sType}
        <option value={sType.name}>{sType.name}</option>
      {/each}
    </select>
  </div>

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
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/scifi.scss';

  article.media-banner {
    display: grid;
    grid-template-columns: 128px auto;
    column-gap: 1rem;
  }
</style>
