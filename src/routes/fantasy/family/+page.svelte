<script lang="ts">
  import * as CommonSpecies from '$lib/species/common';
  import * as Families from '$lib/families';
  import * as Names from '$lib/names';
  import * as RNG from '@ironarachne/rng';
  import type Gender from '$lib/gender/gender';
  import type { NameGenerator } from '@ironarachne/made-up-names';
  import type Species from '$lib/species/species';
  import type { Character } from '$lib/characters/character_types';

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let availableSpecies = CommonSpecies.sentient();
  let selectedSpecies = $state('any');
  let species = CommonSpecies.randomWeighted(availableSpecies);
  let iterations: number = $state(3);
  let nameGeneratorSet;

  try {
    nameGeneratorSet = Names.getFantasyNameGeneratorSet(species.name, rng);
  } catch (e) {
    console.debug(e);
    nameGeneratorSet = Names.getFantasyNameGeneratorSet('human', rng);
  }

  let familyNameGen: NameGenerator = nameGeneratorSet.family;
  let femaleNameGen: NameGenerator = nameGeneratorSet.female;
  let maleNameGen: NameGenerator = nameGeneratorSet.male;
  let lastNameTradition = $state('male');

  // Config State
  let minMembersPerGeneration = $state(2);
  let maxMembersPerGeneration = $state(5);
  let allowAdoption = $state(false);
  let adoptionChance = $state(0.0);
  let allowIllegitimateChildren = $state(false);
  let illegitimateChildChance = $state(0.0);
  let allowMultipleMarriages = $state(false);
  let multipleMarriageChance = $state(0.0);
  let allowSameGenderMarriage = $state(false);
  let sameGenderMarriageChance = $state(0.0);
  let allowCrossSpeciesMarriages = $state(false);
  let crossSpeciesMarriageChance = $state(0.0);
  let infantMortalityChance = $state(0.01);
  let fertilityChance = $state(0.8);

  let config = Families.getDefaultFamilyGenerationConfig(seed + "-family");
  config.speciesOptions = [species];
  config.generations = iterations;
  config.familyNameGenerator = familyNameGen;
  config.femaleNameGenerator = femaleNameGen;
  config.maleNameGenerator = maleNameGen;
  config.dominantGender = getDominantGender().name;
  config.minMembersPerGeneration = minMembersPerGeneration;
  config.maxMembersPerGeneration = maxMembersPerGeneration;
  config.allowAdoption = allowAdoption;
  config.adoptionChance = adoptionChance;
  config.allowIllegitimateChildren = allowIllegitimateChildren;
  config.illegitimateChildChance = illegitimateChildChance;
  config.allowMultipleMarriages = allowMultipleMarriages;
  config.multipleMarriageChance = multipleMarriageChance;
  config.allowSameGenderMarriage = allowSameGenderMarriage;
  config.sameGenderMarriageChance = sameGenderMarriageChance;
  config.allowCrossSpeciesMarriages = allowCrossSpeciesMarriages;
  config.crossSpeciesMarriageChance = crossSpeciesMarriageChance;
  config.infantMortalityChance = infantMortalityChance;
  config.fertilityChance = fertilityChance;

  let family = $state(Families.generateFamilyGeneration(seed, config, Families.generateNewFamily(seed, config)));
  let familyTreeSVG = $state(Families.getFamilyTreeSVG(family));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    species = getSpecies(selectedSpecies);

    try {
      nameGeneratorSet = Names.getFantasyNameGeneratorSet(species.name, rng);
    } catch (e) {
      console.debug(e);
      nameGeneratorSet = Names.getFantasyNameGeneratorSet('human', rng);
    }

    familyNameGen = nameGeneratorSet.family;
    femaleNameGen = nameGeneratorSet.female;
    maleNameGen = nameGeneratorSet.male;
    config.speciesOptions = [species];
    config.generations = iterations;
    config.familyNameGenerator = familyNameGen;
    config.femaleNameGenerator = femaleNameGen;
    config.maleNameGenerator = maleNameGen;
    config.dominantGender = getDominantGender().name;
    config.minMembersPerGeneration = minMembersPerGeneration;
    config.maxMembersPerGeneration = maxMembersPerGeneration;
    config.allowAdoption = allowAdoption;
    config.adoptionChance = adoptionChance;
    config.allowIllegitimateChildren = allowIllegitimateChildren;
    config.illegitimateChildChance = illegitimateChildChance;
    config.allowMultipleMarriages = allowMultipleMarriages;
    config.multipleMarriageChance = multipleMarriageChance;
    config.allowSameGenderMarriage = allowSameGenderMarriage;
    config.sameGenderMarriageChance = sameGenderMarriageChance;
    config.allowCrossSpeciesMarriages = allowCrossSpeciesMarriages;
    config.crossSpeciesMarriageChance = crossSpeciesMarriageChance;
    config.infantMortalityChance = infantMortalityChance;
    config.fertilityChance = fertilityChance;

    family = Families.generateFamilyGeneration(seed, config, Families.generateNewFamily(seed, config));
    familyTreeSVG = Families.getFamilyTreeSVG(family);
  }

  function getDominantGender(): Gender {
    for (let i = 0; i < species.genders.length; i++) {
      if (species.genders[i].name === lastNameTradition) {
        return species.genders[i];
      }
    }

    throw new Error('Dominant gender not set');
  }

  function getSpecies(name: string): Species {
    if (name === 'any') {
      return CommonSpecies.randomWeighted(availableSpecies);
    }

    for (let i = 0; i < availableSpecies.length; i++) {
      if (availableSpecies[i].name === name) {
        return availableSpecies[i];
      }
    }

    throw new Error('Species not found');
  }

  function getGenderSymbol(gender: string): string {
    if (gender === 'male') return '♂';
    if (gender === 'female') return '♀';
    return '⚥';
  }

  function getMate(family: Families.Family, member: Character): Character | undefined {
    const relationship = family.relationships.find(
      (r) => r.type.name === 'spouse' && (r.originatorId === member.id || r.recipientId === member.id)
    );
    if (!relationship) return undefined;
    const mateId = relationship.originatorId === member.id ? relationship.recipientId : relationship.originatorId;
    return family.members.find((m) => m.id === mateId);
  }

  function getChildren(family: Families.Family, member: Character): Character[] {
    const relationships = family.relationships.filter(
      (r) => r.type.name === 'parent' && r.originatorId === member.id
    );
    const childrenIds = relationships.map((r) => r.recipientId);
    return family.members.filter((m) => childrenIds.includes(m.id));
  }

  function getParents(family: Families.Family, member: Character): Character[] {
     const relationships = family.relationships.filter(
      (r) => r.type.name === 'parent' && r.recipientId === member.id
    );
    const parentIds = relationships.map((r) => r.originatorId);
    return family.members.filter((m) => parentIds.includes(m.id));
  }
