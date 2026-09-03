<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import BaseButton from '$components/common/BaseButton.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import {
    POTION_ARTIFACT_KIND,
    potionFileStem,
    potionToDocument,
    potionToMarkdown,
    potionToText,
    rollPotion,
    toPotionSnapshot,
    type PotionGeneratorConfigRecord,
    type PotionSnapshot,
  } from '$lib/potions';

  const TOOL_PATH = '/fantasy/potion-generator';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to build a whole new
   * `RNG(Date.now())` *inside every press* to draw the next seed, so the seed control worked and
   * the seeds themselves came from the clock — requirement 2.2's oldest failure in the pass.
   */
  const rng = new RNG(Date.now().toString());

  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let allowHomebrew = $state(false);
  let allowProceduralNames = $state(false);

  /**
   * The rolled potion, as it is stored.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array and object in
   * the payload in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses one
   * outright, so saving fails with `could not be cloned`. #66 and #67 both hit this.
   */
  let potion: PotionSnapshot | null = $state.raw(null);

  /** The seed and settings the potion on screen was rolled from, which is its provenance. */
  let rolledSeed = $state('');
  let rolledConfig: PotionGeneratorConfigRecord = $state(configRecord());

  const document_ = $derived(potion === null ? null : potionToDocument(potion));

  function configRecord(): PotionGeneratorConfigRecord {
    return { allowHomebrew, allowProceduralNames };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rolledSeed = seed;
    rolledConfig = configRecord();
    // Stored as a snapshot straight away: the page renders the same shape a saved potion is read
    // back in, so a result and a reopened artifact cannot show different things.
    potion = toPotionSnapshot(rollPotion(rolledSeed, rolledConfig));
  }

  function exportMarkdown() {
    if (potion === null) return;
    downloadTextFile(potionToMarkdown(potion), `${potionFileStem(potion)}.md`, 'text/markdown');
  }

  async function exportPdf() {
    if (potion === null) return;
    await downloadTextPdf(
      potionToDocument(potion).title,
      potionToText(potion),
      `${potionFileStem(potion)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Potion Generator">
  {#snippet description()}
    <p>
      Generate magical potions, oils, and ointments with procedural sensory details and SRD-based
      effects.
    </p>
  {/snippet}

  <ControlsPanel>
    <div class="checkbox-group">
      <CheckboxField id="allowHomebrew" label="Allow Homebrew" bind:checked={allowHomebrew} />
      <CheckboxField
        id="allowProceduralNames"
        label="Allow Variations"
        bind:checked={allowProceduralNames}
      />
    </div>

    <SeedControls bind:seed bind:lockSeed inline />

    <BaseButton onclick={generate}>Generate</BaseButton>
  </ControlsPanel>

  <SaveArtifactButton
    kind={POTION_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={potion}
    seed={rolledSeed}
    config={{ ...rolledConfig }}
    defaultName={document_?.title ?? ''}
  />

  <div class="actions">
    <BaseButton onclick={exportMarkdown} disabled={potion === null}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={potion === null}>Download PDF</BaseButton>
  </div>

  {#if potion && document_}
    <!-- A result surface is a panel, not a box with a border on it: the two layers,
         and the keyline, corner and padding are the system's. It wrote its own
         border, radius and padding until #124. -->
    <article class="potion-result panel">
      <div class="panel__field">
        <h2>{document_.title}</h2>

        <!-- One block, from the presentation document, rather than four `Stat`s and a
             `StatBlock` deciding for themselves what to show. 6.4: every line whose field is
             empty is already gone by the time it gets here. -->
        {#if document_.lines.length > 0}
          <StatBlock>
            {#each document_.lines as line (line.label)}
              <Stat label={line.label}>{line.value}</Stat>
            {/each}
          </StatBlock>
        {/if}

        <h3>Effect</h3>
        <p>{document_.effect.description}</p>
        {#if document_.effect.lines.length > 0}
          <StatBlock>
            {#each document_.effect.lines as line (line.label)}
              <Stat label={line.label}>{line.value}</Stat>
            {/each}
          </StatBlock>
        {/if}

        {#if document_.sensory.length > 0}
          <h3>Sensory Profile</h3>
          <!-- A `StatBlock` is a `<dl>`; it was wrapped in a `<ul>` here until #68, which is a
               list whose only child is a definition list — invalid markup, and a screen reader
               announcing a one-item list around four pairs. -->
          <StatBlock>
            {#each document_.sensory as line (line.label)}
              <Stat label={line.label}>{line.value}</Stat>
            {/each}
          </StatBlock>
        {/if}

        <h3>Container</h3>
        <p>{document_.container.name}: {document_.container.description}</p>
        <StatBlock>
          <Stat label="Container value">{document_.container.value}</Stat>
        </StatBlock>

        {#if document_.description !== ''}
          <h3>Description</h3>
          <p>{document_.description}</p>
        {/if}
      </div>
    </article>
  {/if}
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  /* The keyline, the corner and the padding are the panel's now. What is left is where the
     result sits on the page. */
  .potion-result {
    margin-top: var(--s7);
  }

  .potion-result h3 {
    margin-top: var(--s6);
    margin-bottom: var(--s2);
  }
</style>
