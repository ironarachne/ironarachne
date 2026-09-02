<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import { describeEncounterMob } from '$lib/encounters';
  import {
    BLUEPRINTS,
    removeRoomEncounter,
    removeRoomMob,
    removeRoomTreasureItem,
    setDoorDescription,
    setDungeonBlueprint,
    setDungeonName,
    setKeyDescription,
    setRoomDescription,
    setRoomEncounterDescription,
    setRoomEncounterName,
    setRoomMobName,
    setRoomName,
    setRoomPurpose,
    setRoomTreasureItemName,
    validateDungeonSnapshot,
    type DungeonSnapshot,
  } from '$lib/dungeon';

  /**
   * The editing view for a saved dungeon.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it,
   * so what is here is the dungeon's name, its blueprint, one section per room, and the doors and
   * keys.
   *
   * A dungeon is a structure rather than a flat record, which is why this is a bespoke editor and
   * not the declared field editor of decision 5 in docs/tool-readiness.md: rooms repeat, each one
   * carries an encounter that itself carries groups of combatants, and no descriptor language
   * short of a framework describes that.
   *
   * **The geometry is not here, and that is deliberate.** Where a room sits, what shape it is, and
   * where the doors and keys physically lie are what make the map drawable and the keys reachable
   * — the library guarantees a key is placed in a zone reachable before the door it opens — so
   * they are shown and not edited. Everything a referee reads aloud is editable.
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
   * something that is not a dungeon.
   */
  const accepted = $derived(validateDungeonSnapshot(snapshot));
  const dungeon = $derived<DungeonSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  const blueprintNames = BLUEPRINTS.map((blueprint) => blueprint.name);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: DungeonSnapshot) => DungeonSnapshot): void {
    if (dungeon === undefined) {
      return;
    }
    onChange(change(dungeon));
  }
</script>

