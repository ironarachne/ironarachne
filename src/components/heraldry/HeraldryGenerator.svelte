<script lang="ts">
  import * as Charges from '$lib/charges';
  import * as Fields from '$lib/heraldry/fields';
  import type { RNG } from '@ironarachne/rng';
  import { RNG as RngCtor } from '@ironarachne/rng';
  import * as Tinctures from '$lib/heraldry/tinctures';
  import * as Variations from '$lib/heraldry/variations';
  import Download from '$lib/download';
  import saveSvgAsPng from '$lib/download/svg_to_png';
  import { renderSVGAsPNG } from '$lib/images/svg';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';

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
    findSavedHeraldrySnapshotByBlazon,
    loadSavedHeraldrySnapshots,
  } from '$lib/heraldry/heraldry_saved_state';
  import {
    buildVariationSlotPreferences,
    eligibleVariationTinctures,
    fieldDivisionNameFromOption,
    fieldUiStateFromGeneratorOptions,
    fieldVariationSlotCountForDivision,
    hasPinnedFieldTinctures,
    resolveFieldOptions,
    variationTinctureCountForSlot,
  } from '$lib/heraldry/heraldry_ui_options';
  import {
    defaultHeraldryGeneratorOptions,
    heraldryFromSnapshot,
    toHeraldrySnapshot,
    type HeraldryGeneratorOptionsSnapshot,
    type HeraldrySnapshot,
  } from '$lib/heraldry/heraldry_snapshot';
  import { showAlertModal } from '$lib/ui/modal';
  import {
    clearLoadParamFromUrl,
    HERALDRY_LOAD_PARAM,
  } from '$lib/persistent_save/saved_data_links';
  import HeraldryTinctureSelect from '$components/heraldry/HeraldryTinctureSelect.svelte';
  import HeraldryPreviewSelect from '$components/heraldry/HeraldryPreviewSelect.svelte';
  import { buildFieldDivisionPreviewSvg } from '$lib/heraldry/field_division_preview.js';
  import { buildVariationPreviewSvg } from '$lib/heraldry/variation_preview.js';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import LoadSnapshotDialog from '$components/common/LoadSnapshotDialog.svelte';

  const HERALDRY_UI_PREVIEW_SIZE = 16;

  const CHARGE_TINCTURE_NAMES = [
    'gules',
    'argent',
    'vert',
    'purpure',
    'sable',
    'Or',
    'azure',
    'murrey',
    'sanguine',
    'tenné',
  ] as const;

  const CHARGE_TINCTURE_LABELS: Record<(typeof CHARGE_TINCTURE_NAMES)[number], string> = {
    gules: 'gules (red)',
    argent: 'argent (white)',
    vert: 'vert (green)',
    purpure: 'purpure (purple)',
    sable: 'sable (black)',
    Or: 'Or (gold)',
    azure: 'azure (blue)',
    murrey: 'murrey (mulberry)',
    sanguine: 'sanguine (blood red)',
    tenné: 'tenné (brown)',
  };

  const chargeTinctureOptions = CHARGE_TINCTURE_NAMES.map((name) => Tinctures.byName(name));

  function chargeTinctureLabel(value: string): string {
    return CHARGE_TINCTURE_LABELS[value as (typeof CHARGE_TINCTURE_NAMES)[number]] ?? value;
  }

  const rng = new RngCtor(Date.now().toString());
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
  let loadDialogComponent: LoadSnapshotDialog | undefined = $state();
  let charges = Charges.all();
  const allCharges = Charges.all();
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
  const variations = Variations.all();
  const allFields = Fields.all();
  const fieldDivisionSelectOptions = $derived(
    allFields.map((field) => ({ value: field.name, label: field.name })),
  );
  const variationSelectOptions = $derived(
    variations.map((variation) => ({ value: variation.name, label: variation.name })),
  );
  const availableTags = Charges.allChargeTags();
  const fieldVariationSlotCount = $derived(fieldVariationSlotCountForDivision(fieldDivisionOption));

  $effect(() => {
    const slotCount = fieldVariationSlotCountForDivision(fieldDivisionOption);
    if (variationSlotOptions.length < slotCount) {
      variationSlotOptions = [
        ...variationSlotOptions,
        ...Array.from({ length: slotCount - variationSlotOptions.length }, () => 'any'),
      ];
    }
    if (variationTinctureOptions.length < slotCount) {
      variationTinctureOptions = [
        ...variationTinctureOptions,
        ...Array.from({ length: slotCount - variationTinctureOptions.length }, () => [
          'any',
          'any',
        ]),
      ];
    }

    const tinctureRows = variationTinctureOptions;
    let tinctureRowsChanged = false;
    const paddedTinctureRows = tinctureRows.map((row, slotIndex) => {
      const tinctureCount = variationTinctureCountForSlot(variationSlotOptions, slotIndex);
      if (row.length >= tinctureCount) {
        return row;
      }
      tinctureRowsChanged = true;
      return [...row, ...Array.from({ length: tinctureCount - row.length }, () => 'any')];
    });
    if (tinctureRowsChanged) {
      variationTinctureOptions = paddedTinctureRows;
    }
  });
  const isCurrentBlazonSaved = $derived.by(() => {
    const arms = currentArms;
    return arms !== null && savedHeraldries.some((saved) => saved.blazon === arms.blazon);
  });
  const heraldryWidth = 600;
  const heraldryHeight = 660;

  afterNavigate(() => {
    refreshSavedHeraldries();
    tryLoadHeraldryFromBlazonParam();
  });

  function tryLoadHeraldryFromBlazonParam(): boolean {
    const blazonParam = page.url.searchParams.get(HERALDRY_LOAD_PARAM);
    if (blazonParam === null) {
      return false;
    }
    const snapshot = findSavedHeraldrySnapshotByBlazon(blazonParam);
    if (snapshot !== undefined) {
      loadSavedHeraldry(snapshot);
    }
    clearLoadParamFromUrl(HERALDRY_LOAD_PARAM);
    return snapshot !== undefined;
  }

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
    if (chargeTinctureName === 'any') {
      chargeTincture = Tinctures.randomChargeTincture(rng);
    } else {
      const tincture = Tinctures.byName(chargeTinctureName);
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
    types1.push('fur');
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
    // As in SavedDataManager: no error surface here, so a failure to rasterize is logged rather
    // than swallowed. It used to throw inside an image `onload`, where nothing could catch it.
    saveSvgAsPng(image, heraldryWidth, heraldryHeight, `heraldry-${seed}.png`).catch(
      (error: unknown) => console.error(error),
    );
  }

  function saveHeraldry() {
    if (currentArms === null) {
      return;
    }
    const result = appendSavedHeraldry(
      toHeraldrySnapshot(currentArms, seed, currentGeneratorOptions()),
    );
    if (!result.ok) {
      void showAlertModal({
        message: 'This heraldry is already saved.',
      });
      return;
    }
    refreshSavedHeraldries();
    void showAlertModal({
      message: 'Heraldry saved.',
      style: 'success',
    });
  }

  function openLoadDialog() {
    refreshSavedHeraldries();
    loadDialogComponent?.open();
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
    loadDialogComponent?.close();
  }

  function handleLoadHeraldryItem(item: { name: string; seed: string }) {
    const snapshot = savedHeraldries.find((s) => s.seed === item.seed);
    if (snapshot !== undefined) {
      loadSavedHeraldry(snapshot);
    }
  }

  const loadDialogItems = $derived(savedHeraldries.map((s) => ({ name: s.name, seed: s.seed })));

  if (!page.url.searchParams.has(HERALDRY_LOAD_PARAM)) {
    generate();
  }
