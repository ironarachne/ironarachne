<script lang="ts">
  import * as CharGen from '$lib/unchartedworlds/character';
  import { downloadUwCharacterPdf } from '$lib/unchartedworlds/render_uw_character_pdf';
  import * as RNG from '@ironarachne/rng';
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

  function applyNamesToCharacter(target: CharGen.UWCharacter) {
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
    const nameRng = new RNG.RNG(`${Date.now()}-uw-name`);
    return rollCharacterNameForSource(nameRng, source, 'human', namingGender);
  }

  function applyGeneratedNamesFromSource(target: CharGen.UWCharacter) {
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
    let description = CharGen.formatAsText(character);

    const blob = new Blob([description], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'uw-character.txt';
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
      await downloadUwCharacterPdf(character);
    } finally {
      downloadingPdf = false;
    }
  }

  onMount(() => {
    savedCultures = loadSavedCultures();
    nameSetNames = getAllFantasyNameGeneratorSets(new RNG.RNG('uw-name-sets')).map(
      (set) => set.name,
    );
    if (savedCultures.length > 0) {
      savedCultureName = savedCultures[0]!.name;
    }
  });

  generate();
</script>

<svelte:head>
  <title>Uncharted Worlds Character Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Uncharted Worlds Character Generator</h1>

  <p>Generate starting characters for Uncharted Worlds.</p>

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

  <h2>{firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Character summary'}</h2>

  <h3>Statistics</h3>

  <p><strong>Physique:</strong> {character.stats.physique}</p>
  <p><strong>Mettle:</strong> {character.stats.mettle}</p>
  <p><strong>Expertise:</strong> {character.stats.expertise}</p>
  <p><strong>Influence:</strong> {character.stats.influence}</p>
  <p><strong>Interface:</strong> {character.stats.interface}</p>

  <h2>Careers</h2>

  {#each character.careers as career}
    <div>{career.name}</div>
  {/each}

  <h2>Origin</h2>

  <p>{character.origin.name}</p>

  <h2>Descriptors</h2>

  <p>{character.descriptors}</p>

  <h2>Skills</h2>

  <ul>
    {#each character.skills as skill}
      <li>
        <strong>{skill.name}: </strong>
        <pre>{skill.description}</pre>
      </li>
    {/each}
  </ul>

  <h2>Advancement</h2>

  <p>{character.advancement}</p>

  <h2>Assets</h2>

  <div class="asset">
    <h4>Workspace: {character.workspace.name}</h4>
    <p>{character.workspace.description}</p>
  </div>

  {#each character.assets as asset}
    <div>
      <h4>{asset.name}</h4>
      <p>{asset.description}</p>
      {#if asset.upgrades.length > 0}
        <ul>
          {#each asset.upgrades as upgrade}
            <li>
              <strong>{upgrade.name}:</strong>
              {upgrade.description}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/each}
</section>
