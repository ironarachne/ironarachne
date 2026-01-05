<script lang="ts">
  import { getContext } from 'svelte';
  import * as Names from '$lib/names';
  import * as RNG from '@ironarachne/rng';
  import * as CommonSpecies from '$lib/species/common.js';
  import * as ReligionCategories from '$lib/religion/categories';
  import type Species from '$lib/species/species';

  import ReligionGenerator from '$lib/religion/generator';
  import ReligionGeneratorConfig from '$lib/religion/generatorconfig';

  import type Culture from '$lib/culture/culture';

  import type { Writable } from 'svelte/store';
  import type UserData from '$lib/user_data';

  const userStore = getContext<Writable<UserData>>('user');

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let humanNameGenSet = Names.getFantasyNameGeneratorSet('human', rng);
  let savedCulture: string | undefined = $state();
  let useSavedCulture: boolean = $state(false);
  let culture: Culture;
  let genConfig = new ReligionGeneratorConfig();
  let generator = new ReligionGenerator(genConfig);
  let religion = $state(generator.generate());
  let allSpeciesNames: string[] = [];
  const allSpecies = CommonSpecies.sentient();
  const allReligionCategories = ReligionCategories.all();
  let allReligionCategoriesNames: string[] = [];

  for (let i = 0; i < allSpecies.length; i++) {
    allSpeciesNames.push(allSpecies[i].name);
  }

  for (let i = 0; i < allReligionCategories.length; i++) {
    allReligionCategoriesNames.push(allReligionCategories[i].name);
  }

  let selectedSpecies: string[] = $state(['human']);
  let selectedCategories: string[] = $state(['polytheism']);

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    if (humanNameGenSet.family === null) {
      throw new Error('Name set does not have a family name generator.');
    }
    if (humanNameGenSet.female === null) {
      throw new Error('Name set does not have a female name generator.');
    }
    if (humanNameGenSet.male === null) {
      throw new Error('Name set does not have a male name generator.');
    }
    let speciesOptions: Species[] = [];
    for (let i = 0; i < selectedSpecies.length; i++) {
      speciesOptions.push(CommonSpecies.byName(selectedSpecies[i], allSpecies));
    }

    let categoryOptions = [];
    for (let i = 0; i < selectedCategories.length; i++) {
      categoryOptions.push(ReligionCategories.byName(selectedCategories[i], allReligionCategories));
    }

    generator.config.deitySpeciesOptions = speciesOptions;
    generator.config.categories = categoryOptions;
    generator.config.nameGenerator = humanNameGenSet.family;
    generator.config.femaleNameGenerator = humanNameGenSet.female;
    generator.config.maleNameGenerator = humanNameGenSet.male;

    if (useSavedCulture) {
      loadSavedCulture();

      if (culture.nameGenerators.family !== null) {
        generator.config.nameGenerator = culture.nameGenerators.family;
      }
      if (culture.nameGenerators.female !== null) {
        generator.config.femaleNameGenerator = culture.nameGenerators.female;
      }
      if (culture.nameGenerators.male !== null) {
        generator.config.maleNameGenerator = culture.nameGenerators.male;
      }
    } else {
      generator.config.nameGenerator = humanNameGenSet.family;
      generator.config.femaleNameGenerator = humanNameGenSet.female;
      generator.config.maleNameGenerator = humanNameGenSet.male;
    }

    religion = generator.generate();
  }

  function loadSavedCulture() {
    for (let i = 0; i < $userStore.savedCultures.length; i++) {
      if ($userStore.savedCultures[i].name === savedCulture) {
        culture = $userStore.savedCultures[i];
      }
    }
  }
</script>

<svelte:head>
  <title>Religion Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Religion Generator</h1>

  <p>Generate a fictional fantasy religion.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="selected-categories">Allow these religion categories</label>
    {#each allReligionCategoriesNames as categoryName}
      <ul>
        <li>
          <input
            type="checkbox"
            name="selected-categories"
            bind:group={selectedCategories}
            id="selected-categories"
            value={categoryName}
          />
          {categoryName}
        </li>
      </ul>
    {/each}
  </div>

  <div class="input-group">
    <label for="selected-species">Allow deities of these species</label>
    {#each allSpeciesNames as speciesName}
      <ul>
        <li>
          <input
            type="checkbox"
            name="selected-species"
            bind:group={selectedSpecies}
            id="selected-species"
            value={speciesName}
          />
          {speciesName}
        </li>
      </ul>
    {/each}
  </div>

  {#if $userStore && $userStore.savedCultures !== undefined && $userStore.savedCultures.length > 0}
    <div class="input-group">
      <label for="useSavedCulture">Use a saved culture for naming?</label>
      <input
        type="checkbox"
        name="useSavedCulture"
        bind:checked={useSavedCulture}
        id="useSavedCulture"
      />
    </div>

    <div class="input-group">
      <label for="savedCulture">Select a saved culture to load</label>
      <select bind:value={savedCulture}>
        {#each $userStore.savedCultures as saved}
          <option value={saved.name}>{saved.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <button onclick={generate}>Generate</button>

  <h2>{religion.name}</h2>

  <p>{religion.description}</p>

  <h3>Realms</h3>

  {#each religion.realms as realm}
    <div>
      <h4>{realm.name}</h4>
      <p>{realm.description}</p>
    </div>
  {/each}

  {#if religion.pantheon !== null}
    <h3>Deities</h3>

    <p>{religion.pantheon.description}</p>

    {#each religion.pantheon.members as member}
      <div>
        <h4>{member.deity.name}</h4>

        <p>{member.deity.titles.join(',')}</p>

        <p><strong>Holy Item:</strong> {member.deity.holyItem}</p>
        <p><strong>Holy Symbol:</strong> {member.deity.holySymbol}</p>

        <p>{member.deity.description}</p>
      </div>
    {/each}
  {/if}
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';

  .input-group {
    ul > li {
      list-style: none;
    }
  }
</style>
