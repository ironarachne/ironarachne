<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addCharacterCarried,
    addCharacterDescribedEntry,
    addCharacterPersonalityTrait,
    addCharacterTitle,
    characterAgeCategoryOptions,
    characterGenderOptions,
    isUnknownSpeciesName,
    removeCharacterCarried,
    removeCharacterDescribedEntry,
    removeCharacterPersonalityTrait,
    removeCharacterTitle,
    setCharacterAge,
    setCharacterAgeCategory,
    setCharacterArchetypeName,
    setCharacterCarriedName,
    setCharacterDescribedEntry,
    setCharacterGender,
    setCharacterHeraldry,
    setCharacterMeasurement,
    setCharacterNamePart,
    setCharacterPersonalityTrait,
    setCharacterText,
    setCharacterTitleField,
    validateCharacterSnapshot,
    type CharacterDescribedListField,
    type CharacterMeasurementField,
    type CharacterSnapshot,
    type CharacterTitleField,
  } from '$lib/characters';
  import { armsFromStored, renderDeviceBlazon, toStoredArms } from '$lib/heraldry';
  import { showHeraldryModal } from '$lib/ui';

  /**
   * The editing view for a saved character.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is the character's own shape and the calls that change it.
   *
   * Every control writes a whole replacement snapshot through `onChange`. The framework compares
   * that against what it read to decide whether anything needs saving, so typing a character and
   * deleting it again leaves nothing to save — no bookkeeping here is required to achieve that.
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
   * through `validate` rather than a cast is what keeps a character editor from rendering fields
   * over something that is not a character.
   */
  const accepted = $derived(validateCharacterSnapshot(snapshot));
  const character = $derived<CharacterSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  const MEASUREMENTS: { field: CharacterMeasurementField; label: string }[] = [
    { field: 'height', label: 'Height (cm)' },
    { field: 'weight', label: 'Weight (kg)' },
    { field: 'length', label: 'Length (cm)' },
  ];

  const TITLE_FIELDS: { field: CharacterTitleField; label: string }[] = [
    { field: 'maleTitle', label: 'Male form' },
    { field: 'femaleTitle', label: 'Female form' },
    { field: 'maleHonorific', label: 'Male honorific' },
    { field: 'femaleHonorific', label: 'Female honorific' },
    { field: 'landName', label: 'Land' },
  ];

  const DESCRIBED_LISTS: { list: CharacterDescribedListField; legend: string; noun: string }[] = [
    { list: 'physicalTraits', legend: 'Physical traits', noun: 'physical trait' },
    { list: 'abilities', legend: 'Abilities', noun: 'ability' },
  ];

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: CharacterSnapshot) => CharacterSnapshot): void {
    if (character === undefined) {
      return;
    }
    onChange(change(character));
  }

  /**
   * Draw this character a new coat of arms, through the same modal the generator uses.
   *
   * Only offered for a character carrying arms of their own. One wearing a referenced coat of arms
   * holds a link rather than a copy, and replacing it from here would be editing someone else's
   * record through a window — the same line `CultureArtifactEditor` draws around a referenced
   * religion.
   */
  async function replaceArms(): Promise<void> {
    const current = character;
    if (current === undefined || current.heraldry === undefined || current.heraldry === null) {
      return;
    }
    const result = await showHeraldryModal({
      arms: armsFromStored(current.heraldry),
      seed: current.id,
      title: current.name,
    });
    if (result.action === 'replaced') {
      edit((snapshot) => setCharacterHeraldry(snapshot, toStoredArms(result.arms)));
    }
  }
</script>

