<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import DeleteButton from '$components/common/DeleteButton.svelte';
  import Notice from '$components/common/Notice.svelte';
  import {
    addStockItem,
    merchantPriceText,
    proprietorTraitsLine,
    removeStockItem,
    repricedStock,
    setMerchantText,
    setPriceModifier,
    setProprietorText,
    setProprietorTraits,
    setShopText,
    setStockNumber,
    setStockText,
    validateMerchantSnapshot,
    type MerchantSnapshot,
    type MerchantTextField,
    type ProprietorTextField,
    type ShopTextField,
  } from '$lib/merchants';

  /**
   * The editing view for a saved merchant.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **The stock is the point.** A shop is a list a referee crosses things off, marks one item down
   * on, and adds the thing a player asked for — none of which is a field, which is why the rows
   * carry their own controls rather than being a generic list.
   *
   * **Nothing is recomputed.** Every ask price is the catalog cost times the price modifier, so a
   * form that re-derived the column whenever the modifier changed would be the most natural thing
   * to write and would undo a hand-marked price on the next keystroke — 4.2 exactly. The button at
   * the foot offers the arithmetic to anyone who wants it.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  /**
   * The snapshot as this kind's own validator accepts it, or nothing.
   *
   * The prop is `unknown` because the framework holds payloads of every kind, and narrowing it
   * through `validate` rather than a cast is what keeps this editor from rendering fields over
   * something that is not a merchant.
   */
  const accepted = $derived(validateMerchantSnapshot(snapshot));
  const merchant = $derived<MerchantSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: MerchantSnapshot) => MerchantSnapshot): void {
    if (merchant === undefined) {
      return;
    }
    onChange(change(merchant));
  }

  const SHOP_FIELDS: { field: ShopTextField; label: string }[] = [
    { field: 'name', label: 'Shop name' },
    { field: 'settlementName', label: 'Settlement' },
  ];

  const PROPRIETOR_FIELDS: { field: ProprietorTextField; label: string }[] = [
    { field: 'fullName', label: 'Proprietor' },
    { field: 'firstName', label: 'First name' },
    { field: 'lastName', label: 'Last name' },
  ];

  const NOTE_FIELDS: { field: MerchantTextField; label: string }[] = [
    { field: 'honestyNotes', label: 'Honesty notes' },
    { field: 'hagglingAdvice', label: 'Haggling advice' },
  ];
</script>

