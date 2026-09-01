<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addSwnCharacterAbility,
    addSwnCharacterArmor,
    addSwnCharacterEquipment,
    addSwnCharacterSkill,
    addSwnCharacterWeapon,
    removeSwnCharacterAbility,
    removeSwnCharacterArmor,
    removeSwnCharacterEquipment,
    removeSwnCharacterFocus,
    removeSwnCharacterSkill,
    removeSwnCharacterWeapon,
    setSwnCharacterAbilityDescription,
    setSwnCharacterArmorClass,
    setSwnCharacterArmorName,
    setSwnCharacterBackgroundName,
    setSwnCharacterClassName,
    setSwnCharacterEquipmentName,
    setSwnCharacterFocusLevel,
    setSwnCharacterFocusName,
    setSwnCharacterNumber,
    setSwnCharacterSkillLevel,
    setSwnCharacterSkillName,
    setSwnCharacterStat,
    setSwnCharacterText,
    setSwnCharacterWeaponField,
    swnDerivedFromStats,
    validateSwnCharacterSnapshot,
    SWN_NUMBER_FIELDS,
    type SwnCharacterNumberField,
    type SwnCharacterSnapshot,
    type SwnCharacterTextField,
    type SwnWeaponField,
    type SwnWeaponList,
  } from '$lib/swn';

  /**
   * The editing view for a saved Stars Without Number character.
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
   * through `validate` rather than a cast is what keeps a SWN editor from rendering fields over
   * something that is not a SWN character.
   */
  const accepted = $derived(validateSwnCharacterSnapshot(snapshot));
  const character = $derived<SwnCharacterSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  const TEXT_FIELDS: { field: SwnCharacterTextField; label: string }[] = [
    { field: 'firstName', label: 'First name' },
    { field: 'lastName', label: 'Last name' },
  ];

  /** The numbers, in the order the sheet reads, with the labels the sheet prints. */
  const NUMBER_LABELS: Record<SwnCharacterNumberField, string> = {
    currentLevel: 'Level',
    hitPoints: 'Hit points',
    effort: 'Effort',
    attackBonus: 'Base attack bonus',
    meleeAttackBonus: 'Melee attack bonus',
    rangedAttackBonus: 'Ranged attack bonus',
    armorClassBase: 'Armor class (base)',
    armorClassUnequipped: 'Armor class (unarmored)',
    armorClassEquipped: 'Armor class (armored)',
    credits: 'Credits',
    savingThrowMental: 'Mental save',
    savingThrowEvasion: 'Evasion save',
    savingThrowPhysical: 'Physical save',
  };

  const WEAPON_LISTS: { list: SwnWeaponList; legend: string; noun: string }[] = [
    { list: 'rangedWeapons', legend: 'Ranged weapons', noun: 'ranged weapon' },
    { list: 'meleeWeapons', legend: 'Melee weapons', noun: 'melee weapon' },
  ];

  const WEAPON_FIELDS: { field: SwnWeaponField; label: string }[] = [
    { field: 'name', label: 'name' },
    { field: 'damage', label: 'damage' },
    { field: 'range', label: 'range' },
  ];

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: SwnCharacterSnapshot) => SwnCharacterSnapshot): void {
    if (character === undefined) {
      return;
    }
    onChange(change(character));
  }
</script>

