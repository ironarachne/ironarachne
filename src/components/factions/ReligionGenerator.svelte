<script lang="ts">
  import { onMount } from 'svelte';
  import * as Names from '$lib/names';
  import * as RNG from '@ironarachne/rng';
  import * as CommonSpecies from '$lib/species/common.js';
  import * as ReligionCategories from '$lib/religion/categories';
  import type Species from '$lib/species/species';
  import type { Culture } from '$lib/culture';
  import type { Religion } from '$lib/religion/religion_types';
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
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import ExportImportRow from '$components/common/ExportImportRow.svelte';
  import LoadSnapshotDialog from '$components/common/LoadSnapshotDialog.svelte';
  import SavedCulturePicker from '$components/common/SavedCulturePicker.svelte';

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
  let loadDialogComponent: LoadSnapshotDialog | undefined = $state();

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
    } else {
      generate();
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

  let religion: Religion | null = $state(null);

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
    if (!religion) return;
    appendSavedReligion(toReligionSnapshot(religion, seed, currentGeneratorOptions()));
    refreshSavedReligions();
  }

  function openLoadDialog() {
    refreshSavedReligions();
    loadDialogComponent?.open();
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
    loadDialogComponent?.close();
  }

  function handleLoadReligionItem(item: { name: string; seed: string }) {
    const snapshot = savedReligions.find((s) => s.seed === item.seed);
    if (snapshot !== undefined) {
      loadSavedReligion(snapshot);
    }
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

  async function onImportFile(file: File) {
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

  const loadDialogItems = $derived(savedReligions.map((s) => ({ name: s.name, seed: s.seed })));
</script>

<GeneratorPage theme="fantasy" title="Fantasy Religion Generator">
  {#snippet description()}
    <p>Generate a fictional fantasy religion.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

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
      <option value="shallow"
        >Shallow — one or two extra orders (messengers, ancestors, etc.)</option
      >
      <option value="moderate">Moderate — several intermediate kinds</option>
      <option value="deep">Deep — many ranks and overlapping jurisdictions</option>
    </select>
    <p class="field-hint">
      Adds structured spirit echelons (messengers, rebels, nature spirits, saints, psychopomps, …)
      with varying rank depth.
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

  <SavedCulturePicker cultures={savedCultures} bind:useSavedCulture bind:savedCulture />

  <button onclick={generate}>Generate</button>
  <button type="button" onclick={saveReligion}>Save</button>
  <button type="button" onclick={openLoadDialog}>Load...</button>

  <ExportImportRow onExport={exportReligionsFile} onImport={onImportFile} />

  {#if religion}
    <h2>{religion.name}</h2>

    <p>{religion.description}</p>

    {#if religion.nonTheisticDetail}
      <h3>Tradition detail (non-theistic)</h3>
      <p>{religion.nonTheisticDetail.mediationSummary}</p>
      <p>
        <strong>Purity and pollution:</strong>
        {religion.nonTheisticDetail.pollutionOrPurityNotes}
      </p>
    {/if}

    {#if religion.dimensions}
      <h3>Comparative dimensions</h3>
      <p class="dimensions-intro">
        Aspects after Ninian Smart (ritual, experiential, mythological, doctrinal, ethical,
        institutional, material).
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
  {/if}
</GeneratorPage>

<LoadSnapshotDialog
  bind:this={loadDialogComponent}
  title="Load Saved Religion"
  items={loadDialogItems}
  onLoad={handleLoadReligionItem}
  emptyMessage="No saved religions yet. Generate a religion and click Save."
/>

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
</style>
