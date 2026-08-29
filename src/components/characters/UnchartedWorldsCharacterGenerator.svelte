<script lang="ts">
  import { CharGen, parseSkillDescription, downloadUwCharacterPdf } from '$lib/unchartedworlds';
  import type { UWCharacter } from '$lib/unchartedworlds';
  import * as RNG from '@ironarachne/rng';
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
  let character: UWCharacter | null = $state(null);
  let downloadingPdf = $state(false);

  let savedCultures = $state<Culture[]>([]);
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
    if (!character) return;
    applyNamesToCharacter(character);
    const description = CharGen.formatAsText(character);

    const blob = new Blob([description], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'uw-character.txt';
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
      await downloadUwCharacterPdf(character);
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

<GeneratorPage toolPath="/unchartedworlds/character" title="Uncharted Worlds Character Generator">
  {#snippet description()}
    <p>Generate starting characters for Uncharted Worlds.</p>
  {/snippet}

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
    seed="uw-name-sets"
    onGenerateName={generateNameOnly}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>
  <BaseButton onclick={save}>Save</BaseButton>
  <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf} />

  <h2>{firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Character summary'}</h2>

  {#if character}
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

    <ul class="skills">
      {#each character.skills as skill}
        <li class="skill">
          <p class="skill-name"><strong>{skill.name}</strong></p>
          {#each parseSkillDescription(skill.description) as block}
            {#if block.kind === 'options'}
              <ul class="skill-options">
                {#each block.items as item}
                  <li>{item}</li>
                {/each}
              </ul>
            {:else}
              <p class="skill-line">{block.text}</p>
            {/if}
          {/each}
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
  {/if}
</GeneratorPage>

<style>
  ul.skills > li.skill {
    list-style-type: none;
    margin-left: 0;
    margin-bottom: 1.25rem;
  }

  p.skill-name,
  p.skill-line {
    margin: 0 0 0.35rem;
  }

  ul.skill-options {
    margin: 0 0 0.35rem;
  }

  ul.skill-options > li {
    list-style-type: disc;
    margin-left: 1.5rem;
  }
</style>
