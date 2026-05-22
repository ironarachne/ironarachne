<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import {
    buildCharacterNameSource,
    isCustomCharacterNameSource,
    restoreLockedCharacterName,
    resolveCharacterNameGeneratorSet,
    rollCharacterNameForSource,
  } from '$lib/characters';
  import CharacterNameControls from '$lib/components/character_name_controls.svelte';
  import { loadSavedCultures, type Culture } from '$lib/culture';
  import * as DCC from '$lib/dcc';
  import { dccOccupationToNameSetHint } from '$lib/characters/character_name_generation';
  import { getAllFantasyNameGeneratorSets } from '$lib/names';
  import { onMount } from 'svelte';

  let rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let allowDwarves = $state(true);
  let allowElves = $state(true);
  let allowHalflings = $state(true);
  let allowHumans = $state(true);

  let savedCultures = $state<Culture[]>([]);
  let nameSetNames = $state<string[]>([]);
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture'>('default');
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);

  let genConfig = DCC.getDefaultDCCCharacterGeneratorConfig(rng.randomString(13));
  let character = $state(DCC.generateRandomDCCCharacter(rng.randomString(13), genConfig));
  let spellsKnown = $state(DCC.formatDccSpellsKnown(character.spellsKnown));
  let downloadingPdf = $state(false);

  function resolveCustomNameGeneratorSet() {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    if (!isCustomCharacterNameSource(source)) {
      return undefined;
    }
    return resolveCharacterNameGeneratorSet(
      rng,
      source,
      dccOccupationToNameSetHint(character.occupation.name),
    );
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    const lockedFirstName = firstName;
    const lockedLastName = lastName;

    let allowedOccupations = [];

    if (allowDwarves) {
      allowedOccupations.push('dwarf');
    }

    if (allowElves) {
      allowedOccupations.push('elf');
    }

    if (allowHalflings) {
      allowedOccupations.push('halfling');
    }

    if (allowHumans) {
      allowedOccupations.push('human');
    }

    genConfig.allowedOccupations = allowedOccupations;

    const customNameGeneratorSet = resolveCustomNameGeneratorSet();
    character = DCC.generateRandomDCCCharacter(
      rng.randomString(13),
      genConfig,
      customNameGeneratorSet,
    );
    if (lockName) {
      restoreLockedCharacterName(character, lockedFirstName, lockedLastName);
    } else {
      firstName = character.firstName;
      lastName = character.lastName;
    }
    spellsKnown = DCC.formatDccSpellsKnown(character.spellsKnown);
  }

  function generateNameOnly() {
    if (lockName) {
      return;
    }
    const nameRng = new RNG(`${Date.now()}-dcc-name`);
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    const generated = rollCharacterNameForSource(
      nameRng,
      source,
      dccOccupationToNameSetHint(character.occupation.name),
      'random',
      character.gender,
    );
    firstName = generated.firstName;
    lastName = generated.lastName;
    character = {
      ...character,
      firstName: generated.firstName,
      lastName: generated.lastName,
    };
  }

  async function downloadPdf() {
    if (downloadingPdf) {
      return;
    }

    downloadingPdf = true;
    try {
      await DCC.downloadDccCharacterPdf(character);
    } finally {
      downloadingPdf = false;
    }
  }

  onMount(() => {
    savedCultures = loadSavedCultures();
    nameSetNames = getAllFantasyNameGeneratorSets(new RNG('dcc-name-sets')).map((set) => set.name);
    if (savedCultures.length > 0) {
      savedCultureName = savedCultures[0]!.name;
    }
  });

  generate();
</script>

