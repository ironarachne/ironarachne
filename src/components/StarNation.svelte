<script lang="ts">
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";
  import StarNation from "../modules/starnations/starnation";
  import StarNationGeneratorConfig from "../modules/starnations/generatorconfig";
  import StarNationGenerator from "../modules/starnations/generator";
  import SVGPlanetRenderer from "../modules/renderers/planets/planet-svg";
  import SVGStarRenderer from "../modules/renderers/stars/star-svg";
  import * as Words from "../modules/words";

  let config = new StarNationGeneratorConfig();
  let gen = new StarNationGenerator(config);
  let nation = new StarNation();
  let seed = RND.randomString(13);

  let planetRenderer = new SVGPlanetRenderer(64, 64);
  let starRenderer = new SVGStarRenderer(64, 64);

  function generate() {
    random.use(seedrandom(seed));
    nation = gen.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  newSeed();
</script>

<style>
  .star-system { display: flex; max-width: 600px; }
</style>

<svelte:head>
  <title>Star Nation Generator | Iron Arachne</title>
</svelte:head>

<section class="scifi main">
  <h2>Star Nation Generator</h2>

  <p>Generate a star nation.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{ nation.name }</h2>

  <p>{ nation.description }</p>

  <p>Their primary goal is { nation.primaryGoal }.</p>

  <p><strong>Culture:</strong> {nation.culture}</p>
  <p><strong>Economy:</strong> {nation.economy}</p>
  <p><strong>Military:</strong> { nation.military }</p>
  <p><strong>Technology:</strong> { nation.technology }</p>

  <h3>The { nation.systems[nation.capitalSystem].name } System</h3>

  <p>{ nation.systems[nation.capitalSystem].planets[nation.capitalPlanet].name } is the { nation.capitalPlanet + 1}{ Words.getOrdinal(nation.capitalPlanet + 1) } planet in this system. It has a population of { nation.systems[nation.capitalSystem].planets[nation.capitalPlanet].populationFriendly }.</p>

  <div class="star-system">
  {@html starRenderer.render(nation.systems[nation.capitalSystem].stars[0])}
  {#each nation.systems[nation.capitalSystem].planets as planet}
  {@html planetRenderer.render(planet)}
  {/each}
  </div>
</section>
