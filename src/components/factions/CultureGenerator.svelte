<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { onMount } from 'svelte';
  import {
    CULTURE_ARTIFACT_KIND,
    cultureFileStem,
    cultureToMarkdown,
    cultureToPlainText,
    generateCulture,
    getDefaultCultureGenerationConfig,
    loadSavedCultures,
    toCultureSnapshot,
    type Culture,
  } from '$lib/culture';
  import type { ArtifactReference } from '$lib/artifacts';
  import Download from '$lib/download';
  import {
    applyImportedScopes,
    clearLoadParamFromUrl,
    readLoadCueFromUrl,
  } from '$lib/persistent_save';
  import { getAllFantasyNameGeneratorSets, type NameGeneratorSet } from '$lib/names';
  import { downloadTextPdf } from '$lib/pdf';
  import { RELIGION_ARTIFACT_KIND, type RestoredReligion } from '$lib/religion';
  import { recordGeneration } from '$lib/session_log';
  import { showAlertModal } from '$lib/ui';
  import type { ToolCue } from '$lib/workshop';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import ExportImportRow from '$components/common/ExportImportRow.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';

  const TOOL_PATH = '/culture';

  type Props = {
    /**
     * A request from the session log to roll a particular culture again. Absent everywhere except
     * a workshop panel that has been pressed in the log.
     */
    cue?: ToolCue;
  };

  const { cue }: Props = $props();

  const rng = new RNG.RNG(Date.now());
  const allNameSets = getAllFantasyNameGeneratorSets(rng);

  const initialSeed = rng.randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  const genConfig = getDefaultCultureGenerationConfig();
  let genSet: NameGeneratorSet = rng.item(allNameSets);
  genConfig.nameGenerators = genSet;
  let culture = $state<Culture | null>(null);

  // Filled in by the picker: whether the offer was taken up, which religion, the religion itself
  // rebuilt by its own kind, and the link to record on whatever this culture is saved as.
  let useSavedReligion: boolean = $state(false);
  let religionArtifactId: string | undefined = $state();
  // The religion kind's live value is the restored *record* — the religion, the seed it was rolled
  // from, and the options — not a bare religion. What a picker hands back is whatever that kind's
  // codec rebuilds, so a consumer has to speak its shape.
  let referencedReligion: RestoredReligion | undefined = $state();
  let religionReference: ArtifactReference | undefined = $state();
  let religionProblem: string | null = $state(null);

  /**
   * The link to record on whatever is saved, and only when the culture on screen actually used it.
   *
   * Gated on the payload rather than on the checkbox: a reference is a record of what the tool was
   * handed, and one written for a culture that rolled its own religion would claim an input that
   * was never used.
   */
  const references = $derived(
    culture?.religion === null && religionReference !== undefined ? [religionReference] : [],
  );

  /**
   * Whether the next roll should defer to a referenced religion rather than roll its own.
   *
   * It waits for the religion to have actually loaded. A ticked box whose artifact has not come
   * back yet — or came back unreadable — would otherwise produce a culture with no religion at
   * all and no reference to explain the gap.
   */
  const religionSource = $derived(
    useSavedReligion && referencedReligion !== undefined ? 'reference' : 'generate',
  );

  /**
   * A religion has been chosen and has not arrived yet.
   *
   * Generating during this window would quietly ignore the choice and roll a religion of its own,
   * and the user would have no way of telling that from a culture that took the one they picked.
   * So the roll waits — briefly, and only while there is something to wait for. A chosen artifact
   * that cannot be read reports a problem instead of a value, and waiting on that would be waiting
   * forever.
   */
  const awaitingReligion = $derived(
    useSavedReligion &&
      religionArtifactId !== undefined &&
      referencedReligion === undefined &&
      religionProblem === null,
  );

  /**
   * The deep link `/saved-data` used to produce. Nothing generates these any more — that page is
   * gone (#44) — but people bookmarked them, so this still honours one.
   */
  const CULTURE_LOAD_PARAM = 'name';

  onMount(() => {
    const nameParam = readLoadCueFromUrl(CULTURE_LOAD_PARAM);
    if (nameParam !== null) {
      showLegacyCultureNamed(nameParam);
      clearLoadParamFromUrl(CULTURE_LOAD_PARAM);
    } else {
      generate();
    }
  });

  /**
   * Show a culture saved under the old per-generator scope, named by the `/saved-data` link that
   * sent the user here.
   *
   * Read-only, and the last thing on this page that touches that scope: cultures are saved into a
   * project now. It stays while the legacy scope does — a bookmarked link that quietly stopped
   * showing the culture it names would fail without saying so.
   */
  function showLegacyCultureNamed(name: string) {
    const found = loadSavedCultures().find((saved) => saved.name === name);
    if (found !== undefined) {
      culture = found;
      return;
    }
    generate();
  }

  /**
   * Where a replay says the culture on screen got its religion, for the one roll that honours it.
   *
   * A plain variable: it is read once, synchronously, inside the roll it belongs to, and putting
   * it in the reactive graph would make it a second copy of the picker's state.
   */
  let cuedReligionSource: 'generate' | 'reference' | undefined;

  function generate(keepSeed = false) {
    if (!keepSeed && !lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    genSet = rng.item(allNameSets);
    genConfig.nameGenerators = genSet;
    genConfig.religionSource = cuedReligionSource ?? religionSource;
    const rolled = generateCulture(seed, genConfig);
    culture = rolled;

    // Reported with the settings it rolled *with*: the resolved pattern set rather than the draw
    // that chose it, and where this culture's religion actually came from rather than where the
    // next roll would get one. The two differ the moment the picker is touched.
    recordGeneration({
      toolPath: TOOL_PATH,
      summary: rolled.name,
      seed,
      config: {
        nameGeneratorSet: rolled.nameGenerators.name,
        religionSource: genConfig.religionSource,
      },
    });
  }

  /**
   * The cue this panel has already acted on.
   *
   * Compared by id and not by contents: pressing the same log entry twice is two distinct
   * requests, and comparing seeds would swallow the second. A plain variable rather than `$state`
   * because nothing renders from it, which is also what keeps the effect from retriggering itself.
   */
  let lastCueId: string | undefined;

  $effect(() => {
    if (cue === undefined || cue.id === lastCueId) {
      return;
    }
    lastCueId = cue.id;
    applyCue(cue);
  });

  /**
   * Roll a recorded run again.
   *
   * The recorded `nameGeneratorSet` is deliberately not applied: this generator draws its pattern
   * set from the seed, so restoring the seed restores the set. It is recorded because provenance
   * records it — a saved culture's re-roll has no seeded draw to reach back into.
   */
  function applyCue(request: ToolCue) {
    const source = request.config.religionSource;
    seed = request.seed;
    cuedReligionSource = source === 'generate' || source === 'reference' ? source : undefined;
    generate(true);
    cuedReligionSource = undefined;
  }

  // The snapshot is what a project stores, and the generator already owns the conversion: the
  // payload is the truth, so what is kept is what is on screen rather than the seed that made it.
  const cultureSnapshot = $derived(culture === null ? null : toCultureSnapshot(culture));

  /**
   * The religion to show and to export: the culture's own, or the referenced one standing in for
   * it. A culture rolled against a reference carries `null`, which is the point — it holds no copy
   * of a religion that someone may edit later.
   */
  /**
   * Where the culture on screen got its religion, which is what provenance should record — not
   * where the next roll would get one. They differ the moment the box is ticked and nothing has
   * been rolled since, and a re-roll reads this.
   */
  const rolledReligionSource = $derived(culture?.religion === null ? 'reference' : 'generate');

  const shownReligion = $derived(
    culture === null ? null : (culture.religion ?? referencedReligion?.religion ?? null),
  );

  /**
   * Example names, drawn once per culture.
   *
   * Derived rather than called from the markup: a generator in the template rolls fresh names on
   * every re-render, so the lists used to shuffle whenever anything else on the page changed, and
   * an export could never match what the user was looking at.
   */
  const sampleNames = $derived(
    culture === null
      ? null
      : {
          male: culture.nameGenerators.male.generate(10),
          female: culture.nameGenerators.female.generate(10),
          family: culture.nameGenerators.family.generate(10),
          country: culture.nameGenerators.country.generate(10),
          town: culture.nameGenerators.town.generate(10),
        },
  );

  let downloadingPdf = $state(false);

  function exportMarkdown() {
    if (culture === null || sampleNames === null) {
      return;
    }
    const markdown = cultureToMarkdown(culture, { sampleNames, religion: shownReligion });
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${cultureFileStem(culture)}.md`);
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    if (culture === null || sampleNames === null || downloadingPdf) {
      return;
    }
    downloadingPdf = true;
    try {
      await downloadTextPdf(
        `The ${culture.name} Culture`,
        cultureToPlainText(culture, { sampleNames, religion: shownReligion }),
        `${cultureFileStem(culture)}.pdf`,
      );
    } finally {
      downloadingPdf = false;
    }
  }

  /**
   * Take in a file exported by an older build, which lands in the old `localStorage` scope.
   *
   * Kept without its matching export button, deliberately. A user who backed cultures up that way
   * must still be able to bring them back — the root layout adopts what lands there into a project
   * on the next load — but offering to *write* such a file now would produce something missing
   * every culture saved since, labelled as a backup.
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

<GeneratorPage toolPath={TOOL_PATH} theme="fantasy" title="Culture Generator">
  {#snippet description()}
    <p>This generator lets you create fantasy cultures.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <SavedArtifactPicker
    kind={RELIGION_ARTIFACT_KIND}
    role="religion"
    checkboxLabel="Use a saved religion?"
    selectLabel="Saved religion"
    bind:enabled={useSavedReligion}
    bind:artifactId={religionArtifactId}
    bind:value={referencedReligion}
    bind:reference={religionReference}
    bind:problem={religionProblem}
  />

  <button onclick={() => generate()} disabled={awaitingReligion}>Generate</button>

  <SaveArtifactButton
    kind={CULTURE_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={cultureSnapshot}
    {seed}
    config={{
      nameGeneratorSet: cultureSnapshot?.nameGenerators.name ?? '',
      religionSource: rolledReligionSource,
    }}
    defaultName={culture?.name ?? ''}
    {references}
  />

  {#if culture}
    <h2>The {culture.name} Culture</h2>

    <div class="culture-exports">
      <button type="button" onclick={exportMarkdown}>Download Markdown</button>
      <DownloadPdfButton onclick={exportPdf} downloading={downloadingPdf} />
    </div>

    <h3>Common Names</h3>

    <div class="namelist">
      <div>
        <h4>Male Names</h4>
        <ul>
          {#each sampleNames?.male ?? [] as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>
      <div>
        <h4>Female Names</h4>
        <ul>
          {#each sampleNames?.female ?? [] as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>
      <div>
        <h4>Family Names</h4>
        <ul>
          {#each sampleNames?.family ?? [] as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>
    </div>

    <div class="namelist">
      <div>
        <h4>Country Names</h4>

        <ul>
          {#each sampleNames?.country ?? [] as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>
      <div>
        <h4>Town Names</h4>

        <ul>
          {#each sampleNames?.town ?? [] as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>
    </div>

    <h3>Organization</h3>

    <p>{culture.organization.description}</p>

    <h3>Religion</h3>

    {#if shownReligion === null}
      <p>
        This culture takes its religion from a saved religion. Choose one above, or generate again
        without one to give it a religion of its own.
      </p>
    {:else}
      {#if culture.religion === null}
        <!-- Named as borrowed, because it is: the culture stores a link, not a copy, so editing
             that religion changes what this culture believes. -->
        <p class="culture-referenced-religion">From the saved religion {shownReligion.name}.</p>
      {/if}
      <p>{shownReligion.description}</p>
    {/if}

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
  {/if}

  <h2>Older saved cultures</h2>

  <p>
    Cultures are saved into a project now. A file exported by an older version of the site can still
    be brought in here, and it joins a project the next time the page loads.
  </p>

  <ExportImportRow onImport={onImportFile} />
</GeneratorPage>

<style>
  /* Three fixed columns only ever just fit a 320px phone, and generated names
     have no upper bound on length. Let the columns reflow instead: three side
     by side wherever they fit, fewer when they don't. */
  .namelist {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
    align-items: start;
    justify-items: center;
  }

  .culture-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .culture-referenced-religion {
    font-style: italic;
    opacity: 0.9;
  }
</style>
