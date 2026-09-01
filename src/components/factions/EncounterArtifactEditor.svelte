<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    describeEncounterMob,
    removeEncounterGroup,
    removeEncounterMob,
    setEncounterGroupName,
    setEncounterMobName,
    setEncounterName,
    validateEncounterSnapshot,
    type EncounterSnapshot,
  } from '$lib/encounters';

  /**
   * The editing view for a saved encounter.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is the encounter's name, one section per group, one row per combatant, and the
   * calls that change them.
   *
   * A group is a repeating structure — a name, a count, its combatants — so this is a list editor
   * rather than a flat form, as docs/readiness-factions.md says. A combatant's species and role are
   * shown beside its name and not edited: they are names other tables are resolved from, and a
   * text box over them would let a user type a species this build cannot describe. That is what a
   * re-roll is for.
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
   * something that is not an encounter.
   */
  const accepted = $derived(validateEncounterSnapshot(snapshot));
  const encounter = $derived<EncounterSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: EncounterSnapshot) => EncounterSnapshot): void {
    if (encounter === undefined) {
      return;
    }
    onChange(change(encounter));
  }
</script>

{#if encounter === undefined}
  <Notice tone="danger">
    These contents are stored as an encounter but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="encounter-editor">
    <!-- Qualified as "Encounter name" rather than "Name": the panel above already has a field
         labelled "Name" that renames the artifact, and two fields with the same accessible name in
         one region is the 6.2 failure. -->
    <div class="input-group input-group--inline">
      <label for="{uid}-name">Encounter name</label>
      <input
        id="{uid}-name"
        type="text"
        value={encounter.name}
        oninput={(event) => edit((current) => setEncounterName(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    {#if encounter.groups.length === 0}
      <!-- An encounter with nothing in it is an ordinary state, not a fault: a user may have
           removed every group on the way to something else. -->
      <p class="encounter-editor__note">No groups in this encounter.</p>
    {/if}

    <!-- Keyed by position rather than by name: two rows may read the same while one is being
         typed, and a key that changed as the user typed would lose focus on every keystroke. -->
    {#each encounter.groups as group, groupIndex (groupIndex)}
      <fieldset>
        <legend>Group {groupIndex + 1}</legend>

        <div class="input-group input-group--inline">
          <label for="{uid}-group-{groupIndex}-name">Group {groupIndex + 1} name</label>
          <input
            id="{uid}-group-{groupIndex}-name"
            type="text"
            value={group.name ?? ''}
            oninput={(event) =>
              edit((current) =>
                setEncounterGroupName(current, groupIndex, event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>

        {#if group.mobs.length === 0}
          <p class="encounter-editor__note">No one left in this group.</p>
        {/if}

        {#each group.mobs as mob, mobIndex (mobIndex)}
          {@const line = describeEncounterMob(mob)}
          <div class="encounter-editor__mob">
            <div class="input-group input-group--inline">
              <!-- Qualified by group as well as position: a panel holds every group, and "Combatant 1
                   name" once per group is the same 6.2 failure as two fields called "Name". -->
              <label for="{uid}-group-{groupIndex}-mob-{mobIndex}-name">
                Group {groupIndex + 1} combatant {mobIndex + 1} name
              </label>
              <input
                id="{uid}-group-{groupIndex}-mob-{mobIndex}-name"
                type="text"
                value={mob.name}
                oninput={(event) =>
                  edit((current) =>
                    setEncounterMobName(current, groupIndex, mobIndex, event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>
            {#if line.kind !== ''}
              <span class="encounter-editor__kind">{line.kind}</span>
            {/if}
            <BaseButton
              aria-label="Remove combatant {mobIndex + 1} from group {groupIndex + 1}"
              onclick={() => edit((current) => removeEncounterMob(current, groupIndex, mobIndex))}
            >
              Remove
            </BaseButton>
          </div>
        {/each}

        <BaseButton
          aria-label="Remove group {groupIndex + 1}"
          onclick={() => edit((current) => removeEncounterGroup(current, groupIndex))}
        >
          Remove group {groupIndex + 1}
        </BaseButton>
      </fieldset>
    {/each}
  </div>
{/if}

<style>
  .encounter-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .encounter-editor fieldset {
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

  .encounter-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .encounter-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .encounter-editor input[type='text'] {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .encounter-editor__mob {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--s3);
    width: 100%;
    min-width: 0;
  }

  .encounter-editor__kind {
    font-size: var(--t-small-size);
    color: color-mix(in srgb, currentColor 70%, transparent);
  }

  .encounter-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
