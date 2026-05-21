<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import * as Measurements from '$lib/measurements';
  import {
    generate,
    getDefaultCharacterGenerationConfig,
    type Character,
    type CharacterGenerationConfig,
    type Title,
  } from '$lib/characters';
  import type { Arms } from '$lib/heraldry/arms';
  import { renderDeviceBlazon } from '$lib/heraldry/device';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry/renderers/svg';
  import { showHeraldryPersistenceModal } from '$lib/ui/modal';
  import { type Culture, loadSavedCultures } from '$lib/culture';
  import { onMount } from 'svelte';
  import { sentientSpeciesList } from '$lib/species_sentients';
  import { getAllFantasyArchetypes } from '$lib/archetypes';
  import { getCategoryList } from '$lib/age/age_categories';
  import { getFantasyNameGeneratorSet } from '$lib/names';

  const heraldryWidth = 200;
  const heraldryHeight = 220;

  let seed = new RNG(Date.now().toString()).randomString(13);
  let rng = new RNG(seed);
  let character: null | Character = null;

  let savedCultures: Culture[] = [];
  let useSavedCulture = false;
  let savedCulture: string | undefined = undefined;
  let culture: Culture | undefined = undefined;

  let speciesList = sentientSpeciesList;
  let archetypeOptions = getAllFantasyArchetypes().sort((a, b) => a.name.localeCompare(b.name));
  let ageCategories = getCategoryList();
  let genderOptions = ['Random', 'Male', 'Female'];

  let selectedSpeciesName = 'human';
  let selectedArchetypeName = 'Random';
  let selectedGenderName = 'Random';
  let selectedAgeCategoryName = 'Random';

  let lockSeed = false;
  $: if (!lockSeed) {
    rng.setSeed(seed);
  }

  function loadSavedCulture() {
    for (const c of savedCultures) {
      if (c.name === savedCulture) {
        culture = c;
        return;
      }
    }
    if (savedCultures[0]) {
      culture = savedCultures[0];
      savedCulture = savedCultures[0].name;
    }
  }

  function applyNameGeneratorsFromCulture(config: CharacterGenerationConfig) {
    if (culture === undefined) {
      return;
    }
    if (culture.nameGenerators.family !== null) {
      config.familyNameGenerator = culture.nameGenerators.family;
    }
    if (culture.nameGenerators.female !== null) {
      config.femaleFirstNameGenerator = culture.nameGenerators.female;
    }
    if (culture.nameGenerators.male !== null) {
      config.maleFirstNameGenerator = culture.nameGenerators.male;
    }
  }

  function applyNameGeneratorsFromSpecies(config: CharacterGenerationConfig, speciesName: string) {
    try {
      let nameSetToUse = speciesName.toLowerCase();
      if (nameSetToUse.includes('elf')) nameSetToUse = 'elf';
      if (nameSetToUse.includes('dwarf')) nameSetToUse = 'dwarf';
      if (nameSetToUse.includes('gnome')) nameSetToUse = 'gnome';
      if (nameSetToUse.includes('halfling')) nameSetToUse = 'halfling';
      if (nameSetToUse.includes('human')) nameSetToUse = 'human';
      if (nameSetToUse.includes('orc')) nameSetToUse = 'orc';
      if (nameSetToUse.includes('goblin')) nameSetToUse = 'goblin';

      const nameSet = getFantasyNameGeneratorSet(nameSetToUse, rng);
      config.maleFirstNameGenerator = nameSet.male;
      config.femaleFirstNameGenerator = nameSet.female;
      config.familyNameGenerator = nameSet.family;
    } catch {
      console.log(`Name set not found for ${speciesName}, falling back to human.`);
    }
  }

  function generateCharacter() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
      rng.setSeed(seed);
    }

    let config = getDefaultCharacterGenerationConfig(seed + '-character');

    // Species
    const species =
      sentientSpeciesList.find((s) => s.name === selectedSpeciesName) || sentientSpeciesList[0];
    config.species = species;

    if (useSavedCulture) {
      loadSavedCulture();
      applyNameGeneratorsFromCulture(config);
    } else {
      applyNameGeneratorsFromSpecies(config, species.name);
    }

    // Archetype
    if (selectedArchetypeName !== 'Random') {
      const arch = archetypeOptions.find((a) => a.name === selectedArchetypeName);
      if (arch) {
        config.archetypeOptions = [arch];
      }
    }

    // Gender
    if (selectedGenderName !== 'Random') {
      config.allowedGenderNames = [selectedGenderName.toLowerCase()];
    } else {
      config.allowedGenderNames = undefined;
    }

    // Age Category
    if (selectedAgeCategoryName !== 'Random') {
      config.allowedAgeCategoryNames = [selectedAgeCategoryName];
    } else {
      config.allowedAgeCategoryNames = undefined;
    }

    character = generate(seed + '-character', config);
  }

  async function openHeraldryModal(arms: Arms, title: string, applyReplacement: (arms: Arms) => void) {
    const result = await showHeraldryPersistenceModal({ arms, seed, title });
    if (result.action === 'replaced') {
      applyReplacement(result.arms);
    }
  }

  function replaceCharacterHeraldry(arms: Arms) {
    if (character === null) {
      return;
    }
    character = {
      ...character,
      heraldry: arms,
    };
  }

  function getDisplayTitle(title: Title, genderName: string): string {
    const titleName = genderName.toLowerCase() === 'female' ? title.femaleTitle : title.maleTitle;
    if (title.hasLands && title.landName) {
      return `${titleName} of ${title.landName}`;
    }
    return titleName;
  }

  onMount(() => {
    savedCultures = loadSavedCultures();
    if (savedCultures.length > 0) {
      savedCulture = savedCultures[0]!.name;
    }
    generateCharacter();
  });
