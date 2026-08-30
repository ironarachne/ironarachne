<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import * as RNG from '@ironarachne/rng';
  import { characters as CharGen, downloadSwnCharacterPdf } from '$lib/swn';
  import type { SWNCharacter } from '$lib/swn';
  import {
    buildCharacterNameSource,
    isCustomCharacterNameSource,
    restoreLockedCharacterName,
    rollCharacterNameForSource,
    loadCulturesForNaming,
  } from '$lib/characters';
  import type { Culture } from '$lib/culture';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  let character: SWNCharacter | null = $state(null);
  let downloadingPdf = $state(false);

  let savedCultures = $state<Culture[]>([]);
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture'>('default');
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);
  let namingGender = $state<'male' | 'female' | 'random'>('random');

  function applyNamesToCharacter(target: CharGen.SWNCharacter) {
    target.firstName = firstName;
    target.lastName = lastName;
  }

  function rollNamesForCurrentSource() {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    const nameRng = new RNG.RNG(`${Date.now()}-swn-name`);
    return rollCharacterNameForSource(nameRng, source, 'human', namingGender);
  }

  function applyGeneratedNamesFromSource(target: CharGen.SWNCharacter) {
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

    const generated = rollNamesForCurrentSource();
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

    character = CharGen.generate(rng);
    if (lockName) {
      restoreLockedCharacterName(character, lockedFirstName, lockedLastName);
    } else {
      applyGeneratedNamesFromSource(character);
    }
  }

  function generateNameOnly() {
    if (lockName) {
      return;
    }
    const generated = rollNamesForCurrentSource();
    firstName = generated.firstName;
    lastName = generated.lastName;
    if (character) {
      character.firstName = generated.firstName;
      character.lastName = generated.lastName;
    }
  }

  function save() {
    if (!character) return;
    applyNamesToCharacter(character);
    const saveData = CharGen.formatAsText(character);

    const blob = new Blob([saveData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'swn-character.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function downloadPdf() {
    if (downloadingPdf || !character) {
      return;
    }

    applyNamesToCharacter(character);
    downloadingPdf = true;
    try {
      await downloadSwnCharacterPdf(character);
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

<GeneratorPage toolPath="/swn/character" title="Stars Without Number Character Generator">
  <SeedControls bind:seed bind:lockSeed />

  <CharacterNameSection
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    bind:namingGender
    showGenderPicker={true}
    seed="swn-name-sets"
    onGenerateName={generateNameOnly}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>
  <BaseButton onclick={save}>Save</BaseButton>
  <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf} />

  <h2>{firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Character'}</h2>

  {#if character}
    <StatBlock>
      <Stat label="Background">{character.background.name}</Stat>
      <Stat label="Class">{character.characterClass.name}</Stat>
      <Stat label="Hit Points">{character.hitPoints}</Stat>
      {#if character.effort > 0}
        <Stat label="Effort">{character.effort}</Stat>
      {/if}
      <Stat label="Base Attack Bonus">+{character.attackBonus}</Stat>
      <Stat label="Armor Class">{character.armorClassEquipped}</Stat>
      <Stat label="Credits">{character.credits}</Stat>
    </StatBlock>

    <h3>Saving Throws</h3>

    <StatBlock>
      <Stat label="Evasion">{character.savingThrowEvasion}</Stat>
      <Stat label="Mental">{character.savingThrowMental}</Stat>
      <Stat label="Physical">{character.savingThrowPhysical}</Stat>
    </StatBlock>

    <h3>Focuses</h3>

    {#each character.focuses as focus}
      <div>
        <strong>{focus.name}</strong>, Level {focus.currentLevel}
      </div>
    {/each}

    <h3>Stats</h3>

    <div class="stats">
      {#each character.stats as stat}
        <div>
          <strong>{stat.abbreviation}:</strong>
          <span>{stat.score} ({stat.modifier})</span>
        </div>
      {/each}
    </div>

    <h3>Skills</h3>

    <div class="skills">
      {#each character.skills as skill}
        <div>
          {skill.name}-{skill.level}
        </div>
      {/each}
    </div>

    <h3>Abilities</h3>

    <div class="abilities">
      {#each character.abilities as ability}
        <div>
          {ability.description}
        </div>
      {/each}
    </div>

    <h3>Weapons</h3>

    <div class="weapons">
      {#each character.rangedWeapons as weapon}
        <div>
          {weapon.name}: {weapon.damage}, ATK +{character.rangedAttackBonus} (rng)
        </div>
      {/each}
      {#each character.meleeWeapons as weapon}
        <div>
          {weapon.name}: {weapon.damage}, ATK +{character.meleeAttackBonus} (mel)
        </div>
      {/each}
    </div>

    <h3>Armor</h3>

    <div class="armor">
      {#each character.armor as item}
        <div>{item.name}: AC {item.ac}</div>
      {/each}
    </div>

    <h3>Equipment</h3>

    <div class="equipment">
      {#each character.equipment as item}
        <div>{item.name}</div>
      {/each}
    </div>
  {/if}
</GeneratorPage>

<style>
  .stats,
  .skills,
  .abilities,
  .weapons,
  .armor,
  .equipment {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }
</style>
