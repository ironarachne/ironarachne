<script lang="ts">
  import * as CommonSpecies from '$lib/species/common';
  import * as FantasySpecies from "$lib/species/fantasy";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";
  import FamilyGeneratorConfig from "$lib/characters/family/generatorconfig";
  import FamilyGenerator from "$lib/characters/family/generator";
  import type Gender from "$lib/gender";
  import type Species from "$lib/species/species";
  import type NameGenerator from '@ironarachne/made-up-names/dist/generator';

  let seed = RND.randomString(13);
  let availableSpecies = FantasySpecies.pc();
  let selectedSpecies = "any";
  let species = CommonSpecies.randomWeighted(availableSpecies);
  let iterations = 2;
  if (species.nameGeneratorSet.family === null) {
    throw new Error("Species does not have a family name generator.")
  }
  if (species.nameGeneratorSet.female === null) {
    throw new Error("Species does not have a female name generator.")
  }
  if (species.nameGeneratorSet.male === null) {
    throw new Error("Species does not have a male name generator.")
  }
  let familyNameGen: NameGenerator = species.nameGeneratorSet.family;
  let femaleNameGen: NameGenerator = species.nameGeneratorSet.female;
  let maleNameGen: NameGenerator = species.nameGeneratorSet.male;
  let lastNameTradition = "male";
  let config = new FamilyGeneratorConfig(species, iterations, familyNameGen, femaleNameGen, maleNameGen, getDominantGender());
  let generator = new FamilyGenerator(config);
  let family = generator.generate();

  function generate() {
    random.use(seedrandom(seed));
    species = getSpecies(selectedSpecies);
    if (species.nameGeneratorSet.family === null) {
      throw new Error("Species does not have a family name generator.")
    }
    if (species.nameGeneratorSet.female === null) {
      throw new Error("Species does not have a female name generator.")
    }
    if (species.nameGeneratorSet.male === null) {
      throw new Error("Species does not have a male name generator.")
    }
    familyNameGen = species.nameGeneratorSet.family;
    femaleNameGen = species.nameGeneratorSet.female;
    maleNameGen = species.nameGeneratorSet.male;
    config = new FamilyGeneratorConfig(species, iterations, familyNameGen, femaleNameGen, maleNameGen, getDominantGender());
    generator.config = config;
    family = generator.generate();
  }

  function getDominantGender(): Gender {
    for (let i=0;i<species.genders.length;i++) {
      if (species.genders[i].name == lastNameTradition) {
        return species.genders[i];
      }
    }

    throw new Error("Dominant gender not set");
  }

  function getSpecies(name: string): Species {
    if (name == "any") {
      return CommonSpecies.randomWeighted(availableSpecies);
    }

    for (let i=0;i<availableSpecies.length;i++) {
      if (availableSpecies[i].name == name) {
        return availableSpecies[i];
      }
    }

    throw new Error("Species not found");
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
  <title>Fantasy Family Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Family Generator</h1>

  <p>This generator creates a family. Note that more than 10 iterations can be quite slow. More than 30 may or may not crash your browser.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <div class="input-group">
    <label for="iterations">Iterations</label>
    <input type="number" name="iterations" bind:value={iterations} id="iterations" min="1" max="10" />
  </div>

  <div class="input-group">
    <label for="species">Species</label>
    <select id="species" bind:value={selectedSpecies}>
      <option>any</option>
      {#each availableSpecies as option}
      <option>{option.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="last-name-tradition">Last name tradition (gender)</label>
    <select id="last-name-tradition" bind:value={lastNameTradition}>
      <option>male</option>
      <option>female</option>
    </select>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>The {family.name} Family</h2>

  {#each family.members as member}
    <h3>{member.character.firstName} {member.character.lastName}</h3>
    <p>{member.character.age}-year-old {member.character.species.name} {member.character.ageCategory.noun} {#if member.character.status == "dead"}(dead){/if}</p>
    <p>{member.character.description}</p>
    {#if member.mate != -1}
      <p><strong>Mate:</strong> {family.getMate(member).character.firstName} {family.getMate(member).character.lastName}</p>
    {/if}
    {#if member.children.length > 0}
      <h4>Children</h4>
      <ul>
        {#each family.getChildren(member) as child}
          <li>{child.character.firstName} {child.character.lastName}</li>
        {/each}
      </ul>
    {/if}
    {#if member.parents.length > 0}
      <h4>Parents</h4>
      <ul>
        {#each family.getParents(member) as parent}
          <li>{parent.character.firstName} {parent.character.lastName}</li>
        {/each}
      </ul>
    {/if}
  {/each}
</section>
