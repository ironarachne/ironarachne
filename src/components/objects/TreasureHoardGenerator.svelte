<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import BaseButton from '$components/common/BaseButton.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import {
    MAXIMUM_HOARD_VALUE,
    MINIMUM_HOARD_VALUE,
    MINIMUM_ROOM_DIMENSION,
    TREASURE_HOARD_ARTIFACT_KIND,
    defaultTreasureHoardConfigRecord,
    hoardFileStem,
    hoardToDocument,
    hoardToMarkdown,
    hoardToText,
    rollTreasureHoardSnapshot,
    type TreasureHoardGeneratorConfigRecord,
    type TreasureHoardSnapshot,
  } from '$lib/treasure';

  const TOOL_PATH = '/fantasy/treasure-hoard';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be reseeded from the seed
   * field inside an `$effect` *and* again inside `generate()`, so the next press's seed depended on
   * the text of the previous one — the same requirement 2.2 failure #66, #67 and #69 all had.
   */
  const rng = new RNG(Date.now().toString());

  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  const defaults = defaultTreasureHoardConfigRecord();
  let treasureValue = $state(defaults.value);
  let coinsProportion = $state(defaults.coinsProportion);
  let gemsProportion = $state(defaults.gemsProportion);
  let artProportion = $state(defaults.artProportion);
  let mundaneItemProportion = $state(defaults.mundaneItemProportion);
  let magicItemProportion = $state(defaults.magicItemProportion);
  let potionProportion = $state(defaults.potionProportion);
  let allowPotionVariations = $state(defaults.allowPotionVariations);
  let allowPotionHomebrew = $state(defaults.allowPotionHomebrew);
  let roomWidth = $state(defaults.roomWidth);
  let roomLength = $state(defaults.roomLength);
  let roomHeight = $state(defaults.roomHeight);

  /**
   * The rolled hoard, as it is stored.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array in the payload
   * in a Proxy — and this payload is dozens of items each with their own arrays — and
   * `structuredClone`, what IndexedDB stores with, refuses one outright.
   */
  let hoard: TreasureHoardSnapshot | null = $state.raw(null);

  /** The seed and settings the hoard on screen was rolled from, which is its provenance. */
  let rolledSeed = $state('');
  let rolledConfig: TreasureHoardGeneratorConfigRecord = $state(defaults);

  const document_ = $derived(hoard === null ? null : hoardToDocument(hoard));

  function configRecord(): TreasureHoardGeneratorConfigRecord {
    return {
      value: treasureValue,
      coinsProportion,
      gemsProportion,
      artProportion,
      mundaneItemProportion,
      magicItemProportion,
      potionProportion,
      allowPotionVariations,
      allowPotionHomebrew,
      roomWidth,
      roomLength,
      roomHeight,
    };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rolledSeed = seed;
    rolledConfig = configRecord();
    // Stored as a snapshot straight away: the page renders the same shape a saved hoard is read
    // back in, so a result and a reopened artifact cannot show different things.
    hoard = rollTreasureHoardSnapshot(rolledSeed, rolledConfig);
  }

  function exportMarkdown() {
    if (hoard === null) return;
    downloadTextFile(hoardToMarkdown(hoard), `${hoardFileStem()}.md`, 'text/markdown');
  }

  async function exportPdf() {
    if (hoard === null) return;
    await downloadTextPdf('Treasure Hoard', hoardToText(hoard), `${hoardFileStem()}.pdf`);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Treasure Hoard Generator">
  {#snippet description()}
    <p>This generates a unique treasure hoard.</p>
  {/snippet}

  <ControlsPanel>
    <NumberField
      id="value"
      label="Treasure Hoard Value (gp)"
      bind:value={treasureValue}
      min={MINIMUM_HOARD_VALUE}
      max={MAXIMUM_HOARD_VALUE}
    />
    <NumberField
      id="coins"
      label="Proportion of Coins"
      bind:value={coinsProportion}
      min={0}
      max={100}
    />
    <NumberField
      id="gems"
      label="Proportion of Gems"
      bind:value={gemsProportion}
      min={0}
      max={100}
    />
    <NumberField
      id="art"
      label="Proportion of Art Objects"
      bind:value={artProportion}
      min={0}
      max={100}
    />
    <NumberField
      id="mundane"
      label="Proportion of Mundane Items"
      bind:value={mundaneItemProportion}
      min={0}
      max={100}
    />
    <NumberField
      id="magic"
      label="Proportion of Magic Items"
      bind:value={magicItemProportion}
      min={0}
      max={100}
    />
    <NumberField
      id="potions"
      label="Proportion of Potions"
      bind:value={potionProportion}
      min={0}
      max={100}
    />

    {#if potionProportion > 0}
      <div class="checkbox-group">
        <CheckboxField
          id="allowPotionVariations"
          label="Allow Potion Variations"
          bind:checked={allowPotionVariations}
        />
        <CheckboxField
          id="allowPotionHomebrew"
          label="Allow Homebrew Potions"
          bind:checked={allowPotionHomebrew}
        />
      </div>
    {/if}

    <NumberField
      id="room-width"
      label="Room Width (ft)"
      bind:value={roomWidth}
      min={MINIMUM_ROOM_DIMENSION}
    />
    <NumberField
      id="room-length"
      label="Room Length (ft)"
      bind:value={roomLength}
      min={MINIMUM_ROOM_DIMENSION}
    />
    <NumberField
      id="room-height"
      label="Room Height (ft)"
      bind:value={roomHeight}
      min={MINIMUM_ROOM_DIMENSION}
    />

    <SeedControls bind:seed bind:lockSeed inline inputClass="monospace" />

    <BaseButton onclick={generate}>Generate Treasure Hoard</BaseButton>
  </ControlsPanel>

  <SaveArtifactButton
    kind={TREASURE_HOARD_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={hoard}
    seed={rolledSeed}
    config={{ ...rolledConfig }}
  />

  <div class="actions">
    <BaseButton onclick={exportMarkdown} disabled={hoard === null}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={hoard === null}>Download PDF</BaseButton>
  </div>

  <h2>Generated Treasure Hoard</h2>

  {#if document_ === null}
    <p>No treasure hoard generated yet.</p>
  {:else}
    <p class="hoard-total">Worth {document_.totalValueText} all told.</p>

    <!-- The whole of what the page used to compute for itself — the gem tally, the loose-item
         sorting, the container contents lookup — is `hoardToDocument` now, so the card and both
         exports say the same thing. 6.4: an empty section is already gone by the time it gets
         here. -->
    <ul class="hoard">
      {#each document_.containers as container, index (index)}
        <li>
          {container.name} (total weight: {container.weightText})
          {#if container.contents.length === 0}
            <ul><li>Empty.</li></ul>
          {:else}
            <ul>
              {#each container.contents as held, heldIndex (heldIndex)}
                <li>{held.name} ({held.valueText})</li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
      {#each document_.loose as held, index (index)}
        <li>{held.name} ({held.valueText})</li>
      {/each}
    </ul>
  {/if}
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .hoard-total {
    color: var(--ink-muted);
  }
</style>
