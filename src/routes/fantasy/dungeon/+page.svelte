<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import * as Words from '@ironarachne/words';
  import { onMount, tick } from 'svelte';
  import * as Currency from '$lib/currency/currency';
  import { generateDungeon, type EngineeredDungeon } from '$lib/dungeon';
  import { BLUEPRINTS } from '$lib/dungeon/theme/theme';
  import { renderClassicModuleMapToCanvas } from '$lib/dungeon/render/classic_module_map';
  import {
    generate as generateEnvironment,
    getDefaultConfig as getDefaultEnvironmentConfig,
  } from '$lib/environment/environments';

  const blueprintOptions = BLUEPRINTS.map((b) => b.name);

  let seed = '';
  let lockSeed = false;
  let mapWidth = 40;
  let mapHeight = 60;
  let blueprintName: string = blueprintOptions[0] ?? 'Tomb';
  let encounterChancePerRoom = 0.4;
  let treasureChancePerRoom = 0.3;
  let fullSize = false;

  let mapCanvas: HTMLCanvasElement | undefined;
  let dungeon: EngineeredDungeon | undefined;

  function getKeyDescription(keyId: string, doorId: string, d: EngineeredDungeon): string {
    const door = d.doors.find((doObj) => doObj.id === doorId);
    if (!door) {
      return 'It unlocks a door elsewhere in the dungeon.';
    }
    const connectedRooms = d.rooms.filter(
      (r) =>
        door.x >= r.x - 1 &&
        door.x <= r.x + r.primitive.width &&
        door.y >= r.y - 1 &&
        door.y <= r.y + r.primitive.height,
    );
    if (connectedRooms.length >= 2) {
      return `It unlocks the door between rooms ${connectedRooms[0].id} and ${connectedRooms[1].id}.`;
    }
    if (connectedRooms.length === 1) {
      return `It unlocks the door to room ${connectedRooms[0].id}.`;
    }
    return `It unlocks a door elsewhere in the dungeon.`;
  }

  function sanitizeForFilenamePart(s: string): string {
    return s.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 64) || 'dungeon';
  }

  function downloadMap(format: 'image/png' | 'image/jpeg') {
    if (!mapCanvas || !dungeon) {
      return;
    }
    const ext = format === 'image/png' ? 'png' : 'jpg';
    const base = sanitizeForFilenamePart(`${dungeon.name}-${seed}`);
    const filename = `${base}.${ext}`;
    const url =
      format === 'image/jpeg' ? mapCanvas.toDataURL('image/jpeg', 0.92) : mapCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  async function triggerRender() {
    await tick();
    if (mapCanvas && dungeon) {
      renderClassicModuleMapToCanvas(dungeon, mapCanvas);
    }
  }

  async function generate() {
    const rng = new RNG.RNG(Date.now().toString());
    if (!lockSeed || seed === '') {
      seed = rng.randomString(13);
    }

    const environmentConfig = getDefaultEnvironmentConfig();
    environmentConfig.rng = new RNG.RNG(`${seed}-env`);
    const environment = generateEnvironment(environmentConfig);

    dungeon = generateDungeon({
      seed,
      width: mapWidth,
      height: mapHeight,
      environment,
      blueprintName,
      encounterChancePerRoom,
      treasureChancePerRoom,
    });

    await tick();
    if (mapCanvas) {
      renderClassicModuleMapToCanvas(dungeon, mapCanvas);
    }
  }

  onMount(() => {
    void generate();
  });
</script>

<svelte:head>
  <title>Dungeon Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Dungeon Generator</h1>

  <p>Grid-based dungeons with themed rooms, doors, keys, encounters, and treasure.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <label class="inline-label">
      <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock seed
    </label>
  </div>

  <div class="input-group">
    <label for="mapWidth">Map width</label>
    <input type="number" name="mapWidth" bind:value={mapWidth} id="mapWidth" min="15" max="120" />
  </div>

  <div class="input-group">
    <label for="mapHeight">Map height</label>
    <input type="number" name="mapHeight" bind:value={mapHeight} id="mapHeight" min="15" max="120" />
  </div>

  <div class="input-group">
    <label for="blueprint">Blueprint</label>
    <select name="blueprint" bind:value={blueprintName} id="blueprint">
      {#each blueprintOptions as name (name)}
        <option value={name}>{name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="encounterChance">Encounter chance per room (0–1)</label>
    <input
      type="number"
      name="encounterChance"
      bind:value={encounterChancePerRoom}
      id="encounterChance"
      min="0"
      max="1"
      step="0.05"
    />
  </div>

  <div class="input-group">
    <label for="treasureChance">Treasure chance per room (0–1)</label>
    <input
      type="number"
      name="treasureChance"
      bind:value={treasureChancePerRoom}
      id="treasureChance"
      min="0"
      max="1"
      step="0.05"
    />
  </div>

  <div class="actions">
    <button type="button" onclick={() => void generate()}>Generate</button>
    <button type="button" onclick={() => downloadMap('image/png')} disabled={!mapCanvas || !dungeon}>
      Download PNG
    </button>
    <button type="button" onclick={() => downloadMap('image/jpeg')} disabled={!mapCanvas || !dungeon}>
      Download JPEG
    </button>
  </div>

  <div class="input-group">
    <label class="inline-label">
      <input
        type="checkbox"
        name="fullSize"
        bind:checked={fullSize}
        id="fullSize"
        onchange={triggerRender}
      /> Show full size
    </label>
  </div>

  {#if dungeon}
    <h2>{dungeon.name}</h2>

    <p><strong>Theme:</strong> {dungeon.theme.name}</p>
    <p><strong>Environment:</strong> {dungeon.theme.environment.description}</p>
    <p><strong>Blueprint:</strong> {dungeon.theme.blueprint.description}</p>

    <p class="map-legend">
      Blue-map style: white dungeon cut-out on darker blue “rock”; lighter blue grid lines show between
      floor squares inside rooms and halls. Room numbers and symbols are blue on white. Doors are blue bars (open doors show a gap;
      secret doors have an <strong>S</strong> overlaid); locked doors add a small lock frame. Stairs are tapered blue treads.
    </p>
  {/if}

  <canvas
    bind:this={mapCanvas}
    class="dungeon-map"
    class:full-size={fullSize}
    width={fullSize && dungeon ? dungeon.layout.width * 25 : 800}
    height={fullSize && dungeon ? dungeon.layout.height * 25 : 600}
  ></canvas>

  {#if dungeon}
    {#each dungeon.rooms as room (room.id)}
      <div class="room">
        <h3>{Words.title(room.name)} <span class="room-id">(room {room.id})</span></h3>
        <p class="room-meta">
          <strong>Purpose:</strong>
          {room.purpose} · <strong>Shape:</strong>
          {room.primitive.style} · <strong>Size:</strong>
          {room.primitive.width}×{room.primitive.height}
        </p>
        <div class="room-description">
          {room.description}
        </div>
        {#if room.encounter}
          <div class="encounter">
            <h4>Encounter</h4>
            <p><strong>Difficulty:</strong> {room.encounter.difficulty}</p>
            <p>{room.encounter.description}</p>
            {#each room.encounter.groups as group, gi (`${room.id}-grp-${gi}`)}
              <p>
                {#if group.name}
                  <strong>{group.name}:</strong>
                {/if}
                {#if group.mobs.length > 1}
                  {group.mobs.length} creatures.
                {:else if group.mobs.length === 1}
                  One foe.
                {/if}
              </p>
              <div class="mobs">
                {#each group.mobs as mob (mob.id)}
                  <div class="mob">
                    <h4>{mob.name}</h4>
                    <p>{mob.shortDescription || mob.description}</p>
                    {#if mob.actions.length > 0}
                      <p>Actions:</p>
                      <ul>
                        {#each mob.actions as action, ai (`${mob.id}-act-${ai}`)}
                          <li><strong>{action.name}:</strong> {action.description}</li>
                        {/each}
                      </ul>
                    {/if}
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        {/if}
        {#if room.treasure && room.treasure.length > 0}
          <div class="treasure">
            <h4>Treasure</h4>
            <ul>
              {#each room.treasure as item (item.id)}
                <li>
                  <strong>{item.name}:</strong>
                  {item.description} — {Currency.valueToString(item.value, undefined, true)}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
        {#if dungeon.keys.some(k => k.x >= room.x && k.x < room.x + room.primitive.width && k.y >= room.y && k.y < room.y + room.primitive.height)}
          <div class="keys">
            <h4>Keys</h4>
            <ul>
              {#each dungeon.keys.filter(k => k.x >= room.x && k.x < room.x + room.primitive.width && k.y >= room.y && k.y < room.y + room.primitive.height) as key (key.id)}
                <li>
                  <strong>Key:</strong> {key.description} {getKeyDescription(key.id, key.doorId, dungeon)}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</section>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';

  .inline-label {
    margin-left: 0.75rem;
    font-weight: normal;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  canvas.dungeon-map {
    width: 100%;
    max-width: 960px;
    height: 70vh;
    display: block;
    border: 1px solid #3a6f9a;
    background: #4a8fc4;
  }

  canvas.dungeon-map.full-size {
    width: auto;
    max-width: none;
    height: auto;
  }

  .map-legend {
    font-size: 0.9rem;
    margin: 0.5rem 0 1rem;
  }

  .room-id {
    font-weight: normal;
    font-size: 0.9em;
  }

  .room-meta {
    font-size: 0.95rem;
    margin: 0.25rem 0 0.5rem;
  }

  div.mobs {
    display: block;
    padding: 0;
    margin: 0;
  }

  div.mob {
    border: 1px solid black;
    padding: 0.5rem;
    margin: 0.5rem;
  }

  div.mob > h4 {
    display: block;
    font-size: 1rem;
    margin: 0;
    padding: 0;
    width: 100%;
    border-bottom: 1px solid black;
  }

  div.room-description {
    border: 3px solid black;
    padding: 0.5rem;
    margin: 0.5rem;
  }
</style>
