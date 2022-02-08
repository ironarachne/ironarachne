<script lang="ts">
  import * as Heraldry from "../modules/heraldry/heraldry";
  import * as RND from "../modules/random";
  import * as RegionGenerator from "../modules/region/generator";
  import * as Words from "../modules/words";
  import * as MapBiomes from "../modules/region/maps/biomes";

  import random from "random";
  import seedrandom from "seedrandom";
  import RegionMapGeneratorConfig from "../modules/region/maps/generatorconfig";
  import RegionMapGenerator from "../modules/region/maps/generator";
  import MapFeature from "../modules/region/maps/feature";
  import MeshMapSVGRenderer from "../modules/region/maps/renderers/meshsvg";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let region = RegionGenerator.generate();
  let ruler = region.sovereign.authority;
  let mapGenConfig = new RegionMapGeneratorConfig(60, 40);
  mapGenConfig.elevationTransform = MapBiomes.getElevationFunctionForBiome(region.environment.biome.name);
  mapGenConfig.humidityTransform = MapBiomes.getHumidityFunctionForBiome(region.environment.biome.name);
  mapGenConfig.temperatureTransform = MapBiomes.getTemperatureFunctionForBiome(region.environment.biome.name);
  let mapFeatures = [];

  for (let i=0;i<region.settlements.length;i++) {
    let feature = new MapFeature(region.settlements[i].name, region.settlements[i].category.name);
    mapFeatures.push(feature);
  }
  mapGenConfig.features = mapFeatures;

  let mapGen = new RegionMapGenerator(mapGenConfig);
  let map = mapGen.generateMesh();
  let mapRenderer = new MeshMapSVGRenderer(map);
  let mapSVG = mapRenderer.render();

  function generate() {
    random.use(seedrandom(seed));
    region = RegionGenerator.generate();
    ruler = region.sovereign.authority;
    mapGenConfig = new RegionMapGeneratorConfig(60, 40);
    mapGenConfig.elevationTransform = MapBiomes.getElevationFunctionForBiome(region.environment.biome.name);
    mapGenConfig.humidityTransform = MapBiomes.getHumidityFunctionForBiome(region.environment.biome.name);
    mapGenConfig.temperatureTransform = MapBiomes.getTemperatureFunctionForBiome(region.environment.biome.name);
    mapFeatures = [];

    for (let i=0;i<region.settlements.length;i++) {
      let feature = new MapFeature(region.settlements[i].name, region.settlements[i].category.name);
      mapFeatures.push(feature);
    }
    mapGenConfig.features = mapFeatures;
    mapGen = new RegionMapGenerator(mapGenConfig);
    map = mapGen.generateMesh();
    mapRenderer = new MeshMapSVGRenderer(map);
    mapSVG = mapRenderer.render();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<svelte:head>
  <title>Region Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Region Generator</h2>

  <p>Generate fantasy regions.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h3>{Words.capitalize(region.name)}</h3>

  <p>{region.description}</p>

  <div class="region-map">{@html mapSVG}</div>

  <h4>Claimants</h4>

  {#each region.claimants as claimant}
  <div class="claimant">
    <div class="claimant-arms">{@html Heraldry.renderSVG(claimant.heraldry.device, 64, 64)}</div>
    <div><strong>{Words.capitalize(claimant.name)}</strong></div>
    <div>{claimant.description}.</div>
  </div>
  {/each}

  <h4>Ruler: {ruler.getPrimaryTitle()} {ruler.firstName} {ruler.lastName}</h4>

  <div class="ruler">
    <div class="ruler-arms">{@html Heraldry.renderSVG(ruler.heraldry.device, 200, 220)}</div>
    <div><p>{Words.capitalize(region.name)} is ruled by {ruler.getPrimaryTitle()} {ruler.firstName} {ruler.lastName}. {ruler.description}</p></div>
  </div>

  <h4>Notable Settlements</h4>
  {#each region.settlements as settlement}
    <article>
      <h5>{settlement.name}</h5>
      <p>{settlement.description}</p>
    </article>
  {/each}
  <h4>Notable Organizations</h4>
  {#each region.organizations as organization}
    <article>
      <h5>{organization.name}</h5>
      <p>{organization.description}</p>
    </article>
  {/each}
</section>

<style>
  div.claimant {
    display: grid;
    grid-template-columns: 70px 200px auto;
  }

  div.claimant > div {
    align-self: start;
  }

  div.ruler {
    display: grid;
    column-gap: 1rem;
    margin-bottom: 1rem;
    grid-template-columns: 210px auto;
  }

  div.ruler-arms {
    align-self: start;
    width: 200px;
    height: 220px;
    margin: 0 auto;
  }
</style>
