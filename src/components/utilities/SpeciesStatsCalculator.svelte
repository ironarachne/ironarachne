<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import DataTable, { type Column } from '$components/common/DataTable.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import {
    MINIMUM_MAXIMUM_AGE,
    MINIMUM_PERCENT,
    SPECIES_STATS_TITLE,
    speciesStatsDocument,
    speciesStatsFileStem,
    speciesStatsToMarkdown,
    speciesStatsToText,
  } from '$lib/size';

  const TOOL_PATH = '/species-stats';

  const LADDER_COLUMNS: Column[] = [
    { label: 'Age category' },
    { label: 'Age range' },
    { label: 'Height' },
    { label: 'Weight' },
  ];

  let maximumAge = $state(100);
  let femaleHeightModifier = $state(100);
  let femaleWeightModifier = $state(100);
  let maleHeightModifier = $state(100);
  let maleWeightModifier = $state(100);

  /**
   * The whole sheet, from `$lib/size`.
   *
   * Everything below the controls is read from this one value, so the page and the two exports
   * cannot disagree. The clamping lives there too — a cleared number field binds to `null`, which
   * used to walk the age ladder into rows reading "2 to 1 years".
   */
  const document_ = $derived(
    speciesStatsDocument({
      maximumAge,
      female: { heightPercent: femaleHeightModifier, weightPercent: femaleWeightModifier },
      male: { heightPercent: maleHeightModifier, weightPercent: maleWeightModifier },
    }),
  );

  function exportMarkdown() {
    downloadTextFile(
      speciesStatsToMarkdown(document_),
      `${speciesStatsFileStem(document_)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    await downloadTextPdf(
      document_.title,
      speciesStatsToText(document_),
      `${speciesStatsFileStem(document_)}.pdf`,
    );
  }
</script>

<GeneratorPage toolPath={TOOL_PATH} title={SPECIES_STATS_TITLE}>
  {#snippet description()}
    <p>
      This tool helps in the construction of non-human species. I built it to help me input standard
      fantasy species. To use it, just enter the percentage of human size you want to use for height
      and weight.
    </p>
    <p>All numbers use modern human as a base.</p>
  {/snippet}

  <h2>Settings</h2>

  <ControlsPanel>
    <NumberField
      id="maxAge"
      label="Maximum Age (Years)"
      bind:value={maximumAge}
      min={MINIMUM_MAXIMUM_AGE}
    />
    <NumberField
      id="female-height"
      label="Female % of Base Height"
      bind:value={femaleHeightModifier}
      min={MINIMUM_PERCENT}
    />
    <NumberField
      id="female-weight"
      label="Female % of Base Weight"
      bind:value={femaleWeightModifier}
      min={MINIMUM_PERCENT}
    />
    <NumberField
      id="male-height"
      label="Male % of Base Height"
      bind:value={maleHeightModifier}
      min={MINIMUM_PERCENT}
    />
    <NumberField
      id="male-weight"
      label="Male % of Base Weight"
      bind:value={maleWeightModifier}
      min={MINIMUM_PERCENT}
    />
  </ControlsPanel>

  <div class="actions">
    <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
  </div>

  <h2>Calculated Stats</h2>

  <!-- `role="status"` because the sheet recomputes as the fields change, and a clamped value is a
       change the user did not ask for. The sentence is the same one both exports open with. -->
  <p class="summary" role="status">{document_.summary}</p>

  {#each document_.genders as gender (gender.name)}
    <section class="ladder">
      <h3>{gender.label}</h3>
      <DataTable columns={LADDER_COLUMNS} rows={ladderRows} label="{gender.label} sizes by age" />

      {#snippet ladderRows()}
        {#each gender.rows as row (row.ageCategoryName)}
          <tr>
            <td data-label="Age category">{row.ageCategoryName}</td>
            <td data-label="Age range">{row.ageRange}</td>
            <td data-label="Height">{row.heightRange}</td>
            <td data-label="Weight">{row.weightRange}</td>
          </tr>
        {/each}
      {/snippet}
    </section>
  {/each}

  <h2>For Ingenium Second Edition</h2>

  <p>This is for Ingenium Second Edition heritages.</p>

  <StatBlock>
    <Stat label="Female Height">{document_.ingenium.femaleHeight}</Stat>
    <Stat label="Male Height">{document_.ingenium.maleHeight}</Stat>
    <Stat label="Female Weight">{document_.ingenium.femaleWeight}</Stat>
    <Stat label="Male Weight">{document_.ingenium.maleWeight}</Stat>
    <Stat label="Adult Age">{document_.ingenium.adultAge}</Stat>
    <Stat label="Maximum Lifespan">{document_.ingenium.maximumLifespan}</Stat>
  </StatBlock>
</GeneratorPage>

<style>
  .summary {
    color: var(--ink-faint);
  }

  .ladder {
    margin-bottom: var(--s6);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }
</style>
