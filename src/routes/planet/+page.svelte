<script lang="ts">
  import * as RND from '@ironarachne/rng';
  import * as Classifications from '$lib/planets/classifications';
  import * as WebGLPlanetRenderer from '$lib/renderers/planets/webgl_planet_renderer';
  import * as Planets from '$lib/planets/planets';
  import random from 'random';
  import seedrandom from 'seedrandom';
  import PlanetGeneratorConfig from '$lib/planets/planet_generator_config';
  import type Planet from '$lib/planets/planet';

  import { onMount } from 'svelte';

  let planetTypes = Classifications.getClassificationNames();

  let seed = RND.randomString(13);
  let lockSeed = false;
  random.use(seedrandom(seed));

  let planetType = 'random';
  let planetGenConfig: PlanetGeneratorConfig;
  let planet: Planet;

  const width = 400;
  const height = 400;

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));

    if (planetType == 'random') {
      planetGenConfig.possibleClassifications = Classifications.all();
    } else {
      let classification = Classifications.getClassificationByName(planetType);
      if (classification !== undefined) {
        planetGenConfig.possibleClassifications = [
        classification,
      ];
      }
    }

    planet = Planets.generate(planetGenConfig);
  }

  onMount(() => {
    planetGenConfig = new PlanetGeneratorConfig();
		planet = Planets.generate(planetGenConfig);
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
        <option>{pType}</option>
      {/each}
    </select>
  </div>

  <button on:click={generate}>Generate</button>

  {#if planet}
    <h2>{planet.name}</h2>

    <img alt="{ planet.name } image" src="{ WebGLPlanetRenderer.render(planet, width, height) }" />

    <p>{planet.description}</p>

    <p><strong>Planet Type:</strong> {planet.classification}</p>
    <p><strong>Population:</strong> {planet.populationFriendly}</p>
    <p><strong>Government:</strong> {planet.government}</p>
    <p><strong>Culture:</strong> {planet.culture}</p>
    <p>
      <strong>Distance from Star:</strong>
      {new Intl.NumberFormat().format(planet.distance_from_sun)} AU
    </p>
    <p>
      <strong>Mass:</strong>
      {new Intl.NumberFormat().format(planet.mass)} &times; 10<sup>24</sup> kg ({new Intl.NumberFormat().format(
        Math.floor((planet.mass / 5.9722) * 100),
      )}% Earth's mass)
    </p>
    <p>
      <strong>Diameter:</strong>
      {new Intl.NumberFormat().format(Math.floor(planet.diameter))} km ({new Intl.NumberFormat().format(
        Math.floor((planet.diameter / 12756) * 100),
      )}% Earth's diameter)
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
