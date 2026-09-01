<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addDccCharacterEquipment,
    addDccCharacterListEntry,
    addDccCharacterWeapon,
    dccDerivedFromAttributes,
    DCC_ATTRIBUTE_FIELDS,
    DCC_NUMBER_FIELDS,
    isUnknownDccOccupationName,
    removeDccCharacterEquipment,
    removeDccCharacterListEntry,
    removeDccCharacterWeapon,
    setDccCharacterAttribute,
    setDccCharacterCurrency,
    setDccCharacterEquipmentName,
    setDccCharacterListEntry,
    setDccCharacterLuckyRollModifier,
    setDccCharacterLuckyRollText,
    setDccCharacterNumber,
    setDccCharacterOccupationName,
    setDccCharacterText,
    setDccCharacterWeaponField,
    validateDccCharacterSnapshot,
    type DccCharacterListField,
    type DccCharacterNumberField,
    type DccCharacterSnapshot,
    type DccCharacterTextField,
    type DccWeaponField,
  } from '$lib/dcc';

  /**
   * The editing view for a saved DCC zero-level character.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is the character's own shape and the calls that change it.
   *
   * Every control writes a whole replacement snapshot through `onChange`. The framework compares
   * that against what it read to decide whether anything needs saving, so typing a character and
   * deleting it again leaves nothing to save.
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
   * through `validate` rather than a cast is what keeps a DCC editor from rendering fields over
   * something that is not a DCC character.
   */
  const accepted = $derived(validateDccCharacterSnapshot(snapshot));
  const character = $derived<DccCharacterSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  const TEXT_FIELDS: { field: DccCharacterTextField; label: string }[] = [
    { field: 'firstName', label: 'First name' },
    { field: 'lastName', label: 'Last name' },
    { field: 'gender', label: 'Gender' },
    { field: 'alignment', label: 'Alignment' },
  ];

  /** The numbers, in the order the sheet reads, with the labels the sheet prints. */
  const NUMBER_LABELS: Record<DccCharacterNumberField, string> = {
    level: 'Level',
    xp: 'XP',
    hp: 'HP',
    speed: 'Speed (ft.)',
    age: 'Age',
    armorClass: 'Armor class',
    attackModifier: 'Attack modifier',
    baseSave: 'Base save',
    fortitudeSave: 'Fortitude save',
    reflexSave: 'Reflex save',
    willpowerSave: 'Willpower save',
    spellsKnown: 'Spells known',
    wizardMaxSpellLevel: 'Wizard max spell level',
    clericMaxSpellLevel: 'Cleric max spell level',
    numberOfLanguages: 'Number of languages',
  };

  const LISTS: { list: DccCharacterListField; legend: string; noun: string }[] = [
    { list: 'specialRules', legend: 'Special rules', noun: 'special rule' },
    { list: 'languages', legend: 'Languages', noun: 'language' },
  ];

  const WEAPON_FIELDS: { field: DccWeaponField; label: string }[] = [
    { field: 'name', label: 'name' },
    { field: 'damage', label: 'damage' },
    { field: 'range', label: 'range' },
  ];

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: DccCharacterSnapshot) => DccCharacterSnapshot): void {
    if (character === undefined) {
      return;
    }
    onChange(change(character));
  }
</script>

