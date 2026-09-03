<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import DeleteButton from '$components/common/DeleteButton.svelte';
  import Notice from '$components/common/Notice.svelte';
  import { ITEM_RARITIES } from '$lib/equipment';
  import type { Rarity } from '$lib/equipment';
  import {
    describeModification,
    describePotionSnapshot,
    removePotionModification,
    setPotionContainerText,
    setPotionDescription,
    setPotionEffectText,
    setPotionMagnitude,
    setPotionRarity,
    setPotionSensory,
    setPotionText,
    setPotionValue,
    validatePotionSnapshot,
    type PotionSensoryField,
    type PotionSnapshot,
    type PotionTextField,
  } from '$lib/potions';

  /**
   * The editing view for a saved potion.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **The sensory profile and the effect are here, which is why a potion is not an `item`.**
   * Decision 2 of docs/readiness-objects.md: an item editor has no field for a duration or a
   * flavour, and folding the two kinds together would give one of them an editor that is wrong.
   *
   * **Nothing is recomputed.** Changing the magnitude does not reprice the potion, and no field
   * rewrites the description — 4.2 forbids exactly that, and `$lib/potions`' `potion_editing.ts`
   * says why at length. The button at the foot offers the generated wording back.
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
   * something that is not a potion.
   */
  const accepted = $derived(validatePotionSnapshot(snapshot));
  const potion = $derived<PotionSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: PotionSnapshot) => PotionSnapshot): void {
    if (potion === undefined) {
      return;
    }
    onChange(change(potion));
  }

  const NAME_FIELDS: { field: PotionTextField; label: string }[] = [
    { field: 'displayName', label: 'Potion name' },
    { field: 'canonicalName', label: 'Base formula' },
  ];

  const SENSORY_FIELDS: { field: PotionSensoryField; label: string }[] = [
    { field: 'appearance', label: 'Appearance' },
    { field: 'viscosity', label: 'Viscosity' },
    { field: 'flavor', label: 'Flavor' },
    { field: 'scent', label: 'Scent' },
  ];
</script>

{#if potion === undefined}
  <Notice tone="danger">
    These contents are stored as a potion but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="potion-editor">
    {#each NAME_FIELDS as entry (entry.field)}
      <div class="input-group input-group--inline">
        <label for="{uid}-{entry.field}">{entry.label}</label>
        <input
          id="{uid}-{entry.field}"
          type="text"
          value={potion[entry.field] ?? ''}
          oninput={(event) =>
            edit((current) => setPotionText(current, entry.field, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    {/each}

    <div class="input-group input-group--inline">
      <label for="{uid}-rarity">Rarity</label>
      <select
        id="{uid}-rarity"
        value={potion.liquid.rarity}
        onchange={(event) =>
          edit((current) => setPotionRarity(current, event.currentTarget.value as Rarity))}
      >
        {#each ITEM_RARITIES as rarity (rarity)}
          <option value={rarity}>{rarity}</option>
        {/each}
      </select>
    </div>

    <div class="input-group input-group--inline">
      <!-- In copper, which is the unit a value is stored in and the one the price lists quote. -->
      <label for="{uid}-value">Value (cp)</label>
      <input
        id="{uid}-value"
        type="number"
        min="0"
        value={potion.liquid.value}
        oninput={(event) =>
          edit((current) => setPotionValue(current, event.currentTarget.valueAsNumber))}
      />
    </div>

    <h3 class="potion-editor__heading">Effect</h3>

    <div class="input-group input-group--inline">
      <label for="{uid}-effect-name">Effect name</label>
      <input
        id="{uid}-effect-name"
        type="text"
        value={potion.effect.name}
        oninput={(event) =>
          edit((current) => setPotionEffectText(current, 'name', event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group">
      <label for="{uid}-effect-description">What it does</label>
      <textarea
        id="{uid}-effect-description"
        rows="3"
        value={potion.effect.description}
        oninput={(event) =>
          edit((current) => setPotionEffectText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    <div class="input-group input-group--inline">
      <label for="{uid}-magnitude">Magnitude</label>
      <input
        id="{uid}-magnitude"
        type="number"
        min="0"
        value={potion.effect.magnitude}
        oninput={(event) =>
          edit((current) => setPotionMagnitude(current, event.currentTarget.valueAsNumber))}
      />
    </div>

    <h3 class="potion-editor__heading">Sensory profile</h3>

    {#each SENSORY_FIELDS as entry (entry.field)}
      <div class="input-group input-group--inline">
        <label for="{uid}-sensory-{entry.field}">{entry.label}</label>
        <input
          id="{uid}-sensory-{entry.field}"
          type="text"
          value={potion.sensory[entry.field]}
          oninput={(event) =>
            edit((current) => setPotionSensory(current, entry.field, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    {/each}

    <h3 class="potion-editor__heading">Container</h3>

    <div class="input-group input-group--inline">
      <label for="{uid}-container-name">Container</label>
      <input
        id="{uid}-container-name"
        type="text"
        value={potion.container.name}
        oninput={(event) =>
          edit((current) => setPotionContainerText(current, 'name', event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group">
      <label for="{uid}-container-description">Container description</label>
      <textarea
        id="{uid}-container-description"
        rows="2"
        value={potion.container.description}
        oninput={(event) =>
          edit((current) =>
            setPotionContainerText(current, 'description', event.currentTarget.value),
          )}
      ></textarea>
    </div>

    <!-- 6.4 in the editor as well as the exports: a potion with nothing done to the base formula
         shows no modifications section rather than an empty heading. -->
    {#if potion.modifications.length > 0}
      <h3 class="potion-editor__heading">Modifications</h3>
      <ul class="potion-editor__modifications">
        {#each potion.modifications as modification, index (index)}
          <li>
            <span>{describeModification(modification)}</span>
            <!-- Removed, not re-picked: a modification is what the roll did to the base formula and
                 was applied to the numbers when it happened. Adding one from nowhere would claim a
                 change that never touched them. -->
            <DeleteButton
              label="Remove {describeModification(modification)}"
              onclick={() => edit((current) => removePotionModification(current, index))}
            />
          </li>
        {/each}
      </ul>
    {/if}

    <div class="input-group">
      <!-- Qualified as "Potion description": the panel above has a field labelled "Name" that
           renames the artifact, and two other descriptions sit near this one. -->
      <label for="{uid}-description">Potion description</label>
      <textarea
        id="{uid}-description"
        rows="4"
        value={potion.liquid.description}
        oninput={(event) =>
          edit((current) => setPotionDescription(current, event.currentTarget.value))}
      ></textarea>
    </div>

    <!-- Offered rather than done automatically, for the reason the header gives. -->
    <BaseButton
      onclick={() =>
        edit((current) => setPotionDescription(current, describePotionSnapshot(current)))}
    >
      Rewrite the description from the fields
    </BaseButton>
  </div>
{/if}

<style>
  .potion-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
    align-items: flex-start;
  }

  .potion-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .potion-editor input,
  .potion-editor textarea,
  .potion-editor select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .potion-editor__heading {
    margin: var(--s4) 0 0;
  }

  .potion-editor__modifications {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .potion-editor__modifications li {
    align-items: center;
    display: flex;
    gap: var(--s4);
    justify-content: space-between;
  }
</style>
