<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import { onMount } from 'svelte';

  import type { ArtifactReference } from '$lib/artifacts';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import Download from '$lib/download';
  import { getFantasyNameGeneratorSetNames } from '$lib/names';
  import { downloadTextPdf } from '$lib/pdf';
  import { RELIGION_ARTIFACT_KIND, type RestoredReligion } from '$lib/religion';
  import { recordGeneration } from '$lib/session_log';
  import {
    rollSettlement,
    settlementFileStem,
    settlementSummaryLine,
    settlementToMarkdown,
    settlementToPlainText,
    toSettlementSnapshot,
    SETTLEMENT_ARTIFACT_KIND,
    type Settlement,
    type SettlementSizeFilter,
  } from '$lib/settlements';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import type { ToolCue } from '$lib/workshop';

  const TOOL_PATH = '/fantasy/settlement';

  type Props = {
    /**
     * A request from the session log to roll a particular settlement again. Absent everywhere
     * except a workshop panel that has been pressed in the log.
     */
    cue?: ToolCue;
  };

  const { cue }: Props = $props();

  let seed = $state(new RNG(Date.now().toString()).randomString(13));
  let lockSeed = $state(false);

  const nameSetNames = getFantasyNameGeneratorSetNames();
  let nameSetName = $state('any');

  let sizeClass = $state<SettlementSizeFilter>('any');
  let includeTrade = $state(false);
  let includeProblems = $state(false);
  let includeOrganizations = $state(false);
  let includeNotables = $state(false);

  // Filled in by the picker: the culture whose tongue names this place, rebuilt by its own kind.
  let useSavedCulture = $state(false);
  let cultureArtifactId: string | undefined = $state();
  let culture: Culture | undefined = $state();
  let cultureReference: ArtifactReference | undefined = $state();
  let cultureProblem: string | null = $state(null);

  // And the faith practised here. The religion kind's live value is the restored *record* — the
  // religion, its seed, and its options — not a bare religion, so a consumer speaks that shape.
  let useSavedReligion = $state(false);
  let referencedReligion: RestoredReligion | undefined = $state();
  let religionReference: ArtifactReference | undefined = $state();
  let religionProblem: string | null = $state(null);

  let settlement = $state<Settlement | null>(null);
  /**
   * What the settlement on screen was actually rolled with, as opposed to what the next roll would
   * use. The two differ the moment a control is changed and nothing has been rolled since, and
   * provenance has to record the first: a re-roll reads it, and a config describing settings the
   * settlement was never made with would produce a different place under the same name.
   *
   * `$state.raw`, and that is load-bearing rather than a preference. A plain `$state` object is a
   * deep proxy, provenance is copied into the record by reference, and IndexedDB stores through
   * `structuredClone`, which refuses a proxy outright — the save comes back as
   * `storage-failed: could not be cloned`. Nothing here is ever mutated in place; a roll replaces
   * the whole record, which is what raw state is for.
   */
  let rolledConfig = $state.raw<Record<string, unknown>>({});
  /**
   * The culture link, recorded only when the settlement on screen was actually named from it.
   *
   * Gated on the roll rather than on the checkbox, because a reference is a record of what the
   * tool was handed. One written for a settlement whose names were drawn at random would claim an
   * input that was never used.
   */
  let rolledCultureReference = $state<ArtifactReference | undefined>();
  /**
   * The name of that culture, kept beside the link rather than read back off the picker.
   *
   * Unticking the box clears the picker's value, and a line that read from it would vanish while
   * the reference it describes was still there to be saved — the page would stop crediting an
   * input the artifact still records.
   */
  let rolledCultureName = $state<string | undefined>();

  /**
   * A culture has been chosen and has not arrived yet.
   *
   * Rolling in that window would quietly ignore the choice and draw a pattern set at random, and
   * the user would have no way of telling that from a settlement that took the culture they picked.
   * A chosen artifact that cannot be read reports a problem instead of a value, and waiting on
   * that would be waiting forever.
   */
  const awaitingCulture = $derived(
    useSavedCulture &&
      cultureArtifactId !== undefined &&
      culture === undefined &&
      cultureProblem === null,
  );

  /**
   * The faith practised here, as a link rather than a copy.
   *
   * It follows the picker rather than the roll, and that is the difference between it and the
   * culture above: a culture is an *input*, consumed while the settlement is being made, whereas a
   * faith is something the user says about the place afterwards. Nothing about it is stored in the
   * payload — requirement 5.2 — so choosing one changes what the page shows and what an export
   * carries, and the artifact records which religion by id.
   */
  const shownReligion = $derived(useSavedReligion ? (referencedReligion?.religion ?? null) : null);

  const references = $derived(
    [rolledCultureReference, useSavedReligion ? religionReference : undefined].filter(
      (reference): reference is ArtifactReference => reference !== undefined,
    ),
  );

  const settlementSnapshot = $derived(
    settlement === null ? null : toSettlementSnapshot(settlement),
  );

  /**
   * Roll a settlement, through the library's own entry point rather than by assembling a config
   * here.
   *
   * That is the whole of requirement 2.2 for this tool. The page used to build its own
   * configuration inline — drawing name sets and an environment off a shared RNG in an order
   * nothing else could reproduce — which made "same seed, same settlement" true only for as long
   * as nobody touched this file, and left a re-roll with no way to reproduce anything.
   */
  function generate(keepSeed = false) {
    if (!keepSeed && !lockSeed) {
      seed = new RNG(Date.now().toString()).randomString(13);
    }
    const requestedSet = useSavedCulture ? culture?.nameGenerators.name : sanitisedNameSetName();
    const config = {
      ...(requestedSet === undefined ? {} : { nameGeneratorSet: requestedSet }),
      size: sizeClass,
      includeTrade,
      includeProblems,
      includeOrganizations,
      includeNotables,
    };
    const rolled = rollSettlement(seed, config);
    settlement = rolled.settlement;
    // The resolved set, not the requested one: "any" recorded as provenance would make a re-roll a
    // fresh draw rather than the same settlement again.
    const runConfig = { ...config, nameGeneratorSet: rolled.nameGeneratorSet };
    rolledConfig = runConfig;
    const namedFromCulture = useSavedCulture && culture !== undefined;
    rolledCultureReference = namedFromCulture ? cultureReference : undefined;
    rolledCultureName = namedFromCulture ? culture?.name : undefined;

    // The session log is told what was rolled, with the config it rolled *with* — the same value
    // provenance records, and for the same reason.
    recordGeneration({
      toolPath: TOOL_PATH,
      summary: rolled.settlement.name,
      seed,
      config: runConfig,
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

  function isSizeFilter(value: unknown): value is SettlementSizeFilter {
    return value === 'any' || value === 'small' || value === 'medium' || value === 'large';
  }

  /** Put the controls back where they were for a recorded run, and roll it again. */
  function applyCue(request: ToolCue) {
    const config = request.config;
    seed = request.seed;
    if (isSizeFilter(config.size)) {
      sizeClass = config.size;
    }
    includeTrade = config.includeTrade === true;
    includeProblems = config.includeProblems === true;
    includeOrganizations = config.includeOrganizations === true;
    includeNotables = config.includeNotables === true;
    if (
      typeof config.nameGeneratorSet === 'string' &&
      nameSetNames.includes(config.nameGeneratorSet)
    ) {
      // The recorded set is the one that was *drawn*, so it has to win over both an "any" left in
      // the control and a culture still in the picker — otherwise the same entry replays as a
      // different town. Nothing is lost by releasing the picker: a culture only ever contributed
      // the name of its pattern set, which is exactly what is being restored here.
      useSavedCulture = false;
      nameSetName = config.nameGeneratorSet;
    }
    generate(true);
  }

  function sanitisedNameSetName(): string | undefined {
    return nameSetName === 'any' ? undefined : nameSetName;
  }

  onMount(() => {
    generate();
  });

  let downloadingPdf = $state(false);

  function exportMarkdown() {
    if (settlement === null) {
      return;
    }
    const markdown = settlementToMarkdown(settlement, { religion: shownReligion });
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${settlementFileStem(settlement)}.md`);
    URL.revokeObjectURL(url);
  }

  async function exportPdf() {
    if (settlement === null || downloadingPdf) {
      return;
    }
    downloadingPdf = true;
    try {
      await downloadTextPdf(
        settlement.name,
        settlementToPlainText(settlement, { religion: shownReligion }),
        `${settlementFileStem(settlement)}.pdf`,
      );
    } finally {
      downloadingPdf = false;
    }
  }
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Settlement Generator">
  {#snippet description()}
    <p>
      Generate a settlement with derived facets (law, commerce, food security, health) and economic
      role. Optionally add narrative trade, acute/creeping problems, local organizations, and
      important people. A <strong>saved culture</strong> can name the town, its organizations, and
      its people, and a <strong>saved religion</strong> can be recorded as the faith practised here.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="size"
    label="Size class filter"
    bind:value={sizeClass}
    options={[
      { value: 'any', label: 'Any category' },
      { value: 'small', label: 'Small (hamlet, village)' },
      { value: 'medium', label: 'Medium (town, borough)' },
      { value: 'large', label: 'Large (city, metropolis)' },
    ]}
  />

  <SelectField
    id="nameSet"
    label="Name set (town, people, and orgs when enrichment is on)"
    bind:value={nameSetName}
    options={[
      { value: 'any', label: 'any (drawn from the seed)' },
      ...nameSetNames.map((name) => ({ value: name, label: name })),
    ]}
    disabled={useSavedCulture}
  />

  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Use a saved culture for all names"
    selectLabel="Saved culture"
    bind:enabled={useSavedCulture}
    bind:artifactId={cultureArtifactId}
    bind:value={culture}
    bind:reference={cultureReference}
    bind:problem={cultureProblem}
  />

  <SavedArtifactPicker
    kind={RELIGION_ARTIFACT_KIND}
    role="faith"
    checkboxLabel="Record a saved religion as the local faith?"
    selectLabel="Saved religion"
    bind:enabled={useSavedReligion}
    bind:value={referencedReligion}
    bind:reference={religionReference}
    bind:problem={religionProblem}
  />

  <h2>Optional enrichment</h2>
  <p>These layers add more details, depending on what you want to see. They are off by default.</p>

  <CheckboxField id="trade" label="Trade (imports / exports / blurb)" bind:checked={includeTrade} />
  <CheckboxField id="problems" label="Acute and creeping problems" bind:checked={includeProblems} />
  <CheckboxField id="orgs" label="Organizations" bind:checked={includeOrganizations} />
  <CheckboxField id="notables" label="Important characters (1–2)" bind:checked={includeNotables} />

  <p>
    <BaseButton onclick={() => generate()} disabled={awaitingCulture}>Generate</BaseButton>
  </p>

  <SaveArtifactButton
    kind={SETTLEMENT_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={settlementSnapshot}
    {seed}
    config={rolledConfig}
    defaultName={settlement?.name ?? ''}
    {references}
  />

  {#if settlement}
    {#if rolledCultureName !== undefined}
      <p class="settlement-referenced">Naming: <strong>{rolledCultureName}</strong> culture</p>
    {/if}
    <h2>{settlement.name}</h2>
    <p class="settlement-meta">{settlementSummaryLine(settlement)}</p>

    <div class="settlement-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <DownloadPdfButton onclick={exportPdf} downloading={downloadingPdf} />
    </div>

    <p>{settlement.description}</p>

    <h3>Facets</h3>
    <p>These are the key attributes of the settlement. They run from 0-10.</p>
    <ul>
      <li>Law and order: {settlement.lawAndOrder}</li>
      <li>Commerce: {settlement.commerce}</li>
      <li>Food security: {settlement.foodSecurity}</li>
      <li>Public health: {settlement.publicHealth}</li>
    </ul>

    <h3>Environment</h3>
    <p>{settlement.environment.description}</p>

    {#if useSavedReligion}
      <h3>Faith</h3>
      {#if shownReligion === null}
        <p>Choose a saved religion above to record the faith practised here.</p>
      {:else}
        <!-- Named as borrowed, because it is: the settlement stores a link, not a copy, so
             editing that religion changes what is practised here. -->
        <p class="settlement-referenced">From the saved religion {shownReligion.name}.</p>
        <p>{shownReligion.description}</p>
      {/if}
    {/if}

    {#if settlement.primaryImports && settlement.primaryImports.length > 0}
      <h3>Trade</h3>
      <p><strong>Exports:</strong> {settlement.primaryExports?.join(', ')}</p>
      <p><strong>Imports:</strong> {settlement.primaryImports.join(', ')}</p>
      {#if settlement.tradeBlurb}
        <p>{settlement.tradeBlurb}</p>
      {/if}
    {/if}

    {#if settlement.acuteProblems && settlement.acuteProblems.length > 0}
      <h3>Acute problems</h3>
      <ul>
        {#each settlement.acuteProblems as p}
          <li>
            {p.summary}
            {#if p.detail}
              <span class="detail">{p.detail}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if settlement.creepingProblems && settlement.creepingProblems.length > 0}
      <h3>Creeping problems</h3>
      <ul>
        {#each settlement.creepingProblems as p}
          <li>
            {p.summary}
            {#if p.detail}
              <span class="detail">{p.detail}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if settlement.organizations && settlement.organizations.length > 0}
      <h3>Organizations</h3>
      <ul>
        {#each settlement.organizations as o}
          <li><strong>{o.name}</strong>: {o.profile.hook}</li>
        {/each}
      </ul>
    {/if}

    {#if settlement.importantPeople && settlement.importantPeople.length > 0}
      <h3>Important people</h3>
      <ul class="notable-people">
        {#each settlement.importantPeople as p}
          <li>
            <strong>{p.roleDisplay || p.roleId}</strong>:
            {p.character.firstName}
            {p.character.lastName}
            <p class="importance">{p.importance}</p>
            {#if p.salientPersonality.length}
              <p class="traits-line">
                <span class="label">Notable demeanor:</span>
                {p.salientPersonality.join(' · ')}
              </p>
            {/if}
            {#if p.salientPhysical.length}
              <p class="traits-line">
                <span class="label">Striking look:</span>
                {p.salientPhysical.join(' · ')}
              </p>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</GeneratorPage>

<style>
  .settlement-referenced {
    margin-bottom: 0.5rem;
    font-size: 0.95em;
    font-style: italic;
    opacity: 0.9;
  }
  .settlement-meta {
    opacity: 0.95;
  }
  .settlement-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .detail {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.95em;
    opacity: 0.9;
  }
  .notable-people {
    list-style: disc;
    padding-left: 1.25rem;
  }
  .notable-people .importance {
    margin: 0.4rem 0 0.35rem;
    font-size: 0.95em;
    line-height: 1.45;
  }
  .notable-people .traits-line {
    margin: 0.25rem 0 0;
    font-size: 0.9em;
    line-height: 1.4;
    opacity: 0.95;
  }
  .notable-people .label {
    font-style: italic;
    margin-right: 0.35rem;
  }
</style>