{#if character === undefined}
  <Notice tone="danger">
    These contents are stored as a DCC character but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="dcc-editor">
    <fieldset>
      <legend>Who they are</legend>

      {#each TEXT_FIELDS as entry (entry.field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{entry.field}">{entry.label}</label>
          <input
            id="{uid}-{entry.field}"
            type="text"
            value={character[entry.field]}
            oninput={(event) =>
              edit((current) =>
                setDccCharacterText(current, entry.field, event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>
      {/each}

      <div class="input-group input-group--inline">
        <label for="{uid}-occupation">Occupation</label>
        <input
          id="{uid}-occupation"
          type="text"
          value={character.occupation.name}
          oninput={(event) =>
            edit((current) => setDccCharacterOccupationName(current, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      <!-- Said rather than hidden. A great many perfectly good characters carry a name no table
           ever had — the human farmer's own handler rewrites it to the crop they rolled — so this
           is information, not a fault. -->
      {#if isUnknownDccOccupationName(character.occupation.name)}
        <p class="dcc-editor__note">
          No occupation table in this build has that name, so the trained weapon and trade goods it
          would have supplied come from the payload alone. That is the ordinary state for a farmer.
        </p>
      {/if}
    </fieldset>

    <fieldset>
      <legend>Attributes</legend>

      {#each DCC_ATTRIBUTE_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{field}-value">{field} score</label>
          <input
            id="{uid}-{field}-value"
            type="number"
            value={character[field].value}
            oninput={(event) =>
              edit((current) =>
                setDccCharacterAttribute(
                  current,
                  field,
                  'value',
                  event.currentTarget.valueAsNumber,
                ),
              )}
          />
          <label for="{uid}-{field}-modifier">{field} modifier</label>
          <input
            id="{uid}-{field}-modifier"
            type="number"
            value={character[field].modifier}
            oninput={(event) =>
              edit((current) =>
                setDccCharacterAttribute(
                  current,
                  field,
                  'modifier',
                  event.currentTarget.valueAsNumber,
                ),
              )}
          />
        </div>
      {/each}

      <!-- Offered rather than done automatically: a judge who adjusted a save has made a decision,
           and a form that silently corrected the four numbers derived from an attribute would
           overrule them four times. -->
      <BaseButton onclick={() => edit(dccDerivedFromAttributes)}>
        Recalculate modifiers and saves from the scores
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>The numbers</legend>

      {#each DCC_NUMBER_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-number-{field}">{NUMBER_LABELS[field]}</label>
          <input
            id="{uid}-number-{field}"
            type="number"
            value={character[field]}
            oninput={(event) =>
              edit((current) =>
                setDccCharacterNumber(current, field, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Lucky sign</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-lucky-name">Sign</label>
        <input
          id="{uid}-lucky-name"
          type="text"
          value={character.luckyRoll.name}
          oninput={(event) =>
            edit((current) =>
              setDccCharacterLuckyRollText(current, 'name', event.currentTarget.value),
            )}
          autocomplete="off"
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-lucky-description">Applies to</label>
        <input
          id="{uid}-lucky-description"
          type="text"
          value={character.luckyRoll.description}
          oninput={(event) =>
            edit((current) =>
              setDccCharacterLuckyRollText(current, 'description', event.currentTarget.value),
            )}
          autocomplete="off"
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-lucky-modifier">Lucky modifier</label>
        <input
          id="{uid}-lucky-modifier"
          type="number"
          value={character.luckyRoll.modifier}
          oninput={(event) =>
            edit((current) =>
              setDccCharacterLuckyRollModifier(current, event.currentTarget.valueAsNumber),
            )}
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Money</legend>

      {#each Object.keys(character.currency) as coin (coin)}
        <div class="input-group input-group--inline">
          <label for="{uid}-currency-{coin}">{coin}</label>
          <input
            id="{uid}-currency-{coin}"
            type="number"
            value={character.currency[coin]}
            oninput={(event) =>
              edit((current) =>
                setDccCharacterCurrency(current, coin, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Weapons</legend>

      <!-- Keyed by position rather than by value: two entries may read the same, and a key that
           changed as the user typed would lose focus on every keystroke. -->
      {#each character.weapons as weapon, index (index)}
        <div class="dcc-editor__row">
          {#each WEAPON_FIELDS as entry (entry.field)}
            <div class="input-group input-group--inline">
              <label for="{uid}-weapon-{index}-{entry.field}">
                Weapon {index + 1}
                {entry.label}
              </label>
              <input
                id="{uid}-weapon-{index}-{entry.field}"
                type="text"
                value={weapon[entry.field]}
                oninput={(event) =>
                  edit((current) =>
                    setDccCharacterWeaponField(
                      current,
                      index,
                      entry.field,
                      event.currentTarget.value,
                    ),
                  )}
                autocomplete="off"
              />
            </div>
          {/each}
          <BaseButton
            aria-label="Remove weapon {index + 1}"
            onclick={() => edit((current) => removeDccCharacterWeapon(current, index))}
          >
            Remove weapon {index + 1}
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit(addDccCharacterWeapon)}>Add a weapon</BaseButton>
    </fieldset>

    <fieldset>
      <legend>Equipment</legend>

      {#each character.equipment as item, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-equipment-{index}">Item {index + 1}</label>
          <input
            id="{uid}-equipment-{index}"
            type="text"
            value={item.name}
            oninput={(event) =>
              edit((current) =>
                setDccCharacterEquipmentName(current, index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <BaseButton
            aria-label="Remove item {index + 1}"
            onclick={() => edit((current) => removeDccCharacterEquipment(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit(addDccCharacterEquipment)}>Add an item</BaseButton>
    </fieldset>

    {#each LISTS as entry (entry.list)}
      <fieldset>
        <legend>{entry.legend}</legend>

        {#each character[entry.list] as value, index (index)}
          <div class="input-group input-group--inline">
            <label for="{uid}-{entry.list}-{index}">{entry.noun} {index + 1}</label>
            <input
              id="{uid}-{entry.list}-{index}"
              type="text"
              {value}
              oninput={(event) =>
                edit((current) =>
                  setDccCharacterListEntry(current, entry.list, index, event.currentTarget.value),
                )}
              autocomplete="off"
            />
            <BaseButton
              aria-label="Remove {entry.noun} {index + 1}"
              onclick={() =>
                edit((current) => removeDccCharacterListEntry(current, entry.list, index))}
            >
              Remove
            </BaseButton>
          </div>
        {/each}

        <BaseButton
          onclick={() => edit((current) => addDccCharacterListEntry(current, entry.list))}
        >
          Add {entry.noun === 'ability' ? 'an' : 'a'}
          {entry.noun}
        </BaseButton>
      </fieldset>
    {/each}
  </div>
{/if}

<style>
  .dcc-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .dcc-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the culture and character editors: a fieldset inside an
       editor panel was a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .dcc-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .dcc-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .dcc-editor input[type='text'],
  .dcc-editor input[type='number'] {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .dcc-editor__row {
    display: flex;
    flex-direction: column;
    gap: var(--s2);
    width: 100%;
    min-width: 0;
  }

  .dcc-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
