<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addCultureTaboo,
    redescribeCultureOrganization,
    removeCultureTaboo,
    renameCulture,
    setCultureOrganizationField,
    setCultureReligionField,
    setCultureTaboo,
    setCultureTrait,
    validateCultureSnapshot,
    type CultureOrganizationField,
    type CultureSnapshot,
    type CultureTraitField,
  } from '$lib/culture';

  /**
   * The editing view for a saved culture — the first kind to fill the slot #39 built.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it,
   * so what is here is the culture's own shape and the calls that change it.
   *
   * Every control writes a whole replacement snapshot through `onChange`. The framework compares
   * that against what it read to decide whether anything needs saving, so typing a character and
   * deleting it again leaves nothing to save — no bookkeeping here required to achieve that.
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
   * through `validate` rather than a cast is what keeps a culture editor from rendering fields
   * over something that is not a culture. The surface already reports a payload it could not read;
   * this is the case where it read cleanly and then failed its own kind's check, which should not
   * happen and is said plainly rather than crashing the panel.
   */
  const accepted = $derived(validateCultureSnapshot(snapshot));
  const culture = $derived<CultureSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  const TRAIT_FIELDS: { field: CultureTraitField; label: string }[] = [
    { field: 'greeting', label: 'Greetings' },
    { field: 'eatingTrait', label: 'Meals' },
    { field: 'designTrait', label: 'Design' },
    { field: 'musicStyle', label: 'Music' },
  ];

  const ORGANIZATION_FIELDS: { field: CultureOrganizationField; label: string }[] = [
    { field: 'powerConcentration', label: 'Power' },
    { field: 'socialMobility', label: 'Social mobility' },
    { field: 'dominantProfession', label: 'Dominant profession' },
    { field: 'dominantGender', label: 'Dominant gender' },
  ];

  /** Applies one edit. Every handler goes through here so `onChange` is called in exactly one place. */
  function edit(change: (current: CultureSnapshot) => CultureSnapshot): void {
    if (culture === undefined) {
      return;
    }
    onChange(change(culture));
  }
</script>

{#if culture === undefined}
  <Notice tone="danger">
    These contents are stored as a culture but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="culture-editor">
    <div class="input-group input-group--inline">
      <label for="{uid}-culture-name">Culture name</label>
      <input
        id="{uid}-culture-name"
        type="text"
        value={culture.name}
        oninput={(event) => edit((current) => renameCulture(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <fieldset>
      <legend>Organization</legend>

      {#each ORGANIZATION_FIELDS as entry (entry.field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{entry.field}">{entry.label}</label>
          <input
            id="{uid}-{entry.field}"
            type="text"
            value={culture.organization[entry.field] ?? ''}
            oninput={(event) =>
              edit((current) =>
                setCultureOrganizationField(current, entry.field, event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>
      {/each}

      <div class="input-group culture-editor__stacked">
        <label for="{uid}-organization-description">Organization description</label>
        <textarea
          id="{uid}-organization-description"
          rows="3"
          value={culture.organization.description}
          oninput={(event) =>
            edit((current) =>
              setCultureOrganizationField(current, 'description', event.currentTarget.value),
            )}
        ></textarea>
      </div>

      <!-- Offered rather than done automatically: the description is the user's once they have
           touched it, and recomposing it the moment a field above changed would throw away a
           paragraph they wrote by hand. -->
      <BaseButton onclick={() => edit(redescribeCultureOrganization)}>
        Rewrite description from these
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>Religion</legend>

      {#if culture.religion === null}
        <p class="culture-editor__note">
          This culture's religion is a saved religion of its own, linked above. Editing it there
          changes it everywhere it is used, including here.
        </p>
      {:else}
        <div class="input-group input-group--inline">
          <label for="{uid}-religion-name">Religion name</label>
          <input
            id="{uid}-religion-name"
            type="text"
            value={culture.religion.name}
            oninput={(event) =>
              edit((current) =>
                setCultureReligionField(current, 'name', event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>
        <div class="input-group culture-editor__stacked">
          <label for="{uid}-religion-description">Religion description</label>
          <textarea
            id="{uid}-religion-description"
            rows="3"
            value={culture.religion.description}
            oninput={(event) =>
              edit((current) =>
                setCultureReligionField(current, 'description', event.currentTarget.value),
              )}
          ></textarea>
        </div>
      {/if}
    </fieldset>

    <fieldset>
      <legend>Taboos</legend>

      <!-- Keyed by position rather than by value: two taboos may read the same, and a key that
           changed as the user typed would lose focus on every keystroke. -->
      {#each culture.taboos as taboo, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-taboo-{index}">Taboo {index + 1}</label>
          <input
            id="{uid}-taboo-{index}"
            type="text"
            value={taboo}
            oninput={(event) =>
              edit((current) => setCultureTaboo(current, index, event.currentTarget.value))}
            autocomplete="off"
          />
          <BaseButton
            aria-label="Remove taboo {index + 1}"
            onclick={() => edit((current) => removeCultureTaboo(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit((current) => addCultureTaboo(current))}>
        Add a taboo
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>Customs</legend>

      {#each TRAIT_FIELDS as entry (entry.field)}
        <div class="input-group culture-editor__stacked">
          <label for="{uid}-{entry.field}">{entry.label}</label>
          <textarea
            id="{uid}-{entry.field}"
            rows="3"
            value={culture[entry.field]}
            oninput={(event) =>
              edit((current) => setCultureTrait(current, entry.field, event.currentTarget.value))}
          ></textarea>
        </div>
      {/each}
    </fieldset>

    <!-- Read-only, and named rather than hidden: the naming traditions are what other generators
         reach into this culture for, so which set they came from is worth seeing. There is no
         editor for them because a name pattern set is not prose — it is a grammar, and rewriting
         one by hand in a text box is not an edit anyone wants to make. -->
    <p class="culture-editor__note">Names follow the {culture.nameGenerators.name} patterns.</p>
  </div>
{/if}

<style>
  .culture-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .culture-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius. A fieldset inside an editor panel was a box inside a box, which
       is what "the problem is nineteen copies of a box" is about: when everything is a box,
       being one emphasises nothing. The legend and the spacing group these fields; the panel
       around them is the only keyline in sight. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .culture-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset, the room to shrink and the full width. */
  .culture-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  /* Prose wants the width; a label sitting beside a three-row textarea on a 320px screen leaves
     neither enough room to be useful. */
  .culture-editor .culture-editor__stacked {
    flex-direction: column;
    align-items: stretch;
  }

  .culture-editor input[type='text'],
  .culture-editor textarea {
    min-width: 0;
    flex: 1 1 6rem;
    width: 100%;
  }

  .culture-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
