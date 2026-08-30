<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { RNG } from '@ironarachne/rng';
  import {
    buildCharacterNameSource,
    isCustomCharacterNameSource,
    restoreLockedCharacterName,
    resolveCharacterNameGeneratorSet,
    rollCharacterNameForSource,
    dccOccupationToNameSetHint,
    loadCulturesForNaming,
  } from '$lib/characters';
  import type { Culture } from '$lib/culture';
  import * as DCC from '$lib/dcc';
  import type { DCCCharacter } from '$lib/dcc';
  import { onMount } from 'svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG(Date.now().toString());
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
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture'>('default');
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);

  const genConfig = DCC.getDefaultDCCCharacterGeneratorConfig(rng.randomString(13));
  let character: DCCCharacter | null = $state(null);
  let spellsKnown = $state('');
  let downloadingPdf = $state(false);

  function resolveCustomNameGeneratorSet() {
    if (!character) return undefined;
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

    const allowedOccupations: string[] = [];

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
    if (lockName || !character) {
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
    if (downloadingPdf || !character) {
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
    // Not awaited: the cultures come from the vault database, and a character worth looking at
    // should be on screen before a naming dropdown has finished filling in.
    void loadCulturesForNaming().then((cultures) => {
      savedCultures = cultures;
      if (savedCultures.length > 0) {
        savedCultureName = savedCultures[0]!.name;
      }
    });
    generate();
  });
</script>

<GeneratorPage toolPath="/fantasy/dcc/character" title="Dungeon Crawl Classics Character Generator">
  {#snippet description()}
    <p>This is a DCC 0-level character generator.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <CheckboxField id="allowDwarves" label="Allow Dwarves" bind:checked={allowDwarves} />

  <CheckboxField id="allowElves" label="Allow Elves" bind:checked={allowElves} />

  <CheckboxField id="allowHalflings" label="Allow Halflings" bind:checked={allowHalflings} />

  <CheckboxField id="allowHumans" label="Allow Humans" bind:checked={allowHumans} />

  <CharacterNameSection
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    seed="dcc-name-sets"
    onGenerateName={generateNameOnly}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>
  <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf} />

  {#if character}
    <h2>{character.firstName} {character.lastName}</h2>

    <p>A level {character.level} {character.occupation.name}</p>

    <StatBlock>
      <Stat label="XP">{character.xp}</Stat>
      <Stat label="HP">{character.hp}</Stat>
      <Stat label="AC">{character.armorClass}</Stat>
      <Stat label="Currency">{DCC.formatDccCurrency(character.currency)}</Stat>
      <Stat label="Alignment">{character.alignment}</Stat>
      <Stat label="Gender">{character.gender}</Stat>
      <Stat label="Speed">{character.speed}'</Stat>
    </StatBlock>

    <h3>Attributes</h3>

    <Stat label="Strength">
      {character.strength.value} ({DCC.formatDccModifier(character.strength.modifier)})
    </Stat>
    <Stat label="Agility">
      {character.agility.value} ({DCC.formatDccModifier(character.agility.modifier)})
    </Stat>
    <Stat label="Stamina">
      {character.stamina.value} ({DCC.formatDccModifier(character.stamina.modifier)})
    </Stat>
    <Stat label="Personality">
      {character.personality.value} ({DCC.formatDccModifier(character.personality.modifier)})
    </Stat>
    <Stat label="Intelligence">
      {character.intelligence.value} ({DCC.formatDccModifier(character.intelligence.modifier)})
    </Stat>
    <Stat label="Luck">
      {character.luck.value} ({DCC.formatDccModifier(character.luck.modifier)})
    </Stat>

    <h3>Other Stats</h3>

    <Stat label="Lucky Roll">
      {DCC.formatDccLuckySign(character.luckyRoll)}
    </Stat>

    <h3>Saving Throws</h3>

    <StatBlock>
      <Stat label="Fortitude">{DCC.formatDccModifier(character.fortitudeSave)}</Stat>
      <Stat label="Reflex">{DCC.formatDccModifier(character.reflexSave)}</Stat>
      <Stat label="Willpower">{DCC.formatDccModifier(character.willpowerSave)}</Stat>
    </StatBlock>

    <h3>Spellcasting</h3>

    <StatBlock>
      <Stat label="Spells Known">{spellsKnown}</Stat>
      <Stat label="Wizard Max Spell Level">{character.wizardMaxSpellLevel}</Stat>
      <Stat label="Cleric Max Spell Level">{character.clericMaxSpellLevel}</Stat>
    </StatBlock>

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
  {/if}
</GeneratorPage>
