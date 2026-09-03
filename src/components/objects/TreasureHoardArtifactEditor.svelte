<script lang="ts">
  import DeleteButton from '$components/common/DeleteButton.svelte';
  import Notice from '$components/common/Notice.svelte';
  import {
    hoardTotalValue,
    isHoardContainer,
    removeHoardItem,
    setHoardItemText,
    setHoardItemValue,
    setHoardTargetValue,
    validateTreasureHoardSnapshot,
    type HoardItemTextField,
    type TreasureHoardSnapshot,
  } from '$lib/treasure';
  import { COMMON_FANTASY, valueToString } from '$lib/currency';

  /**
   * The editing view for a saved treasure hoard.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **A hoard is a list a party carries off**, so the operations are renaming a thing, repricing
   * it, and taking it out — not typing into a form. Removing an item also takes it out of whichever
   * chest held it, which `removeHoardItem` does and a caller would forget.
   *
   * **Nothing is recomputed.** A container's weight is not re-derived when something leaves it, and
   * the target value is not re-derived from what is left: the target is what the hoard was *rolled
   * for*, which stays true however much of it the party takes.
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
   * something that is not a hoard.
   */
  const accepted = $derived(validateTreasureHoardSnapshot(snapshot));
  const hoard = $derived<TreasureHoardSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: TreasureHoardSnapshot) => TreasureHoardSnapshot): void {
    if (hoard === undefined) {
      return;
    }
    onChange(change(hoard));
  }

  const totalText = $derived(
    hoard === undefined ? '' : valueToString(hoardTotalValue(hoard), COMMON_FANTASY) || '0 cp',
  );

  const FIELDS: { field: HoardItemTextField; label: string }[] = [
    { field: 'name', label: 'Name' },
    { field: 'description', label: 'Description' },
  ];
</script>

{#if hoard === undefined}
  <Notice tone="danger">
    These contents are stored as a treasure hoard but do not read as one, so there is nothing safe
    to edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="hoard-editor">
    <div class="input-group input-group--inline">
      <!-- In copper, which is the unit every price on the site is stored in. -->
      <label for="{uid}-target">Rolled for (cp)</label>
      <input
        id="{uid}-target"
        type="number"
        min="0"
        value={hoard.targetValue}
        oninput={(event) =>
          edit((current) => setHoardTargetValue(current, event.currentTarget.valueAsNumber))}
      />
    </div>

    <p class="hoard-editor__total" role="status">
      {hoard.items.length} items, worth {totalText} all told.
    </p>

    <!-- 6.4 in the editor too: a hoard the party has carried off entirely says so rather than
         showing an empty list under a heading. -->
    {#if hoard.items.length === 0}
      <Notice>Nothing left in this hoard.</Notice>
    {/if}

    {#each hoard.items as item, index (item.id)}
      <fieldset class="hoard-editor__item inset">
        <legend>
          {item.name === '' ? `Item ${index + 1}` : item.name}
          {#if isHoardContainer(item)}<span class="hoard-editor__badge">container</span>{/if}
        </legend>

        {#each FIELDS as entry (entry.field)}
          <div class="input-group input-group--inline">
            <label for="{uid}-{item.id}-{entry.field}">{entry.label}</label>
            <input
              id="{uid}-{item.id}-{entry.field}"
              type="text"
              value={item[entry.field]}
              oninput={(event) =>
                edit((current) =>
                  setHoardItemText(current, index, entry.field, event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>
        {/each}

        <div class="input-group input-group--inline">
          <label for="{uid}-{item.id}-value">Value (cp)</label>
          <input
            id="{uid}-{item.id}-value"
            type="number"
            min="0"
            value={item.value}
            oninput={(event) =>
              edit((current) =>
                setHoardItemValue(current, index, event.currentTarget.valueAsNumber),
              )}
          />
          <span class="hoard-editor__price">
            {valueToString(item.value, COMMON_FANTASY) || '0 cp'}
          </span>
        </div>

        <DeleteButton
          label="Remove {item.name === '' ? `item ${index + 1}` : item.name}"
          onclick={() => edit((current) => removeHoardItem(current, index))}
        />
      </fieldset>
    {/each}
  </div>
{/if}

<style>
  .hoard-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
    align-items: flex-start;
  }

  .hoard-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .hoard-editor input {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .hoard-editor__total {
    color: var(--ink-faint);
    margin: 0;
  }

  /* `inset` rather than a hand-rolled border and radius: the panel language owns those. */
  .hoard-editor__item {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    align-items: flex-start;
    min-width: 0;
    padding: var(--s4);
    width: 100%;
  }

  .hoard-editor__item legend,
  .hoard-editor__badge,
  .hoard-editor__price {
    color: var(--ink-faint);
    font: var(--t-micro);
    letter-spacing: var(--t-micro-tracking);
  }

  .hoard-editor__item legend {
    text-transform: uppercase;
  }

  .hoard-editor__price {
    white-space: nowrap;
  }
</style>
