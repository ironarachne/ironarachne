<script lang="ts">
  import * as RND from "@ironarachne/rng";
  import * as Words from "@ironarachne/words";
  import * as WebGLStarRenderer from "$lib/renderers/stars/webgl_star_renderer";
  import * as WebGLPlanetRenderer from "$lib/renderers/planets/webgl_planet_renderer";
  import random from "random";
  import seedrandom from "seedrandom";
  import type StarNation from "$lib/starnations/starnation";
  import StarNationGenerator from "$lib/starnations/generator";
  import StarNationGeneratorConfig from "$lib/starnations/generatorconfig";
  import { onMount } from "svelte";

  let config: StarNationGeneratorConfig;
  let gen: StarNationGenerator;
  let nation: StarNation;

  let seed = RND.randomString(13);

  const imageWidth = 64;
  const imageHeight = 64;

  function generate() {
    random.use(seedrandom(seed));
    nation = gen.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  onMount(() => {
    config = new StarNationGeneratorConfig();
    gen = new StarNationGenerator(config);
    newSeed();
  });
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/scifi.scss';

  .star-system { display: flex; width: 100%; flex-wrap: wrap; }
</style>

<svelte:head>
  <title>Star Nation Generator | Iron Arachne</title>
</svelte:head>

<section class="scifi main">
  <h1>Star Nation Generator</h1>

  <p>Generate a star nation.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  {#if nation }
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
    <div class="image-container">
      <img alt="{ nation.systems[nation.capitalSystem].stars[0].name } image" src="{ WebGLStarRenderer.render(nation.systems[nation.capitalSystem].stars[0], imageWidth, imageHeight) }" />
    </div>
    {#each nation.systems[nation.capitalSystem].planets as planet}
    <div class="image-container">
      <img alt="{ planet.name } image" src="{ WebGLPlanetRenderer.render(planet, imageWidth, imageHeight) }" />
    </div>
    {/each}
  </div>
  {/if}
</section>