{#if character === undefined}
  <Notice tone="danger">
    These contents are stored as a Stars Without Number character but do not read as one, so there
    is nothing safe to edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="swn-editor">
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
                setSwnCharacterText(current, entry.field, event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>
      {/each}

      <div class="input-group input-group--inline">
        <label for="{uid}-background">Background</label>
        <input
          id="{uid}-background"
          type="text"
          value={character.background.name}
          oninput={(event) =>
            edit((current) => setSwnCharacterBackgroundName(current, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-class">Class</label>
        <input
          id="{uid}-class"
          type="text"
          value={character.characterClass.name}
          oninput={(event) =>
            edit((current) => setSwnCharacterClassName(current, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Stats</legend>

      {#each character.stats as stat, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-stat-{index}-score">{stat.name} score</label>
          <input
            id="{uid}-stat-{index}-score"
            type="number"
            value={stat.score}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterStat(current, index, 'score', event.currentTarget.valueAsNumber),
              )}
          />
          <label for="{uid}-stat-{index}-modifier">{stat.name} modifier</label>
          <input
            id="{uid}-stat-{index}-modifier"
            type="number"
            value={stat.modifier}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterStat(current, index, 'modifier', event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}

      <!-- Offered rather than done automatically: a referee who adjusted a save has made a
           decision, and a form that silently corrected everything derived from a score would
           overrule them several times over. -->
      <BaseButton onclick={() => edit(swnDerivedFromStats)}>
        Recalculate modifiers and saves from the scores
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>The numbers</legend>

      {#each SWN_NUMBER_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-number-{field}">{NUMBER_LABELS[field]}</label>
          <input
            id="{uid}-number-{field}"
            type="number"
            value={character[field]}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterNumber(current, field, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Skills</legend>

      <!-- Keyed by position rather than by value: two entries may read the same, and a key that
           changed as the user typed would lose focus on every keystroke. -->
      {#each character.skills as skill, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-skill-{index}-name">Skill {index + 1} name</label>
          <input
            id="{uid}-skill-{index}-name"
            type="text"
            value={skill.name}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterSkillName(current, index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <label for="{uid}-skill-{index}-level">Skill {index + 1} level</label>
          <input
            id="{uid}-skill-{index}-level"
            type="number"
            value={skill.level}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterSkillLevel(current, index, event.currentTarget.valueAsNumber),
              )}
          />
          <BaseButton
            aria-label="Remove skill {index + 1}"
            onclick={() => edit((current) => removeSwnCharacterSkill(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit(addSwnCharacterSkill)}>Add a skill</BaseButton>
    </fieldset>

    <fieldset>
      <legend>Foci</legend>

      <!-- The row is the pick. A focus carries its own name and the level the character holds it
           at, so this is where a user corrects what they took; the rulebook text under it is not
           theirs to rewrite and is not offered. -->
      {#each character.focuses as focus, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-focus-{index}-name">Focus {index + 1} name</label>
          <input
            id="{uid}-focus-{index}-name"
            type="text"
            value={focus.name}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterFocusName(current, index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <label for="{uid}-focus-{index}-level">Focus {index + 1} level</label>
          <input
            id="{uid}-focus-{index}-level"
            type="number"
            value={focus.currentLevel}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterFocusLevel(current, index, event.currentTarget.valueAsNumber),
              )}
          />
          <BaseButton
            aria-label="Remove focus {index + 1}"
            onclick={() => edit((current) => removeSwnCharacterFocus(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Abilities</legend>

      {#each character.abilities as ability, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-ability-{index}">Ability {index + 1}</label>
          <textarea
            id="{uid}-ability-{index}"
            rows="3"
            value={ability.description}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterAbilityDescription(current, index, event.currentTarget.value),
              )}
          ></textarea>
          <BaseButton
            aria-label="Remove ability {index + 1}"
            onclick={() => edit((current) => removeSwnCharacterAbility(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit(addSwnCharacterAbility)}>Add an ability</BaseButton>
    </fieldset>

    {#each WEAPON_LISTS as entry (entry.list)}
      <fieldset>
        <legend>{entry.legend}</legend>

        {#each character[entry.list] as weapon, index (index)}
          <div class="swn-editor__row">
            {#each WEAPON_FIELDS as part (part.field)}
              <div class="input-group input-group--inline">
                <label for="{uid}-{entry.list}-{index}-{part.field}">
                  {entry.noun}
                  {index + 1}
                  {part.label}
                </label>
                <input
                  id="{uid}-{entry.list}-{index}-{part.field}"
                  type="text"
                  value={weapon[part.field]}
                  oninput={(event) =>
                    edit((current) =>
                      setSwnCharacterWeaponField(
                        current,
                        entry.list,
                        index,
                        part.field,
                        event.currentTarget.value,
                      ),
                    )}
                  autocomplete="off"
                />
              </div>
            {/each}
            <BaseButton
              aria-label="Remove {entry.noun} {index + 1}"
              onclick={() =>
                edit((current) => removeSwnCharacterWeapon(current, entry.list, index))}
            >
              Remove {entry.noun}
              {index + 1}
            </BaseButton>
          </div>
        {/each}

        <BaseButton onclick={() => edit((current) => addSwnCharacterWeapon(current, entry.list))}>
          Add a {entry.noun}
        </BaseButton>
      </fieldset>
    {/each}

    <fieldset>
      <legend>Armor</legend>

      {#each character.armor as item, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-armor-{index}-name">Armor {index + 1} name</label>
          <input
            id="{uid}-armor-{index}-name"
            type="text"
            value={item.name}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterArmorName(current, index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <label for="{uid}-armor-{index}-ac">Armor {index + 1} AC</label>
          <input
            id="{uid}-armor-{index}-ac"
            type="number"
            value={item.ac}
            oninput={(event) =>
              edit((current) =>
                setSwnCharacterArmorClass(current, index, event.currentTarget.valueAsNumber),
              )}
          />
          <BaseButton
            aria-label="Remove armor {index + 1}"
            onclick={() => edit((current) => removeSwnCharacterArmor(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit(addSwnCharacterArmor)}>Add armor</BaseButton>
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
                setSwnCharacterEquipmentName(current, index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <BaseButton
            aria-label="Remove item {index + 1}"
            onclick={() => edit((current) => removeSwnCharacterEquipment(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit(addSwnCharacterEquipment)}>Add an item</BaseButton>
    </fieldset>
  </div>
{/if}

<style>
  .swn-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .swn-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the culture, character and DCC editors: a fieldset inside
       an editor panel was a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .swn-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .swn-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .swn-editor input[type='text'],
  .swn-editor input[type='number'],
  .swn-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .swn-editor__row {
    display: flex;
    flex-direction: column;
    gap: var(--s2);
    width: 100%;
    min-width: 0;
  }
</style>