</script>

<svelte:head>
  <title>Character | Iron Arachne</title>
</svelte:head>

<section class="main">
  <h1>Character</h1>

  <p>This generator creates random characters.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="species">Species</label>
    <select bind:value={selectedSpeciesName} id="species">
      {#each speciesList as species}
        <option value={species.name}>{species.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="archetype">Archetype</label>
    <select bind:value={selectedArchetypeName} id="archetype">
      <option value="Random">Random</option>
      {#each archetypeOptions as archetype}
        <option value={archetype.name}>{archetype.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="gender">Gender</label>
    <select bind:value={selectedGenderName} id="gender">
      {#each genderOptions as gender}
        <option value={gender}>{gender}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="age">Age</label>
    <select bind:value={selectedAgeCategoryName} id="age">
      <option value="Random">Random</option>
      {#each ageCategories as age}
        <option value={age}>{age}</option>
      {/each}
    </select>
  </div>

  {#if savedCultures.length > 0}
    <div class="input-group">
      <label for="useSavedCulture">Use a saved culture for naming</label>
      <input
        type="checkbox"
        name="useSavedCulture"
        id="useSavedCulture"
        bind:checked={useSavedCulture}
      />
    </div>
    <div class="input-group">
      <label for="savedCulture">Saved culture</label>
      <select id="savedCulture" name="savedCulture" bind:value={savedCulture} disabled={!useSavedCulture}>
        {#each savedCultures as s}
          <option value={s.name}>{s.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <button onclick={generateCharacter}>Generate</button>

  {#if character}
    <h2>{character.name}</h2>
    {#if character.titles && character.titles.length > 0}
      <h3>Titles</h3>
      <ul>
        {#each character.titles as title}
          <li>{getDisplayTitle(title, character.gender.name)}</li>
        {/each}
      </ul>
    {/if}
    <p><strong>Description:</strong> {character.description}</p>
    <p><strong>Gender:</strong> {character.gender.name}</p>
    <p><strong>Species:</strong> {character.species.name}</p>
    {#if character.creatureTypes.length > 0}
      <p><strong>Type:</strong> {character.creatureTypes.join(', ')}</p>
    {/if}
    {#if character.archetype}
      <p><strong>Archetype:</strong> {character.archetype.name}</p>
    {/if}
    <p><strong>Age:</strong> {character.age} years ({character.ageCategory.name})</p>
    <p>
      <strong>Height:</strong>
      {Measurements.inchesToFeetExpression(Measurements.cmToInches(character.height))}
    </p>
    {#if character.length > 0}
      <p>
        <strong>Length:</strong>
        {Measurements.inchesToFeetExpression(Measurements.cmToInches(character.length))}
      </p>
    {/if}
    <p><strong>Weight:</strong> {Measurements.kgToPounds(character.weight)} lbs.</p>

    {#if character.physicalTraits.length > 0}
      <h3>Physical Traits</h3>
      <ul>
        {#each character.physicalTraits as trait}
          <li><strong>{trait.name}:</strong> {trait.description}</li>
        {/each}
      </ul>
    {/if}

    {#if character.personalityTraits.length > 0}
      <h3>Personality</h3>
      <p>{character.personalityTraits.join(', ')}</p>
    {/if}

    {#if character.heraldry}
      <h3>Heraldry</h3>
      <button
        type="button"
        class="character-heraldry heraldry-block-target"
        aria-label="View heraldry for {character.name}"
        onclick={() => {
          const current = character;
          if (current?.heraldry) {
            void openHeraldryModal(current.heraldry, current.name, replaceCharacterHeraldry);
          }
        }}
      >
        {@html renderHeraldryDeviceSvg(
          character.heraldry.device,
          heraldryWidth,
          heraldryHeight,
          rng,
        )}
      </button>
      <p>{renderDeviceBlazon(character.heraldry.device)}</p>
    {/if}

    {#if character.abilities.length > 0}
      <h3>Abilities</h3>
      <ul>
        {#each character.abilities as ability}
          <li><strong>{ability.name}:</strong> {ability.description}</li>
        {/each}
      </ul>
    {/if}

    {#if character.carried.length > 0}
      <h3>Equipment</h3>
      <ul>
        {#each character.carried as item}
          <li>{item.name}</li>
        {/each}
      </ul>
    {/if}
  {/if}
</section>

<style>
  button.character-heraldry {
    width: 200px;
    height: 220px;
    margin-bottom: 0.5rem;
  }

  button.heraldry-block-target {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }

  button.heraldry-block-target:hover {
    opacity: 0.85;
  }
</style>
