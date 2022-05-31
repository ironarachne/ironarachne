<script lang="ts">
  import * as FantasySpecies from "../modules/species/fantasy";
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";
  import FamilyGeneratorConfig from "../modules/characters/family/generatorconfig";
  import FamilyGenerator from "../modules/characters/family/generator";
  import Gender from "../modules/gender";
  import type Species from "../modules/species/species";

  let seed = RND.randomString(13);
  let availableSpecies = FantasySpecies.pc();
  let selectedSpecies = "any";
  let species = FantasySpecies.randomWeighted();
  let iterations = 2;
  let familyNameGen = species.nameGeneratorSet.family;
  let femaleNameGen = species.nameGeneratorSet.female;
  let maleNameGen = species.nameGeneratorSet.male;
  let lastNameTradition = "male";
  let config = new FamilyGeneratorConfig(species, iterations, familyNameGen, femaleNameGen, maleNameGen, getDominantGender());
  let generator = new FamilyGenerator(config);
  let family = generator.generate();

  function generate() {
    random.use(seedrandom(seed));
    species = getSpecies(selectedSpecies);
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
  }

  function getSpecies(name: string): Species {
    if (name == "any") {
      return FantasySpecies.randomWeighted();
    }

    for (let i=0;i<availableSpecies.length;i++) {
      if (availableSpecies[i].name == name) {
        return availableSpecies[i];
      }
    }
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<svelte:head>
  <title>Fantasy Family Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Fantasy Family Generator</h2>

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

  <h3>The {family.name} Family</h3>

  {#each family.members as member}
    <h4>{member.character.firstName} {member.character.lastName}</h4>
    <p>{member.character.age}-year-old {member.character.species.name} {member.character.ageCategory.noun} {#if member.character.status == "dead"}(dead){/if}</p>
    <p>{member.character.description}</p>
    {#if member.mate != -1}
      <p><strong>Mate:</strong> {family.getMate(member).character.firstName} {family.getMate(member).character.lastName}</p>
    {/if}
    {#if member.children.length > 0}
      <h5>Children</h5>
      <ul>
        {#each family.getChildren(member) as child}
          <li>{child.character.firstName} {child.character.lastName}</li>
        {/each}
      </ul>
    {/if}
    {#if member.parents.length > 0}
      <h5>Parents</h5>
      <ul>
        {#each family.getParents(member) as parent}
          <li>{parent.character.firstName} {parent.character.lastName}</li>
        {/each}
      </ul>
    {/if}
  {/each}
</section>
