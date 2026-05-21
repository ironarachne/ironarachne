<script lang="ts">
  import * as Charges from '$lib/charges';
  import * as Fields from '$lib/heraldry/fields';
  import type { RNG } from '@ironarachne/rng';
  import { RNG as RngCtor } from '@ironarachne/rng';
  import * as Tinctures from '$lib/heraldry/tinctures';
  import * as Variations from '$lib/heraldry/variations';
  import Download from '$lib/download';
  import SaveSVGToPNG from '$lib/renderers/svg-to-png';
  import { renderSVGAsPNG } from '$lib/images/svg';
  import { onMount } from 'svelte';

  import { generateHeraldry } from '$lib/heraldry/generator';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry/renderers/svg';
  import type { Arms } from '$lib/heraldry/arms';
  import type { Charge } from '$lib/heraldry/charge_heraldry';
  import {
    mergeHeraldryGeneratorConfig,
    type HeraldryGeneratorConfig,
  } from '$lib/heraldry/generatorconfig';
  import {
    appendSavedHeraldry,
    loadSavedHeraldrySnapshots,
  } from '$lib/heraldry/heraldry_saved_state';
  import {
    buildVariationSlotPreferences,
    eligibleVariationTinctures,
    fieldDivisionNameFromOption,
    fieldUiStateFromGeneratorOptions,
    hasPinnedFieldTinctures,
    resolveFieldOptions,
    showSecondVariationSlot,
    variationTinctureCountForSlot,
  } from '$lib/heraldry/heraldry_ui_options';
  import {
    defaultHeraldryGeneratorOptions,
    heraldryFromSnapshot,
    toHeraldrySnapshot,
    type HeraldryGeneratorOptionsSnapshot,
    type HeraldrySnapshot,
  } from '$lib/heraldry/heraldry_snapshot';

  let rng = new RngCtor(Date.now().toString());
  const initialOptions = defaultHeraldryGeneratorOptions();
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(initialOptions.lockSeed);

  let blazon = $state('');
  let image = $state('');
  let currentArms = $state<Arms | null>(null);
  let savedHeraldries = $state<HeraldrySnapshot[]>([]);
  let loadDialog: HTMLDialogElement | undefined = $state();
  let charges = Charges.all();
  let allCharges = Charges.all();
  let heraldryTag = $state(initialOptions.heraldryTag);
  let chargeTinctureName = $state(initialOptions.chargeTinctureName);
  let chargeTincture = Tinctures.randomChargeTincture(rng);
  let numberOfChargesOption = $state(initialOptions.numberOfChargesOption);
  let chargePosition = $state(initialOptions.chargePosition);
  let fieldTinctures1 = Tinctures.all();
  let fieldTinctures2 = Tinctures.all();
  let fieldDivisionOption = $state(initialOptions.fieldDivisionOption!);
  let variationSlotOptions = $state([...initialOptions.variationSlotOptions!]);
  let variationTinctureOptions = $state(
    initialOptions.variationTinctureOptions!.map((row) => [...row]),
  );
  let variations = Variations.all();
  let allFields = Fields.all();
  let availableTags = Charges.allChargeTags();
  const showVariationSlotTwo = $derived(showSecondVariationSlot(fieldDivisionOption));
  const heraldryWidth = 600;
  const heraldryHeight = 660;

  onMount(() => {
    refreshSavedHeraldries();
  });

  function refreshSavedHeraldries() {
    savedHeraldries = loadSavedHeraldrySnapshots();
  }

  function currentGeneratorOptions(): HeraldryGeneratorOptionsSnapshot {
    return {
      heraldryTag,
      chargeTinctureName,
      numberOfChargesOption,
      chargePosition,
      lockSeed,
      fieldDivisionOption,
      variationSlotOptions: [...variationSlotOptions],
      variationTinctureOptions: variationTinctureOptions.map((row) => [...row]),
    };
  }

  function applyFieldUiState(options: HeraldryGeneratorOptionsSnapshot) {
    const fieldUi = fieldUiStateFromGeneratorOptions(options);
    fieldDivisionOption = fieldUi.fieldDivisionOption;
    variationSlotOptions = [...fieldUi.variationSlotOptions];
    variationTinctureOptions = fieldUi.variationTinctureOptions.map((row) => [...row]);
  }

  function changeCharges() {
    if (heraldryTag === 'any') {
      charges = allCharges;
    } else {
      charges = Charges.matchingTag(heraldryTag, allCharges);
    }
  }

  function setChargeTincture(rng: RNG) {
    // TODO: if the field tinctures are 'any', automatically contrast them with the charge tincture here
    if (chargeTinctureName === 'any') {
      chargeTincture = Tinctures.randomChargeTincture(rng);
    } else {
      let tincture = Tinctures.byName(chargeTinctureName);
      if (tincture !== undefined) {
        chargeTincture = tincture;
      }
    }
    setFieldTinctures(rng);
  }

  function setFieldTinctures(rng: RNG) {
    if (hasPinnedFieldTinctures(variationTinctureOptions)) {
      return;
    }

    let types1 = [];
    let types2 = [];
    if (chargeTincture.type === 'color' || chargeTincture.type === 'stain') {
      types1 = ['metal'];
      types2 = ['metal'];
    } else {
      types1 = ['color'];
      types2 = ['color'];

      if (rng.int(1, 100) > 70) {
        types1.push('stain');
      }
      if (rng.int(1, 100) > 80) {
        types2.push('stain');
      }
    }
    types1.push('furs');
    fieldTinctures1 = Tinctures.ofTypes(types1);
    fieldTinctures2 = Tinctures.ofTypes(types2);
  }

  function applyHeraldryToPreview(arms: Arms) {
    currentArms = arms;
    blazon = arms.blazon;
    image = renderHeraldryDeviceSvg(arms.device, heraldryWidth, heraldryHeight, rng);
    renderSVGAsPNG(image, heraldryWidth, heraldryHeight, 'output');
  }

  function reset() {
    const defaults = defaultHeraldryGeneratorOptions();
    lockSeed = defaults.lockSeed;
    heraldryTag = defaults.heraldryTag;
    chargeTinctureName = defaults.chargeTinctureName;
    numberOfChargesOption = defaults.numberOfChargesOption;
    chargePosition = defaults.chargePosition;
    applyFieldUiState(defaults);
    charges = allCharges;
    setChargeTincture(rng);
    generate();
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    let numberOfCharges = randomNumberOfCharges(rng);
    if (numberOfChargesOption === 'one') {
      numberOfCharges = 1;
    } else if (numberOfChargesOption === 'two') {
      numberOfCharges = 2;
    } else if (numberOfChargesOption === 'three') {
      numberOfCharges = 3;
    } else if (numberOfChargesOption === 'four') {
      numberOfCharges = 4;
    } else if (numberOfChargesOption === 'none') {
      numberOfCharges = 0;
    }
    setChargeTincture(rng);

    const config: HeraldryGeneratorConfig = mergeHeraldryGeneratorConfig({
      chargeCount: numberOfCharges,
      chargeOptions: charges as Charge[],
      chargeTinctures: [chargeTincture],
      chargePosition: chargePosition === 'normal' ? undefined : chargePosition,
      fieldOptions: resolveFieldOptions(fieldDivisionOption),
      fieldDivisionName: fieldDivisionNameFromOption(fieldDivisionOption),
      variationSlotPreferences: buildVariationSlotPreferences(
        variationSlotOptions,
        variationTinctureOptions,
      ),
      variationOptions: variations,
      fieldTinctures1,
      fieldTinctures2,
      width: heraldryWidth,
      height: heraldryHeight,
      rng: rng,
    });

    applyHeraldryToPreview(generateHeraldry(config));
  }

  function randomNumberOfCharges(rng: RNG) {
    const weights = [
      { value: 0, commonality: 20 },
      { value: 1, commonality: 55 },
      { value: 2, commonality: 5 },
      { value: 3, commonality: 3 },
      { value: 4, commonality: 2 },
    ];

    const result = rng.weighted(weights);

    return result;
  }

  function downloadSvg() {
    const blob = new Blob([image], { type: 'image/svg+xml' });
    Download(window.URL.createObjectURL(blob), `heraldry-${seed}.svg`);
  }

  function downloadPng() {
    SaveSVGToPNG(image, heraldryWidth, heraldryHeight, `heraldry-${seed}.png`);
  }

  function saveHeraldry() {
    if (currentArms === null) {
      return;
    }
    appendSavedHeraldry(toHeraldrySnapshot(currentArms, seed, currentGeneratorOptions()));
    refreshSavedHeraldries();
  }

  function openLoadDialog() {
    refreshSavedHeraldries();
    loadDialog?.showModal();
  }

  function loadSavedHeraldry(snapshot: HeraldrySnapshot) {
    const restored = heraldryFromSnapshot(snapshot);
    seed = restored.seed;
    lockSeed = restored.generatorOptions.lockSeed;
    heraldryTag = restored.generatorOptions.heraldryTag;
    chargeTinctureName = restored.generatorOptions.chargeTinctureName;
    numberOfChargesOption = restored.generatorOptions.numberOfChargesOption;
    chargePosition = restored.generatorOptions.chargePosition;
    applyFieldUiState(restored.generatorOptions);
    changeCharges();
    if (restored.arms.device.chargeGroups.length > 0) {
      chargeTincture = restored.arms.device.chargeGroups[0].charge.tincture;
    } else if (chargeTinctureName !== 'any') {
      const tincture = Tinctures.byName(chargeTinctureName);
      if (tincture !== undefined) {
        chargeTincture = tincture;
      }
    }
    rng.setSeed(seed);
    applyHeraldryToPreview(restored.arms);
    loadDialog?.close();
  }

  generate();