</script>

<GeneratorPage theme="fantasy" title="Heraldry Generator">
  {#snippet description()}
    <p>
      Generate fantasy coats-of-arms. Note: if you change the seed, the page URL won't change, but
      your new seed will be used the next time you hit Generate.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

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
    <HeraldryTinctureSelect
      id="charge-tincture"
      bind:value={chargeTinctureName}
      tinctures={chargeTinctureOptions}
      labelForValue={chargeTinctureLabel}
      onchange={() => setChargeTincture(rng)}
    />
  </div>

  <div class="input-group">
    <label for="field-division">Field division</label>
    <HeraldryPreviewSelect
      id="field-division"
      bind:value={fieldDivisionOption}
      options={fieldDivisionSelectOptions}
      previewSvg={(value) => buildFieldDivisionPreviewSvg(value, HERALDRY_UI_PREVIEW_SIZE)}
    />
  </div>

  <div class="input-group">
    <label for="variation-slot-0">Field variation</label>
    <HeraldryPreviewSelect
      id="variation-slot-0"
      bind:value={variationSlotOptions[0]}
      options={variationSelectOptions}
      previewSvg={(value) => buildVariationPreviewSvg(value, HERALDRY_UI_PREVIEW_SIZE)}
    />
  </div>
  {#each { length: variationTinctureCountForSlot(variationSlotOptions, 0) } as _, tinctureIndex (tinctureIndex)}
    <div class="input-group">
      <label for="variation-0-tincture-{tinctureIndex}"
        >Variation tincture {tinctureIndex + 1}</label
      >
      <HeraldryTinctureSelect
        id="variation-0-tincture-{tinctureIndex}"
        bind:value={variationTinctureOptions[0][tinctureIndex]}
        tinctures={eligibleVariationTinctures(variationSlotOptions[0])}
      />
    </div>
  {/each}

  {#each { length: Math.max(0, fieldVariationSlotCount - 1) } as _, slotIndex (slotIndex)}
    {@const slot = slotIndex + 1}
    <div class="input-group">
      <label for="variation-slot-{slot}">Variation {slot + 1}</label>
      <HeraldryPreviewSelect
        id="variation-slot-{slot}"
        bind:value={variationSlotOptions[slot]}
        options={variationSelectOptions}
        previewSvg={(value) => buildVariationPreviewSvg(value, HERALDRY_UI_PREVIEW_SIZE)}
      />
    </div>
    {#if slot === 1}
      <p class="field-variation-hint">Additional variations apply to divided fields only.</p>
    {/if}
    {#each { length: variationTinctureCountForSlot(variationSlotOptions, slot) } as _, tinctureIndex (tinctureIndex)}
      <div class="input-group">
        <label for="variation-{slot}-tincture-{tinctureIndex}">
          Variation {slot + 1} tincture {tinctureIndex + 1}
        </label>
        <HeraldryTinctureSelect
          id="variation-{slot}-tincture-{tinctureIndex}"
          bind:value={variationTinctureOptions[slot][tinctureIndex]}
          tinctures={eligibleVariationTinctures(variationSlotOptions[slot])}
        />
      </div>
    {/each}
  {/each}

  <button type="button" onclick={reset}>Reset</button>
  <button onclick={generate}>Generate</button>
  <button onclick={downloadSvg} disabled={currentArms === null}>Download SVG</button>
  <button onclick={downloadPng} disabled={currentArms === null}>Download PNG</button>
  <button onclick={saveHeraldry} disabled={currentArms === null || isCurrentBlazonSaved}
    >Save</button
  >
  <button type="button" onclick={openLoadDialog}>Load...</button>

  <p class="blazon">{blazon}</p>
  <div class="coat-of-arms"><img alt="" id="output" /></div>
</GeneratorPage>

<LoadSnapshotDialog
  bind:this={loadDialogComponent}
  title="Load Saved Heraldry"
  items={loadDialogItems}
  onLoad={handleLoadHeraldryItem}
  emptyMessage="No saved heraldry yet. Generate a coat of arms and click Save."
/>

<style>
  div.coat-of-arms {
    width: 600px;
    /* Full size on desktop, but never wider than the screen it is drawn on. */
    max-width: 100%;
    aspect-ratio: 600 / 660;
    height: auto;
    margin: 0 auto;
  }

  div.coat-of-arms img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  p.blazon {
    text-align: center;
  }

  p.field-variation-hint {
    font-size: 0.875rem;
    opacity: 0.8;
    margin: 0 0 0.5rem;
  }
</style>
