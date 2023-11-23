<script lang="ts">
  import * as RND from '@ironarachne/rng';
  import * as Classifications from '$lib/planets/classifications';
  import * as PlanetRenderer from '$lib/renderers/planets/planet-webgl';
  import random from 'random';
  import seedrandom from 'seedrandom';

  import { onMount } from 'svelte';
  import PlanetGeneratorConfig from '$lib/planets/generatorconfig';
  import PlanetGenerator from '$lib/planets/generator';

  let planetTypes = Classifications.getClassificationNames();

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let planetType = 'random';
  let planetGenConfig = new PlanetGeneratorConfig();
  let planetGen = new PlanetGenerator(planetGenConfig);
  let planet = planetGen.generate();
  let planetImage: HTMLImageElement | null;

  function generate() {
    random.use(seedrandom(seed));

    if (planetType == 'random') {
      planetGen.config.possibleClassifications = Classifications.all();
    } else {
      let classification = Classifications.getClassificationByName(planetType);
      if (classification !== undefined) {
        planetGen.config.possibleClassifications = [
        classification,
      ];
      }
    }

    planet = planetGen.generate();

    if (planetImage !== null) {
      planetImage.src = PlanetRenderer.render(planet, 600, 400);
    }
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  onMount(() => {
    planetImage = document.getElementById('planet-render') as HTMLImageElement;
    newSeed();
  });
</script>

<svelte:head>
  <title>Planet Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Planet Generator</h1>

  <p>This lets you generate a planet. It uses WebGL and your graphics card.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
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

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{planet.name}</h2>

  <img alt="Planet" id="planet-render" />

  <p>{planet.description}</p>

  <p><strong>Planet Type:</strong> {planet.classification.name}</p>
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
