<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import Badge from '$components/common/Badge.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import { downloadTextFile } from '$lib/download';
  import {
    ITEM_ARTIFACT_KIND,
    itemDisplayName,
    itemFileStem,
    itemListToMarkdown,
    itemListToText,
    itemToMarkdown,
    itemSeed,
    itemToDocument,
    rollItems,
    toItemSnapshot,
    defaultEquipmentGeneratorConfig,
    type EquipmentGeneratorConfigRecord,
    type ItemDisplaySystem,
    type ItemMajorTypeChoice,
    type ItemSnapshot,
  } from '$lib/equipment';
  import { downloadTextPdf } from '$lib/pdf';

  const TOOL_PATH = '/fantasy/equipment-generator';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be reseeded from the seed
   * field inside an `$effect`, which made the next press's seed depend on the text of the previous
   * one — a seed control that worked and a stream nobody could reproduce, which is requirement
   * 2.2's usual failure in a form this pass had not seen before.
   */
  const rng = new RNG(Date.now().toString());

  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let itemType: ItemMajorTypeChoice = $state('any');
  let itemCount = $state(10);
  let useRefine = $state(true);
  let useEnchant = $state(true);
  let useDecorate = $state(true);
  let displaySystem: ItemDisplaySystem = $state('dnd5e');

  /**
   * The seed and settings the items on screen were rolled from, which is what their provenance
   * records. Empty until the first press, which `onMount` makes immediately.
   */
  let rolledSeed = $state('');
  let rolledConfig: EquipmentGeneratorConfigRecord = $state(defaultEquipmentGeneratorConfig());
  /**
   * `$state.raw`, not `$state`: a deep `$state` wraps every array in the payload — `properties`,
   * `actions`, `bonusDamage` — in a reactive Proxy, and IndexedDB's structured clone refuses one
   * with "[object Array] could not be cloned". The page only ever replaces this list wholesale, so
   * the deep proxy buys nothing and costs every save.
   */
  let items: ItemSnapshot[] = $state.raw([]);

  function rollConfig(): EquipmentGeneratorConfigRecord {
    return { itemMajorType: itemType, useRefine, useEnchant, useDecorate };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rolledSeed = seed;
    rolledConfig = rollConfig();
    // Stored as snapshots straight away: the page renders the same shape a saved item is read
    // back in, so a card and a reopened artifact cannot show different things.
    items = rollItems(rolledSeed, itemCount, rolledConfig).map(toItemSnapshot);
  }

  function exportMarkdown() {
    downloadTextFile(itemListToMarkdown(items, displaySystem), 'equipment.md', 'text/markdown');
  }

  async function exportPdf() {
    await downloadTextPdf('Equipment', itemListToText(items, displaySystem), 'equipment.pdf');
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Equipment Generator">
  {#snippet description()}
    <p>Generate random weapons and armor.</p>
    <p>"Refine" adds quality modifications to the items.</p>
    <p>"Enchant" adds magical properties to the items.</p>
    <p>"Decorate" adds aesthetic modifications to the items.</p>
  {/snippet}

  <ControlsPanel>
    <SelectField
      id="itemType"
      label="Item Type"
      bind:value={itemType}
      options={[
        { value: 'any', label: 'Any' },
        { value: 'weapon', label: 'Weapon' },
        { value: 'armor', label: 'Armor' },
      ]}
    />

    <!-- Not part of the roll, and so not part of the provenance: it chooses between D&D dice and
         this site's own numbers for the *same* rolled item. -->
    <SelectField
      id="displaySystem"
      label="System"
      bind:value={displaySystem}
      options={[
        { value: 'dnd5e', label: 'D&D 5e' },
        { value: 'ironarachne', label: 'Iron Arachne' },
      ]}
    />

    <NumberField id="itemCount" label="Count" bind:value={itemCount} min={1} max={50} />

    <div class="checkbox-group">
      <CheckboxField id="useRefine" label="Refine" bind:checked={useRefine} />
      <CheckboxField id="useEnchant" label="Enchant" bind:checked={useEnchant} />
      <CheckboxField id="useDecorate" label="Decorate" bind:checked={useDecorate} />
    </div>

    <SeedControls bind:seed bind:lockSeed inline />

    <BaseButton onclick={generate}>Generate</BaseButton>
  </ControlsPanel>

  <div class="actions">
    <BaseButton onclick={exportMarkdown} disabled={items.length === 0}>
      Download Markdown
    </BaseButton>
    <BaseButton onclick={exportPdf} disabled={items.length === 0}>Download PDF</BaseButton>
  </div>

  <div class="results">
    {#each items as item, index (item.id)}
      {@const document_ = itemToDocument(item, displaySystem)}
      <!-- A card is a panel: the two layers, with the `li` painting the keyline across its box
           and the field covering all but a pixel of it. See docs/visual-design.md, "Cards are
           panels". This card wrote its own border, radius, fill and padding until #124. -->
      <div class="item-card panel">
        <div class="panel__field">
          <h3>{document_.title}</h3>
          <p class="description">{document_.description}</p>
          <div class="stats">
            <Badge>{item.itemMajorType}</Badge>
            {#each document_.lines as line (line.label)}
              <Badge>{line.label}: {line.value}</Badge>
            {/each}
          </div>
          {#if document_.properties.length > 0}
            <div class="tags">
              <!-- Keyed by index, not by the tag: a weapon's properties can repeat — the type name, the
                     damage type and an enchantment's `tagsAdded` all land in the same list — and a duplicate
                     key is a Svelte error that takes the whole page down with it. -->
              {#each document_.properties as tag, index (index)}
                <!-- `plain` because a card can carry a dozen of these: bordered pills stop
                     annotating the item and start shouting over it. -->
                <Badge plain>{tag}</Badge>
              {/each}
            </div>
          {/if}

          <div class="card-actions">
            <!-- One save per card, because the kind is `item` and an artifact is one item. Each
                 card's seed is the one that rolls *that* item, so a saved sword re-rolls to a
                 sword rather than to the list it arrived in. -->
            <SaveArtifactButton
              kind={ITEM_ARTIFACT_KIND}
              toolPath={TOOL_PATH}
              snapshot={item}
              seed={itemSeed(rolledSeed, index)}
              config={{ ...rolledConfig }}
              defaultName={itemDisplayName(item)}
            />
            <BaseButton
              onclick={() =>
                downloadTextFile(
                  itemToMarkdown(item, displaySystem),
                  `${itemFileStem(item)}.md`,
                  'text/markdown',
                )}
              aria-label="Download {document_.title} as Markdown"
            >
              Markdown
            </BaseButton>
          </div>
        </div>
      </div>
    {/each}
  </div>
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .results {
    display: grid;
    gap: var(--s6);
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  /* What is left after #124: the card's own border, radius, fill and padding are the panel's now,
     and the three tag colours are gone. A hue meaning "damage", another meaning "defense" and a
     third meaning "value" was a fourth colour system beside the roles, the tones and the genres —
     the label already says which is which. */
  .item-card .description {
    color: var(--ink-muted);
    font-style: italic;
  }

  .item-card .stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
    margin: var(--s4) 0;
  }

  .item-card .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s3);
    margin-top: var(--s4);
  }

  .item-card .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s4);
    margin-top: var(--s5);
  }
</style>
