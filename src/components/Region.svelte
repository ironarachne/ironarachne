<script lang="ts">
    import * as RND from "../modules/random";
  import RegionGeneratorConfig from "../modules/region/generatorconfig";
  import RegionGenerator from "../modules/region/generator";
  import * as Words from "../modules/words";

  import random from "random";
  import seedrandom from "seedrandom";
  import HeraldrySVGRenderer from "../modules/heraldry/renderers/svg";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let config = new RegionGeneratorConfig();
  let generator = new RegionGenerator(config);
  let heraldryRenderer = new HeraldrySVGRenderer();
  let region = generator.generate();
  let ruler = region.authority;

  function generate() {
    random.use(seedrandom(seed));
    region = generator.generate();
    ruler = region.authority;
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

  {#if region.realms[region.mainRealm].parent != -1}
  <p>{Words.title(region.name)} is part of {region.realms[region.realms[region.mainRealm].parent].name}.</p>
  {/if}

  <h4>Ruler: {ruler.getHonorific()} {ruler.firstName} {ruler.lastName}</h4>

  <div class="ruler">
    <div class="ruler-arms">{@html heraldryRenderer.render(ruler.heraldry.device, 200, 220)}</div>
    <div><p>{Words.capitalize(region.name)} is ruled by {ruler.getHonorific()} {ruler.firstName} {ruler.lastName}. {ruler.description}</p></div>
  </div>

  <h4>Nearby Realms</h4>

  {#each region.realms as neighbor, index}
    {#if index != region.mainRealm && index != region.realms[region.mainRealm].parent}
    <div class="neighbor">
      <div class="neighbor-arms">{@html heraldryRenderer.render(neighbor.heraldry.device, 80, 88)}</div>
      <div>
        <p><strong>{Words.title(neighbor.name)}</strong>{#if neighbor.parent != -1}, part of {region.realms[neighbor.parent].name}{/if}.</p>
        <p>Ruled by {neighbor.authority.getHonorific()} {neighbor.authority.name}, {Words.article(neighbor.authority.species.adjective)} {neighbor.authority.species.adjective} {neighbor.authority.ageCategory.noun}.</p>
      </div>
    </div>
    {/if}
  {/each}

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

  div.neighbor {
    display: grid;
    column-gap: 1rem;
    margin-bottom: 0.5rem;
    grid-template-columns: 80px auto;
  }

  div.neighbor > div {
    align-self: start;
  }

  div.neighbor > div > p {
    margin: 0;
  }

  div.neighbor-arms {
    justify-self: center;
    width: 80px;
    height: 88px;
    margin: 0 auto;
  }
</style>
