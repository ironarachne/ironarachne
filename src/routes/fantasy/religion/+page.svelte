<script lang="ts">
  import { getContext } from 'svelte';
  import * as MUN from "@ironarachne/made-up-names";
  import * as RND from "@ironarachne/rng";
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

  <h3>Deities</h3>

  {#if religion.pantheon}
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
