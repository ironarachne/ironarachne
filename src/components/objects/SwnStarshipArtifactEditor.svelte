<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import Notice from '$components/common/Notice.svelte';
  import {
    addSwnAllocationRow,
    removeSwnAllocationRow,
    setSwnAllocationNumber,
    setSwnAllocationText,
    setSwnHullNumber,
    setSwnHullText,
    setSwnStarshipDriveField,
    setSwnStarshipDriveNumber,
    setSwnStarshipNumber,
    setSwnStarshipText,
    setSwnWeaponDamage,
    setSwnWeaponQualities,
    swnStarshipBudgetFromAllocation,
    swnStarshipWithRecomputedBudget,
    SWN_ALLOCATION_LISTS,
    SWN_HULL_NUMBER_FIELDS,
    SWN_HULL_TEXT_FIELDS,
    SWN_STARSHIP_NUMBER_FIELDS,
    SWN_STARSHIP_TEXT_FIELDS,
    type SwnAllocationList,
    type SwnHullNumberField,
    type SwnHullTextField,
    type SwnStarshipNumberField,
    type SwnStarshipTextField,
  } from '$lib/swn/swn_starship_editing';
  import { validateSwnStarshipSnapshot } from '$lib/swn/swn_starship_artifact_kind';
  import type { SwnStarshipSnapshot } from '$lib/swn/swn_starship_snapshot';

  /**
   * The editing view for a saved Stars Without Number starship.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * **The allocation is the point.** A ship's used mass, power and hardpoints are the three numbers
   * a referee reads a refit against, and they are derived from what is bolted to the hull. Both are
   * here, because the payload stores both: the totals so a referee may state them, and the fittings
   * so this editor can offer back the decisions that produced them. What it will not do is move a
   * total on its own — the recompute is a button, which is the difference between arithmetic on
   * demand and a form that overrules a user on every keystroke.
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
   * something that is not a starship.
   */
  const accepted = $derived(validateSwnStarshipSnapshot(snapshot));
  const ship = $derived<SwnStarshipSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** What the allocation adds up to, shown beside what the ship says, so the button is honest. */
  const settled = $derived(ship === undefined ? undefined : swnStarshipBudgetFromAllocation(ship));

  const agrees = $derived(
    ship === undefined ||
      settled === undefined ||
      (ship.usedMass === settled.usedMass &&
        ship.usedPower === settled.usedPower &&
        ship.usedHardPoints === settled.usedHardPoints),
  );

  const TEXT_LABELS: Record<SwnStarshipTextField, string> = {
    name: 'Ship name',
    className: 'Model',
    manufacturer: 'Manufacturer',
    ownerTypeName: 'Owner type',
  };

  const NUMBER_LABELS: Record<SwnStarshipNumberField, string> = {
    currentCrew: 'Current crew',
    totalCost: 'Total ship value (credits)',
    tonsOfCargo: 'Cargo space (tons)',
    usedMass: 'Mass used',
    usedPower: 'Power used',
    usedHardPoints: 'Hardpoints used',
  };

  const HULL_TEXT_LABELS: Record<SwnHullTextField, string> = {
    name: 'Hull type',
    hullClassName: 'Hull class',
    crewSkill: 'Crew skill',
  };

  const HULL_NUMBER_LABELS: Record<SwnHullNumberField, string> = {
    mass: 'Maximum mass',
    power: 'Maximum power',
    hardPoints: 'Hardpoints',
    speed: 'Speed',
    armor: 'Armor',
    ac: 'AC',
    hp: 'HP',
    cost: 'Hull cost (credits)',
    crewMinimum: 'Minimum crew',
    crewMaximum: 'Maximum crew',
  };

  const LIST_LABELS: Record<SwnAllocationList, { legend: string; noun: string }> = {
    fittings: { legend: 'Fittings', noun: 'fitting' },
    weapons: { legend: 'Weapons', noun: 'weapon' },
    defenses: { legend: 'Defenses', noun: 'defense' },
  };

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: SwnStarshipSnapshot) => SwnStarshipSnapshot): void {
    if (ship === undefined) {
      return;
    }
    onChange(change(ship));
  }
