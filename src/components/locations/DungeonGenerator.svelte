<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Words from '@ironarachne/words';
  import { onMount, tick } from 'svelte';
  import { Currency } from '$lib/currency';
  import ArchetypeBadge from '$components/characters/ArchetypeBadge.svelte';
  import SpeciesBadge from '$components/characters/SpeciesBadge.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import type { ArtifactReference } from '$lib/artifacts';
  import type { Character } from '$lib/characters';
  import type { Creature } from '$lib/creatures';
  import { ENCOUNTER_ARTIFACT_KIND, type Encounter } from '$lib/encounters';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import * as Dungeons from '$lib/dungeon';

  const TOOL_PATH = '/fantasy/dungeon';

  /** The page's select value that means "let the seed choose". */
  const RANDOM = 'Random';

  const blueprintOptions = Dungeons.dungeonBlueprintNames();
  const biomeOptions = Dungeons.dungeonBiomeNames();

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be rebuilt from `Date.now()`
   * on every press to take one string from it, which is the shape every generator in the readiness
   * pass has been corrected to.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let mapWidth = $state(Dungeons.DUNGEON_DEFAULT_WIDTH);
  let mapHeight = $state(Dungeons.DUNGEON_DEFAULT_HEIGHT);
  let blueprintName = $state(RANDOM);
  let biomeName = $state(RANDOM);
  let encounterChancePerRoom = $state(Dungeons.DUNGEON_DEFAULT_ENCOUNTER_CHANCE);
  let treasureChancePerRoom = $state(Dungeons.DUNGEON_DEFAULT_TREASURE_CHANCE);
  let fullSize = $state(false);

  /** The saved encounter to put at the foot of the stairs, when the user has offered one (5.1). */
  let useReferencedEncounter = $state(false);
  let referencedEncounter = $state<Encounter | undefined>(undefined);
  let encounterReference = $state<ArtifactReference | undefined>(undefined);

  let mapCanvas = $state<HTMLCanvasElement | undefined>(undefined);

  /**
   * The rolled dungeon.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`. A dungeon is the largest value on the site to wrap,
   * so this is also the difference between a page that renders and one that crawls.
   */
  let dungeon = $state.raw<Dungeons.EngineeredDungeon | undefined>(undefined);

  /** What the roll records about itself: the page's six controls, as provenance (3.6). */
  const generatorConfig = $derived<Dungeons.DungeonGeneratorConfigRecord>({
    width: mapWidth,
    height: mapHeight,
    ...(blueprintName === RANDOM ? {} : { blueprintName }),
    ...(biomeName === RANDOM ? {} : { biomeName }),
    encounterChancePerRoom,
    treasureChancePerRoom,
  });

  const dungeonSnapshot = $derived(
    dungeon === undefined ? null : Dungeons.toDungeonSnapshot(dungeon),
  );

  /**
   * Roughly what keeping this dungeon costs, shown because it is the one payload on the site that
   * reaches megabytes: a 120×120 map with an encounter in every room is a storage decision, and a
   * user making one is entitled to know before the browser tells them it has no room left.
   */
  const storedSize = $derived(
    dungeonSnapshot === null
      ? ''
      : Dungeons.describeDungeonSize(Dungeons.dungeonSnapshotByteSize(dungeonSnapshot)),
  );

  const references = $derived(encounterReference === undefined ? [] : [encounterReference]);

  const defaultArtifactName = $derived(
    dungeon === undefined ? '' : Dungeons.dungeonDisplayName(dungeon),
  );

  function getKeyDescription(keyId: string, doorId: string, d: Dungeons.EngineeredDungeon): string {
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
    return (
      s
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64) || 'dungeon'
    );
  }

  function downloadMap(format: 'image/png' | 'image/jpeg') {
    if (!mapCanvas || !dungeon) {
      return;
    }
    const ext = format === 'image/png' ? 'png' : 'jpg';
    const base = sanitizeForFilenamePart(`${dungeon.name}-${seed}`);
    const filename = `${base}.${ext}`;
    const url =
      format === 'image/jpeg'
        ? mapCanvas.toDataURL('image/jpeg', 0.92)
        : mapCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  function exportMarkdown() {
    if (dungeonSnapshot === null) {
      return;
    }
    downloadTextFile(
      Dungeons.dungeonToMarkdown(dungeonSnapshot),
      `${Dungeons.dungeonFileStem(dungeonSnapshot)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (dungeonSnapshot === null) {
      return;
    }
    await downloadTextPdf(
      Dungeons.dungeonDisplayName(dungeonSnapshot),
      Dungeons.dungeonToText(dungeonSnapshot),
      `${Dungeons.dungeonFileStem(dungeonSnapshot)}.pdf`,
    );
  }

  /**
   * Draws the plan, when there is a canvas to draw it on.
   *
   * A missing canvas is an ordinary state rather than a failure (2.5): the room list below is the
   * dungeon, and the plan is a picture of it. Nothing here throws, and nothing below depends on it
   * having run.
   */
  async function triggerRender() {
    await tick();
    if (mapCanvas && dungeon) {
      Dungeons.renderClassicModuleMapToCanvas(dungeon, mapCanvas);
    }
  }

  async function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    const rolled = Dungeons.rollDungeon(seed, generatorConfig);
    dungeon =
      useReferencedEncounter && referencedEncounter !== undefined
        ? Dungeons.withEncounterAtEntrance(rolled, referencedEncounter)
        : rolled;
    await triggerRender();
  }

  onMount(() => {
    void generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Dungeon Generator">
  {#snippet description()}
    <p>Grid-based dungeons with themed rooms, doors, keys, encounters, and treasure.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed inline />

  <NumberField
    id="mapWidth"
    label="Map width"
    bind:value={mapWidth}
    min={Dungeons.DUNGEON_MIN_DIMENSION}
    max={Dungeons.DUNGEON_MAX_DIMENSION}
  />
  <NumberField
    id="mapHeight"
    label="Map height"
    bind:value={mapHeight}
    min={Dungeons.DUNGEON_MIN_DIMENSION}
    max={Dungeons.DUNGEON_MAX_DIMENSION}
  />

  <SelectField
    id="blueprint"
    label="Blueprint"
    bind:value={blueprintName}
    options={[
      { value: RANDOM, label: 'Random' },
      ...blueprintOptions.map((n) => ({ value: n, label: n })),
    ]}
  />

  <SelectField
    id="environment"
    label="Environment (Biome)"
    bind:value={biomeName}
    options={[
      { value: RANDOM, label: 'Random' },
      ...biomeOptions.map((n) => ({ value: n, label: n })),
    ]}
  />

  <NumberField
    id="encounterChance"
    label="Encounter chance per room (0–1)"
    bind:value={encounterChancePerRoom}
    min={0}
    max={1}
    step={0.05}
  />
  <NumberField
    id="treasureChance"
    label="Treasure chance per room (0–1)"
    bind:value={treasureChancePerRoom}
    min={0}
    max={1}
    step={0.05}
  />

  <SavedArtifactPicker
    kind={ENCOUNTER_ARTIFACT_KIND}
    role="entrance-encounter"
    checkboxLabel="Put a saved encounter at the foot of the stairs"
    selectLabel="Encounter"
    bind:enabled={useReferencedEncounter}
    bind:value={referencedEncounter}
    bind:reference={encounterReference}
  />

  <div class="actions">
    <BaseButton onclick={() => void generate()}>Generate</BaseButton>
    <BaseButton onclick={exportMarkdown} disabled={!dungeon}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={!dungeon}>Download PDF</BaseButton>
    <BaseButton onclick={() => downloadMap('image/png')} disabled={!mapCanvas || !dungeon}>
      Download PNG
    </BaseButton>
    <BaseButton onclick={() => downloadMap('image/jpeg')} disabled={!mapCanvas || !dungeon}>
      Download JPEG
    </BaseButton>
  </div>

  <SaveArtifactButton
    kind={Dungeons.DUNGEON_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={dungeonSnapshot}
    {seed}
    config={generatorConfig}
    defaultName={defaultArtifactName}
    {references}
  />

  {#if dungeon}
    <p class="stored-size">Saving this dungeon keeps about {storedSize} in this browser.</p>
  {/if}

  <div class="input-group">
    <label class="inline-label">
      <input type="checkbox" bind:checked={fullSize} id="fullSize" onchange={triggerRender} /> Show full
      size
    </label>
  </div>

  {#if dungeon}
    <h2>{dungeon.name}</h2>

    <StatBlock>
      <Stat label="Theme">{dungeon.theme.name}</Stat>
      <Stat label="Environment">{dungeon.theme.environment.description}</Stat>
      <Stat label="Blueprint">{dungeon.theme.blueprint.description}</Stat>
    </StatBlock>

    <p class="map-legend">
      Doors are blue bars (open doors show a gap; secret doors have an <strong>S</strong> overlaid); locked
      doors add a small lock frame. Stairs are tapered blue treads.
    </p>
  {/if}

  <!-- A named canvas with fallback content inside it, because a bare canvas is announced as
       nothing at all (6.2). The name says what the plan shows; the fallback says where the
       dungeon itself is, which is the room list below — what a machine with no canvas still gets
       (2.5), and what the Markdown and PDF exports carry. -->
  <canvas
    bind:this={mapCanvas}
    aria-label={dungeon
      ? `Plan of ${dungeon.name}: ${dungeon.rooms.length} rooms on a ${dungeon.layout.width} by ${dungeon.layout.height} grid.`
      : 'Dungeon plan'}
    class="dungeon-map"
    class:full-size={fullSize}
    width={fullSize && dungeon ? dungeon.layout.width * 25 : 800}
    height={fullSize && dungeon ? dungeon.layout.height * 25 : 600}
  >
    <p>
      This plan is drawn on a canvas. Every room, door, key and encounter it shows is written out
      below, and the Markdown and PDF downloads carry the same.
    </p>
  </canvas>

  {#if dungeon}
    {#each dungeon.rooms as room (room.id)}
      <div class="room">
        <h3>{Words.title(room.name)} <span class="room-id">(room {room.id})</span></h3>
        <!-- Three pairs run together with separators until #153, which is a stat block written as
             a sentence: the middle dots were doing the work the grid does. -->
        <StatBlock class="room-meta">
          <Stat label="Purpose">{room.purpose}</Stat>
          <Stat label="Shape">{room.primitive.style}</Stat>
          <Stat label="Size">{room.primitive.width}×{room.primitive.height}</Stat>
        </StatBlock>
        <div class="room-description">
          {room.description}
        </div>
        {#if room.encounter}
          <div class="encounter">
            <h4>Encounter</h4>
            <StatBlock>
              <Stat label="Difficulty">{room.encounter.difficulty}</Stat>
            </StatBlock>
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
                  {@const asChar = mob as unknown as Character}
                  {@const asCreature = mob as unknown as Creature}
                  {@const mobSpecies = asCreature.species}
                  <div class="mob">
                    <div class="mob-header">
                      <h4>{mob.name}</h4>
                      {#if mobSpecies}
                        <SpeciesBadge speciesName={mobSpecies.name} size="sm" />
                        {#if asChar.archetype}
                          <ArchetypeBadge archetypeName={asChar.archetype.name} size="sm" />
                          <span class="mob-meta">— {mobSpecies.name} {asChar.archetype.name}</span>
                        {:else}
                          <span class="mob-meta">— {mobSpecies.name}</span>
                        {/if}
                      {/if}
                    </div>
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
        {#if dungeon.keys.some((k) => k.x >= room.x && k.x < room.x + room.primitive.width && k.y >= room.y && k.y < room.y + room.primitive.height)}
          <div class="keys">
            <h4>Keys</h4>
            <ul>
              {#each dungeon.keys.filter((k) => k.x >= room.x && k.x < room.x + room.primitive.width && k.y >= room.y && k.y < room.y + room.primitive.height) as key (key.id)}
                <li>
                  <!-- One key per row, and each row is a pair: the label was a bold run inside the
                       sentence until #153. -->
                  <StatBlock>
                    <Stat label="Key">
                      {key.description}
                      {getKeyDescription(key.id, key.doorId, dungeon)}
                    </Stat>
                  </StatBlock>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</GeneratorPage>

<style>
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

  .stored-size {
    font: var(--t-small);
    color: var(--ink-muted);
    margin: var(--s3) 0 0;
  }

  .room-id {
    font-weight: normal;
    font-size: 0.9em;
  }

  /* `:global`, because the class lands on `StatBlock`'s own element. The font size went with the
     conversion: a stat's key and value take their steps from the ramp, so a paragraph-wide 0.95rem
     over the top of them was overriding one ramp with another. */
  .room :global(.room-meta) {
    margin: var(--s2) 0 var(--s4);
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

  div.mob-header {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
    width: 100%;
    margin: 0;
    padding: 0 0 0.25rem;
    border-bottom: 1px solid black;
  }

  div.mob-header h4 {
    display: block;
    font-size: 1rem;
    margin: 0;
    padding: 0;
  }

  .mob-meta {
    font-size: 0.95rem;
    color: color-mix(in srgb, currentColor 70%, transparent);
  }

  div.room-description {
    border: 3px solid black;
    padding: 0.5rem;
    margin: 0.5rem;
  }
</style>