</script>

<section class="fantasy main">
  <h1>Heraldry Generator</h1>
  <p>
    Generate fantasy coats-of-arms. Note: if you change the seed, the page URL won't change, but
    your new seed will be used the next time you hit Generate.
  </p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="tag">Charge Tag</label>
    <select name="tag" bind:value={heraldryTag} onchange={changeCharges}>
      <option>any</option>
      {#each availableTags as tag}
        <option>{tag}</option>
      {/each}
    </select>
  </div>
  <div class="input-group">
    <label for="num-charges">Number of Charges</label>
    <select name="num-charges" bind:value={numberOfChargesOption}>
      <option>any</option>
      <option>none</option>
      <option>one</option>
      <option>two</option>
      <option>three</option>
      <option>four</option>
    </select>
  </div>
  <div class="input-group">
    <label for="charge-position">Charge Position</label>
    <select name="charge-position" bind:value={chargePosition}>
      <option value="normal">normal</option>
      <option value="in chief">in chief</option>
    </select>
  </div>
  <div class="input-group">
    <label for="charge-tincture">Charge Tincture</label>
    <select
      name="charge-tincture"
      bind:value={chargeTinctureName}
      onchange={() => setChargeTincture(rng)}
    >
      <option>any</option>
      <option value="gules">gules (red)</option>
      <option value="argent">argent (white)</option>
      <option value="vert">vert (green)</option>
      <option value="purpure">purpure (purple)</option>
      <option value="sable">sable (black)</option>
      <option value="Or">Or (gold)</option>
      <option value="azure">azure (blue)</option>
      <option value="murrey">murrey (mulberry)</option>
      <option value="sanguine">sanguine (blood red)</option>
      <option value="tenné">tenné (brown)</option>
    </select>
  </div>

  <div class="input-group">
    <label for="field-division">Field division</label>
    <select name="field-division" id="field-division" bind:value={fieldDivisionOption}>
      <option value="any">any</option>
      {#each allFields as field}
        <option value={field.name}>{field.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="variation-slot-0">Field variation</label>
    <select name="variation-slot-0" id="variation-slot-0" bind:value={variationSlotOptions[0]}>
      <option value="any">any</option>
      {#each variations as variation}
        <option value={variation.name}>{variation.name}</option>
      {/each}
    </select>
  </div>
  {#each { length: variationTinctureCountForSlot(variationSlotOptions, 0) } as _, tinctureIndex (tinctureIndex)}
    <div class="input-group">
      <label for="variation-0-tincture-{tinctureIndex}">Variation tincture {tinctureIndex + 1}</label>
      <select
        id="variation-0-tincture-{tinctureIndex}"
        bind:value={variationTinctureOptions[0][tinctureIndex]}
      >
        <option value="any">any</option>
        {#each eligibleVariationTinctures(variationSlotOptions[0]) as tincture}
          <option value={tincture.name}>{tincture.name}</option>
        {/each}
      </select>
    </div>
  {/each}

  {#if showVariationSlotTwo}
    <div class="input-group">
      <label for="variation-slot-1">Variation 2</label>
      <select name="variation-slot-1" id="variation-slot-1" bind:value={variationSlotOptions[1]}>
        <option value="any">any</option>
        {#each variations as variation}
          <option value={variation.name}>{variation.name}</option>
        {/each}
      </select>
    </div>
    <p class="field-variation-hint">Variation 2 applies to divided fields only.</p>
    {#each { length: variationTinctureCountForSlot(variationSlotOptions, 1) } as _, tinctureIndex (tinctureIndex)}
      <div class="input-group">
        <label for="variation-1-tincture-{tinctureIndex}">
          Variation 2 tincture {tinctureIndex + 1}
        </label>
        <select
          id="variation-1-tincture-{tinctureIndex}"
          bind:value={variationTinctureOptions[1][tinctureIndex]}
        >
          <option value="any">any</option>
          {#each eligibleVariationTinctures(variationSlotOptions[1]) as tincture}
            <option value={tincture.name}>{tincture.name}</option>
          {/each}
        </select>
      </div>
    {/each}
  {/if}

  <button type="button" onclick={reset}>Reset</button>
  <button onclick={generate}>Generate</button>
  <button onclick={downloadSvg} disabled={currentArms === null}>Download SVG</button>
  <button onclick={downloadPng} disabled={currentArms === null}>Download PNG</button>
  <button onclick={saveHeraldry} disabled={currentArms === null}>Save</button>
  <button type="button" onclick={openLoadDialog}>Load...</button>

  <p class="blazon">{blazon}</p>
  <div class="coat-of-arms"><img alt="" id="output" /></div>
</section>

<dialog bind:this={loadDialog} class="heraldry-load-dialog">
  <form method="dialog" class="heraldry-load-dialog-content">
    <h2>Load Saved Heraldry</h2>

    {#if savedHeraldries.length === 0}
      <p>No saved heraldry yet. Generate a coat of arms and click Save.</p>
    {:else}
      <ul class="heraldry-load-list">
        {#each savedHeraldries as saved, index (index)}
          <li class="heraldry-load-item">
            <div class="heraldry-load-item-details">
              <p class="heraldry-load-item-name">{saved.name}</p>
              <p class="heraldry-load-item-seed">Seed: {saved.seed}</p>
            </div>
            <button type="button" onclick={() => loadSavedHeraldry(saved)}>Load</button>
          </li>
        {/each}
      </ul>
    {/if}

    <div class="heraldry-load-dialog-actions">
      <button value="cancel">Cancel</button>
    </div>
  </form>
</dialog>

<svelte:head>
  <title>Heraldry Generator | Iron Arachne</title>
</svelte:head>

<style>
  div.coat-of-arms {
    width: 600px;
    height: 660px;
    margin: 0 auto;
  }

  p.blazon {
    text-align: center;
  }

  p.field-variation-hint {
    font-size: 0.875rem;
    opacity: 0.8;
    margin: 0 0 0.5rem;
  }

  dialog.heraldry-load-dialog {
    border: 1px solid var(--gold, #c9a227);
    border-radius: 4px;
    padding: 0;
    max-width: 40rem;
    width: calc(100% - 2rem);
    background: var(--background, #1a1a1a);
    color: inherit;
  }

  dialog.heraldry-load-dialog::backdrop {
    background: rgb(0 0 0 / 50%);
  }

  .heraldry-load-dialog-content {
    padding: 1rem 1.25rem;
  }

  .heraldry-load-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .heraldry-load-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .heraldry-load-item:last-child {
    border-bottom: none;
  }

  .heraldry-load-item-details {
    min-width: 0;
  }

  .heraldry-load-item-name,
  .heraldry-load-item-seed {
    margin: 0;
  }

  .heraldry-load-item-name {
    font-weight: 600;
  }

  .heraldry-load-item-seed {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .heraldry-load-dialog-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
</style>
