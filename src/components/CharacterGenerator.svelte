<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import * as Measurements from '$lib/measurements';
  import {
    applyNameGeneratorsToCharacterGenerationConfig,
    buildCharacterNameSource,
    generate,
    getDefaultCharacterGenerationConfig,
    isCustomCharacterNameSource,
    resolveCharacterNameGeneratorSet,
    restoreLockedCharacterName,
    rollCharacterNameForSource,
    type Character,
    type CharacterGenerationConfig,
    type Title,
  } from '$lib/characters';
  import type { Arms } from '$lib/heraldry/arms';
  import { renderDeviceBlazon } from '$lib/heraldry/device';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry/renderers/svg';
  import { showHeraldryPersistenceModal } from '$lib/ui/modal';
  import { type Culture, loadSavedCultures } from '$lib/culture';
  import { sentientSpeciesList } from '$lib/species_sentients';
  import { getAllFantasyArchetypes } from '$lib/archetypes';
  import { getCategoryList } from '$lib/age/age_categories';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/GeneratorPage.svelte';
  import SeedControls from '$components/SeedControls.svelte';
  import CharacterNameSection from '$components/CharacterNameSection.svelte';

  const heraldryWidth = 200;
  const heraldryHeight = 220;

  const speciesList = sentientSpeciesList;
  const archetypeOptions = getAllFantasyArchetypes().sort((a, b) => a.name.localeCompare(b.name));
  const ageCategories = getCategoryList();
  const genderOptions = ['Random', 'Male', 'Female'];

  let seed = $state(new RNG(Date.now().toString()).randomString(13));
  let rng = new RNG(seed);
  let character = $state<null | Character>(null);

  let savedCultures = $state<Culture[]>([]);
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture'>('default');
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);

  let selectedSpeciesName = $state('human');
  let selectedArchetypeName = $state('Random');
  let selectedGenderName = $state('Random');
  let selectedAgeCategoryName = $state('Random');

  let lockSeed = $state(false);
  $effect(() => {
    if (!lockSeed) {
      rng.setSeed(seed);
    }
  });

  function applyNameGeneratorsForCharacterGeneration(
    config: CharacterGenerationConfig,
    speciesName: string,
  ) {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    if (isCustomCharacterNameSource(source)) {
      const nameSet = resolveCharacterNameGeneratorSet(rng, source, speciesName);
      applyNameGeneratorsToCharacterGenerationConfig(config, nameSet);
      return;
    }

    const nameSet = resolveCharacterNameGeneratorSet(rng, { kind: 'default' }, speciesName);
    applyNameGeneratorsToCharacterGenerationConfig(config, nameSet);
  }

  function generateCharacter() {
    if (!lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
      rng.setSeed(seed);
    }

    const lockedFirstName = firstName;
    const lockedLastName = lastName;

    let config = getDefaultCharacterGenerationConfig(seed + '-character');

    const species =
      sentientSpeciesList.find((s) => s.name === selectedSpeciesName) || sentientSpeciesList[0];
    config.species = species;

    applyNameGeneratorsForCharacterGeneration(config, species.name);

    if (selectedArchetypeName !== 'Random') {
      const arch = archetypeOptions.find((a) => a.name === selectedArchetypeName);
      if (arch) {
        config.archetypeOptions = [arch];
      }
    }

    if (selectedGenderName !== 'Random') {
      config.allowedGenderNames = [selectedGenderName.toLowerCase()];
    } else {
      config.allowedGenderNames = undefined;
    }

    if (selectedAgeCategoryName !== 'Random') {
      config.allowedAgeCategoryNames = [selectedAgeCategoryName];
    } else {
      config.allowedAgeCategoryNames = undefined;
    }

    character = generate(seed + '-character', config);
    if (lockName) {
      restoreLockedCharacterName(character, lockedFirstName, lockedLastName);
    } else {
      firstName = character.firstName;
      lastName = character.lastName;
    }
  }

  function generateNameOnly() {
    if (lockName) {
      return;
    }
    const speciesName = character?.species.name ?? selectedSpeciesName;
    const nameRng = new RNG(`${Date.now()}-character-name`);
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    const generated = rollCharacterNameForSource(
      nameRng,
      source,
      speciesName,
      'random',
      character?.gender.name,
    );
    firstName = generated.firstName;
    lastName = generated.lastName;
    if (character) {
      character = {
        ...character,
        firstName: generated.firstName,
        lastName: generated.lastName,
        name: `${generated.firstName} ${generated.lastName}`.trim(),
      };
    }
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
      savedCultureName = savedCultures[0]!.name;
    }
    generateCharacter();
  });
</script>

<GeneratorPage title="Character">
  {#snippet description()}
    <p>This generator creates random characters.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

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

  <CharacterNameSection
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    seed="character-name-sets"
    onGenerateName={generateNameOnly}
  />

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
</GeneratorPage>

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
