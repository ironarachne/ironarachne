<script>
  import * as StarSystem from "../modules/starsystem/starsystem";
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let system = StarSystem.generate();

  function generate() {
    random.use(seedrandom(seed));
    system = StarSystem.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<svelte:head>
  <title>Star System Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h2>Star System Generator</h2>
  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h3>The {system.name} System</h3>

  <p>{system.description}</p>

  <h4>Stars</h4>

  {#each system.stars as star}
    <article class="media-banner">
      <div class="image-container">{@html star.svg}</div>
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

  <h4>Planets</h4>

  {#each system.planets as planet}
    <article class="media-banner">
      <div class="image-container">{@html planet.svg}</div>
      <div>
        <h5>{planet.name}</h5>
        <p>{planet.description}</p>
        <p><strong>Planet Type:</strong> {planet.classification}</p>
        <p><strong>Population:</strong> {planet.population}</p>
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
          {new Intl.NumberFormat().format(planet.gravity)} m/s<sup>2</sup>
        </p>
        <p>
          <strong>Orbital Period:</strong>
          {new Intl.NumberFormat().format(Math.floor(planet.orbital_period))} days
        </p>
      </div>
    </article>
  {/each}
</section>

<style>
  article.media-banner {
    display: grid;
    grid-template-columns: 128px auto;
    column-gap: 1rem;
  }
</style>
