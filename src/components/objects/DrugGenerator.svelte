<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import * as Drug from '$lib/drug';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';

  const TOOL_PATH = '/drug';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to build a whole new `RNG` from
   * `Date.now()` twice — once at module load for the initial seed and once per press — which is the
   * requirement 2.2 failure the readiness pass finds most often: a seed control that works,
   * over a seed nobody can reproduce.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  /**
   * The rolled drug, as it is stored.
   *
   * The snapshot rather than the live value, because everything the page shows is in it and the
   * live type adds only two table rows the page does not read. `$state.raw` for the usual reason:
   * deep-reactive `$state` wraps values in a Proxy and `structuredClone` refuses one, so saving
   * would fail with `could not be cloned`.
   */
  let drug = $state.raw<Drug.DrugSnapshot | null>(null);

  const document_ = $derived(drug === null ? null : Drug.drugToDocument(drug));
  const defaultArtifactName = $derived(drug === null ? '' : Drug.drugDisplayName(drug));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    drug = Drug.rollDrugSnapshot(seed);
  }

  function exportMarkdown() {
    if (drug === null) return;
    downloadTextFile(Drug.drugToMarkdown(drug), `${Drug.drugFileStem(drug)}.md`, 'text/markdown');
  }

  async function exportPdf() {
    if (drug === null) return;
    await downloadTextPdf(
      Drug.drugDisplayName(drug),
      Drug.drugToText(drug),
      `${Drug.drugFileStem(drug)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Drug Generator">
  {#snippet description()}
    <p>I suppose you could also use this for any sci-fi setting, really.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed label="Random Seed" />

  <div class="actions">
    <BaseButton onclick={generate}>Generate</BaseButton>
    <BaseButton onclick={exportMarkdown} disabled={!drug}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={!drug}>Download PDF</BaseButton>
  </div>

  <SaveArtifactButton
    kind={Drug.DRUG_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={drug}
    {seed}
    defaultName={defaultArtifactName}
  />

  {#if document_}
    <!-- The page renders the same document the exports do, so what a referee reads on screen and
         what they take away cannot drift. It used to show the description alone, with the ten
         fields behind it invisible — which also meant the editor had fields answering to nothing
         on the page. -->
    <div class="drug">
      <h2>{document_.title}</h2>

      {#each document_.paragraphs as paragraph, index (index)}
        <p>{paragraph}</p>
      {/each}

      <StatBlock>
        {#each document_.lines as line (line.label)}
          <Stat label={line.label}>{line.value}</Stat>
        {/each}
      </StatBlock>
    </div>
  {/if}
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }
</style>
