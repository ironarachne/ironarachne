<script>
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";
  import StarSystemGenerator from "$lib/starsystem/generator";
  import StarSystemGeneratorConfig from "$lib/starsystem/generatorconfig";
  import SVGPlanetRenderer from "$lib/renderers/planets/planet-svg";
  import SVGStarRenderer from "$lib/renderers/stars/star-svg";

  const width = 128;
  const height = 128;

  let planetRenderer = new SVGPlanetRenderer(width, height);
  let starRenderer = new SVGStarRenderer(width, height);

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));

  let config = new StarSystemGeneratorConfig();
  let generator = new StarSystemGenerator(config);

  let system = generator.generate();

  function generate() {
    random.use(seedrandom(seed));
    system = generator.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/scifi.scss';

  article.media-banner {
    display: grid;
    grid-template-columns: 128px auto;
    column-gap: 1rem;
  }
</style>

<svelte:head>
  <title>Star System Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Star System Generator</h1>
  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>The {system.name} System</h2>

  <p>{system.description}</p>

  <h3>Stars</h3>

  {#each system.stars as star}
    <article class="media-banner">
      <div class="image-container">{@html starRenderer.render(star)}</div>
      <div>
        <h5>{star.name}</h5>
        <p>{star.description}</p>
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
          {new Intl.NumberFormat().format(star.luminosity)} &times; 10<sup
            >26</sup
          > W
        </p>
        <p>
          <strong>Temperature:</strong>
          {new Intl.NumberFormat().format(star.temperature)}K
        </p>
      </div>
    </article>
  {/each}

  <h3>Planets</h3>

  {#each system.planets as planet}
    <article class="media-banner">
      <div class="image-container">{@html planetRenderer.render(planet)}</div>
      <div>
        <h5>{planet.name}</h5>
        <p>{planet.description}</p>
        <p><strong>Planet Type:</strong> {planet.classification.name}</p>
        <p><strong>Population:</strong> {planet.populationFriendly}</p>
        <p><strong>Culture:</strong> {planet.culture}</p>
        <p><strong>Government:</strong> {planet.government}</p>
        <p>
          <strong>Distance from Star:</strong>
          {new Intl.NumberFormat().format(planet.distance_from_sun)} AU
        </p>
        <p>
          <strong>Mass:</strong>
          {new Intl.NumberFormat().format(planet.mass)} &times; 10<sup>24</sup> kg
        </p>
        <p>
          <strong>Diameter:</strong>
          {new Intl.NumberFormat().format(Math.floor(planet.diameter))} km
        </p>
        <p>
          <strong>Gravity:</strong>
          {new Intl.NumberFormat().format(planet.gravity)} m/s<sup>2</sup> ({new Intl.NumberFormat().format(Math.floor(planet.gravity / 9.81 * 100))}% Earth gravity)
        </p>
        <p>
          <strong>Orbital Period:</strong>
          {new Intl.NumberFormat().format(Math.floor(planet.orbital_period))} days
        </p>
      </div>
    </article>
  {/each}
</section>
