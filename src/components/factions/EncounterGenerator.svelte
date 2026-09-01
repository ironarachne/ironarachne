<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import { onMount } from 'svelte';
  import * as Encounters from '$lib/encounters';
  import type { Encounter, EncounterGeneratorConfigRecord } from '$lib/encounters';
  import type { Creature } from '$lib/creatures';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import ArchetypeBadge from '$components/characters/ArchetypeBadge.svelte';
  import SpeciesBadge from '$components/characters/SpeciesBadge.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/fantasy/encounter';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. The page used to build a whole new
   * `RNG` from `Date.now()` on every press to take one string from it, and held a second RNG in
   * `$state` that nothing read.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  const encounterTemplates = Encounters.getAllFantasyEncounterTemplates()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  let selectedTemplateName = $state('any');
  let forceUniformSpecies = $state(false);

  /**
   * The rolled encounter.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`. The same trap is written up in `$lib/workshop`'s
   * README beside `saveToolArtifact`.
   */
  let encounter = $state.raw<Encounter | null>(null);

  /** What the roll records about itself: the page's two controls, as provenance (3.6). */
  const generatorConfig = $derived<EncounterGeneratorConfigRecord>({
    ...(selectedTemplateName === 'any' ? {} : { templateName: selectedTemplateName }),
    forceUniformSpecies,
  });

  const encounterSnapshot = $derived(
    encounter === null ? null : Encounters.toEncounterSnapshot(encounter),
  );

  const defaultArtifactName = $derived(
    encounter === null ? '' : Encounters.encounterDisplayName(encounter),
  );

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    encounter = Encounters.rollEncounter(seed, generatorConfig);
  }

  function exportMarkdown() {
    if (encounter === null) {
      return;
    }
    downloadTextFile(
      Encounters.encounterToMarkdown(encounter),
      `${Encounters.encounterFileStem(encounter)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (encounter === null) {
      return;
    }
    await downloadTextPdf(
      Encounters.encounterDisplayName(encounter),
      Encounters.encounterToText(encounter),
      `${Encounters.encounterFileStem(encounter)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Encounter Generation">
  {#snippet description()}
    <p>This generator creates random encounters.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="template"
    label="Template"
    bind:value={selectedTemplateName}
    options={[
      { value: 'any', label: 'Any' },
      ...encounterTemplates.map((t) => ({ value: t.name, label: t.name })),
    ]}
  />

  <CheckboxField
    id="force-uniform-species"
    label="Force Uniform Species"
    bind:checked={forceUniformSpecies}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={Encounters.ENCOUNTER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={encounterSnapshot}
    {seed}
    config={generatorConfig}
    defaultName={defaultArtifactName}
  />

  {#if encounter}
    <div class="encounter-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
    </div>

    <!-- A result surface is a panel, not a box with a border on it: the two layers,
         and the keyline, corner and padding are the system's. It wrote its own
         border, radius and padding until #124. -->
    <div class="stat-block panel">
      <div class="panel__field">
        <div class="encounter-header">
          <h2>{encounter.name}</h2>
        </div>
      </div>

      {#each encounter.groups as group, index}
        <div class="group-section">
          <h3>{Encounters.encounterGroupHeading(group, index)}</h3>
          <ul>
            {#each group.mobs as mob}
              {@const line = Encounters.describeEncounterMob(mob)}
              <!-- `Mob` itself carries no species; every mob an encounter rolls is a `Creature`
                   or a `Character`, and both do. -->
              {@const species = (mob as Creature).species}
              <li class="mob-row">
                <strong>{line.name}</strong>
                <SpeciesBadge speciesName={species.name} size="sm" />
                {#if Encounters.isEncounterCharacter(mob) && mob.archetype}
                  <ArchetypeBadge archetypeName={mob.archetype.name} size="sm" />
                {/if}
                {#if line.kind !== ''}
                  <span class="mob-meta">— {line.kind}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</GeneratorPage>

<style>
  .encounter-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* The keyline, the corner, the padding and the fill are the panel's now — the fill was a
     40% mix of slate, which is a fourth surface level invented in one component. */
  .stat-block {
    margin-top: var(--s8);
  }

  .stat-block h2 {
    margin-top: 0;
    text-transform: capitalize;
  }

  .group-section {
    margin-top: var(--s7);
  }

  .group-section ul {
    list-style-type: none;
    padding-left: 0;
    margin-left: 0;
  }

  .group-section li {
    margin-left: 0;
    margin-bottom: var(--s4);
    /* A row in a list inside a panel, which the panel language says is a row rather than a
       third box: the well the list sits in already says the rows are held. The fill was a mix of
       charcoal and white invented here, and the radius was outside the vocabulary. */
    padding: var(--s4);
  }

  .mob-row {
    display: flex;
    align-items: center;
    gap: var(--s3);
    flex-wrap: wrap;
  }

  .mob-meta {
    color: color-mix(in srgb, currentColor 70%, transparent);
  }
</style>