</script>

{#if ship === undefined}
  <Notice tone="danger">
    These contents are stored as a Stars Without Number starship but do not read as one, so there is
    nothing safe to edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="starship-editor">
    <fieldset>
      <legend>What it is</legend>

      {#each SWN_STARSHIP_TEXT_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{field}">{TEXT_LABELS[field]}</label>
          <input
            id="{uid}-{field}"
            type="text"
            value={ship[field]}
            oninput={(event) =>
              edit((current) => setSwnStarshipText(current, field, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>The hull</legend>

      {#each SWN_HULL_TEXT_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-hull-{field}">{HULL_TEXT_LABELS[field]}</label>
          <input
            id="{uid}-hull-{field}"
            type="text"
            value={ship.hullType[field]}
            oninput={(event) =>
              edit((current) => setSwnHullText(current, field, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>
      {/each}

      {#each SWN_HULL_NUMBER_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-hull-{field}">{HULL_NUMBER_LABELS[field]}</label>
          <input
            id="{uid}-hull-{field}"
            type="number"
            value={ship.hullType[field]}
            oninput={(event) =>
              edit((current) =>
                setSwnHullNumber(current, field, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>The drive</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-drive-name">Drive</label>
        <input
          id="{uid}-drive-name"
          type="text"
          value={ship.drive.name}
          oninput={(event) =>
            edit((current) => setSwnStarshipDriveField(current, 'name', event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-drive-effect">Drive effect</label>
        <input
          id="{uid}-drive-effect"
          type="text"
          value={ship.drive.effect}
          oninput={(event) =>
            edit((current) =>
              setSwnStarshipDriveField(current, 'effect', event.currentTarget.value),
            )}
          autocomplete="off"
        />
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-drive-mass">Drive mass</label>
        <input
          id="{uid}-drive-mass"
          type="number"
          value={ship.drive.mass}
          oninput={(event) =>
            edit((current) =>
              setSwnStarshipDriveNumber(current, 'mass', event.currentTarget.valueAsNumber),
            )}
        />
        <label for="{uid}-drive-power">Drive power</label>
        <input
          id="{uid}-drive-power"
          type="number"
          value={ship.drive.power}
          oninput={(event) =>
            edit((current) =>
              setSwnStarshipDriveNumber(current, 'power', event.currentTarget.valueAsNumber),
            )}
        />
      </div>
    </fieldset>

    {#each SWN_ALLOCATION_LISTS as list (list)}
      <fieldset>
        <legend>{LIST_LABELS[list].legend}</legend>

        <!-- 6.4 in the editor too: a ship carrying nothing of this sort says so rather than
             showing an empty list under a heading. -->
        {#if ship[list].length === 0}
          <p class="starship-editor__empty">
            Nothing fitted. Add a {LIST_LABELS[list].noun} below to change that.
          </p>
        {/if}

        <!-- Keyed by position rather than by value: two rows may read the same, and a key that
             changed as the user typed would lose focus on every keystroke. -->
        {#each ship[list] as row, index (index)}
          <div class="starship-editor__row inset">
            <div class="input-group input-group--inline">
              <label for="{uid}-{list}-{index}-name">
                {LIST_LABELS[list].noun}
                {index + 1} name
              </label>
              <input
                id="{uid}-{list}-{index}-name"
                type="text"
                value={row.name}
                oninput={(event) =>
                  edit((current) =>
                    setSwnAllocationText(current, list, index, 'name', event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>

            <div class="input-group input-group--inline">
              <label for="{uid}-{list}-{index}-effect">
                {LIST_LABELS[list].noun}
                {index + 1} effect
              </label>
              <input
                id="{uid}-{list}-{index}-effect"
                type="text"
                value={row.effect}
                oninput={(event) =>
                  edit((current) =>
                    setSwnAllocationText(current, list, index, 'effect', event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>

            {#if list === 'weapons'}
              <div class="input-group input-group--inline">
                <label for="{uid}-weapon-{index}-damage">Weapon {index + 1} damage</label>
                <input
                  id="{uid}-weapon-{index}-damage"
                  type="text"
                  value={ship.weapons[index].damage}
                  oninput={(event) =>
                    edit((current) =>
                      setSwnWeaponDamage(current, index, event.currentTarget.value),
                    )}
                  autocomplete="off"
                />
              </div>

              <div class="input-group input-group--inline">
                <!-- Comma-separated, as the sheet prints them. The splitting rule lives in
                     `swn_starship_editing.ts` so it has one home and a test. -->
                <label for="{uid}-weapon-{index}-qualities">Weapon {index + 1} qualities</label>
                <input
                  id="{uid}-weapon-{index}-qualities"
                  type="text"
                  value={ship.weapons[index].qualities.join(', ')}
                  oninput={(event) =>
                    edit((current) =>
                      setSwnWeaponQualities(current, index, event.currentTarget.value),
                    )}
                  autocomplete="off"
                />
              </div>
            {/if}

            <div class="input-group input-group--inline">
              <label for="{uid}-{list}-{index}-mass"
                >{LIST_LABELS[list].noun} {index + 1} mass</label
              >
              <input
                id="{uid}-{list}-{index}-mass"
                type="number"
                value={row.mass}
                oninput={(event) =>
                  edit((current) =>
                    setSwnAllocationNumber(
                      current,
                      list,
                      index,
                      'mass',
                      event.currentTarget.valueAsNumber,
                    ),
                  )}
              />
              <label for="{uid}-{list}-{index}-power">
                {LIST_LABELS[list].noun}
                {index + 1} power
              </label>
              <input
                id="{uid}-{list}-{index}-power"
                type="number"
                value={row.power}
                oninput={(event) =>
                  edit((current) =>
                    setSwnAllocationNumber(
                      current,
                      list,
                      index,
                      'power',
                      event.currentTarget.valueAsNumber,
                    ),
                  )}
              />
            </div>

            <BaseButton
              aria-label="Remove {LIST_LABELS[list].noun} {index + 1}"
              onclick={() => edit((current) => removeSwnAllocationRow(current, list, index))}
            >
              Remove
            </BaseButton>
          </div>
        {/each}

        <BaseButton onclick={() => edit((current) => addSwnAllocationRow(current, list))}>
          Add a {LIST_LABELS[list].noun}
        </BaseButton>
      </fieldset>
    {/each}

    <fieldset>
      <legend>The budget</legend>

      {#each SWN_STARSHIP_NUMBER_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-number-{field}">{NUMBER_LABELS[field]}</label>
          <input
            id="{uid}-number-{field}"
            type="number"
            value={ship[field]}
            oninput={(event) =>
              edit((current) =>
                setSwnStarshipNumber(current, field, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}

      {#if settled !== undefined}
        <p class="starship-editor__settled" role="status">
          {#if agrees}
            The budget agrees with what is fitted.
          {:else}
            What is fitted comes to {settled.usedMass} mass, {settled.usedPower} power and
            {settled.usedHardPoints} hardpoints.
          {/if}
        </p>
      {/if}

      <!-- Offered rather than done automatically: the totals are a referee's to state, and the
           hull-class multipliers mean a hand-built refit will not always agree with a naive sum.
           A form that silently corrected the three lines would overrule a user repeatedly. -->
      <BaseButton onclick={() => edit(swnStarshipWithRecomputedBudget)}>
        Recalculate the budget from what is fitted
      </BaseButton>
    </fieldset>
  </div>
{/if}

<style>
  .starship-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
    align-items: flex-start;
  }

  .starship-editor fieldset {
    width: 100%;
    min-width: 0;
  }

  .starship-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .starship-editor input {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  /* `inset` rather than a hand-rolled border and radius: the panel language owns those. */
  .starship-editor__row {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    align-items: flex-start;
    min-width: 0;
    padding: var(--s4);
    width: 100%;
  }

  .starship-editor__empty,
  .starship-editor__settled {
    color: var(--ink-faint);
    margin: 0;
  }
</style>
