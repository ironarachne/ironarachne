<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import BaseButton from '$components/common/BaseButton.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import DataTable, { type Column } from '$components/common/DataTable.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import type { ArtifactReference } from '$lib/artifacts';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import { downloadTextFile } from '$lib/download';
  import {
    MAXIMUM_STOCK_COUNT,
    MERCHANT_ARTIFACT_KIND,
    MINIMUM_STOCK_COUNT,
    merchantFileStem,
    merchantPriceText,
    merchantToDocument,
    merchantToMarkdown,
    merchantToText,
    rollMerchant,
    toMerchantSnapshot,
    type MerchantGeneratorConfigRecord,
    type MerchantSnapshot,
  } from '$lib/merchants';
  import { renderMerchantMarkSvg } from '$lib/merchant_marks';
  import { downloadTextPdf } from '$lib/pdf';
  import { SETTLEMENT_ARTIFACT_KIND, type Settlement } from '$lib/settlements';

  const TOOL_PATH = '/fantasy/merchant';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be reseeded from the seed
   * field inside an `$effect`, so the next press's seed depended on the *text* of the previous
   * one — the same requirement 2.2 failure #66 found in the equipment generator.
   */
  const rng = new RNG(Date.now().toString());

  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let shopType = $state('any');
  let venueType = $state('any');
  let honesty = $state('any');
  let priceLevel = $state('any');
  let stockCount = $state(12);
  let includeMerchantMark = $state(true);

  /** Composition, opt-in twice over (rule 1, docs/workshop.md). */
  let useCulture = $state(false);
  let referencedCulture: Culture | undefined = $state();
  let cultureReference: ArtifactReference | undefined = $state();
  let useSettlement = $state(false);
  let referencedSettlement: Settlement | undefined = $state();
  let settlementReference: ArtifactReference | undefined = $state();

  /**
   * The rolled merchant.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array and object in
   * the payload in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses one
   * outright, so saving fails with `could not be cloned`. #66 hit exactly this.
   */
  let merchant: MerchantSnapshot | null = $state.raw(null);

  /** The seed and settings the merchant on screen was rolled from, which is its provenance. */
  let rolledSeed = $state('');
  let rolledConfig: MerchantGeneratorConfigRecord = $state(configRecord());

  const references = $derived(
    [cultureReference, settlementReference].filter(
      (reference): reference is ArtifactReference => reference !== undefined,
    ),
  );

  const document_ = $derived(merchant === null ? null : merchantToDocument(merchant));

  function configRecord(): MerchantGeneratorConfigRecord {
    return {
      shopType: shopType as MerchantGeneratorConfigRecord['shopType'],
      venueType: venueType as MerchantGeneratorConfigRecord['venueType'],
      honesty: honesty as MerchantGeneratorConfigRecord['honesty'],
      priceLevel: priceLevel as MerchantGeneratorConfigRecord['priceLevel'],
      stockCount,
      includeMerchantMark,
      // The culture's *pattern set name*, not its id: a re-roll cannot ask the store for an
      // artifact it has only a reference to, and naming of the same tongue is what was chosen.
      // The link itself is an artifact reference and lives beside the payload.
      ...(useCulture && referencedCulture !== undefined
        ? { nameGeneratorSet: referencedCulture.nameGenerators.name }
        : {}),
      ...(useSettlement && referencedSettlement !== undefined
        ? { settlementName: referencedSettlement.name }
        : {}),
    };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rolledSeed = seed;
    rolledConfig = configRecord();
    merchant = toMerchantSnapshot(
      rollMerchant(
        rolledSeed,
        rolledConfig,
        useCulture && referencedCulture !== undefined
          ? { kind: 'referenced_culture', culture: referencedCulture }
          : undefined,
      ),
    );
  }

  function exportMarkdown() {
    if (merchant === null) return;
    downloadTextFile(
      merchantToMarkdown(merchant),
      `${merchantFileStem(merchant)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (merchant === null) return;
    await downloadTextPdf(
      merchant.shop.name,
      merchantToText(merchant),
      `${merchantFileStem(merchant)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });

  const STOCK_COLUMNS: Column[] = [
    { label: 'Item' },
    { label: 'Qty', numeric: true },
    { label: 'Catalog', numeric: true },
    { label: 'Ask Price', numeric: true },
    { label: 'Note' },
  ];
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Fantasy Merchant Generator">
  {#snippet description()}
    <p>
      Generate a fantasy merchant with a proprietor, shop or traveling venue, merchant mark, and
      stock list priced according to honesty and markup settings.
    </p>
  {/snippet}

  <ControlsPanel>
    <SelectField
      id="shopType"
      label="Shop Type"
      bind:value={shopType}
      options={[
        { value: 'any', label: 'Any' },
        { value: 'general', label: 'General goods' },
        { value: 'weaponsmith', label: 'Weaponsmith' },
        { value: 'armorer', label: 'Armorer' },
        { value: 'apothecary', label: 'Apothecary' },
        { value: 'clothier', label: 'Clothier' },
        { value: 'provisioner', label: 'Provisioner' },
        { value: 'tavern', label: 'Tavern keeper' },
        { value: 'stable', label: 'Stable master' },
        { value: 'scribe', label: 'Scribe' },
        { value: 'jeweler', label: 'Jeweler' },
      ]}
    />

    <SelectField
      id="venueType"
      label="Venue"
      bind:value={venueType}
      options={[
        { value: 'any', label: 'Any' },
        { value: 'shop', label: 'Shop' },
        { value: 'stall', label: 'Market stall' },
        { value: 'cart', label: 'Pushcart' },
        { value: 'tent', label: 'Tent' },
        { value: 'market_booth', label: 'Market booth' },
        { value: 'wagon', label: 'Wagon' },
      ]}
    />

    <SelectField
      id="honesty"
      label="Honesty"
      bind:value={honesty}
      options={[
        { value: 'any', label: 'Any' },
        { value: 'honest', label: 'Honest' },
        { value: 'fair', label: 'Fair' },
        { value: 'shrewd', label: 'Shrewd' },
        { value: 'shifty', label: 'Shifty' },
        { value: 'swindler', label: 'Swindler' },
      ]}
    />

    <SelectField
      id="priceLevel"
      label="Prices"
      bind:value={priceLevel}
      options={[
        { value: 'any', label: 'Any' },
        { value: 'bargain', label: 'Bargain' },
        { value: 'standard', label: 'Standard' },
        { value: 'expensive', label: 'Expensive' },
        { value: 'extortionate', label: 'Extortionate' },
      ]}
    />

    <NumberField
      id="stockCount"
      label="Stock Items"
      bind:value={stockCount}
      min={MINIMUM_STOCK_COUNT}
      max={MAXIMUM_STOCK_COUNT}
    />

    <div class="checkbox-group">
      <CheckboxField
        id="includeMerchantMark"
        label="Merchant mark"
        bind:checked={includeMerchantMark}
      />
    </div>

    <SeedControls bind:seed bind:lockSeed inline />

    <BaseButton onclick={generate}>Generate</BaseButton>
  </ControlsPanel>

  <!-- Requirement 5.1, twice. Both are offers: the checkboxes start off, and a merchant handed
       nothing names its proprietor from the default patterns and invents its own corner of an
       unnamed town, exactly as it always did (5.3). -->
  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Name the proprietor from a saved culture"
    selectLabel="Naming culture"
    bind:enabled={useCulture}
    bind:value={referencedCulture}
    bind:reference={cultureReference}
  />

  <SavedArtifactPicker
    kind={SETTLEMENT_ARTIFACT_KIND}
    role="settlement"
    checkboxLabel="Put this shop in a saved settlement"
    selectLabel="Settlement"
    bind:enabled={useSettlement}
    bind:value={referencedSettlement}
    bind:reference={settlementReference}
  />

  <SaveArtifactButton
    kind={MERCHANT_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={merchant}
    seed={rolledSeed}
    config={{ ...rolledConfig }}
    defaultName={merchant?.shop.name ?? ''}
    {references}
  />

  <div class="actions">
    <BaseButton onclick={exportMarkdown} disabled={merchant === null}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={merchant === null}>Download PDF</BaseButton>
  </div>

  {#if merchant && document_}
    <!-- A result surface is a panel, not a box with a border on it: the two layers,
         and the keyline, corner and padding are the system's. It wrote its own
         border, radius and padding until #124. -->
    <article class="merchant-result panel">
      <div class="panel__field">
        <header class="merchant-header">
          <div class="merchant-heading">
            <h2>{document_.title}</h2>
            <p class="shop-meta">{document_.subtitle}</p>
          </div>
          {#if merchant.mark}
            <div class="merchant-mark" aria-hidden="true">
              <!-- Renders app-generated markup (no external or user-supplied input). -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html renderMerchantMarkSvg(merchant.mark, 120, 120)}
            </div>
          {/if}
        </header>

        {#if document_.location !== ''}
          <p class="location">{document_.location}</p>
        {/if}
        {#each document_.paragraphs as paragraph, index (index)}
          <p>{paragraph}</p>
        {/each}

        {#if document_.proprietor.name !== ''}
          <h3>Proprietor</h3>
          <p><strong>{document_.proprietor.name}</strong></p>
          {#each document_.proprietor.paragraphs as paragraph, index (index)}
            <p>{paragraph}</p>
          {/each}
          {#if document_.proprietor.lines.length > 0}
            <StatBlock>
              {#each document_.proprietor.lines as line (line.label)}
                <Stat label={line.label}>{line.value}</Stat>
              {/each}
            </StatBlock>
          {/if}
        {/if}

        <h3>Trading Character</h3>
        <StatBlock>
          {#each document_.trading as line (line.label)}
            <Stat label={line.label}>{line.value}</Stat>
          {/each}
        </StatBlock>
        {#if document_.notes.length > 0}
          <ul class="trading-notes">
            {#each document_.notes as note, index (index)}
              <li>{note}</li>
            {/each}
          </ul>
        {/if}

        <!-- 6.4: an empty shop shows no heading at all rather than a table head with nothing
             under it. A referee can empty one from the editor. -->
        {#if document_.stock.length > 0}
          <h3>Stock</h3>
          <!-- Five columns, and it scrolled sideways in its own container until #154. A stock row
               reads perfectly well as a list of pairs, which is the test: it flips. -->
          <DataTable columns={STOCK_COLUMNS} rows={stockRows} label="Stock" />

          {#snippet stockRows()}
            {#each document_?.stock ?? [] as item, index (index)}
              <tr>
                <td data-label="Item">{item.name}</td>
                <td class="numeric" data-label="Qty">{item.quantity}</td>
                <td class="numeric" data-label="Catalog">{merchantPriceText(item.baseCost)}</td>
                <td class="numeric" data-label="Ask Price">{merchantPriceText(item.price)}</td>
                <td data-label="Note">{item.note ?? ''}</td>
              </tr>
            {/each}
          {/snippet}
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
  .merchant-result {
    margin-top: var(--s7);
  }

  .merchant-header {
    display: flex;
    justify-content: space-between;
    gap: var(--s6);
    align-items: flex-start;
    /* A long shop name plus the 120px mark does not fit a phone on one line. */
    flex-wrap: wrap;
  }

  .merchant-heading {
    flex: 1 1 12rem;
    min-width: 0;
  }

  .merchant-heading h2 {
    margin-top: 0;
  }

  .shop-meta {
    color: var(--ink-muted);
    margin-top: var(--s1);
  }

  /* The mark is generated artwork rather than furniture, so it keeps a plain keyline and loses
     the radius: 4px is outside the corner vocabulary, which offers a pill and the round icon
     button and nothing between them. */
  .merchant-mark {
    border: 1px solid var(--border);
    flex-shrink: 0;
    overflow: hidden;
  }

  .location {
    color: var(--ink-muted);
    font-style: italic;
  }

  .trading-notes {
    padding-left: var(--s6);
  }
</style>
