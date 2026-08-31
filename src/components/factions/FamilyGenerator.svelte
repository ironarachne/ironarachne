<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import { CommonSpecies } from '$lib/species';
  import * as Families from '$lib/families';
  import * as Names from '$lib/names';
  import { RNG } from '@ironarachne/rng';
  import type { Gender } from '$lib/gender';
  import type { NameGenerator } from '@ironarachne/made-up-names';
  import type { Species } from '$lib/species';
  import type { Character } from '$lib/characters';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const INITIAL_ITERATIONS = 3;
  const INITIAL_MIN_MEMBERS_PER_GENERATION = 2;
  const INITIAL_MAX_MEMBERS_PER_GENERATION = 5;
  const INITIAL_INFANT_MORTALITY_CHANCE = 0.01;
  const INITIAL_FERTILITY_CHANCE = 0.8;

  const rng = new RNG(Date.now().toString());
  const initialSeed = rng.randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  const availableSpecies = CommonSpecies.sentient();
  let selectedSpecies = $state('any');
  let species = CommonSpecies.randomWeighted(availableSpecies, rng);
  let iterations: number = $state(INITIAL_ITERATIONS);
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

  let minMembersPerGeneration = $state(INITIAL_MIN_MEMBERS_PER_GENERATION);
  let maxMembersPerGeneration = $state(INITIAL_MAX_MEMBERS_PER_GENERATION);
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
  let infantMortalityChance = $state(INITIAL_INFANT_MORTALITY_CHANCE);
  let fertilityChance = $state(INITIAL_FERTILITY_CHANCE);

  const config = Families.getDefaultFamilyGenerationConfig(initialSeed + '-family');
  config.speciesOptions = [species];
  config.generations = INITIAL_ITERATIONS;
  config.familyNameGenerator = familyNameGen;
  config.femaleNameGenerator = femaleNameGen;
  config.maleNameGenerator = maleNameGen;
  config.dominantGender = getDominantGender().name;
  config.minMembersPerGeneration = INITIAL_MIN_MEMBERS_PER_GENERATION;
  config.maxMembersPerGeneration = INITIAL_MAX_MEMBERS_PER_GENERATION;
  config.allowAdoption = false;
  config.adoptionChance = 0.0;
  config.allowIllegitimateChildren = false;
  config.illegitimateChildChance = 0.0;
  config.allowMultipleMarriages = false;
  config.multipleMarriageChance = 0.0;
  config.allowSameGenderMarriage = false;
  config.sameGenderMarriageChance = 0.0;
  config.allowCrossSpeciesMarriages = false;
  config.crossSpeciesMarriageChance = 0.0;
  config.infantMortalityChance = INITIAL_INFANT_MORTALITY_CHANCE;
  config.fertilityChance = INITIAL_FERTILITY_CHANCE;

  const initialFamily = Families.generateFamilyGeneration(
    initialSeed,
    config,
    Families.generateNewFamily(initialSeed, config),
  );
  let family = $state(initialFamily);
  let familyTreeSVG = $state(Families.getFamilyTreeSVG(initialFamily));

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

    family = Families.generateFamilyGeneration(
      seed,
      config,
      Families.generateNewFamily(seed, config),
    );
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
      return CommonSpecies.randomWeighted(availableSpecies, rng);
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
      (r) =>
        r.type.name === 'spouse' && (r.originatorId === member.id || r.recipientId === member.id),
    );
    if (!relationship) return undefined;
    const mateId =
      relationship.originatorId === member.id
        ? relationship.recipientId
        : relationship.originatorId;
    return family.members.find((m) => m.id === mateId);
  }

  function getChildren(family: Families.Family, member: Character): Character[] {
    const relationships = family.relationships.filter(
      (r) => r.type.name === 'parent' && r.originatorId === member.id,
    );
    const childrenIds = relationships.map((r) => r.recipientId);
    return family.members.filter((m) => childrenIds.includes(m.id));
  }

  function getParents(family: Families.Family, member: Character): Character[] {
    const relationships = family.relationships.filter(
      (r) => r.type.name === 'parent' && r.recipientId === member.id,
    );
    const parentIds = relationships.map((r) => r.originatorId);
    return family.members.filter((m) => parentIds.includes(m.id));
  }
</script>

<GeneratorPage toolPath="/fantasy/family" title="Fantasy Family Generator">
  {#snippet description()}
    <p>
      This generator creates a family. Note that more than 10 iterations can be quite slow. More
      than 30 may or may not crash your browser.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <NumberField id="iterations" label="Iterations" bind:value={iterations} min={1} max={10} />

  <SelectField
    id="species"
    label="Species"
    bind:value={selectedSpecies}
    options={['any', ...availableSpecies.map((s) => s.name)]}
  />

  <SelectField
    id="last-name-tradition"
    label="Last name tradition (gender)"
    bind:value={lastNameTradition}
    options={['male', 'female']}
  />

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
    <CheckboxField id="allow-adoption" label="Allow Adoption" bind:checked={allowAdoption} />
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
    <CheckboxField
      id="allow-illegitimate"
      label="Allow Illegitimate Children"
      bind:checked={allowIllegitimateChildren}
    />
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
    <CheckboxField
      id="allow-multiple-marriages"
      label="Allow Multiple Marriages"
      bind:checked={allowMultipleMarriages}
    />
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
    <CheckboxField
      id="allow-same-gender"
      label="Allow Same Gender Marriage"
      bind:checked={allowSameGenderMarriage}
    />
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
    <CheckboxField
      id="allow-cross-species"
      label="Allow Cross Species Marriage"
      bind:checked={allowCrossSpeciesMarriages}
    />
    <input
      type="number"
      bind:value={crossSpeciesMarriageChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowCrossSpeciesMarriages}
    />
  </div>

  <BaseButton onclick={generate}>Generate</BaseButton>

  <h2>The {family.name} Family</h2>

  <h3>Family Tree</h3>
  <!-- Scrolls sideways on purpose; see `DELIBERATE_SCROLLER` in e2e/mobile_layout.ts. -->
  <div class="family-tree" data-scroll-x>
    <!-- Renders app-generated markup (no external or user-supplied input). -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
      <Stat label="Mate">
        {mate.firstName}
        {mate.lastName}
        <span class="gender-symbol" title={mate.gender.name}>
          {getGenderSymbol(mate.gender.name)}
        </span>
      </Stat>
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
</GeneratorPage>

<style>
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
