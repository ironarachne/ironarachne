<script lang="ts">
  import { getContext } from 'svelte';
  import * as RND from "@ironarachne/rng";
  import RegionGeneratorConfig from "$lib/region/generatorconfig";
  import RegionGenerator from "$lib/region/generator";
  import * as Words from "@ironarachne/words";
  import * as MUN from "@ironarachne/made-up-names";
  import random from "random";
  import seedrandom from "seedrandom";
  import HeraldrySVGRenderer from "$lib/heraldry/renderers/svg";
  import type Culture from '$lib/culture/culture';

  const user = getContext('user');
  let savedCulture: string;
  let useSavedCulture: boolean = false;
  let culture: Culture;

  let seed = RND.randomString(13);
  let nameSetName = 'any';
  let nameSet = RND.item(MUN.cultureSets());
  let nameSets = MUN.cultureSets();
  random.use(seedrandom(seed));
  let config = new RegionGeneratorConfig();
  config.nameGeneratorSet = nameSet;
  let generator = new RegionGenerator(config);
  let heraldryRenderer = new HeraldrySVGRenderer();
  let region = generator.generate();
  let ruler = region.authority;

  function generate() {
    random.use(seedrandom(seed));

    generator.config.dominantCulture = null;
    if (useSavedCulture) {
      loadSavedCulture();
      generator.config.dominantCulture = culture;
      nameSet = culture.generatorSet;
    } else {
      if (nameSetName == 'any') {
        nameSet = RND.item(MUN.cultureSets());
      } else {
        MUN.cultureSets().forEach(element => {
          if (element.name == nameSetName) {
            nameSet = element;
          }
        });
      }
    }

    generator.config.nameGeneratorSet = nameSet;

    region = generator.generate();
    ruler = region.authority;
  }

  function loadSavedCulture() {
    for (let i = 0; i < user.savedCultures.length; i++) {
      if (user.savedCultures[i].name === savedCulture) {
        culture = user.savedCultures[i];
      }
    }
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
  <h1>Region Generator</h1>

  <p>Generate fantasy regions.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>

  <div class="input-group">
    <label for="names">Name Set</label>
    <select name="names" bind:value={nameSetName} id="nameSet">
      <option>any</option>
      {#each nameSets as nameSet}
        <option>{nameSet.name}</option>
      {/each}
    </select>
  </div>

  {#if user.savedCultures !== undefined && user.savedCultures.length > 0}
  <div class="input-group">
    <label for="useSavedCulture">Use a saved culture for naming?</label>
    <input type="checkbox" name="useSavedCulture" bind:checked={useSavedCulture} id="useSavedCulture" />
  </div>

  <div class="input-group">
    <label for="savedCulture">Select a saved culture to load</label>
    <select bind:value={savedCulture}>
      {#each user.savedCultures as saved}
      <option value={saved.name}>{ saved.name }</option>
      {/each}
    </select>
  </div>
  {/if}

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{Words.capitalize(region.name)}</h2>

  <p>{region.description}</p>

  {#if region.dominantCulture != null}

  <p>The dominant culture here is the {region.dominantCulture.name}.</p>

  {/if}

  {#if region.realms[region.mainRealm].parent != -1}
  <div class="parent-realm">
    <p>{Words.title(region.name)} is part of {region.realms[region.realms[region.mainRealm].parent].name} {@html heraldryRenderer.render(region.realms[region.realms[region.mainRealm].parent].heraldry.device, 20, 22)}.</p>
  </div>
  {/if}

  <h3>Ruler: {ruler.getHonorific()} {ruler.firstName} {ruler.lastName}</h3>

  <div class="ruler">
    {#if ruler.heraldry !== null}
    <div class="ruler-arms">{@html heraldryRenderer.render(ruler.heraldry.device, 200, 220)}</div>
    {/if}
    <div><p>{Words.capitalize(region.name)} is ruled by {ruler.getHonorific()} {ruler.firstName} {ruler.lastName}. {ruler.description}</p></div>
  </div>

  <h3>Nearby Sovereignties</h3>

  {#each region.realms as neighbor, index}
    {#if index != region.mainRealm && neighbor.parent == -1}
    <div class="neighbor">
      <div class="neighbor-arms">{@html heraldryRenderer.render(neighbor.heraldry.device, 80, 88)}</div>
      <div>
        <p><strong>{Words.title(neighbor.name)}</strong></p>
        <p>Ruled by {neighbor.authority.getHonorific()} {neighbor.authority.name}, {Words.article(neighbor.authority.species.adjective)} {neighbor.authority.species.adjective} {neighbor.authority.ageCategory.noun}.</p>
        {#if region.realms[region.mainRealm].parent == index}
          <p>{Words.title(region.realms[region.mainRealm].name)} is part of this.</p>
        {/if}
      </div>
    </div>
    {/if}
  {/each}

  <h3>Nearby Realms</h3>

  {#each region.realms as neighbor, index}
    {#if index != region.mainRealm && index != region.realms[region.mainRealm].parent && neighbor.parent != -1}
    <div class="neighbor">
      <div class="neighbor-arms">{@html heraldryRenderer.render(neighbor.heraldry.device, 80, 88)}</div>
      <div>
        <p><strong>{Words.title(neighbor.name)}</strong>, part of {region.realms[neighbor.parent].name} {@html heraldryRenderer.render(region.realms[neighbor.parent].heraldry.device, 20, 22)}.</p>
        <p>Ruled by {neighbor.authority.getHonorific()} {neighbor.authority.name}, {Words.article(neighbor.authority.species.adjective)} {neighbor.authority.species.adjective} {neighbor.authority.ageCategory.noun}.</p>
      </div>
    </div>
    {/if}
  {/each}

  <h3>Notable Settlements in {region.name}</h3>
  {#each region.settlements as settlement}
    <article>
      <h5>{settlement.name}</h5>
      <p>{settlement.description}</p>
    </article>
  {/each}
  <h3>Notable Organizations</h3>
  {#each region.organizations as organization}
    <article>
      <h5>{organization.name}</h5>
      <p>{organization.description}</p>
    </article>
  {/each}
</section>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';

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
