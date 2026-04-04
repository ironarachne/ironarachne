<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { getContext } from 'svelte';
  import type UserData from '$lib/user_data';
  import { generateCulture, getDefaultCultureGenerationConfig, type Culture, type CultureGenerationConfig } from '$lib/culture';
  import { getAllFantasyNameGeneratorSets, type NameGeneratorSet } from '$lib/names';

  const user: UserData = getContext('user');
  const rng = new RNG.RNG(Date.now());
  const allNameSets = getAllFantasyNameGeneratorSets(rng);

  if (user.savedCultures === undefined) {
    user.savedCultures = [];
  }

  let savedCulture: string | undefined = $state();

  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  const genConfig = getDefaultCultureGenerationConfig();
  let genSet: NameGeneratorSet = rng.item(allNameSets);
  genConfig.nameGenerators = genSet;
  let culture = $state(generateCulture(seed, genConfig));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    genSet = rng.item(allNameSets);
    genConfig.nameGenerators = genSet;
    culture = generateCulture(seed, genConfig);
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

<section class="fantasy main">
  <h1>Culture Generator</h1>
  <p>This generator lets you create fantasy cultures.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>
  <button onclick={saveCulture}>Save Current Culture</button>

  <h2>Saved Cultures</h2>

  <div class="input-group">
    <label for="savedCulture">Select a saved culture to load</label>
    <select bind:value={savedCulture}>
      {#each user.savedCultures as saved}
        <option value={saved.name}>{saved.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <button onclick={loadSavedCulture}>Load Selected Culture</button>
  </div>

  <h2>The {culture.name} Culture</h2>

  <h3>Common Names</h3>

  <div class="namelist">
    <div>
      <h4>Male Names</h4>
      <ul>
        {#each culture.nameGenerators.male.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h4>Female Names</h4>
      <ul>
        {#each culture.nameGenerators.female.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h4>Family Names</h4>
      <ul>
        {#each culture.nameGenerators.family.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="namelist">
    <div>
      <h4>Country Names</h4>

      <ul>
        {#each culture.nameGenerators.country.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h4>Town Names</h4>

      <ul>
        {#each culture.nameGenerators.town.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
  </div>

  <h3>Organization</h3>

  <p>{culture.organization.description}</p>

  <h3>Religion</h3>

  <p>{culture.religion.description}</p>

  <h3>Taboos</h3>

  {#each culture.taboos as taboo}
    <p>{taboo}</p>
  {/each}

  <h3>Greetings</h3>

  <p>{culture.greeting}</p>

  <h3>Meals</h3>

  <p>{culture.eatingTrait}</p>

  <h3>Design</h3>

  <p>{culture.designTrait}</p>

  <h3>Music</h3>

  <p>{culture.musicStyle}</p>
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';

  .namelist {
    display: grid;
    grid-template-columns: auto auto auto;
    align-items: start;
    justify-items: center;
  }
</style>
