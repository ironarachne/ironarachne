<script lang="ts">
  import { getContext } from 'svelte';
  import * as MUN from "@ironarachne/made-up-names";
  import * as RND from "@ironarachne/rng";
  import * as CommonSpecies from "$lib/species/common.js";
  import * as ReligionCategories from "$lib/religion/categories/categories.js";
  import type Species from "$lib/species/species";
  import random from "random";
  import ReligionGenerator from "$lib/religion/generator";
  import ReligionGeneratorConfig from "$lib/religion/generatorconfig";
  import seedrandom from "seedrandom";
  import type Culture from '$lib/culture/culture';

  const user = getContext('user');

  let humanNameGenSet = new MUN.HumanSet();
  let savedCulture: string;
  let useSavedCulture: boolean = false;
  let culture: Culture;

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let genConfig = new ReligionGeneratorConfig();
  let generator = new ReligionGenerator(genConfig);
  let religion = generator.generate();
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

  let selectedSpecies: string[] = ["human"];
  let selectedCategories: string[] = ["polytheism"];

  function generate() {
    random.use(seedrandom(seed));
    if (humanNameGenSet.family === null) {
      throw new Error("Name set does not have a family name generator.")
    }
    if (humanNameGenSet.female === null) {
      throw new Error("Name set does not have a female name generator.")
    }
    if (humanNameGenSet.male === null) {
      throw new Error("Name set does not have a male name generator.")
    }
    let speciesOptions: Species[] = [];
    for (let i=0;i<selectedSpecies.length;i++) {
      speciesOptions.push(CommonSpecies.byName(selectedSpecies[i], allSpecies));
    }

    let categoryOptions = [];
    for (let i=0;i<selectedCategories.length;i++) {
      categoryOptions.push(ReligionCategories.byName(selectedCategories[i], allReligionCategories));
    }

    generator.config.deitySpeciesOptions = speciesOptions;
    generator.config.categories = categoryOptions;
    generator.config.nameGenerator = humanNameGenSet.family;
    generator.config.femaleNameGenerator = humanNameGenSet.female;
    generator.config.maleNameGenerator = humanNameGenSet.male;

    if (useSavedCulture) {
      loadSavedCulture();

      if (culture.generatorSet.family !== null) {
        generator.config.nameGenerator = culture.generatorSet.family;
      }
      if (culture.generatorSet.female !== null) {
        generator.config.femaleNameGenerator = culture.generatorSet.female;
      }
      if (culture.generatorSet.male !== null) {
        generator.config.maleNameGenerator = culture.generatorSet.male;
      }
    } else {
      generator.config.nameGenerator = humanNameGenSet.family;
      generator.config.femaleNameGenerator = humanNameGenSet.female;
      generator.config.maleNameGenerator = humanNameGenSet.male;
    }

    religion = generator.generate();
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

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';

  .input-group {
    ul > li {
      list-style: none;
    }
  }
</style>

<svelte:head>
  <title>Religion Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Religion Generator</h1>

  <p>Generate a fictional fantasy religion.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>

  <div class="input-group">
    <label for="selected-categories">Allow these religion categories</label>
    {#each allReligionCategoriesNames as categoryName}
    <ul>
      <li><input type="checkbox" name="selected-categories" bind:group={selectedCategories} id="selected-categories" value={categoryName} /> {categoryName}</li>
    </ul>
    {/each}
  </div>

  <div class="input-group">
    <label for="selected-species">Allow deities of these species</label>
    {#each allSpeciesNames as speciesName}
    <ul>
      <li><input type="checkbox" name="selected-species" bind:group={selectedSpecies} id="selected-species" value={speciesName} /> {speciesName}</li>
    </ul>
    {/each}
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

      <p>{member.deity.titles.join(",")}</p>

      <p><strong>Holy Item:</strong> {member.deity.holyItem}</p>
      <p><strong>Holy Symbol:</strong> {member.deity.holySymbol}</p>

      <p>{member.deity.description}</p>
    </div>
  {/each}
  {/if}
</section>
