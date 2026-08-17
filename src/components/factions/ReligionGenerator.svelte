<script lang="ts">
  import { onMount } from 'svelte';
  import * as Names from '$lib/names';
  import * as RNG from '@ironarachne/rng';
  import { CommonSpecies } from '$lib/species';
  import {
    ReligionCategories,
    RELIGION_ARTIFACT_KIND,
    listDomains,
    ALL_RELIGION_DIMENSION_IDS,
    deityTitleLine,
    loadSavedReligionSnapshots,
    type PolytheisticStandingMode,
    type ReligionDimensionId,
    religionFileStem,
    religionFromSnapshot,
    religionToMarkdown,
    religionToPlainText,
    type ReligionGeneratorOptionsSnapshot,
    type ReligionSnapshot,
    type SpiritCosmologyDepthMode,
    generateReligion,
    getDefaultReligionGenerationConfig,
    summaryTextForReligionDimension,
    toReligionSnapshot,
  } from '$lib/religion';
  import type { Species } from '$lib/species';
  import type { Religion } from '$lib/religion';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import Download from '$lib/download';
  import { hydrateArtifacts, listArtifactsOfKind, type ArtifactReference } from '$lib/artifacts';
  import { downloadTextPdf } from '$lib/pdf';
  import { getActiveProject, hydrateProjects } from '$lib/projects';
  import {
    applyImportedScopes,
    clearLoadParamFromUrl,
    readLoadCueFromUrl,
  } from '$lib/persistent_save';
  import { showAlertModal } from '$lib/ui';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import ExportImportRow from '$components/common/ExportImportRow.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';

  const dimensionSectionTitles: Record<ReligionDimensionId, string> = {
    ritual: 'Ritual',
    experiential: 'Experiential',
    mythological: 'Mythological',
    doctrinal: 'Doctrinal',
    ethical: 'Ethical',
    institutional: 'Institutional',
    material: 'Material',
  };

  // One id per component instance: this generator may be mounted in a workshop panel and on its own
  // route at the same time, and two sets of checkboxes on a page must not collide on label `for`.
  const uid = $props.id();

  /**
   * The deep link `/saved-data` used to produce. Nothing generates these any more — that page is
   * gone (#44) — but people bookmarked them, so this still honours one.
   */
  const RELIGION_LOAD_PARAM = 'seed';

  onMount(() => {
    const seedParam = readLoadCueFromUrl(RELIGION_LOAD_PARAM);
    if (seedParam !== null) {
      showLegacyReligionSeeded(seedParam);
      clearLoadParamFromUrl(RELIGION_LOAD_PARAM);
    } else {
      generate();
    }
  });

  /**
   * Show a religion saved under the old per-generator scope, named by the `/saved-data` link that
   * sent the user here.
   *
   * Read-only, and the last thing on this page that touches that scope: religions are saved into a
   * project now. It stays while the legacy scope does — a bookmarked link that quietly stopped
   * showing the religion it names would fail without saying so.
   */
  function showLegacyReligionSeeded(savedSeed: string) {
    const found = loadSavedReligionSnapshots().find((saved) => saved.seed === savedSeed);
    if (found === undefined) {
      generate();
      return;
    }
    loadSavedReligion(found);
  }

  // Filled in by the picker: which saved culture supplies the names, the culture itself rebuilt by
  // its own kind, and the link to record on whatever this religion is saved as.
  let useSavedCulture: boolean = $state(false);
  let cultureArtifactId: string | undefined = $state();
  let culture: Culture | undefined = $state();
  let cultureReference: ArtifactReference | undefined = $state();
  let cultureProblem: string | null = $state(null);

  /**
   * The culture the religion **on screen** was actually named from, which is not the same question
   * as which culture the next roll would use. They differ the moment the box is ticked and nothing
   * has been rolled since.
   */
  let namingCulture: Culture | undefined = $state();

  /**
   * The culture a religion restored from an older save says it was named from, until that culture
   * arrives.
   *
   * A restored religion was named from a culture before this page was open, so nothing here rolled
   * it and `generate` never ran — and without this, saving it into a project would drop the link it
   * came with. It is matched by name because a name is all the old format kept, and it clears once
   * matched so that switching the picker afterwards cannot claim a culture this religion never saw.
   */
  let restoredCultureName: string | undefined = $state();
  $effect(() => {
    if (restoredCultureName !== undefined && culture?.name === restoredCultureName) {
      namingCulture = culture;
      rolledSettings = { ...settingsOnScreen, nameGeneratorSet: culture.nameGenerators.name };
      restoredCultureName = undefined;
    }
  });

  /**
   * The link to record on whatever is saved, and only when the religion on screen actually used it.
   *
   * A reference is a record of what the tool was handed; one written for a religion that named its
   * own gods would claim an input that was never used.
   *
   * The name in `generatorOptions` is not a second copy of this. It is the older per-generator save
   * format, which predates projects and can only carry a name, and it is kept so a religion saved
   * the old way still says which culture it came from.
   */
  const savedCultureReferences = $derived(
    namingCulture !== undefined && cultureReference !== undefined ? [cultureReference] : [],
  );

  /**
   * A culture has been chosen and has not arrived yet.
   *
   * Generating during this window would quietly ignore the choice and name the gods itself, and the
   * user would have no way of telling that from a religion that took the culture they picked. So
   * the roll waits — briefly, and only while there is something to wait for. A chosen artifact that
   * cannot be read reports a problem instead of a value, and waiting on that would be waiting
   * forever.
   */
  const awaitingCulture = $derived(
    useSavedCulture &&
      cultureArtifactId !== undefined &&
      culture === undefined &&
      cultureProblem === null,
  );

  const rng = new RNG.RNG(Date.now().toString());
  const initialSeed = rng.randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  const humanNameGenSet = Names.getFantasyNameGeneratorSet('human', rng);
  const genConfig = getDefaultReligionGenerationConfig();

  const allSpecies = CommonSpecies.sentient();
  const allSpeciesNames = allSpecies.map((species) => species.name);
  const allReligionCategories = ReligionCategories.all();
  const allReligionCategoriesNames = allReligionCategories.map((category) => category.name);

  let selectedSpecies: string[] = $state(['human']);
  let selectedCategories: string[] = $state(allReligionCategories.map((c) => c.name));

  let polytheisticStanding: PolytheisticStandingMode = $state('random');
  let spiritCosmologyDepth: SpiritCosmologyDepthMode = $state('random');

  let religion: Religion | null = $state(null);

  /**
   * The settings the religion **on screen** was made with, as against the controls above, which say
   * what the next roll would use.
   *
   * They diverge the moment a checkbox is touched and nothing has been rolled since, and what an
   * artifact records about itself has to be the former: provenance is what a re-roll reads back, so
   * a config naming categories this religion was never drawn from would roll a religion of a
   * different kind entirely and call it the same one.
   *
   * Undefined only before anything has been generated, when there is also nothing to save.
   */
  type RolledSettings = {
    selectedCategories: string[];
    selectedSpecies: string[];
    polytheisticStanding: PolytheisticStandingMode;
    spiritCosmologyDepth: SpiritCosmologyDepthMode;
    nameGeneratorSet: string;
  };
  let rolledSettings: RolledSettings | undefined = $state();
  const settingsOnScreen = $derived(rolledSettings ?? liveSettings());

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    const speciesOptions: Species[] = [];
    for (let i = 0; i < selectedSpecies.length; i++) {
      speciesOptions.push(CommonSpecies.byName(selectedSpecies[i], allSpecies));
    }

    const categoryOptions = [];
    for (let i = 0; i < selectedCategories.length; i++) {
      categoryOptions.push(ReligionCategories.byName(selectedCategories[i], allReligionCategories));
    }

    genConfig.deitySpeciesOptions = speciesOptions;
    genConfig.categories = categoryOptions;
    genConfig.polytheisticStanding = polytheisticStanding;
    genConfig.spiritCosmologyDepth = spiritCosmologyDepth;

    // A referenced culture supplies the names and nothing else: its family generator names the
    // religion, and its personal ones name the gods.
    namingCulture = useSavedCulture ? culture : undefined;
    const names = namingCulture?.nameGenerators ?? humanNameGenSet;
    genConfig.nameGenerator = names.family;
    genConfig.femaleNameGenerator = names.female;
    genConfig.maleNameGenerator = names.male;

    religion = generateReligion(seed, genConfig);
    rolledSettings = { ...liveSettings(), nameGeneratorSet: names.name };
  }

  /** What the controls above are set to now — which is what the *next* roll would use. */
  function liveSettings(): RolledSettings {
    return {
      selectedCategories: [...selectedCategories],
      selectedSpecies: [...selectedSpecies],
      polytheisticStanding,
      spiritCosmologyDepth,
      nameGeneratorSet: humanNameGenSet.name,
    };
  }

  function currentGeneratorOptions(): ReligionGeneratorOptionsSnapshot {
    return {
      lockSeed,
      selectedCategories: [...settingsOnScreen.selectedCategories],
      selectedSpecies: [...settingsOnScreen.selectedSpecies],
      polytheisticStanding: settingsOnScreen.polytheisticStanding,
      spiritCosmologyDepth: settingsOnScreen.spiritCosmologyDepth,
      useSavedCulture: namingCulture !== undefined,
      savedCultureName: namingCulture?.name,
    };
  }

  /**
   * The name pattern set the religion on screen was named from, recorded as provenance.
   *
   * It is what makes a re-roll faithful to a religion that borrowed a culture's names: a roll is
   * handed a seed and a config, so without this it would have to reach back into the store for an
   * artifact it has no way to ask for, and would silently name the gods from somewhere else.
   */
  const nameGeneratorSet = $derived(settingsOnScreen.nameGeneratorSet);

  // What a project stores. The generator already owns the conversion, and the options travel with
  // it so a saved religion can be picked back up and rolled on from where it was left.
  const religionSnapshot = $derived(
    religion === null ? null : toReligionSnapshot(religion, seed, currentGeneratorOptions()),
  );

  /**
   * The culture a religion saved the old way named, as an artifact in the open project.
   *
   * A per-generator save from before projects existed carries a culture's *name* and nothing else,
   * so this is the only way back to the artifact. It matches or it does not: an unmatched name
   * leaves the picker empty rather than guessing, and the religion keeps the names it was saved
   * with. Names are not unique, so the first match wins — which is the most recently updated, the
   * order `listArtifactsOfKind` returns.
   *
   * It waits for the store, because this runs on mount and the reads are synchronous against an
   * index that may not have been read yet: without the await, restoring a religion from a link
   * would find an empty vault and quietly drop the culture.
   */
  async function selectSavedCultureNamed(name: string | undefined): Promise<void> {
    if (name === undefined) {
      return;
    }
    await Promise.all([hydrateProjects(), hydrateArtifacts()]);
    const projectId = getActiveProject()?.id;
    cultureArtifactId =
      projectId === undefined
        ? undefined
        : listArtifactsOfKind(projectId, CULTURE_ARTIFACT_KIND).find(
            (summary) => summary.name === name,
          )?.id;
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
    namingCulture = undefined;
    // Restoring is the other way a religion arrives on screen, so it captures its settings too —
    // from the options it was saved with rather than from the controls, which have just been set
    // from those same options. The name set is the one thing the old format never kept; the effect
    // above fills it in if the culture it names turns up.
    rolledSettings = {
      selectedCategories: [...restored.generatorOptions.selectedCategories],
      selectedSpecies: [...restored.generatorOptions.selectedSpecies],
      polytheisticStanding: restored.generatorOptions.polytheisticStanding,
      spiritCosmologyDepth: restored.generatorOptions.spiritCosmologyDepth,
      nameGeneratorSet: humanNameGenSet.name,
    };
    restoredCultureName = restored.generatorOptions.useSavedCulture
      ? restored.generatorOptions.savedCultureName
      : undefined;
    void selectSavedCultureNamed(restored.generatorOptions.savedCultureName);
    rng.setSeed(seed);
  }

  let downloadingPdf = $state(false);

  function exportMarkdown() {
    if (religion === null) {
      return;
    }
    const markdown = religionToMarkdown(religion);
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${religionFileStem(religion)}.md`);
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    if (religion === null || downloadingPdf) {
      return;
    }
    downloadingPdf = true;
    try {
      await downloadTextPdf(
        religion.name,
        religionToPlainText(religion),
        `${religionFileStem(religion)}.pdf`,
      );
    } finally {
      downloadingPdf = false;
    }
  }

  /**
   * Take in a file exported by an older build, which lands in the old `localStorage` scope.
   *
   * Kept without its matching export button, deliberately. A user who backed religions up that way
   * must still be able to bring them back — the root layout adopts what lands there into a project
   * on the next load — but offering to *write* such a file now would produce something missing
   * every religion saved since, labelled as a backup.
   */
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
    if (result.appliedScopes.length > 0) {
      void showAlertModal({
        message: `Imported ${result.appliedScopes.join(', ')}. Reload to add them to a project.`,
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

<GeneratorPage theme="fantasy" title="Fantasy Religion Generator">
  {#snippet description()}
    <p>Generate a fictional fantasy religion.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <fieldset class="input-group">
    <legend>Allow these religion categories</legend>
    <ul>
      {#each allReligionCategoriesNames as categoryName (categoryName)}
        <li>
          <input
            type="checkbox"
            name="{uid}-selected-categories"
            bind:group={selectedCategories}
            id="{uid}-category-{categoryName}"
            value={categoryName}
          />
          <label for="{uid}-category-{categoryName}">{categoryName}</label>
        </li>
      {/each}
    </ul>
  </fieldset>

  <div class="input-group complexity-controls">
    <label for="{uid}-poly-standing"
      >Polytheistic deity standing (when the draw is polytheism)</label
    >
    <select id="{uid}-poly-standing" bind:value={polytheisticStanding}>
      <option value="random">Random</option>
      <option value="egalitarian">Egalitarian — coequal high gods</option>
      <option value="hierarchical">Hierarchical — uneven cult and precedence</option>
      <option value="balanced">Balanced — fluid, situational prominence</option>
    </select>
    <p class="field-hint">
      Monotheism ignores this. Egalitarian polytheism avoids elevating one king of the gods.
    </p>

    <label for="{uid}-spirit-depth">Spirit cosmology depth (when the religion has deities)</label>
    <select id="{uid}-spirit-depth" bind:value={spiritCosmologyDepth}>
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

  <fieldset class="input-group">
    <legend>Allow deities of these species</legend>
    <ul>
      {#each allSpeciesNames as speciesName (speciesName)}
        <li>
          <input
            type="checkbox"
            name="{uid}-selected-species"
            bind:group={selectedSpecies}
            id="{uid}-species-{speciesName}"
            value={speciesName}
          />
          <label for="{uid}-species-{speciesName}">{speciesName}</label>
        </li>
      {/each}
    </ul>
  </fieldset>

  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Use a saved culture for naming?"
    bind:enabled={useSavedCulture}
    bind:artifactId={cultureArtifactId}
    bind:value={culture}
    bind:reference={cultureReference}
    bind:problem={cultureProblem}
  />

  <button onclick={generate} disabled={awaitingCulture}>Generate</button>

  <SaveArtifactButton
    kind={RELIGION_ARTIFACT_KIND}
    toolPath="/fantasy/religion"
    snapshot={religionSnapshot}
    {seed}
    config={{ ...currentGeneratorOptions(), nameGeneratorSet }}
    defaultName={religion?.name ?? ''}
    references={savedCultureReferences}
  />

  {#if religion}
    <h2>{religion.name}</h2>

    <div class="religion-exports">
      <button type="button" onclick={exportMarkdown}>Download Markdown</button>
      <DownloadPdfButton onclick={exportPdf} downloading={downloadingPdf} />
    </div>

    {#if namingCulture !== undefined}
      <!-- Named as borrowed, because it is: the gods are named in that culture's tongue, and the
           link recorded on a saved religion says which culture it was. -->
      <p class="religion-naming-culture">Named from the saved culture {namingCulture.name}.</p>
    {/if}

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

          <!-- A title is a record with a form per gender, not a string: printing the array
               straight read as "[object Object]" the moment a god was crowned. -->
          {#if deityTitleLine(member) !== ''}
            <p>{deityTitleLine(member)}</p>
          {/if}

          <p><strong>Domains:</strong> {listDomains(member.domains)}</p>

          {#if member.holyItem !== null}
            <p><strong>Holy Item:</strong> {member.holyItem}</p>
          {/if}
          {#if member.holySymbol !== null}
            <p><strong>Holy Symbol:</strong> {member.holySymbol}</p>
          {/if}

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

  <h2>Older saved religions</h2>

  <p>
    Religions are saved into a project now. A file exported by an older version of the site can
    still be brought in here, and it joins a project the next time the page loads.
  </p>

  <ExportImportRow onImport={onImportFile} />
</GeneratorPage>

<style>
  .input-group {
    ul {
      margin: 0;
      padding: 0;
    }

    ul > li {
      list-style: none;
    }
  }

  /* The checkbox lists are grouped, so their heading is a legend rather than a label pointing at
     one arbitrary box among six. */
  fieldset.input-group {
    border: none;
    margin: 0;
    padding: 0;
  }

  fieldset.input-group legend {
    padding: 0;
  }

  .religion-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .religion-naming-culture {
    font-style: italic;
    opacity: 0.9;
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
