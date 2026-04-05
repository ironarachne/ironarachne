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

  const width = 128;
  const height = 128;

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let config = getDefaultStarSystemGeneratorConfig();
  let system: StarSystem | undefined = $state();

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    system = generateStarSystem(config);
  }

  onMount(() => {
    config = getDefaultStarSystemGeneratorConfig();
    system = generateStarSystem(config);
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

  <button onclick={generate}>Generate</button>

  {#if system}
    <h2>The {system.name} System</h2>

    {#if browser}
      <div style="width: 100%; margin-bottom: 2rem;">
        <img
          alt="{system.name} composite"
          style="max-width: 100%; height: auto; display: block;"
          src={WebGLStarSystemRenderer.render(
            document,
            system,
            width * (system.stars.length + system.planets.length) * 0.5,
            height,
            rng.randomString(13),
          )}
        />
      </div>
    {/if}

    <p>{system.description}</p>

    <h3>Stars</h3>

    {#each system.stars as star}
      <article class="media-banner">
        <div class="image-container">
          <img
            alt="{star.name} image"
            src={WebGLStarRenderer.render(document, star, width, height, rng.randomString(13))}
          />
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

    {#each system.planets as planet}
      <article class="media-banner">
        <div class="image-container">
          <img
            alt="{planet.name} image"
            src={WebGLPlanetRenderer.render(document, planet, width, height, rng.randomString(13))}
          />
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