<svelte:head>
  <title>Dungeon Crawl Classics Character Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Dungeon Crawl Classics Character Generator</h1>

  <p>This is a DCC 0-level character generator.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="allowDwarves">Allow Dwarves</label>
    <input type="checkbox" name="allowDwarves" bind:checked={allowDwarves} id="allowDwarves" />
  </div>

  <div class="input-group">
    <label for="allowElves">Allow Elves</label>
    <input type="checkbox" name="allowElves" bind:checked={allowElves} id="allowElves" />
  </div>

  <div class="input-group">
    <label for="allowHalflings">Allow Halflings</label>
    <input
      type="checkbox"
      name="allowHalflings"
      bind:checked={allowHalflings}
      id="allowHalflings"
    />
  </div>

  <div class="input-group">
    <label for="allowHumans">Allow Humans</label>
    <input type="checkbox" name="allowHumans" bind:checked={allowHumans} id="allowHumans" />
  </div>

  <CharacterNameControls
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    {savedCultures}
    {nameSetNames}
    onGenerateName={generateNameOnly}
  />

  <button onclick={generate}>Generate</button>
  <button onclick={downloadPdf} disabled={downloadingPdf}>Download PDF</button>

  <h2>{character.firstName} {character.lastName}</h2>

  <p>A level {character.level} {character.occupation.name}</p>

  <p><strong>XP:</strong> {character.xp}</p>
  <p><strong>HP:</strong> {character.hp}</p>
  <p><strong>AC:</strong> {character.armorClass}</p>
  <p><strong>Currency:</strong> {DCC.formatDccCurrency(character.currency)}</p>
  <p><strong>Alignment:</strong> {character.alignment}</p>
  <p><strong>Gender:</strong> {character.gender}</p>
  <p><strong>Speed:</strong> {character.speed}'</p>

  <h3>Attributes</h3>

  <p>
    <strong>Strength:</strong>
    {character.strength.value} ({DCC.formatDccModifier(character.strength.modifier)})
  </p>
  <p>
    <strong>Agility:</strong>
    {character.agility.value} ({DCC.formatDccModifier(character.agility.modifier)})
  </p>
  <p>
    <strong>Stamina:</strong>
    {character.stamina.value} ({DCC.formatDccModifier(character.stamina.modifier)})
  </p>
  <p>
    <strong>Personality:</strong>
    {character.personality.value} ({DCC.formatDccModifier(character.personality.modifier)})
  </p>
  <p>
    <strong>Intelligence:</strong>
    {character.intelligence.value} ({DCC.formatDccModifier(character.intelligence.modifier)})
  </p>
  <p>
    <strong>Luck:</strong>
    {character.luck.value} ({DCC.formatDccModifier(character.luck.modifier)})
  </p>

  <h3>Other Stats</h3>

  <p>
    <strong>Lucky Roll:</strong>
    {DCC.formatDccLuckySign(character.luckyRoll)}
  </p>

  <h3>Saving Throws</h3>

  <p><strong>Fortitude:</strong> {DCC.formatDccModifier(character.fortitudeSave)}</p>
  <p><strong>Reflex:</strong> {DCC.formatDccModifier(character.reflexSave)}</p>
  <p><strong>Willpower:</strong> {DCC.formatDccModifier(character.willpowerSave)}</p>

  <h3>Spellcasting</h3>

  <p><strong>Spells Known:</strong> {spellsKnown}</p>
  <p><strong>Wizard Max Spell Level:</strong> {character.wizardMaxSpellLevel}</p>
  <p><strong>Cleric Max Spell Level:</strong> {character.clericMaxSpellLevel}</p>

  <h3>Weapons</h3>

  <ul>
    {#each character.weapons as weapon}
      <li>{weapon.name}: {weapon.damage} dmg, {weapon.range} range</li>
    {/each}
  </ul>

  <h3>Languages</h3>

  <ul>
    {#each character.languages as language}
      <li>{language}</li>
    {/each}
  </ul>

  <h3>Equipment</h3>

  <ul>
    {#each character.equipment as item}
      <li>{item.name}</li>
    {/each}
  </ul>

  <h3>Special Rules</h3>

  <ul>
    {#each character.specialRules as rule}
      <li>{rule}</li>
    {/each}
  </ul>
</section>