{#if dungeon === undefined}
  <Notice tone="danger">
    These contents are stored as a dungeon but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="dungeon-editor">
    <!-- Qualified as "Dungeon name" rather than "Name": the panel above already has a field
         labelled "Name" that renames the artifact, and two fields with the same accessible name in
         one region is the 6.2 failure. -->
    <div class="input-group input-group--inline">
      <label for="{uid}-name">Dungeon name</label>
      <input
        id="{uid}-name"
        type="text"
        value={dungeon.name}
        oninput={(event) => edit((current) => setDungeonName(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group input-group--inline">
      <label for="{uid}-blueprint">Blueprint</label>
      <select
        id="{uid}-blueprint"
        value={dungeon.theme.blueprint.name}
        onchange={(event) =>
          edit((current) => setDungeonBlueprint(current, event.currentTarget.value))}
      >
        {#each blueprintNames as name (name)}
          <option value={name}>{name}</option>
        {/each}
      </select>
    </div>
    <p class="dungeon-editor__note">
      Changing the blueprint relabels this dungeon and leaves every room as it was. Re-roll to get
      rooms that match a new blueprint — which discards these edits.
    </p>

    {#if dungeon.rooms.length === 0}
      <!-- A dungeon with nothing in it is an ordinary state, not a fault: the generator can pack
           no rooms at a low density, and a user may have emptied the ones there were. -->
      <p class="dungeon-editor__note">No rooms in this dungeon.</p>
    {/if}

    <!-- Keyed by position rather than by name or id: two rooms may read the same while one is
         being typed, and a key that changed as the user typed would lose focus on every
         keystroke. -->
    {#each dungeon.rooms as room, roomIndex (roomIndex)}
      <fieldset>
        <legend>Room {room.id}</legend>

        <div class="input-group input-group--inline">
          <label for="{uid}-room-{roomIndex}-name">Room {room.id} name</label>
          <input
            id="{uid}-room-{roomIndex}-name"
            type="text"
            value={room.name}
            oninput={(event) =>
              edit((current) => setRoomName(current, roomIndex, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-room-{roomIndex}-purpose">Room {room.id} purpose</label>
          <input
            id="{uid}-room-{roomIndex}-purpose"
            type="text"
            value={room.purpose}
            oninput={(event) =>
              edit((current) => setRoomPurpose(current, roomIndex, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>

        <div class="input-group">
          <label for="{uid}-room-{roomIndex}-description">Room {room.id} description</label>
          <textarea
            id="{uid}-room-{roomIndex}-description"
            rows="3"
            value={room.description}
            oninput={(event) =>
              edit((current) => setRoomDescription(current, roomIndex, event.currentTarget.value))}
          ></textarea>
        </div>

        <!-- Shown and not edited: the shape and the size are what the plan is drawn from. -->
        <p class="dungeon-editor__note">
          {room.primitive.style}, {room.primitive.width}×{room.primitive.height}, at
          {room.x},{room.y}
        </p>

        {#if room.encounter}
          <div class="input-group input-group--inline">
            <label for="{uid}-room-{roomIndex}-encounter-name">Room {room.id} encounter name</label>
            <input
              id="{uid}-room-{roomIndex}-encounter-name"
              type="text"
              value={room.encounter.name}
              oninput={(event) =>
                edit((current) =>
                  setRoomEncounterName(current, roomIndex, event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>

          <div class="input-group">
            <label for="{uid}-room-{roomIndex}-encounter-description">
              Room {room.id} encounter description
            </label>
            <textarea
              id="{uid}-room-{roomIndex}-encounter-description"
              rows="2"
              value={room.encounter.description}
              oninput={(event) =>
                edit((current) =>
                  setRoomEncounterDescription(current, roomIndex, event.currentTarget.value),
                )}
            ></textarea>
          </div>

          {#each room.encounter.groups as group, groupIndex (groupIndex)}
            {#each group.mobs as mob, mobIndex (mobIndex)}
              {@const line = describeEncounterMob(mob)}
              <div class="dungeon-editor__mob">
                <div class="input-group input-group--inline">
                  <!-- Qualified by room and group as well as position: a panel holds every room,
                       and "Combatant 1 name" once per room is the same 6.2 failure as two fields
                       called "Name". -->
                  <label for="{uid}-room-{roomIndex}-g{groupIndex}-mob-{mobIndex}">
                    Room {room.id} group {groupIndex + 1} combatant {mobIndex + 1} name
                  </label>
                  <input
                    id="{uid}-room-{roomIndex}-g{groupIndex}-mob-{mobIndex}"
                    type="text"
                    value={mob.name}
                    oninput={(event) =>
                      edit((current) =>
                        setRoomMobName(
                          current,
                          roomIndex,
                          groupIndex,
                          mobIndex,
                          event.currentTarget.value,
                        ),
                      )}
                    autocomplete="off"
                  />
                </div>
                {#if line.kind !== ''}
                  <span class="dungeon-editor__kind">{line.kind}</span>
                {/if}
                <BaseButton
                  aria-label="Remove combatant {mobIndex + 1} from group {groupIndex +
                    1} in room {room.id}"
                  onclick={() =>
                    edit((current) => removeRoomMob(current, roomIndex, groupIndex, mobIndex))}
                >
                  Remove
                </BaseButton>
              </div>
            {/each}
          {/each}

          <BaseButton
            aria-label="Empty room {room.id} of its encounter"
            onclick={() => edit((current) => removeRoomEncounter(current, roomIndex))}
          >
            Remove encounter from room {room.id}
          </BaseButton>
        {/if}

        {#if room.treasure && room.treasure.length > 0}
          {#each room.treasure as item, itemIndex (itemIndex)}
            <div class="dungeon-editor__mob">
              <div class="input-group input-group--inline">
                <label for="{uid}-room-{roomIndex}-item-{itemIndex}">
                  Room {room.id} treasure {itemIndex + 1} name
                </label>
                <input
                  id="{uid}-room-{roomIndex}-item-{itemIndex}"
                  type="text"
                  value={item.name}
                  oninput={(event) =>
                    edit((current) =>
                      setRoomTreasureItemName(
                        current,
                        roomIndex,
                        itemIndex,
                        event.currentTarget.value,
                      ),
                    )}
                  autocomplete="off"
                />
              </div>
              <BaseButton
                aria-label="Remove treasure {itemIndex + 1} from room {room.id}"
                onclick={() =>
                  edit((current) => removeRoomTreasureItem(current, roomIndex, itemIndex))}
              >
                Remove
              </BaseButton>
            </div>
          {/each}
        {/if}
      </fieldset>
    {/each}

    {#if dungeon.doors.length > 0}
      <fieldset>
        <legend>Doors</legend>
        {#each dungeon.doors as door, doorIndex (doorIndex)}
          <div class="input-group input-group--inline">
            <label for="{uid}-door-{doorIndex}">Door {doorIndex + 1} description</label>
            <input
              id="{uid}-door-{doorIndex}"
              type="text"
              value={door.description}
              oninput={(event) =>
                edit((current) =>
                  setDoorDescription(current, doorIndex, event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>
        {/each}
      </fieldset>
    {/if}

    {#if dungeon.keys.length > 0}
      <fieldset>
        <legend>Keys</legend>
        {#each dungeon.keys as key, keyIndex (keyIndex)}
          <div class="input-group input-group--inline">
            <label for="{uid}-key-{keyIndex}">Key {keyIndex + 1} description</label>
            <input
              id="{uid}-key-{keyIndex}"
              type="text"
              value={key.description}
              oninput={(event) =>
                edit((current) => setKeyDescription(current, keyIndex, event.currentTarget.value))}
              autocomplete="off"
            />
          </div>
        {/each}
      </fieldset>
    {/if}
  </div>
{/if}

<style>
  .dungeon-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .dungeon-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the encounter and character editors: a fieldset inside an
       editor panel was a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .dungeon-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .dungeon-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .dungeon-editor input[type='text'],
  .dungeon-editor textarea,
  .dungeon-editor select {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .dungeon-editor__mob {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--s3);
    width: 100%;
    min-width: 0;
  }

  .dungeon-editor__kind {
    font-size: var(--t-small-size);
    color: color-mix(in srgb, currentColor 70%, transparent);
  }

  .dungeon-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
