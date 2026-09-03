<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import Notice from '$components/common/Notice.svelte';
  import {
    ITEM_COMPOSITION_PARTS,
    ITEM_DENSITY_CATEGORIES,
    ITEM_RARITIES,
    describeItem,
    itemPartDescription,
    itemPartName,
    itemPropertiesLine,
    removeItemPart,
    setItemDensity,
    setItemNumber,
    setItemPartField,
    setItemProperties,
    setItemRarity,
    setItemText,
    validateItemSnapshot,
    type DensityCategory,
    type ItemCompositionPart,
    type ItemSnapshot,
    type ItemTextField,
    type Rarity,
  } from '$lib/equipment';

  /**
   * The editing view for a saved item.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **The composition is here, which is the whole reason it is stored.** #66 asks for the records
   * rather than the rendered prose so that an editor can reach them, and these four rows are what
   * that buys: a user can rename the enchantment on a sword, rewrite what the refinement did, or
   * take the decoration off entirely. An item's parts are only editable because the payload kept
   * them.
   *
   * **Nothing is recomputed.** Changing the material does not re-multiply the value, and changing a
   * part does not rewrite the description — 4.2 forbids exactly that, and `$lib/equipment`'s
   * `item_editing.ts` says why at length. The button at the foot offers the generated wording back
   * to anyone who wants it.
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
   * something that is not an item.
   */
  const accepted = $derived(validateItemSnapshot(snapshot));
  const item = $derived<ItemSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: ItemSnapshot) => ItemSnapshot): void {
    if (item === undefined) {
      return;
    }
    onChange(change(item));
  }

  const TEXT_FIELDS: { field: ItemTextField; label: string }[] = [
    { field: 'name', label: 'Item name' },
    { field: 'uniqueName', label: 'Unique name' },
    { field: 'itemMinorType', label: 'Type' },
  ];

  const PART_LABELS: Record<ItemCompositionPart, string> = {
    material: 'Material',
    refinement: 'Refinement',
    enchantment: 'Enchantment',
    decoration: 'Decoration',
  };

  /** The parts this item actually has. A part it does not have has nothing to edit. */
  const presentParts = $derived(
    item === undefined ? [] : ITEM_COMPOSITION_PARTS.filter((part) => item[part] !== undefined),
  );
</script>

{#if item === undefined}
  <Notice tone="danger">
    These contents are stored as an item but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="item-editor">
    {#each TEXT_FIELDS as entry (entry.field)}
      <div class="input-group input-group--inline">
        <label for="{uid}-{entry.field}">{entry.label}</label>
        <input
          id="{uid}-{entry.field}"
          type="text"
          value={item[entry.field] ?? ''}
          oninput={(event) =>
            edit((current) => setItemText(current, entry.field, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    {/each}

    <div class="input-group input-group--inline">
      <label for="{uid}-rarity">Rarity</label>
      <select
        id="{uid}-rarity"
        value={item.rarity}
        onchange={(event) =>
          edit((current) => setItemRarity(current, event.currentTarget.value as Rarity))}
      >
        {#each ITEM_RARITIES as rarity (rarity)}
          <option value={rarity}>{rarity}</option>
        {/each}
      </select>
    </div>

    <div class="input-group input-group--inline">
      <label for="{uid}-density">Density</label>
      <select
        id="{uid}-density"
        value={item.densityCategory}
        onchange={(event) =>
          edit((current) => setItemDensity(current, event.currentTarget.value as DensityCategory))}
      >
        {#each ITEM_DENSITY_CATEGORIES as density (density)}
          <option value={density}>{density}</option>
        {/each}
      </select>
    </div>

    <div class="input-group input-group--inline">
      <!-- In copper, which is the unit the value is stored in and the one the price lists quote. -->
      <label for="{uid}-value">Value (cp)</label>
      <input
        id="{uid}-value"
        type="number"
        min="0"
        value={item.value}
        oninput={(event) =>
          edit((current) => setItemNumber(current, 'value', event.currentTarget.valueAsNumber))}
      />
    </div>

    <div class="input-group input-group--inline">
      <label for="{uid}-weight">Weight (kg)</label>
      <input
        id="{uid}-weight"
        type="number"
        min="0"
        step="0.1"
        value={item.weight}
        oninput={(event) =>
          edit((current) => setItemNumber(current, 'weight', event.currentTarget.valueAsNumber))}
      />
    </div>

    <div class="input-group">
      <label for="{uid}-properties">Properties</label>
      <input
        id="{uid}-properties"
        type="text"
        value={itemPropertiesLine(item)}
        oninput={(event) =>
          edit((current) => setItemProperties(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group">
      <!-- Qualified as "Item description": the panel above has a field labelled "Name" that
           renames the artifact, and three other descriptions sit below this one. -->
      <label for="{uid}-description">Item description</label>
      <textarea
        id="{uid}-description"
        rows="4"
        value={item.description}
        oninput={(event) =>
          edit((current) => setItemText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    {#if presentParts.length > 0}
      <h3 class="item-editor__heading">Composition</h3>
      {#each presentParts as part (part)}
        <fieldset class="item-editor__part inset">
          <legend>{PART_LABELS[part]}</legend>
          <div class="input-group input-group--inline">
            <label for="{uid}-{part}-name">Name</label>
            <input
              id="{uid}-{part}-name"
              type="text"
              value={itemPartName(item, part)}
              oninput={(event) =>
                edit((current) =>
                  setItemPartField(current, part, 'name', event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>
          <!-- A material carries no description; the other three do. -->
          {#if part !== 'material'}
            <div class="input-group">
              <label for="{uid}-{part}-description">What it does</label>
              <textarea
                id="{uid}-{part}-description"
                rows="2"
                value={itemPartDescription(item, part)}
                oninput={(event) =>
                  edit((current) =>
                    setItemPartField(current, part, 'description', event.currentTarget.value),
                  )}
              ></textarea>
            </div>
          {/if}
          <BaseButton onclick={() => edit((current) => removeItemPart(current, part))}>
            Remove {PART_LABELS[part].toLowerCase()}
          </BaseButton>
        </fieldset>
      {/each}
    {/if}

    <!-- Offered rather than done automatically, for the reason the header gives. -->
    <BaseButton
      onclick={() => edit((current) => setItemText(current, 'description', describeItem(current)))}
    >
      Rewrite the description from the parts
    </BaseButton>
  </div>
{/if}

<style>
  .item-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
    align-items: flex-start;
  }

  .item-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .item-editor input,
  .item-editor textarea,
  .item-editor select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .item-editor__heading {
    margin: var(--s4) 0 0;
  }

  /* `inset` rather than a hand-rolled border and radius: the panel language owns those, and a
     nineteenth copy of `1px solid var(--tan)` is exactly what it replaced. */
  .item-editor__part {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    align-items: flex-start;
    min-width: 0;
    padding: var(--s4);
    width: 100%;
  }

  .item-editor__part legend {
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
    text-transform: uppercase;
    color: var(--ink-faint);
  }
</style>
