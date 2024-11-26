<script lang="ts">
  import * as RND from "@ironarachne/rng";
  import * as MUN from "@ironarachne/made-up-names";
  import { getContext } from 'svelte';
  import random from "random";
  import seedrandom from "seedrandom";
  import CultureGeneratorConfig from "$lib/culture/generatorconfig";
  import CultureGenerator from "$lib/culture/generator";

  const user = getContext('user');

  if (user.savedCultures === undefined) {
    user.savedCultures = [];
  }

  let savedCulture: string;

  let seed = RND.randomString(13);
  let lockSeed = false;
  const genConfig = new CultureGeneratorConfig();
  let genSet: MUN.GeneratorSet = RND.item(MUN.cultureSets());
  genConfig.generatorSet = genSet;
  const generator = new CultureGenerator(genConfig);
  let culture = generator.generate();

  function generate() {
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));
    genSet = RND.item(MUN.cultureSets());
    generator.config.generatorSet = genSet;
    culture = generator.generate();
  }

  function loadSavedCulture() {
    for (let i = 0; i < user.savedCultures.length; i++) {
      if (user.savedCultures[i].name === savedCulture) {
        culture = user.savedCultures[i];
      }
    }
  }

  function saveCulture() {
    user.savedCultures.push(culture);
  }
</script>

<svelte:head>
  <title>Culture Generator | Iron Arachne</title>
</svelte:head>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';

  .namelist {
    display: grid;
    grid-template-columns: auto auto auto;
    align-items: start;
    justify-items: center;
  }
</style>

<section class="fantasy main">
  <h1>Culture Generator</h1>
  <p>This generator lets you create fantasy cultures.</p>
  
  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>
  
  <button on:click={generate}>Generate</button>
  <button on:click={saveCulture}>Save Current Culture</button>

  <h2>Saved Cultures</h2>

  <div class="input-group">
    <label for="savedCulture">Select a saved culture to load</label>
    <select bind:value={savedCulture}>
      {#each user.savedCultures as saved}
      <option value={saved.name}>{ saved.name }</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <button on:click={loadSavedCulture}>Load Selected Culture</button>
  </div>

  <h2>The { culture.name } Culture</h2>

  <h3>Common Names</h3>

  <div class="namelist">
    <div>
      <h5>Male Names</h5>
      <ul>
      {#each culture.maleNames as name}
        <li>{ name }</li>
      {/each}
      </ul>
    </div>
    <div>
      <h5>Female Names</h5>
      <ul>
        {#each culture.femaleNames as name}
      <li>{ name }</li>
      {/each}
      </ul>
    </div>
    <div>
      <h5>Family Names</h5>
      <ul>
        {#each culture.familyNames as name}
        <li>{ name }</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="namelist">
    <div>
      <h5>Country Names</h5>

      <ul>
        {#each culture.countryNames as name}
        <li>{ name }</li>
        {/each}
      </ul>
    </div>
    <div>
      <h5>Town Names</h5>

      <ul>
        {#each culture.townNames as name}
        <li>{ name }</li>
        {/each}
      </ul>
    </div>
  </div>



  <h3>Organization</h3>

  <p>{ culture.organization.description }</p>

  <h3>Religion</h3>

  <p>{ culture.religion.description }</p>

  <h3>Taboos</h3>

  {#each culture.taboos as taboo}
  <p>{taboo}</p>
  {/each}

  <h3>Greetings</h3>

  <p>{ culture.greeting }</p>

  <h3>Meals</h3>

  <p>{ culture.eatingTrait }</p>

  <h3>Design</h3>

  <p>{ culture.designTrait }</p>

  <h3>Music</h3>

  <p>{ culture.musicStyle.description }</p>
</section>
