<script lang="ts">
  import { downloadTextFile, saveSvgAsPng } from '$lib/download';
  // Through the entry point, deliberately, where the kind registry and the vault go deep.
  // Measured: this component's chunk already reaches the 18.9 MB charge art either way, because
  // drawing a stored device is what resolves charge names to glyphs. The deep import would buy
  // nothing and cost the rule an exception it did not earn.
  import {
    addHeraldryChargeGroup,
    deviceFromStored,
    heraldryArrangementNamesForCount,
    heraldryChargeNames,
    heraldryFieldNames,
    heraldryTinctureNames,
    heraldryVariationNames,
    removeHeraldryChargeGroup,
    renderHeraldryDeviceSvg,
    setHeraldryChargeArrangement,
    setHeraldryChargeCount,
    setHeraldryChargeName,
    setHeraldryChargePosition,
    setHeraldryChargeTincture,
    setHeraldryFieldName,
    setHeraldryVariationName,
    setHeraldryVariationTincture,
    validateHeraldrySnapshot,
    HERALDRY_CHARGE_POSITIONS,
    HERALDRY_HEIGHT,
    HERALDRY_WIDTH,
    type HeraldrySnapshot,
  } from '$lib/heraldry';
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  /**
   * The editing view for a saved coat of arms.
   *
   * It replaces the viewer heraldry had until #51, which could draw a stored device and hand over
   * an SVG or a PNG and could change nothing. Those two downloads are still here — losing them to
   * gain an editor would have been a trade, not a step — and around them is a form over the names
   * the device is stored as: a field division, a variation and its tinctures per slot, and a charge
   * group per row.
   *
   * **The arms are drawn beside the controls**, which is why this is not a `SnapshotFieldEditor`
   * case (decision 5 of docs/tool-readiness.md): a charge group is a repeating structure with its
   * own add and remove, and a flat list of inputs with no picture would be a worse editor than the
   * viewer it replaces.
   *
   * **The blazon is derived, never edited.** `heraldry_editing.ts` recomputes it after every
   * change, because a stored blazon that no longer describes the device is worse than none.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  /** On screen it sits in a panel beside other panels, so it is drawn smaller and scaled by CSS. */
  const PREVIEW_WIDTH = 200;
  const PREVIEW_HEIGHT = 220;

  let error: string | null = $state(null);

  /**
   * The snapshot as this kind's own validator accepts it, or nothing.
   *
   * The prop is `unknown` because the framework holds payloads of every kind, and narrowing it
   * through `validate` rather than a cast is what keeps this editor from rendering fields over
   * something that is not a coat of arms.
   */
  const accepted = $derived(validateHeraldrySnapshot(snapshot));
  const arms = $derived<HeraldrySnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /**
   * The device drawn, or nothing when a name in it no longer resolves.
   *
   * A charge this build has dropped since the arms were saved is the ordinary reason: the payload
   * is fine and the picture cannot be made, so the editor says so and still lets every other field
   * be corrected.
   */
  const preview = $derived.by(() => {
    if (arms === undefined) {
      return null;
    }
    try {
      return renderHeraldryDeviceSvg(deviceFromStored(arms.device), PREVIEW_WIDTH, PREVIEW_HEIGHT);
    } catch {
      return null;
    }
  });

  const fieldNames = heraldryFieldNames();
  const variationNames = heraldryVariationNames();
  const tinctureNames = heraldryTinctureNames();
  const chargeNames = heraldryChargeNames();

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: HeraldrySnapshot) => HeraldrySnapshot): void {
    if (arms === undefined) {
      return;
    }
    onChange(change(arms));
  }

  /** Redrawn at full size only when a file is actually asked for. */
  function fullSizeSvg(): string | undefined {
    if (arms === undefined) {
      return undefined;
    }
    try {
      return renderHeraldryDeviceSvg(
        deviceFromStored(arms.device),
        HERALDRY_WIDTH,
        HERALDRY_HEIGHT,
      );
    } catch {
      return undefined;
    }
  }

  function fileName(extension: string): string {
    return `heraldry-${arms?.seed ?? 'arms'}.${extension}`;
  }

  function downloadSvg() {
    const svg = fullSizeSvg();
    if (svg === undefined) {
      return;
    }
    error = downloadTextFile(svg, fileName('svg'), 'image/svg+xml')
      ? null
      : 'This browser would not save the file.';
  }

  async function downloadPng() {
    const svg = fullSizeSvg();
    if (svg === undefined) {
      return;
    }
    try {
      await saveSvgAsPng(svg, HERALDRY_WIDTH, HERALDRY_HEIGHT, fileName('png'));
      error = null;
    } catch (thrown: unknown) {
      // Rasterizing can fail on a canvas with no context, or an SVG the browser will not load.
      console.error(thrown);
      error = 'This browser could not turn the arms into a PNG. The SVG still works.';
    }
  }
</script>

