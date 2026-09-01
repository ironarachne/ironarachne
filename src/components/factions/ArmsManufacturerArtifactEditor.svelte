<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addArmsManufacturerModel,
    removeArmsManufacturerModel,
    setArmsManufacturerModelText,
    setArmsManufacturerText,
    validateArmsManufacturerSnapshot,
    type ArmsManufacturerSnapshot,
  } from '$lib/arms_manufacturer';

  /**
   * The editing view for a saved arms manufacturer.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is the company's two fields, one row per model, and the calls that change them.
   *
   * **This is not the `SnapshotFieldEditor` case docs/readiness-factions.md called it**, for the
   * reason Velgarth Gifts was not either. That component (decision 5 of docs/tool-readiness.md) is
   * a list of labelled inputs bound to the fields of a *flat* object, with `string-list` as the
   * only repeating control; a manufacturer's catalogue is a list of *records* — a name, a damage
   * type and a description each — with its own add and remove. The decision's own guard applies: a
   * payload the descriptor language does not describe gets a bespoke editor rather than a fifth
   * control, and the declared component is still waiting for a genuinely flat payload.
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
   * something that is not a manufacturer.
   */
  const accepted = $derived(validateArmsManufacturerSnapshot(snapshot));
  const manufacturer = $derived<ArmsManufacturerSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: ArmsManufacturerSnapshot) => ArmsManufacturerSnapshot): void {
    if (manufacturer === undefined) {
      return;
    }
    onChange(change(manufacturer));
  }
</script>

{#if manufacturer === undefined}
  <Notice tone="danger">
    These contents are stored as an arms manufacturer but do not read as one, so there is nothing
    safe to edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="manufacturer-editor">
    <fieldset>
      <legend>Company</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-name">Company name</label>
        <input
          id="{uid}-name"
          type="text"
          value={manufacturer.name}
          oninput={(event) =>
            edit((current) => setArmsManufacturerText(current, 'name', event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      <!-- Qualified as "Company name" rather than "Name", like every other editor: the panel above
           already has a field labelled "Name" that renames the artifact, and two fields with the
           same accessible name in one region is the 6.2 failure. -->
      <!-- The description opens with the company's name as it was rolled, and renaming the
           company above deliberately does not rewrite it: the prose was assembled from three lists
           at generation time, so there is nothing to derive it from and it is the user's to keep or
           change. -->
      <div class="input-group input-group--inline">
        <label for="{uid}-description">Company description</label>
        <textarea
          id="{uid}-description"
          rows="4"
          value={manufacturer.description}
          oninput={(event) =>
            edit((current) =>
              setArmsManufacturerText(current, 'description', event.currentTarget.value),
            )}
        ></textarea>
      </div>
    </fieldset>

    {#if manufacturer.models.length === 0}
      <!-- A catalogue with nothing in it is an ordinary state, not a fault: a user may have removed
           every model on the way to writing their own. -->
      <p class="manufacturer-editor__note">No models in this catalogue yet.</p>
    {/if}

    <!-- Keyed by position rather than by name: two rows may read the same while one is being
         typed, and a key that changed as the user typed would lose focus on every keystroke. -->
    {#each manufacturer.models as model, index (index)}
      <fieldset>
        <legend>Model {index + 1}</legend>

        <div class="input-group input-group--inline">
          <label for="{uid}-model-{index}-name">Model name</label>
          <input
            id="{uid}-model-{index}-name"
            type="text"
            value={model.name}
            oninput={(event) =>
              edit((current) =>
                setArmsManufacturerModelText(current, index, 'name', event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-model-{index}-damage">Damage type</label>
          <input
            id="{uid}-model-{index}-damage"
            type="text"
            value={model.damage}
            oninput={(event) =>
              edit((current) =>
                setArmsManufacturerModelText(current, index, 'damage', event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-model-{index}-description">Model description</label>
          <textarea
            id="{uid}-model-{index}-description"
            rows="3"
            value={model.description}
            oninput={(event) =>
              edit((current) =>
                setArmsManufacturerModelText(
                  current,
                  index,
                  'description',
                  event.currentTarget.value,
                ),
              )}
          ></textarea>
        </div>

        <BaseButton
          aria-label="Remove model {index + 1}"
          onclick={() => edit((current) => removeArmsManufacturerModel(current, index))}
        >
          Remove model {index + 1}
        </BaseButton>
      </fieldset>
    {/each}

    <BaseButton onclick={() => edit(addArmsManufacturerModel)}>Add a model</BaseButton>
  </div>
{/if}

<style>
  .manufacturer-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .manufacturer-editor fieldset {
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

  .manufacturer-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .manufacturer-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .manufacturer-editor input[type='text'],
  .manufacturer-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .manufacturer-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
