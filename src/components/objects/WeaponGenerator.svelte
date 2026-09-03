<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import Badge from '$components/common/Badge.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import ControlsPanel from '$components/common/ControlsPanel.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import type { ArtifactReference } from '$lib/artifacts';
  import { downloadTextFile } from '$lib/download';
  import {
    ITEM_ARTIFACT_KIND,
    WEAPON_ANY,
    defaultWeaponGeneratorConfigRecord,
    WEAPON_RANGE_CHOICES,
    itemDisplayName,
    itemFileStem,
    itemToDocument,
    itemToMarkdown,
    itemToText,
    resolveWeaponTheme,
    rollWeapon,
    toItemSnapshot,
    type ItemSnapshot,
    type WeaponGeneratorConfigRecord,
  } from '$lib/equipment';
  import { downloadTextPdf } from '$lib/pdf';
  import {
    RELIGION_ARTIFACT_KIND,
    domains,
    religionDomainNames,
    type RestoredReligion,
  } from '$lib/religion';

  const TOOL_PATH = '/fantasy/weapon';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to be reseeded from the seed
   * field inside an `$effect` — the same requirement 2.2 failure #66 and #67 found — and it also
   * drew the theme from this stream when the control read "any", so the roll depended on something
   * the provenance did not record. `resolveWeaponTheme` takes the theme from the seed now.
   */
  const rng = new RNG(Date.now().toString());

  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let theme = $state(WEAPON_ANY);
  let rangeCategory: WeaponGeneratorConfigRecord['rangeCategory'] = $state(WEAPON_ANY);

  /** Composition, opt-in (rule 1, docs/workshop.md). */
  let useReligion = $state(false);
  // The picker hands back what the kind's codec produces, which for a religion is the religion
  // plus the seed and options it was rolled with.
  let referencedReligion: RestoredReligion | undefined = $state();
  let religionReference: ArtifactReference | undefined = $state();

  /**
   * The rolled weapon, as it is stored.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array in the payload
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses one outright.
   */
  let weapon: ItemSnapshot | null = $state.raw(null);

  /** The seed and settings the weapon on screen was rolled from, which is its provenance. */
  let rolledSeed = $state('');
  let rolledConfig: WeaponGeneratorConfigRecord = $state(defaultWeaponGeneratorConfigRecord());

  /**
   * Every domain a weapon may be themed on.
   *
   * Read here rather than in `$lib/equipment`: religion reaches characters, which reaches
   * archetypes, which reaches back into equipment for its gear — so the roll module takes the names
   * as a parameter and this page is where they come from.
   */
  const allThemes = domains.map((domain) => domain.name).sort();

  /**
   * The themes on offer: every domain, or only the ones a referenced religion's gods claim.
   *
   * Requirement 5.1. A weapon consecrated to a domain no god in this religion holds is not a weapon
   * of that religion, so the list narrows rather than merely being annotated — which is also what
   * makes the reference worth recording.
   */
  const themes = $derived(
    useReligion && referencedReligion !== undefined
      ? religionDomainNames(referencedReligion.religion)
      : allThemes,
  );

  const references = $derived(religionReference === undefined ? [] : [religionReference]);

  const document_ = $derived(weapon === null ? null : itemToDocument(weapon));

  /**
   * The settings as the roll used them.
   *
   * The theme is **resolved** before it is recorded: a provenance saying `any` would need the
   * domain list to re-roll, and would produce a different weapon the day that list changed. What is
   * stored is the domain the weapon was actually consecrated to, which is what 3.6 asks for.
   */
  function configRecord(rollSeed: string): WeaponGeneratorConfigRecord {
    return { theme: resolveWeaponTheme(rollSeed, theme, themes), rangeCategory };
  }

  /**
   * Keeps the theme honest when the offer narrows.
   *
   * Referencing a religion whose gods do not claim the currently chosen domain would otherwise
   * leave a select showing a value that is no longer in its own list.
   */
  $effect(() => {
    if (theme !== WEAPON_ANY && !themes.includes(theme)) {
      theme = WEAPON_ANY;
    }
  });

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rolledSeed = seed;
    rolledConfig = configRecord(rolledSeed);
    weapon = toItemSnapshot(rollWeapon(rolledSeed, rolledConfig));
  }

  function exportMarkdown() {
    if (weapon === null) return;
    downloadTextFile(itemToMarkdown(weapon), `${itemFileStem(weapon)}.md`, 'text/markdown');
  }

  async function exportPdf() {
    if (weapon === null) return;
    await downloadTextPdf(
      itemDisplayName(weapon),
      itemToText(weapon),
      `${itemFileStem(weapon)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Magic Weapon Generator">
  {#snippet description()}
    <p>This generates a unique magical weapon.</p>
  {/snippet}

  <ControlsPanel>
    <SelectField id="theme" label="Theme" bind:value={theme} options={[WEAPON_ANY, ...themes]} />

    <!-- "melee" and "ranged" were passed through `itemMinorType` until #69, where they matched no
         weapon type at all and generation threw. They narrow the table by range category now. -->
    <SelectField
      id="category"
      label="Category"
      bind:value={rangeCategory}
      options={[...WEAPON_RANGE_CHOICES]}
    />

    <SeedControls bind:seed bind:lockSeed inline />

    <BaseButton onclick={generate}>Generate</BaseButton>
  </ControlsPanel>

  <!-- Requirement 5.1. An offer: the checkbox starts off, and a weapon handed nothing themes on
       any of the fifty-eight domains exactly as it did before (5.3). -->
  <SavedArtifactPicker
    kind={RELIGION_ARTIFACT_KIND}
    role="consecrated-to"
    checkboxLabel="Consecrate this weapon to a saved religion"
    selectLabel="Religion"
    bind:enabled={useReligion}
    bind:value={referencedReligion}
    bind:reference={religionReference}
  />

  <SaveArtifactButton
    kind={ITEM_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={weapon}
    seed={rolledSeed}
    config={{ ...rolledConfig }}
    defaultName={weapon === null ? '' : itemDisplayName(weapon)}
    {references}
  />

  <div class="actions">
    <BaseButton onclick={exportMarkdown} disabled={weapon === null}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={weapon === null}>Download PDF</BaseButton>
  </div>

  {#if weapon && document_}
    <!-- A result surface is a panel: the two layers, and the keyline, corner and padding are the
         system's. The page showed a heading and one paragraph until #69, with the damage, the
         value, the weight, the material and the enchantment it had just rolled all invisible —
         which would also have left the editor with fields answering to nothing on screen. -->
    <article class="weapon-result panel">
      <div class="panel__field">
        <h2>{document_.title}</h2>

        {#if document_.description !== ''}
          <p class="description">{document_.description}</p>
        {/if}

        {#if document_.lines.length > 0}
          <StatBlock>
            {#each document_.lines as line (line.label)}
              <Stat label={line.label}>{line.value}</Stat>
            {/each}
          </StatBlock>
        {/if}

        {#if document_.properties.length > 0}
          <div class="tags">
            <!-- Keyed by index, not by the tag: a weapon's properties can repeat — the type name, the
                     damage type and an enchantment's `tagsAdded` all land in the same list — and a duplicate
                     key is a Svelte error that takes the whole page down with it. -->
            {#each document_.properties as tag, index (index)}
              <!-- `plain` because a weapon can carry a dozen of these: bordered pills stop
                   annotating the item and start shouting over it. -->
              <Badge plain>{tag}</Badge>
            {/each}
          </div>
        {/if}
      </div>
    </article>
  {/if}
</GeneratorPage>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .weapon-result {
    margin-top: var(--s7);
  }

  .weapon-result .description {
    color: var(--ink-muted);
    font-style: italic;
  }

  .weapon-result .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s3);
    margin-top: var(--s4);
  }
</style>
