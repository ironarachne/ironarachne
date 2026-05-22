<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import * as CharGen from '$lib/swn/character';
  import { downloadSwnCharacterPdf } from '$lib/swn/render_swn_character_pdf';
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
  $effect(() => {
    rng.setSeed(seed);
  });
  let character = $state(CharGen.generate(rng));
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
    applyNamesToCharacter(character);
    let saveData = CharGen.formatAsText(character);

    const blob = new Blob([saveData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'swn-character.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function downloadPdf() {
    if (downloadingPdf) {
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
    savedCultures = loadSavedCultures();
    nameSetNames = getAllFantasyNameGeneratorSets(new RNG.RNG('swn-name-sets')).map(
      (set) => set.name,
    );
    if (savedCultures.length > 0) {
      savedCultureName = savedCultures[0]!.name;
    }
  });

  generate();
</script>

<svelte:head>
  <title>Stars Without Number Character Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Stars Without Number Character Generator</h1>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
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
  <button onclick={save}>Save</button>
  <button onclick={downloadPdf} disabled={downloadingPdf}>Download PDF</button>

  <h2>{firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Character'}</h2>

  <p><strong>Background:</strong> {character.background.name}</p>
  <p><strong>Class:</strong> {character.characterClass.name}</p>
  <p><strong>Hit Points:</strong> {character.hitPoints}</p>
  {#if character.effort > 0}
    <p><strong>Effort:</strong> {character.effort}</p>
  {/if}
  <p><strong>Base Attack Bonus:</strong> +{character.attackBonus}</p>
  <p><strong>Armor Class:</strong> {character.armorClassEquipped}</p>
  <p><strong>Credits:</strong> {character.credits}</p>

  <h3>Saving Throws</h3>

  <p><strong>Evasion:</strong> {character.savingThrowEvasion}</p>
  <p><strong>Mental:</strong> {character.savingThrowMental}</p>
  <p><strong>Physical:</strong> {character.savingThrowPhysical}</p>

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
</section>

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
