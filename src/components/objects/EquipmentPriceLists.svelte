<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import DataTable, { type Column } from '$components/common/DataTable.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import InputGroup from '$components/common/InputGroup.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import { downloadTextFile } from '$lib/download';
  import {
    FantasyEquipmentList,
    PRICE_CURRENCIES,
    PRICE_LIST_TITLE,
    countEquipmentItems,
    filterEquipmentLists,
    priceCurrency,
    priceListDocument,
    priceListFileStem,
    priceListToMarkdown,
    priceListToText,
  } from '$lib/equipment';
  import { downloadTextPdf } from '$lib/pdf';

  const TOOL_PATH = '/fantasy/equipment';

  /**
   * The whole reference, read once.
   *
   * `all()` rebuilds the clothing list on every call, so reading it in a `$derived` would rebuild
   * five hundred rows on every keystroke of the search box.
   */
  const equipmentLists = FantasyEquipmentList.all();
  const totalItems = countEquipmentItems(equipmentLists);

  const CURRENCY_OPTIONS = PRICE_CURRENCIES.map((option) => ({
    value: option.id,
    label: option.label,
  }));

  const PRICE_COLUMNS: Column[] = [{ label: 'Item' }, { label: 'Cost', numeric: true }];

  let currencyId = $state(PRICE_CURRENCIES[0].id);
  let search = $state('');

  const currency = $derived(priceCurrency(currencyId));
  const shownLists = $derived(filterEquipmentLists(equipmentLists, search));
  const shownItems = $derived(countEquipmentItems(shownLists));
  const document_ = $derived(priceListDocument(currency, shownLists));

  function exportMarkdown() {
    downloadTextFile(
      priceListToMarkdown(document_),
      `${priceListFileStem(currency)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    await downloadTextPdf(
      document_.title,
      priceListToText(document_),
      `${priceListFileStem(currency)}.pdf`,
    );
  }
</script>

<GeneratorPage toolPath={TOOL_PATH} title={PRICE_LIST_TITLE}>
  {#snippet description()}
    <p>
      This page is meant to be a comprehensive list of equipment for fantasy games. It will be
      updated over time, so keep checking back for new entries.
    </p>
    <p>
      Where possible, I've based the prices off of historical data rather than fantasy sources. 1
      copper coin is treated as equivalent to 1 farthing.
    </p>
  {/snippet}

  <ControlsPanel>
    <SelectField
      id="currency"
      label="Currency Type"
      bind:value={currencyId}
      options={CURRENCY_OPTIONS}
    />
    <InputGroup id="equipment-search" label="Search">
      <input
        id="equipment-search"
        type="search"
        placeholder="rope, sword, ale…"
        bind:value={search}
      />
    </InputGroup>
  </ControlsPanel>

  <!-- The key is derived from the same currency the Cost column is written in, so it cannot list a
       coin the tables never print or omit one they do. It listed electrum, platinum and a crown
       before #65, none of which any price was ever quoted in. -->
  <h2>Reading the prices</h2>
  <ul class="legend">
    {#each currency.legend as entry (entry.symbol)}
      <li>
        <strong>{entry.symbol}</strong>: {entry.name}{entry.worth === '' ? '' : ` (${entry.worth})`}
      </li>
    {/each}
  </ul>

  <p class="count" role="status">
    {#if search.trim() === ''}
      {totalItems} items in {equipmentLists.length} categories.
    {:else}
      {shownItems} of {totalItems} items match “{search.trim()}”.
    {/if}
  </p>

  <div class="actions">
    <BaseButton onclick={exportMarkdown} disabled={shownItems === 0}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={shownItems === 0}>Download PDF</BaseButton>
  </div>

  {#each document_.lists as list (list.title)}
    <div class="equipment-list">
      <h2>{list.title}</h2>
      <DataTable columns={PRICE_COLUMNS} rows={priceRows} />

      {#snippet priceRows()}
        {#each list.items as item (item.name)}
          <tr>
            <td data-label="Item">{item.name}</td>
            <td class="numeric" data-label="Cost">{item.cost}</td>
          </tr>
        {/each}
      {/snippet}
    </div>
  {/each}
</GeneratorPage>

<style>
  .legend {
    margin-bottom: var(--s6);
  }

  .count {
    color: var(--ink-faint);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }
</style>