{#if merchant === undefined}
  <Notice tone="danger">
    These contents are stored as a merchant but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="merchant-editor">
    {#each SHOP_FIELDS as entry (entry.field)}
      <div class="input-group input-group--inline">
        <label for="{uid}-shop-{entry.field}">{entry.label}</label>
        <input
          id="{uid}-shop-{entry.field}"
          type="text"
          value={merchant.shop[entry.field] ?? ''}
          oninput={(event) =>
            edit((current) => setShopText(current, entry.field, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    {/each}

    <div class="input-group">
      <label for="{uid}-location">Where it stands</label>
      <textarea
        id="{uid}-location"
        rows="2"
        value={merchant.shop.locationBlurb}
        oninput={(event) =>
          edit((current) => setShopText(current, 'locationBlurb', event.currentTarget.value))}
      ></textarea>
    </div>

    <div class="input-group">
      <label for="{uid}-shop-description">Shop description</label>
      <textarea
        id="{uid}-shop-description"
        rows="3"
        value={merchant.shop.description}
        oninput={(event) =>
          edit((current) => setShopText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    {#each PROPRIETOR_FIELDS as entry (entry.field)}
      <div class="input-group input-group--inline">
        <label for="{uid}-prop-{entry.field}">{entry.label}</label>
        <input
          id="{uid}-prop-{entry.field}"
          type="text"
          value={merchant.proprietor[entry.field]}
          oninput={(event) =>
            edit((current) => setProprietorText(current, entry.field, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    {/each}

    <div class="input-group input-group--inline">
      <label for="{uid}-traits">Temperament</label>
      <input
        id="{uid}-traits"
        type="text"
        value={proprietorTraitsLine(merchant)}
        oninput={(event) =>
          edit((current) => setProprietorTraits(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group">
      <label for="{uid}-prop-description">Proprietor description</label>
      <textarea
        id="{uid}-prop-description"
        rows="3"
        value={merchant.proprietor.description}
        oninput={(event) =>
          edit((current) => setProprietorText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    <div class="input-group input-group--inline">
      <!-- A multiplier on the catalog price, so 1 is "sells at cost". -->
      <label for="{uid}-modifier">Price modifier</label>
      <input
        id="{uid}-modifier"
        type="number"
        min="0"
        step="0.05"
        value={merchant.priceModifier}
        oninput={(event) =>
          edit((current) => setPriceModifier(current, event.currentTarget.valueAsNumber))}
      />
    </div>

    {#each NOTE_FIELDS as entry (entry.field)}
      <div class="input-group">
        <label for="{uid}-{entry.field}">{entry.label}</label>
        <textarea
          id="{uid}-{entry.field}"
          rows="2"
          value={merchant[entry.field]}
          oninput={(event) =>
            edit((current) => setMerchantText(current, entry.field, event.currentTarget.value))}
        ></textarea>
      </div>
    {/each}

    <h3 class="merchant-editor__heading">Stock</h3>

    {#each merchant.stock as item, index (index)}
      <fieldset class="merchant-editor__row inset">
        <legend>{item.name === '' ? `Row ${index + 1}` : item.name}</legend>

        <div class="input-group input-group--inline">
          <label for="{uid}-stock-{index}-name">Item</label>
          <input
            id="{uid}-stock-{index}-name"
            type="text"
            value={item.name}
            oninput={(event) =>
              edit((current) => setStockText(current, index, 'name', event.currentTarget.value))}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-stock-{index}-quantity">Quantity</label>
          <input
            id="{uid}-stock-{index}-quantity"
            type="number"
            min="0"
            value={item.quantity}
            oninput={(event) =>
              edit((current) =>
                setStockNumber(current, index, 'quantity', event.currentTarget.valueAsNumber),
              )}
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-stock-{index}-baseCost">Catalog (cp)</label>
          <input
            id="{uid}-stock-{index}-baseCost"
            type="number"
            min="0"
            value={item.baseCost}
            oninput={(event) =>
              edit((current) =>
                setStockNumber(current, index, 'baseCost', event.currentTarget.valueAsNumber),
              )}
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-stock-{index}-price">Ask price (cp)</label>
          <input
            id="{uid}-stock-{index}-price"
            type="number"
            min="0"
            value={item.price}
            oninput={(event) =>
              edit((current) =>
                setStockNumber(current, index, 'price', event.currentTarget.valueAsNumber),
              )}
          />
          <span class="merchant-editor__price">{merchantPriceText(item.price)}</span>
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-stock-{index}-note">Note</label>
          <input
            id="{uid}-stock-{index}-note"
            type="text"
            value={item.note ?? ''}
            oninput={(event) =>
              edit((current) => setStockText(current, index, 'note', event.currentTarget.value))}
            autocomplete="off"
          />
        </div>

        <DeleteButton
          label="Remove {item.name === '' ? `row ${index + 1}` : item.name}"
          onclick={() => edit((current) => removeStockItem(current, index))}
        />
      </fieldset>
    {/each}

    <div class="merchant-editor__actions">
      <BaseButton onclick={() => edit(addStockItem)}>Add a stock row</BaseButton>
      <!-- Offered rather than done automatically, for the reason the header gives. -->
      <BaseButton onclick={() => edit(repricedStock)}>
        Reprice the stock from the modifier
      </BaseButton>
    </div>
  </div>
{/if}

<style>
  .merchant-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
    align-items: flex-start;
  }

  .merchant-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .merchant-editor input,
  .merchant-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .merchant-editor__heading {
    margin: var(--s4) 0 0;
  }

  /* `inset` rather than a hand-rolled border and radius: the panel language owns those. */
  .merchant-editor__row {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    align-items: flex-start;
    min-width: 0;
    padding: var(--s4);
    width: 100%;
  }

  .merchant-editor__row legend {
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  /* The stored price is copper; this is the same number in coins, so a referee typing 1500 can
     see they have written fifteen gold. */
  .merchant-editor__price {
    color: var(--ink-faint);
    font: var(--t-micro);
    white-space: nowrap;
  }

  .merchant-editor__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
  }
</style>
