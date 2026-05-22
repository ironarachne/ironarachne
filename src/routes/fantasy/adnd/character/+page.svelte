<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import AdndCharacterSheet from '$lib/adnd/adnd_character_sheet.svelte';
  import ADNDCharacterGenerator from '$lib/adnd/adndcharactergenerator';
  import ADNDCharacterGeneratorConfig from '$lib/adnd/adndcharactergeneratorconfig';
  import { downloadAdndCharacterPdf } from '$lib/adnd/render_adnd_character_pdf';
  import type ADNDCharacter from '$lib/adnd/adndcharacter';
  import {
    buildCharacterNameSource,
    isCustomCharacterNameSource,
    restoreLockedCharacterName,
    rollCharacterNameForSource,
  } from '$lib/characters';
  import CharacterNameControls from '$lib/components/character_name_controls.svelte';
  import { loadSavedCultures, type Culture } from '$lib/culture';
  import { getAllFantasyNameGeneratorSets } from '$lib/names';
  import { onMount } from 'svelte';

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let includeProficiencies = $state(false);
  let includeKits = $state(false);
  let lastIncludeProficiencies = $state(false);
  let lastIncludeKits = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  let genConfig;
  let charGen;
  let character: ADNDCharacter | undefined = $state();
  let downloadingPdf = $state(false);

  let savedCultures = $state<Culture[]>([]);
  let nameSetNames = $state<string[]>([]);
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture'>('default');
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);
  let namingGender = $state<'male' | 'female' | 'random'>('random');

  function applyNamesToCharacter(target: ADNDCharacter | undefined) {
    if (!target) {
      return;
    }
    target.firstName = firstName;
    target.lastName = lastName;
  }

  function rollNamesForCurrentSource(defaultHint: string) {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    const nameRng = new RNG.RNG(`${Date.now()}-adnd-name`);
    return rollCharacterNameForSource(nameRng, source, defaultHint, namingGender);
  }

  function applyGeneratedNamesFromSource(target: ADNDCharacter, defaultHint: string) {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    if (!isCustomCharacterNameSource(source)) {
      target.firstName = '';
      target.lastName = '';
      firstName = '';
      lastName = '';
      return;
    }

    const generated = rollNamesForCurrentSource(defaultHint);
    target.firstName = generated.firstName;
    target.lastName = generated.lastName;
    firstName = generated.firstName;
    lastName = generated.lastName;
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    const lockedFirstName = firstName;
    const lockedLastName = lastName;

    genConfig = new ADNDCharacterGeneratorConfig();
    genConfig.rng = rng;
    genConfig.includeProficiencies = includeProficiencies;
    genConfig.includeKits = includeKits;
    lastIncludeProficiencies = includeProficiencies;
    lastIncludeKits = includeKits;
    charGen = new ADNDCharacterGenerator(genConfig);
    character = charGen.generateCharacter();
    if (lockName) {
      restoreLockedCharacterName(character, lockedFirstName, lockedLastName);
    } else {
      applyGeneratedNamesFromSource(character, character.race.name);
    }
  }

  function generateNameOnly() {
    if (lockName) {
      return;
    }
    const defaultHint = character?.race.name ?? 'human';
    const generated = rollNamesForCurrentSource(defaultHint);
    firstName = generated.firstName;
    lastName = generated.lastName;
    if (character) {
      character.firstName = generated.firstName;
      character.lastName = generated.lastName;
    }
  }

  async function downloadPdf() {
    if (downloadingPdf || !character) {
      return;
    }

    applyNamesToCharacter(character);
    downloadingPdf = true;
    try {
      await downloadAdndCharacterPdf(character);
    } finally {
      downloadingPdf = false;
    }
  }

  onMount(() => {
    savedCultures = loadSavedCultures();
    nameSetNames = getAllFantasyNameGeneratorSets(new RNG.RNG('adnd-name-sets')).map(
      (set) => set.name,
    );
    if (savedCultures.length > 0) {
      savedCultureName = savedCultures[0]!.name;
    }
  });

  generate();
</script>

<svelte:head>
  <title>AD&amp;D 2e Character Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>AD&amp;D 2e Character Generator</h1>

  <p>This is an AD&amp;D 2e character generator.</p>

  <p>
    <a href="/fantasy/adnd/character/build">User-directed character builder</a> (dice for attributes only).
  </p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <input
      type="checkbox"
      name="includeProficiencies"
      bind:checked={includeProficiencies}
      id="includeProficiencies"
    />
    <label for="includeProficiencies">Include proficiencies (weapon and nonweapon)</label>
  </div>

  <div class="input-group">
    <input type="checkbox" name="includeKits" bind:checked={includeKits} id="includeKits" />
    <label for="includeKits">Include character kit (optional sub-archetype)</label>
  </div>

  <CharacterNameControls
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    bind:namingGender
    {savedCultures}
    {nameSetNames}
    showGenderPicker={true}
    onGenerateName={generateNameOnly}
  />

  <button onclick={generate}>Generate</button>
  <button onclick={downloadPdf} disabled={downloadingPdf || !character}>Download PDF</button>

  {#if character}
    <AdndCharacterSheet character={{ ...character, firstName, lastName }} />
  {/if}
</section>