{#if arms === undefined}
  <Notice tone="danger">
    These arms were written in a shape this version cannot read, so there is nothing safe to edit
    here. They are still stored, and still travel in an export. {accepted.ok
      ? ''
      : accepted.message}
  </Notice>
{:else}
  <div class="heraldry-artifact">
    <!-- The blazon is the arms in words, and it is what a user reads out at the table. It is above
         the image because it is the part that can be searched, quoted, and copied — and it is
         recomputed after every edit rather than typed, because a blazon that no longer describes
         the device is worse than none. -->
    <p class="heraldry-artifact__blazon">{arms.blazon}</p>

    {#if preview === null}
      <Notice tone="notice">
        Something in these arms — a charge, most likely — is not in this build, so they cannot be
        drawn. Every field below still edits the record.
      </Notice>
    {:else}
      <div class="heraldry-artifact__device" role="img" aria-label={arms.blazon}>
        <!-- The SVG is built by our own renderer from a snapshot the kind's validator accepted,
             never from anything a user typed. -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html preview}
      </div>
    {/if}

    <div class="heraldry-artifact__actions">
      <BaseButton onclick={downloadSvg}>Download SVG</BaseButton>
      <BaseButton onclick={() => void downloadPng()}>Download PNG</BaseButton>
    </div>

    {#if error !== null}
      <Notice tone="danger">{error}</Notice>
    {/if}

    <fieldset>
      <legend>The field</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-field">Division</label>
        <select
          id="{uid}-field"
          value={arms.device.fieldName}
          onchange={(event) =>
            edit((current) => setHeraldryFieldName(current, event.currentTarget.value))}
        >
          {#each fieldNames as name (name)}
            <option value={name}>{name}</option>
          {/each}
        </select>
      </div>

      <!-- One block per variation slot. How many there are is the division's decision, so changing
           the division above adds or removes blocks here rather than leaving a slot nothing
           draws. -->
      {#each arms.device.variations as variation, slotIndex (slotIndex)}
        <div class="input-group input-group--inline">
          <label for="{uid}-variation-{slotIndex}">Variation {slotIndex + 1}</label>
          <select
            id="{uid}-variation-{slotIndex}"
            value={variation.variationName}
            onchange={(event) =>
              edit((current) =>
                setHeraldryVariationName(current, slotIndex, event.currentTarget.value),
              )}
          >
            {#each variationNames as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>

        {#each variation.tinctureNames as tinctureName, tinctureIndex (tinctureIndex)}
          <div class="input-group input-group--inline">
            <label for="{uid}-variation-{slotIndex}-tincture-{tinctureIndex}">
              Variation {slotIndex + 1} tincture {tinctureIndex + 1}
            </label>
            <select
              id="{uid}-variation-{slotIndex}-tincture-{tinctureIndex}"
              value={tinctureName}
              onchange={(event) =>
                edit((current) =>
                  setHeraldryVariationTincture(
                    current,
                    slotIndex,
                    tinctureIndex,
                    event.currentTarget.value,
                  ),
                )}
            >
              {#each tinctureNames as name (name)}
                <option value={name}>{name}</option>
              {/each}
            </select>
          </div>
        {/each}
      {/each}
    </fieldset>

    <!-- Keyed by position rather than by value: two groups may hold the same charge, and a key
         that changed as the user picked would lose focus on every change. -->
    {#each arms.device.chargeGroups as group, index (index)}
      <fieldset>
        <legend>Charge group {index + 1}</legend>

        <div class="input-group input-group--inline">
          <label for="{uid}-charge-{index}">Charge</label>
          <select
            id="{uid}-charge-{index}"
            value={group.chargeName}
            onchange={(event) =>
              edit((current) => setHeraldryChargeName(current, index, event.currentTarget.value))}
          >
            {#each chargeNames as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-charge-{index}-tincture">Charge tincture</label>
          <select
            id="{uid}-charge-{index}-tincture"
            value={group.chargeTinctureName}
            onchange={(event) =>
              edit((current) =>
                setHeraldryChargeTincture(current, index, event.currentTarget.value),
              )}
          >
            {#each tinctureNames as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-charge-{index}-count">How many</label>
          <select
            id="{uid}-charge-{index}-count"
            value={String(group.numberOfCharges)}
            onchange={(event) =>
              edit((current) =>
                setHeraldryChargeCount(current, index, Number(event.currentTarget.value)),
              )}
          >
            {#each [1, 2, 3, 4] as count (count)}
              <option value={String(count)}>{count}</option>
            {/each}
          </select>
        </div>

        <!-- Only the arrangements that hold this group's own count: "three, two and one" is not a
             way to arrange two charges, and changing the count above repairs the pairing. -->
        <div class="input-group input-group--inline">
          <label for="{uid}-charge-{index}-arrangement">Arrangement</label>
          <select
            id="{uid}-charge-{index}-arrangement"
            value={group.arrangementName}
            onchange={(event) =>
              edit((current) =>
                setHeraldryChargeArrangement(current, index, event.currentTarget.value),
              )}
          >
            {#each heraldryArrangementNamesForCount(group.numberOfCharges) as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-charge-{index}-position">Position</label>
          <select
            id="{uid}-charge-{index}-position"
            value={group.position ?? 'normal'}
            onchange={(event) =>
              edit((current) =>
                setHeraldryChargePosition(current, index, event.currentTarget.value),
              )}
          >
            {#each HERALDRY_CHARGE_POSITIONS as position (position)}
              <option value={position}>{position}</option>
            {/each}
          </select>
        </div>

        <BaseButton
          aria-label="Remove charge group {index + 1}"
          onclick={() => edit((current) => removeHeraldryChargeGroup(current, index))}
        >
          Remove charge group {index + 1}
        </BaseButton>
      </fieldset>
    {/each}

    <BaseButton onclick={() => edit(addHeraldryChargeGroup)}>Add a charge group</BaseButton>
  </div>
{/if}

<style>
  .heraldry-artifact {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .heraldry-artifact__blazon {
    margin: 0;
    font-style: italic;
  }

  .heraldry-artifact__device {
    /* The drawing is scaled by its container rather than redrawn per width: it is an SVG, so it
       stays sharp, and a panel on a phone is narrower than the size it is drawn at. */
    max-width: 100%;
  }

  .heraldry-artifact__device :global(svg) {
    width: 100%;
    max-width: 12rem;
    height: auto;
  }

  .heraldry-artifact__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
  }

  .heraldry-artifact fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the character editors: a fieldset inside an editor panel
       was a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .heraldry-artifact legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .heraldry-artifact .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .heraldry-artifact select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }
</style>
