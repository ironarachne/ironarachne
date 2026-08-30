<script lang="ts">
  import { onMount } from 'svelte';
  import { valueToString, COMMON_FANTASY } from '$lib/currency';
  import { generateMerchant, getDefaultMerchantConfig, type Merchant } from '$lib/merchants';
  import { renderMerchantMarkSvg } from '$lib/merchant_marks';
  import { RNG } from '@ironarachne/rng';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let shopType = $state('any');
  let venueType = $state('any');
  let honesty = $state('any');
  let priceLevel = $state('any');
  let stockCount = $state(12);
  let includeMerchantMark = $state(true);

  let merchant: Merchant | null = $state(null);

  function buildConfig() {
    const config = getDefaultMerchantConfig();
    config.shopType = shopType as typeof config.shopType;
    config.venueType = venueType as typeof config.venueType;
    config.honesty = honesty as typeof config.honesty;
    config.priceLevel = priceLevel as typeof config.priceLevel;
    config.stockCount = { min: stockCount, max: stockCount };
    config.includeMerchantMark = includeMerchantMark;
    return config;
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    merchant = generateMerchant(seed, buildConfig());
  }

  function formatPrice(cost: number) {
    return valueToString(cost, COMMON_FANTASY);
  }

  function formatModifier(modifier: number) {
    return `${Math.round(modifier * 100)}%`;
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath="/fantasy/merchant" title="Fantasy Merchant Generator">
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

    <NumberField id="stockCount" label="Stock Items" bind:value={stockCount} min={4} max={30} />

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

  {#if merchant}
    <!-- A result surface is a panel, not a box with a border on it: the two layers,
         and the keyline, corner and padding are the system's. It wrote its own
         border, radius and padding until #124. -->
    <article class="merchant-result panel">
      <div class="panel__field">
        <header class="merchant-header">
          <div class="merchant-heading">
            <h2>{merchant.shop.name}</h2>
            <p class="shop-meta">
              {merchant.shop.shopTypeLabel} · {merchant.shop.venueTypeLabel}
            </p>
          </div>
          {#if merchant.mark}
            <div class="merchant-mark" aria-hidden="true">
              <!-- Renders app-generated markup (no external or user-supplied input). -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html renderMerchantMarkSvg(merchant.mark, 120, 120)}
            </div>
          {/if}
        </header>

        <p class="location">{merchant.shop.locationBlurb}</p>
        <p>{merchant.shop.description}</p>

        <h3>Proprietor</h3>
        <p><strong>{merchant.proprietor.fullName}</strong></p>
        <p>{merchant.proprietor.description}</p>
        {#if merchant.proprietor.personalityTraits.length > 0}
          <p><strong>Temperament:</strong> {merchant.proprietor.personalityTraits.join(', ')}</p>
        {/if}

        <h3>Trading Character</h3>
        <ul class="trading-notes">
          <li><strong>Honesty:</strong> {merchant.honesty}</li>
          <li><strong>Price level:</strong> {merchant.priceLevel}</li>
          <li>
            <strong>Price modifier:</strong>
            {formatModifier(merchant.priceModifier)} of catalog value
          </li>
          <li>{merchant.honestyNotes}</li>
          <li>{merchant.hagglingAdvice}</li>
        </ul>

        <h3>Stock</h3>
        <div class="stock-table-scroll">
          <table class="stock-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Catalog</th>
                <th>Ask Price</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {#each merchant.stock as item}
                <tr>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.baseCost)}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.note ?? ''}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  {/if}
</GeneratorPage>

<style>
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

  /* Five columns cannot compress to phone width without the item names turning
     into one letter per line, so let the table scroll on its own instead. */
  .stock-table-scroll {
    overflow-x: auto;
  }

  /* One of the three bespoke tables #154 will collapse into a shared one. What #124 does here is
     take the literals out — the borders were `#555` and the header a raw `rgba` — and leave the
     structure for that issue to settle rather than inventing a fourth table language in a walk. */
  .stock-table {
    border-collapse: collapse;
    margin-top: var(--s4);
    min-width: 30rem;
    width: 100%;
  }

  .stock-table th,
  .stock-table td {
    border: 1px solid var(--border);
    padding: var(--s3) var(--s4);
    text-align: left;
  }

  .stock-table th {
    background: var(--surface-inset);
  }
</style>
