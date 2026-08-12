<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { resolve } from '$app/paths';
  import AdndCharacterSheet from '$components/characters/AdndCharacterSheet.svelte';
  import { generateCharacter } from '$lib/adnd/adndcharactergenerator';
  import { getDefaultConfig } from '$lib/adnd/adndcharactergeneratorconfig';
  import { downloadAdndCharacterPdf } from '$lib/adnd/render_adnd_character_pdf';
  import type ADNDCharacter from '$lib/adnd/adndcharacter';
  import {
    buildCharacterNameSource,
    isCustomCharacterNameSource,
    restoreLockedCharacterName,
    rollCharacterNameForSource,
  } from '$lib/characters';
  import { type Culture, loadSavedCultures } from '$lib/culture';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let includeProficiencies = $state(false);
  let includeKits = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  let genConfig;
  let character = $state<ADNDCharacter | undefined>();
  let downloadingPdf = $state(false);

  let savedCultures = $state<Culture[]>([]);
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

    genConfig = getDefaultConfig();
    genConfig.rng = rng;
    genConfig.includeProficiencies = includeProficiencies;
    genConfig.includeKits = includeKits;
    character = generateCharacter(genConfig);
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
    if (savedCultures.length > 0) {
      savedCultureName = savedCultures[0]!.name;
    }
    generate();
  });
</script>

<GeneratorPage theme="fantasy" title="AD&D 2e Character Generator">
  {#snippet description()}
    <p>This is an AD&D 2e character generator.</p>

    <p>
      <a href={resolve('/fantasy/adnd/character/build')}>User-directed character builder</a> (dice for
      attributes only).
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

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

  <CharacterNameSection
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    bind:namingGender
    showGenderPicker={true}
    seed="adnd-name-sets"
    onGenerateName={generateNameOnly}
  />

  <button onclick={generate}>Generate</button>
  <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf || !character} />

  {#if character}
    <AdndCharacterSheet character={{ ...character, firstName, lastName }} />
  {/if}
</GeneratorPage>
