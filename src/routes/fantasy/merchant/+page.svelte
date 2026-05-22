<script lang="ts">
  import { valueToString } from '$lib/currency';
  import { COMMON_FANTASY } from '$lib/currency/systems';
  import {
    generateMerchant,
    getDefaultMerchantConfig,
    type Merchant,
  } from '$lib/merchants';
  import { renderMerchantMarkSvg } from '$lib/merchant_marks/render_merchant_mark_svg';
  import { RNG } from '@ironarachne/rng';

  let rng = new RNG(Date.now().toString());
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

  let merchant: Merchant = $state(generateMerchant(seed, buildConfig()));

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

  generate();
</script>

<svelte:head>
  <title>Fantasy Merchant Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Merchant Generator</h1>

  <p>
    Generate a fantasy merchant with a proprietor, shop or traveling venue, merchant mark, and stock
    list priced according to honesty and markup settings.
  </p>

  <div class="controls">
    <div class="input-group">
      <label for="shopType">Shop Type</label>
      <select bind:value={shopType} id="shopType" name="shopType">
        <option value="any">Any</option>
        <option value="general">General goods</option>
        <option value="weaponsmith">Weaponsmith</option>
        <option value="armorer">Armorer</option>
        <option value="apothecary">Apothecary</option>
        <option value="clothier">Clothier</option>
        <option value="provisioner">Provisioner</option>
        <option value="tavern">Tavern keeper</option>
        <option value="stable">Stable master</option>
        <option value="scribe">Scribe</option>
        <option value="jeweler">Jeweler</option>
      </select>
    </div>

    <div class="input-group">
      <label for="venueType">Venue</label>
      <select bind:value={venueType} id="venueType" name="venueType">
        <option value="any">Any</option>
        <option value="shop">Shop</option>
        <option value="stall">Market stall</option>
        <option value="cart">Pushcart</option>
        <option value="tent">Tent</option>
        <option value="market_booth">Market booth</option>
        <option value="wagon">Wagon</option>
      </select>
    </div>

    <div class="input-group">
      <label for="honesty">Honesty</label>
      <select bind:value={honesty} id="honesty" name="honesty">
        <option value="any">Any</option>
        <option value="honest">Honest</option>
        <option value="fair">Fair</option>
        <option value="shrewd">Shrewd</option>
        <option value="shifty">Shifty</option>
        <option value="swindler">Swindler</option>
      </select>
    </div>

    <div class="input-group">
      <label for="priceLevel">Prices</label>
      <select bind:value={priceLevel} id="priceLevel" name="priceLevel">
        <option value="any">Any</option>
        <option value="bargain">Bargain</option>
        <option value="standard">Standard</option>
        <option value="expensive">Expensive</option>
        <option value="extortionate">Extortionate</option>
      </select>
    </div>

    <div class="input-group">
      <label for="stockCount">Stock Items</label>
      <input
        type="number"
        bind:value={stockCount}
        id="stockCount"
        name="stockCount"
        min="4"
        max="30"
      />
    </div>

    <div class="checkbox-group">
      <label>
        <input type="checkbox" bind:checked={includeMerchantMark} />
        Merchant mark
      </label>
    </div>

    <div class="input-group">
      <label for="seed">Seed</label>
      <input type="text" bind:value={seed} id="seed" name="seed" />
      <label class="inline-label">
        <input type="checkbox" bind:checked={lockSeed} id="lockSeed" name="lockSeed" />
        Lock Seed
      </label>
    </div>

    <button onclick={generate}>Generate</button>
  </div>

  <article class="merchant-result">
    <header class="merchant-header">
      <div class="merchant-heading">
        <h2>{merchant.shop.name}</h2>
        <p class="shop-meta">
          {merchant.shop.shopTypeLabel} · {merchant.shop.venueTypeLabel}
        </p>
      </div>
      {#if merchant.mark}
        <div class="merchant-mark" aria-hidden="true">
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
      <li><strong>Price modifier:</strong> {formatModifier(merchant.priceModifier)} of catalog value</li>
      <li>{merchant.honestyNotes}</li>
      <li>{merchant.hagglingAdvice}</li>
    </ul>

    <h3>Stock</h3>
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
  </article>
</section>

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .checkbox-group {
    display: flex;
    gap: 1rem;
    padding-bottom: 0.5rem;
  }

  .inline-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: normal;
  }

  .merchant-result {
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px solid var(--border-color, #ccc);
    border-radius: 8px;
  }

  .merchant-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
  }

  .merchant-heading h2 {
    margin-top: 0;
  }

  .shop-meta {
    color: #aaa;
    margin-top: 0.25rem;
  }

  .merchant-mark {
    flex-shrink: 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
  }

  .location {
    font-style: italic;
    color: #bbb;
  }

  .trading-notes {
    padding-left: 1.25rem;
  }

  .stock-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
  }

  .stock-table th,
  .stock-table td {
    border: 1px solid #555;
    padding: 0.4rem 0.6rem;
    text-align: left;
  }

  .stock-table th {
    background: rgba(0, 0, 0, 0.2);
  }
</style>
