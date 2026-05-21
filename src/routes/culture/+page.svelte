<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { onMount } from 'svelte';
  import {
    appendSavedCulture,
    CULTURE_SAVE_SCOPE_ID,
    loadSavedCultures,
    generateCulture,
    getDefaultCultureGenerationConfig,
    type Culture,
  } from '$lib/culture';
  import { applyImportedScopes, buildExportPayload } from '$lib/persistent_save/save_file_export';
  import { getAllFantasyNameGeneratorSets, type NameGeneratorSet } from '$lib/names';
  import { showAlertModal } from '$lib/ui/modal';

  const rng = new RNG.RNG(Date.now());
  const allNameSets = getAllFantasyNameGeneratorSets(rng);

  let savedCultures = $state<Culture[]>([]);
  let savedCulture: string | undefined = $state();
  let importInput: HTMLInputElement | undefined = $state();

  const initialSeed = rng.randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  const genConfig = getDefaultCultureGenerationConfig();
  let genSet: NameGeneratorSet = rng.item(allNameSets);
  genConfig.nameGenerators = genSet;
  let culture = $state(generateCulture(initialSeed, genConfig));

  onMount(() => {
    refreshSavedCultures();
  });

  function refreshSavedCultures() {
    savedCultures = loadSavedCultures();
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    genSet = rng.item(allNameSets);
    genConfig.nameGenerators = genSet;
    culture = generateCulture(seed, genConfig);
  }

  function loadSavedCulture() {
    for (let i = 0; i < savedCultures.length; i++) {
      if (savedCultures[i].name === savedCulture) {
        culture = savedCultures[i];
      }
    }
  }

  function saveCulture() {
    appendSavedCulture(culture);
    refreshSavedCultures();
  }

  function exportCulturesFile() {
    const payload = buildExportPayload([CULTURE_SAVE_SCOPE_ID]);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ironarachne-cultures.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function triggerImportPicker() {
    importInput?.click();
  }

  async function onImportFile(ev: Event) {
    const input = ev.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text()) as unknown;
    } catch {
      void showAlertModal({
        message: 'Could not read that file as JSON.',
        style: 'error',
      });
      return;
    }
    const result = applyImportedScopes(parsed, 'merge');
    if (!result.ok) {
      void showAlertModal({ message: result.error, style: 'error' });
      return;
    }
    refreshSavedCultures();
    if (result.appliedScopes.length > 0) {
      void showAlertModal({
        message: `Imported scopes: ${result.appliedScopes.join(', ')}.`,
        style: 'success',
      });
      return;
    }
    void showAlertModal({
      message: 'Import finished (no scopes in file).',
      style: 'message',
    });
  }
</script>

<svelte:head>
  <title>Culture Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Culture Generator</h1>
  <p>This generator lets you create fantasy cultures.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <button onclick={generate}>Generate</button>
  <button onclick={saveCulture}>Save Current Culture</button>

  <h2>Saved Cultures</h2>

  <div class="input-group">
    <label for="savedCulture">Select a saved culture to load</label>
    <select bind:value={savedCulture}>
      {#each savedCultures as saved}
        <option value={saved.name}>{saved.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <button onclick={loadSavedCulture}>Load Selected Culture</button>
  </div>

  <div class="input-group culture-save-file-actions">
    <button type="button" onclick={exportCulturesFile}>Export saved cultures (JSON)</button>
    <button type="button" onclick={triggerImportPicker}>Import saves from file</button>
    <input
      bind:this={importInput}
      type="file"
      accept="application/json,.json"
      style="display: none"
      onchange={onImportFile}
    />
  </div>

  <h2>The {culture.name} Culture</h2>

  <h3>Common Names</h3>

  <div class="namelist">
    <div>
      <h4>Male Names</h4>
      <ul>
        {#each culture.nameGenerators.male.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h4>Female Names</h4>
      <ul>
        {#each culture.nameGenerators.female.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h4>Family Names</h4>
      <ul>
        {#each culture.nameGenerators.family.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="namelist">
    <div>
      <h4>Country Names</h4>

      <ul>
        {#each culture.nameGenerators.country.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
    <div>
      <h4>Town Names</h4>

      <ul>
        {#each culture.nameGenerators.town.generate(10) as name}
          <li>{name}</li>
        {/each}
      </ul>
    </div>
  </div>

  <h3>Organization</h3>

  <p>{culture.organization.description}</p>

  <h3>Religion</h3>

  <p>{culture.religion.description}</p>

  <h3>Taboos</h3>

  {#each culture.taboos as taboo}
    <p>{taboo}</p>
  {/each}

  <h3>Greetings</h3>

  <p>{culture.greeting}</p>

  <h3>Meals</h3>

  <p>{culture.eatingTrait}</p>

  <h3>Design</h3>

  <p>{culture.designTrait}</p>

  <h3>Music</h3>

  <p>{culture.musicStyle}</p>
</section>

<style>
  .namelist {
    display: grid;
    grid-template-columns: auto auto auto;
    align-items: start;
    justify-items: center;
  }

  .culture-save-file-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
</style>
