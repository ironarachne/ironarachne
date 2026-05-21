<script lang="ts">
  import { onMount } from 'svelte';
  import * as Names from '$lib/names';
  import * as RNG from '@ironarachne/rng';
  import * as CommonSpecies from '$lib/species/common.js';
  import * as ReligionCategories from '$lib/religion/categories';
  import type Species from '$lib/species/species';
  import type { Culture } from '$lib/culture';
  import { loadSavedCultures } from '$lib/culture';
  import { applyImportedScopes, buildExportPayload } from '$lib/persistent_save/save_file_export';
  import {
    ALL_RELIGION_DIMENSION_IDS,
    appendSavedReligion,
    loadSavedReligionSnapshots,
    type PolytheisticStandingMode,
    RELIGION_SAVE_SCOPE_ID,
    type ReligionDimensionId,
    religionFromSnapshot,
    type ReligionGeneratorOptionsSnapshot,
    type ReligionSnapshot,
    type SpiritCosmologyDepthMode,
    generateReligion,
    getDefaultReligionGenerationConfig,
    summaryTextForReligionDimension,
    toReligionSnapshot,
  } from '$lib/religion';
  import { listDomains } from '$lib/religion/domains';
  import { showAlertModal } from '$lib/ui/modal';
  import {
    clearLoadParamFromUrl,
    readReligionLoadParamFromLocation,
    RELIGION_LOAD_PARAM,
  } from '$lib/persistent_save/saved_data_links';

  const dimensionSectionTitles: Record<ReligionDimensionId, string> = {
    ritual: 'Ritual',
    experiential: 'Experiential',
    mythological: 'Mythological',
    doctrinal: 'Doctrinal',
    ethical: 'Ethical',
    institutional: 'Institutional',
    material: 'Material',
  };

  let savedCultures = $state<Culture[]>([]);
  let savedReligions = $state<ReligionSnapshot[]>([]);
  let loadDialog: HTMLDialogElement | undefined = $state();
  let importInput: HTMLInputElement | undefined = $state();

  onMount(() => {
    savedCultures = loadSavedCultures();
    refreshSavedReligions();
    const seedParam = readReligionLoadParamFromLocation();
    if (seedParam !== null) {
      const snapshot = loadSavedReligionSnapshots().find((saved) => saved.seed === seedParam);
      if (snapshot !== undefined) {
        loadSavedReligion(snapshot);
      }
      clearLoadParamFromUrl(RELIGION_LOAD_PARAM);
    }
  });

  function refreshSavedReligions() {
    savedReligions = loadSavedReligionSnapshots();
  }

  let savedCulture: string | undefined = $state();
  let useSavedCulture: boolean = $state(false);
  let culture: Culture | undefined = $state();

  let rng = new RNG.RNG(Date.now().toString());
  const initialSeed = rng.randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let humanNameGenSet = Names.getFantasyNameGeneratorSet('human', rng);
  let genConfig = getDefaultReligionGenerationConfig();

  let allSpeciesNames: string[] = [];
  const allSpecies = CommonSpecies.sentient();
  const allReligionCategories = ReligionCategories.all();
  let allReligionCategoriesNames: string[] = [];

  for (let i = 0; i < allSpecies.length; i++) {
    allSpeciesNames.push(allSpecies[i].name);
  }

  for (let i = 0; i < allReligionCategories.length; i++) {
    allReligionCategoriesNames.push(allReligionCategories[i].name);
  }

  let selectedSpecies: string[] = $state(['human']);
  let selectedCategories: string[] = $state(allReligionCategories.map((c) => c.name));

  let polytheisticStanding: PolytheisticStandingMode = $state('random');
  let spiritCosmologyDepth: SpiritCosmologyDepthMode = $state('random');

  let religion = $state(generateReligion(`${initialSeed}-religion`, genConfig));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    if (humanNameGenSet.family === null) {
      throw new Error('Name set does not have a family name generator.');
    }
    if (humanNameGenSet.female === null) {
      throw new Error('Name set does not have a female name generator.');
    }
    if (humanNameGenSet.male === null) {
      throw new Error('Name set does not have a male name generator.');
    }
    let speciesOptions: Species[] = [];
    for (let i = 0; i < selectedSpecies.length; i++) {
      speciesOptions.push(CommonSpecies.byName(selectedSpecies[i], allSpecies));
    }

    let categoryOptions = [];
    for (let i = 0; i < selectedCategories.length; i++) {
      categoryOptions.push(ReligionCategories.byName(selectedCategories[i], allReligionCategories));
    }

    genConfig.deitySpeciesOptions = speciesOptions;
    genConfig.categories = categoryOptions;
    genConfig.polytheisticStanding = polytheisticStanding;
    genConfig.spiritCosmologyDepth = spiritCosmologyDepth;
    genConfig.nameGenerator = humanNameGenSet.family;
    genConfig.femaleNameGenerator = humanNameGenSet.female;
    genConfig.maleNameGenerator = humanNameGenSet.male;

    if (useSavedCulture) {
      loadSavedCulture();

      if (culture !== undefined) {
        if (culture.nameGenerators.family !== null) {
          genConfig.nameGenerator = culture.nameGenerators.family;
        }
        if (culture.nameGenerators.female !== null) {
          genConfig.femaleNameGenerator = culture.nameGenerators.female;
        }
        if (culture.nameGenerators.male !== null) {
          genConfig.maleNameGenerator = culture.nameGenerators.male;
        }
      }
    } else {
      genConfig.nameGenerator = humanNameGenSet.family;
      genConfig.femaleNameGenerator = humanNameGenSet.female;
      genConfig.maleNameGenerator = humanNameGenSet.male;
    }

    religion = generateReligion(seed, genConfig);
  }

  function loadSavedCulture() {
    for (let i = 0; i < savedCultures.length; i++) {
      if (savedCultures[i].name === savedCulture) {
        culture = savedCultures[i];
      }
    }
  }

  function currentGeneratorOptions(): ReligionGeneratorOptionsSnapshot {
    return {
      lockSeed,
      selectedCategories: [...selectedCategories],
      selectedSpecies: [...selectedSpecies],
      polytheisticStanding,
      spiritCosmologyDepth,
      useSavedCulture,
      savedCultureName: savedCulture,
    };
  }

  function saveReligion() {
    appendSavedReligion(toReligionSnapshot(religion, seed, currentGeneratorOptions()));
    refreshSavedReligions();
  }

  function openLoadDialog() {
    refreshSavedReligions();
    loadDialog?.showModal();
  }

  function loadSavedReligion(snapshot: ReligionSnapshot) {
    const restored = religionFromSnapshot(snapshot);
    religion = restored.religion;
    seed = restored.seed;
    lockSeed = restored.generatorOptions.lockSeed;
    selectedCategories = [...restored.generatorOptions.selectedCategories];
    selectedSpecies = [...restored.generatorOptions.selectedSpecies];
    polytheisticStanding = restored.generatorOptions.polytheisticStanding;
    spiritCosmologyDepth = restored.generatorOptions.spiritCosmologyDepth;
    useSavedCulture = restored.generatorOptions.useSavedCulture;
    savedCulture = restored.generatorOptions.savedCultureName;
    rng.setSeed(seed);
    loadDialog?.close();
  }

  function exportReligionsFile() {
    const payload = buildExportPayload([RELIGION_SAVE_SCOPE_ID]);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ironarachne-religions.json';
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
    refreshSavedReligions();
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
  <title>Religion Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Religion Generator</h1>

  <p>Generate a fictional fantasy religion.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="selected-categories">Allow these religion categories</label>
    {#each allReligionCategoriesNames as categoryName}
      <ul>
        <li>
          <input
            type="checkbox"
            name="selected-categories"
            bind:group={selectedCategories}
            id="selected-categories"
            value={categoryName}
          />
          {categoryName}
        </li>
      </ul>
    {/each}
  </div>

  <div class="input-group complexity-controls">
    <label for="poly-standing">Polytheistic deity standing (when the draw is polytheism)</label>
    <select id="poly-standing" bind:value={polytheisticStanding}>
      <option value="random">Random</option>
      <option value="egalitarian">Egalitarian — coequal high gods</option>
      <option value="hierarchical">Hierarchical — uneven cult and precedence</option>
      <option value="balanced">Balanced — fluid, situational prominence</option>
    </select>
    <p class="field-hint">
      Monotheism ignores this. Egalitarian polytheism avoids elevating one king of the gods.
    </p>

    <label for="spirit-depth">Spirit cosmology depth (when the religion has deities)</label>
    <select id="spirit-depth" bind:value={spiritCosmologyDepth}>
      <option value="random">Random</option>
      <option value="none">None — only the high gods as named</option>
      <option value="shallow">Shallow — one or two extra orders (messengers, ancestors, etc.)</option>
      <option value="moderate">Moderate — several intermediate kinds</option>
      <option value="deep">Deep — many ranks and overlapping jurisdictions</option>
    </select>
    <p class="field-hint">
      Adds structured spirit echelons (messengers, rebels, nature spirits, saints, psychopomps, …) with
      varying rank depth.
    </p>
  </div>

  <div class="input-group">
    <label for="selected-species">Allow deities of these species</label>
    {#each allSpeciesNames as speciesName}
      <ul>
        <li>
          <input
            type="checkbox"
            name="selected-species"
            bind:group={selectedSpecies}
            id="selected-species"
            value={speciesName}
          />
          {speciesName}
        </li>
      </ul>
    {/each}
  </div>

  {#if savedCultures.length > 0}
    <div class="input-group">
      <label for="useSavedCulture">Use a saved culture for naming?</label>
      <input
        type="checkbox"
        name="useSavedCulture"
        bind:checked={useSavedCulture}
        id="useSavedCulture"
      />
    </div>

    <div class="input-group">
      <label for="savedCulture">Select a saved culture to load</label>
      <select bind:value={savedCulture}>
        {#each savedCultures as saved}
          <option value={saved.name}>{saved.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <button onclick={generate}>Generate</button>
  <button type="button" onclick={saveReligion}>Save</button>
  <button type="button" onclick={openLoadDialog}>Load...</button>

  <div class="input-group religion-save-file-actions">
    <button type="button" onclick={exportReligionsFile}>Export saved religions (JSON)</button>
    <button type="button" onclick={triggerImportPicker}>Import saves from file</button>
    <input
      bind:this={importInput}
      type="file"
      accept="application/json,.json"
      style="display: none"
      onchange={onImportFile}
    />
  </div>

  <h2>{religion.name}</h2>

  <p>{religion.description}</p>

  {#if religion.nonTheisticDetail}
    <h3>Tradition detail (non-theistic)</h3>
    <p>{religion.nonTheisticDetail.mediationSummary}</p>
    <p><strong>Purity and pollution:</strong> {religion.nonTheisticDetail.pollutionOrPurityNotes}</p>
  {/if}

  {#if religion.dimensions}
    <h3>Comparative dimensions</h3>
    <p class="dimensions-intro">
      Aspects after Ninian Smart (ritual, experiential, mythological, doctrinal, ethical, institutional,
      material).
    </p>
    {#each ALL_RELIGION_DIMENSION_IDS as dimId}
      {#if religion.dimensions[dimId]}
        <div class="dimension-block">
          <h4>{dimensionSectionTitles[dimId]}</h4>
          <p>{summaryTextForReligionDimension(dimId, religion.dimensions[dimId])}</p>
        </div>
      {/if}
    {/each}
  {/if}

  {#if religion.cosmology}
    <h3>Spirit cosmology</h3>
    <p>{religion.cosmology.summary}</p>
    <ul class="cosmology-echelons">
      {#each religion.cosmology.echelons as ech}
        <li>
          <strong>{ech.label}</strong>
          (rank depth {ech.rankDepth}):
          {ech.summary}
        </li>
      {/each}
    </ul>
  {/if}

  <h3>Realms</h3>

  {#each religion.realms as realm}
    <div>
      <h4>{realm.name}</h4>
      <p>{realm.description}</p>
    </div>
  {/each}

  {#if religion.pantheon !== null}
    <h3>Deities</h3>

    <p>{religion.pantheon.description}</p>

    {#each religion.pantheon.members as member}
      <div>
        <h4>{member.name}</h4>

        <p>{member.titles?.join(',')}</p>

        <p><strong>Domains:</strong> {listDomains(member.domains)}</p>

        <p><strong>Holy Item:</strong> {member.holyItem}</p>
        <p><strong>Holy Symbol:</strong> {member.holySymbol}</p>

        <p>{member.description}</p>

        {#if member.relationships.length > 0}
          <div>
            <strong>Relationships:</strong>
            <ul>
              {#each member.relationships as relationship}
                <li>{relationship.description}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</section>

<dialog bind:this={loadDialog} class="religion-load-dialog">
  <form method="dialog" class="religion-load-dialog-content">
    <h2>Load Saved Religion</h2>

    {#if savedReligions.length === 0}
      <p>No saved religions yet. Generate a religion and click Save.</p>
    {:else}
      <ul class="religion-load-list">
        {#each savedReligions as saved, index (index)}
          <li class="religion-load-item">
            <div class="religion-load-item-details">
              <p class="religion-load-item-name">{saved.name}</p>
              <p class="religion-load-item-seed">Seed: {saved.seed}</p>
            </div>
            <button type="button" onclick={() => loadSavedReligion(saved)}>Load</button>
          </li>
        {/each}
      </ul>
    {/if}

    <div class="religion-load-dialog-actions">
      <button value="cancel">Cancel</button>
    </div>
  </form>
</dialog>

<style>
  .input-group {
    ul > li {
      list-style: none;
    }
  }

  .dimensions-intro {
    font-size: 0.95rem;
    opacity: 0.9;
  }

  .dimension-block {
    margin-bottom: 1rem;
  }

  .complexity-controls label {
    display: block;
    margin-top: 0.75rem;
  }

  .complexity-controls select {
    margin-top: 0.25rem;
    max-width: 100%;
  }

  .field-hint {
    font-size: 0.9rem;
    opacity: 0.88;
    margin: 0.25rem 0 0.5rem;
  }

  .cosmology-echelons li {
    margin-bottom: 0.5rem;
  }

  dialog.religion-load-dialog {
    border: 1px solid var(--gold, #c9a227);
    border-radius: 4px;
    padding: 0;
    max-width: 40rem;
    width: calc(100% - 2rem);
    background: var(--background, #1a1a1a);
    color: inherit;
  }

  dialog.religion-load-dialog::backdrop {
    background: rgb(0 0 0 / 50%);
  }

  .religion-load-dialog-content {
    padding: 1rem 1.25rem;
  }

  .religion-load-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .religion-load-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .religion-load-item:last-child {
    border-bottom: none;
  }

  .religion-load-item-details {
    min-width: 0;
  }

  .religion-load-item-name,
  .religion-load-item-seed {
    margin: 0;
  }

  .religion-load-item-name {
    font-weight: 600;
  }

  .religion-load-item-seed {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .religion-load-dialog-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
</style>