{#if character === undefined}
  <Notice tone="danger">
    These contents are stored as a character but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="character-editor">
    <fieldset>
      <legend>Name</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-first-name">First name</label>
        <input
          id="{uid}-first-name"
          type="text"
          value={character.firstName}
          oninput={(event) =>
            edit((current) =>
              setCharacterNamePart(current, 'firstName', event.currentTarget.value),
            )}
          autocomplete="off"
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-last-name">Last name</label>
        <input
          id="{uid}-last-name"
          type="text"
          value={character.lastName}
          oninput={(event) =>
            edit((current) => setCharacterNamePart(current, 'lastName', event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>What they are</legend>

      <!-- Species is shown and not editable, deliberately. Nothing recomputes the height, weight
           or physical traits a species produced, so a select here would hand back an elf with a
           halfling's build; a re-roll is how a character becomes a different species. -->
      <p class="character-editor__note">
        Species: {character.speciesName}{isUnknownSpeciesName(character.speciesName)
          ? ' — this build no longer has that species, so only what was saved is shown.'
          : ''}
      </p>

      <div class="input-group input-group--inline">
        <label for="{uid}-gender">Gender</label>
        <select
          id="{uid}-gender"
          value={character.gender.name}
          onchange={(event) =>
            edit((current) => setCharacterGender(current, event.currentTarget.value))}
        >
          <!-- The stored value is kept as an option even when it is not one this build offers, so
               opening a character never silently changes what they are. -->
          {#if !characterGenderOptions().some((entry) => entry.name === character.gender.name)}
            <option value={character.gender.name}>{character.gender.name}</option>
          {/if}
          {#each characterGenderOptions() as gender (gender.name)}
            <option value={gender.name}>{gender.name}</option>
          {/each}
        </select>
      </div>

      {#if character.archetype !== undefined}
        <div class="input-group input-group--inline">
          <label for="{uid}-archetype">Archetype</label>
          <input
            id="{uid}-archetype"
            type="text"
            value={character.archetype.name}
            oninput={(event) =>
              edit((current) => setCharacterArchetypeName(current, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>
      {/if}

      <div class="input-group input-group--inline">
        <label for="{uid}-age">Age</label>
        <input
          id="{uid}-age"
          type="number"
          value={character.age}
          oninput={(event) =>
            edit((current) => setCharacterAge(current, event.currentTarget.valueAsNumber))}
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-age-category">Age category</label>
        <select
          id="{uid}-age-category"
          value={character.ageCategory.name}
          onchange={(event) =>
            edit((current) => setCharacterAgeCategory(current, event.currentTarget.value))}
        >
          {#if !characterAgeCategoryOptions().some((entry) => entry.name === character.ageCategory.name)}
            <option value={character.ageCategory.name}>{character.ageCategory.name}</option>
          {/if}
          {#each characterAgeCategoryOptions() as category (category.name)}
            <option value={category.name}>{category.name}</option>
          {/each}
        </select>
      </div>

      {#each MEASUREMENTS as entry (entry.field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{entry.field}">{entry.label}</label>
          <input
            id="{uid}-{entry.field}"
            type="number"
            value={character[entry.field]}
            oninput={(event) =>
              edit((current) =>
                setCharacterMeasurement(current, entry.field, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Description</legend>

      <div class="input-group character-editor__stacked">
        <label for="{uid}-description">Description</label>
        <textarea
          id="{uid}-description"
          rows="4"
          value={character.description}
          oninput={(event) =>
            edit((current) => setCharacterText(current, 'description', event.currentTarget.value))}
        ></textarea>
      </div>

      <div class="input-group character-editor__stacked">
        <label for="{uid}-short-description">Short description</label>
        <textarea
          id="{uid}-short-description"
          rows="2"
          value={character.shortDescription}
          oninput={(event) =>
            edit((current) =>
              setCharacterText(current, 'shortDescription', event.currentTarget.value),
            )}
        ></textarea>
      </div>
    </fieldset>

    <fieldset>
      <legend>Personality</legend>

      <!-- Keyed by position rather than by value: two traits may read the same, and a key that
           changed as the user typed would lose focus on every keystroke. -->
      {#each character.personalityTraits as trait, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-personality-{index}">Trait {index + 1}</label>
          <input
            id="{uid}-personality-{index}"
            type="text"
            value={trait}
            oninput={(event) =>
              edit((current) =>
                setCharacterPersonalityTrait(current, index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <BaseButton
            aria-label="Remove personality trait {index + 1}"
            onclick={() => edit((current) => removeCharacterPersonalityTrait(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit((current) => addCharacterPersonalityTrait(current))}>
        Add a personality trait
      </BaseButton>
    </fieldset>

    {#each DESCRIBED_LISTS as list (list.list)}
      <fieldset>
        <legend>{list.legend}</legend>

        {#each character[list.list] as entry, index (index)}
          <div class="input-group input-group--inline">
            <label for="{uid}-{list.list}-{index}-name">{list.noun} {index + 1} name</label>
            <input
              id="{uid}-{list.list}-{index}-name"
              type="text"
              value={entry.name}
              oninput={(event) =>
                edit((current) =>
                  setCharacterDescribedEntry(
                    current,
                    list.list,
                    index,
                    'name',
                    event.currentTarget.value,
                  ),
                )}
              autocomplete="off"
            />
            <BaseButton
              aria-label="Remove {list.noun} {index + 1}"
              onclick={() =>
                edit((current) => removeCharacterDescribedEntry(current, list.list, index))}
            >
              Remove
            </BaseButton>
          </div>
          <div class="input-group character-editor__stacked">
            <label for="{uid}-{list.list}-{index}-description">
              {list.noun}
              {index + 1} description
            </label>
            <textarea
              id="{uid}-{list.list}-{index}-description"
              rows="2"
              value={entry.description}
              oninput={(event) =>
                edit((current) =>
                  setCharacterDescribedEntry(
                    current,
                    list.list,
                    index,
                    'description',
                    event.currentTarget.value,
                  ),
                )}
            ></textarea>
          </div>
        {/each}

        <BaseButton
          onclick={() => edit((current) => addCharacterDescribedEntry(current, list.list))}
        >
          Add {list.noun === 'ability' ? 'an' : 'a'}
          {list.noun}
        </BaseButton>
      </fieldset>
    {/each}

    <fieldset>
      <legend>Equipment</legend>

      {#each character.carried as item, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-carried-{index}">Item {index + 1}</label>
          <input
            id="{uid}-carried-{index}"
            type="text"
            value={item.name}
            oninput={(event) =>
              edit((current) => setCharacterCarriedName(current, index, event.currentTarget.value))}
            autocomplete="off"
          />
          <BaseButton
            aria-label="Remove item {index + 1}"
            onclick={() => edit((current) => removeCharacterCarried(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit((current) => addCharacterCarried(current))}>
        Add an item
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>Titles</legend>

      {#each character.titles ?? [] as title, index (index)}
        <div class="character-editor__title">
          {#each TITLE_FIELDS as entry (entry.field)}
            <div class="input-group input-group--inline">
              <label for="{uid}-title-{index}-{entry.field}">
                Title {index + 1}
                {entry.label}
              </label>
              <input
                id="{uid}-title-{index}-{entry.field}"
                type="text"
                value={title[entry.field]}
                oninput={(event) =>
                  edit((current) =>
                    setCharacterTitleField(current, index, entry.field, event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>
          {/each}
          <BaseButton
            aria-label="Remove title {index + 1}"
            onclick={() => edit((current) => removeCharacterTitle(current, index))}
          >
            Remove title {index + 1}
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit((current) => addCharacterTitle(current))}>
        Add a title
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>Heraldry</legend>

      {#if character.heraldry === null}
        <p class="character-editor__note">
          This character bears a saved coat of arms of its own, linked above. Editing it there
          changes it everywhere it is used, including here.
        </p>
      {:else if character.heraldry === undefined}
        <p class="character-editor__note">This character bears no arms.</p>
      {:else}
        <p>{renderDeviceBlazon(armsFromStored(character.heraldry).device)}</p>
        <div class="character-editor__arms-controls">
          <BaseButton onclick={replaceArms}>Replace coat of arms</BaseButton>
          <BaseButton onclick={() => edit((current) => setCharacterHeraldry(current, undefined))}>
            Remove coat of arms
          </BaseButton>
        </div>
      {/if}
    </fieldset>
  </div>
{/if}

<style>
  .character-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .character-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the culture editor: a fieldset inside an editor panel was
       a box inside a box, and the legend and the spacing already group these fields. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .character-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .character-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  /* Prose wants the width; a label beside a textarea on a 320px screen leaves neither enough room. */
  .character-editor .character-editor__stacked {
    flex-direction: column;
    align-items: stretch;
  }

  .character-editor input[type='text'],
  .character-editor input[type='number'],
  .character-editor textarea {
    min-width: 0;
    flex: 1 1 6rem;
    width: 100%;
  }

  .character-editor__title {
    display: flex;
    flex-direction: column;
    gap: var(--s2);
    width: 100%;
    min-width: 0;
  }

  .character-editor__arms-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .character-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