</script>

<svelte:head>
  <title>Fantasy Family Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Family Generator</h1>

  <p>
    This generator creates a family. Note that more than 10 iterations can be quite slow. More than
    30 may or may not crash your browser.
  </p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="iterations">Iterations</label>
    <input
      type="number"
      name="iterations"
      bind:value={iterations}
      id="iterations"
      min="1"
      max="10"
    />
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

  <div class="input-group">
    <label for="min-members">Min Children/Couple</label>
    <input type="number" id="min-members" bind:value={minMembersPerGeneration} min="0" max="15" />
    <label for="max-members">Max Children/Couple</label>
    <input type="number" id="max-members" bind:value={maxMembersPerGeneration} min="0" max="15" />
  </div>

  <div class="input-group">
    <label for="fertility-chance">Fertility Chance</label>
    <input
      type="number"
      id="fertility-chance"
      bind:value={fertilityChance}
      min="0"
      max="1"
      step="0.01"
    />
    <label for="infant-mortality">Infant Mortality</label>
    <input
      type="number"
      id="infant-mortality"
      bind:value={infantMortalityChance}
      min="0"
      max="1"
      step="0.01"
    />
  </div>

  <div class="input-group">
    <input type="checkbox" id="allow-adoption" bind:checked={allowAdoption} />
    <label for="allow-adoption">Allow Adoption</label>
    <input
      type="number"
      bind:value={adoptionChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowAdoption}
    />
  </div>

  <div class="input-group">
    <input
      type="checkbox"
      id="allow-illegitimate"
      bind:checked={allowIllegitimateChildren}
    />
    <label for="allow-illegitimate">Allow Illegitimate Children</label>
    <input
      type="number"
      bind:value={illegitimateChildChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowIllegitimateChildren}
    />
  </div>

  <div class="input-group">
    <input type="checkbox" id="allow-multiple-marriages" bind:checked={allowMultipleMarriages} />
    <label for="allow-multiple-marriages">Allow Multiple Marriages</label>
    <input
      type="number"
      bind:value={multipleMarriageChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowMultipleMarriages}
    />
  </div>

  <div class="input-group">
    <input type="checkbox" id="allow-same-gender" bind:checked={allowSameGenderMarriage} />
    <label for="allow-same-gender">Allow Same Gender Marriage</label>
    <input
      type="number"
      bind:value={sameGenderMarriageChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowSameGenderMarriage}
    />
  </div>

  <div class="input-group">
    <input type="checkbox" id="allow-cross-species" bind:checked={allowCrossSpeciesMarriages} />
    <label for="allow-cross-species">Allow Cross Species Marriage</label>
    <input
      type="number"
      bind:value={crossSpeciesMarriageChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowCrossSpeciesMarriages}
    />
  </div>

  <button onclick={generate}>Generate</button>

  <h2>The {family.name} Family</h2>
  
  <h3>Family Tree</h3>
  <div class="family-tree">
      {@html familyTreeSVG}
  </div>

  {#each family.members as member}
    <h3>
      {member.firstName}
      {member.lastName}
      <span class="gender-symbol" title={member.gender.name}>
        {getGenderSymbol(member.gender.name)}
      </span>
    </h3>
    <p>
      {member.age}-year-old {member.species.name}
      {member.ageCategory.noun}
      {#if member.tags.includes('dead')}(dead){/if}
    </p>
    <p>{member.description}</p>
    {@const mate = getMate(family, member)}
    {#if mate}
      <p>
        <strong>Mate:</strong>
        {mate.firstName}
        {mate.lastName}
        <span class="gender-symbol" title={mate.gender.name}>
          {getGenderSymbol(mate.gender.name)}
        </span>
      </p>
    {/if}
    {@const children = getChildren(family, member)}
    {#if children.length > 0}
      <h4>Children</h4>
      <ul>
        {#each children as child}
          <li>
            {child.firstName}
            {child.lastName}
            <span class="gender-symbol" title={child.gender.name}>
              {getGenderSymbol(child.gender.name)}
            </span>
            {#if child.tags.includes('adopted')}(Adopted){/if}
            {#if child.tags.includes('illegitimate')}(Illegitimate){/if}
          </li>
        {/each}
      </ul>
    {/if}
    {@const parents = getParents(family, member)}
    {#if parents.length > 0}
      <h4>Parents</h4>
      <ul>
        {#each parents as parent}
          <li>
            {parent.firstName}
            {parent.lastName}
            <span class="gender-symbol" title={parent.gender.name}>
              {getGenderSymbol(parent.gender.name)}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  {/each}
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';

  .family-tree {
      overflow-x: auto;
      border: 1px solid #ccc;
      padding: 1rem;
      margin-bottom: 2rem;
      background-color: white;
  }

  .gender-symbol {
    font-size: 1.5em;
    color: #666;
    margin-left: 0.5rem;
  }
</style>
