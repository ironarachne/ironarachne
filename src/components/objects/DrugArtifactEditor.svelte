<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    describeDrug,
    drugTypes,
    effectTypes,
    setDrugText,
    validateDrugSnapshot,
    type DrugSnapshot,
    type DrugTextField,
  } from '$lib/drug';

  /**
   * The editing view for a saved drug.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **This is the flattest payload in the pass — eleven strings — and it still gets a bespoke
   * editor.** `docs/tool-readiness.md` retired `SnapshotFieldEditor` after six tools declined it;
   * this one would genuinely have fitted, and one customer does not make a framework worth the
   * indirection. What is here is shorter than the descriptor list that would have configured it.
   *
   * **Nothing recomputes the description.** It is the field a user is most likely to have rewritten
   * by hand, and a form that regenerated it whenever another field changed would throw that away on
   * the next keystroke — which is what 4.2 forbids. The button below offers the generated wording
   * to anyone who wants it back, which is the same shape the DCC sheet uses for its saves.
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
   * something that is not a drug.
   */
  const accepted = $derived(validateDrugSnapshot(snapshot));
  const drug = $derived<DrugSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: DrugSnapshot) => DrugSnapshot): void {
    if (drug === undefined) {
      return;
    }
    onChange(change(drug));
  }

  function set(field: DrugTextField, value: string): void {
    edit((current) => setDrugText(current, field, value));
  }

  /**
   * The two fields backed by a table, offered as a select over the names that table has.
   *
   * A stored drug may name a form or an effect this build has dropped, so the current value is
   * added to the list when it is not in it — otherwise opening such a drug would silently move it
   * to whichever option happened to be first.
   */
  const formOptions = $derived(
    drug === undefined
      ? []
      : [...new Set([...drugTypes.all().map((type) => type.name), drug.drugTypeName])].filter(
          (name) => name !== '',
        ),
  );

  const effectOptions = $derived(
    drug === undefined
      ? []
      : [...new Set([...effectTypes.all().map((type) => type.name), drug.effectTypeName])].filter(
          (name) => name !== '',
        ),
  );

  /** The plain text fields, in the order the sheet reads them. */
  const TEXT_FIELDS: { field: DrugTextField; label: string }[] = [
    { field: 'name', label: 'Street name' },
    { field: 'method', label: 'How it is taken' },
    { field: 'strength', label: 'Strength' },
    { field: 'color', label: 'Colour' },
    { field: 'duration', label: 'Duration' },
    { field: 'sideEffect', label: 'Side effects' },
    { field: 'commonality', label: 'Availability' },
  ];
</script>

{#if drug === undefined}
  <Notice tone="danger">
    These contents are stored as a drug but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="drug-editor">
    {#each TEXT_FIELDS as entry (entry.field)}
      <div class="input-group input-group--inline">
        <label for="{uid}-{entry.field}">{entry.label}</label>
        <input
          id="{uid}-{entry.field}"
          type="text"
          value={drug[entry.field]}
          oninput={(event) => set(entry.field, event.currentTarget.value)}
          autocomplete="off"
        />
      </div>
    {/each}

    <div class="input-group input-group--inline">
      <label for="{uid}-form">Form</label>
      <select
        id="{uid}-form"
        value={drug.drugTypeName}
        onchange={(event) => set('drugTypeName', event.currentTarget.value)}
      >
        {#each formOptions as name (name)}
          <option value={name}>{name}</option>
        {/each}
      </select>
    </div>

    <div class="input-group input-group--inline">
      <label for="{uid}-effect">Effect</label>
      <select
        id="{uid}-effect"
        value={drug.effectTypeName}
        onchange={(event) => set('effectTypeName', event.currentTarget.value)}
      >
        {#each effectOptions as name (name)}
          <option value={name}>{name}</option>
        {/each}
      </select>
    </div>

    <div class="input-group">
      <label for="{uid}-effectDescription">What it does</label>
      <textarea
        id="{uid}-effectDescription"
        rows="2"
        value={drug.effectDescription}
        oninput={(event) => set('effectDescription', event.currentTarget.value)}
      ></textarea>
    </div>

    <div class="input-group">
      <!-- Qualified as "Drug description": the panel above has a field labelled "Name" that renames
           the artifact, and "What it does" sits right beside this one. -->
      <label for="{uid}-description">Drug description</label>
      <textarea
        id="{uid}-description"
        rows="4"
        value={drug.description}
        oninput={(event) => set('description', event.currentTarget.value)}
      ></textarea>
    </div>

    <!-- Offered rather than done automatically, for the reason the header gives. -->
    <BaseButton
      onclick={() => edit((current) => setDrugText(current, 'description', describeDrug(current)))}
    >
      Rewrite the description from the fields
    </BaseButton>
  </div>
{/if}

<style>
  .drug-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
    align-items: flex-start;
  }

  .drug-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .drug-editor input[type='text'],
  .drug-editor textarea,
  .drug-editor select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }
</style>
