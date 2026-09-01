<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Families from '$lib/families';
  import type { Family, FamilyGeneratorConfigRecord } from '$lib/families';
  import type { ArtifactReference } from '$lib/artifacts';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import { downloadTextFile } from '$lib/download';
  import { getFantasyNameGeneratorSetNames } from '$lib/names';
  import { downloadTextPdf } from '$lib/pdf';
  import { CommonSpecies } from '$lib/species';
  import Stat from '$components/common/Stat.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/fantasy/family';

  /** The value of the naming select that means "the set that suits the species". */
  const NAMES_FROM_SPECIES = 'species';
  /** The value of the naming select that means the culture the picker loaded. */
  const NAMES_FROM_CULTURE = 'culture';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to also build the name
   * generators, so where it was in its sequence — how many times Generate had been pressed —
   * decided the names, and a locked seed reproduced the people but not what they were called.
   * `family_roll.ts` draws the names from the seed now.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  const availableSpecies = CommonSpecies.sentient();
  const nameSetNames = getFantasyNameGeneratorSetNames();

  let selectedSpecies = $state<string>(Families.FAMILY_ANY_SPECIES);
  let nameSource = $state<string>(NAMES_FROM_SPECIES);
  let lastNameTradition = $state<Families.FamilyLastNameTradition>('male');
  let generations = $state<number>(Families.FAMILY_DEFAULT_GENERATIONS);
  let minMembersPerGeneration = $state<number>(Families.FAMILY_DEFAULT_MIN_MEMBERS);
  let maxMembersPerGeneration = $state<number>(Families.FAMILY_DEFAULT_MAX_MEMBERS);
  let fertilityChance = $state<number>(Families.FAMILY_DEFAULT_FERTILITY_CHANCE);
  let infantMortalityChance = $state<number>(Families.FAMILY_DEFAULT_INFANT_MORTALITY_CHANCE);
  let allowAdoption = $state(false);
  let adoptionChance = $state(0);
  let allowIllegitimateChildren = $state(false);
  let illegitimateChildChance = $state(0);
  let allowMultipleMarriages = $state(false);
  let multipleMarriageChance = $state(0);
  let allowSameGenderMarriage = $state(false);
  let sameGenderMarriageChance = $state(0);
  let allowCrossSpeciesMarriages = $state(false);
  let crossSpeciesMarriageChance = $state(0);

  /** Filled in by the culture picker: a saved culture to name the family from (5.1). */
  let useReferencedCulture = $state(false);
  let referencedCulture = $state<Culture | undefined>();
  let cultureReference = $state<ArtifactReference | undefined>();

  /**
   * The rolled family.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`. The same trap is written up in `$lib/workshop`'s
   * README beside `saveToolArtifact`.
   */
  let family = $state.raw<Family | null>(null);
  /** The settings the family on screen was actually rolled with. Raw, for the same reason. */
  let rolledConfig = $state.raw<FamilyGeneratorConfigRecord>({});
  /**
   * The culture link, recorded only when the family on screen was actually named from it.
   *
   * Gated on the roll rather than on the picker, as the character generator gates its own: a
   * reference is a record of what the tool was handed, and one written for a family whose names
   * came from somewhere else would claim an input that was never used.
   */
  let rolledCultureReference = $state.raw<ArtifactReference | undefined>();
  let familyTreeSVG = $state('');

  /**
   * Whether a saved culture is actually on hand to name from.
   *
   * The picker's checkbox alone is not enough: ticked with nothing chosen yet, there is no culture,
   * and a page that said "from the saved culture" while naming from the species would be lying.
   */
  const cultureLoaded = $derived(useReferencedCulture && referencedCulture !== undefined);

  /**
   * Follow the culture into and out of the naming select.
   *
   * Keyed on the culture arriving or leaving, not on the select: when a culture loads the page
   * offers it and picks it, and when it goes the select falls back to the species. In between, the
   * user's own choice stands — someone who wants a saved culture in the project but dwarf names
   * for this family can say so, and the select does not fight them for it.
   */
  $effect(() => {
    if (cultureLoaded) {
      nameSource = NAMES_FROM_CULTURE;
    } else if (nameSource === NAMES_FROM_CULTURE) {
      nameSource = NAMES_FROM_SPECIES;
    }
  });

  const familySnapshot = $derived(family === null ? null : Families.toFamilySnapshot(family));
  const defaultArtifactName = $derived(family === null ? '' : Families.familyDisplayName(family));
  const references = $derived(rolledCultureReference === undefined ? [] : [rolledCultureReference]);

  /** The name set the current naming choice asks for, or nothing for "whatever suits the species". */
  function requestedNameSet(): string | undefined {
    if (nameSource === NAMES_FROM_CULTURE) {
      return cultureLoaded ? referencedCulture?.nameGenerators.name : undefined;
    }
    return nameSource === NAMES_FROM_SPECIES ? undefined : nameSource;
  }

  /** The settings a roll takes, and the ones provenance records (3.6). */
  function currentConfig(): FamilyGeneratorConfigRecord {
    const nameGeneratorSet = requestedNameSet();
    return {
      speciesName: selectedSpecies,
      ...(nameGeneratorSet === undefined ? {} : { nameGeneratorSet }),
      lastNameTradition,
      generations,
      minMembersPerGeneration,
      maxMembersPerGeneration,
      fertilityChance,
      infantMortalityChance,
      allowAdoption,
      adoptionChance,
      allowIllegitimateChildren,
      illegitimateChildChance,
      allowMultipleMarriages,
      multipleMarriageChance,
      allowSameGenderMarriage,
      sameGenderMarriageChance,
      allowCrossSpeciesMarriages,
      crossSpeciesMarriageChance,
    };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    const config = currentConfig();
    const rolled = Families.rollFamily(seed, config);
    family = rolled.family;
    // The resolved species and set, not the requested ones: "any" or a set this build has since
    // dropped would otherwise be recorded as provenance a re-roll could not honour.
    rolledConfig = {
      ...config,
      speciesName: rolled.speciesName,
      nameGeneratorSet: rolled.nameGeneratorSet,
    };
    rolledCultureReference =
      nameSource === NAMES_FROM_CULTURE && cultureLoaded ? cultureReference : undefined;
    familyTreeSVG = Families.getFamilyTreeSVG(rolled.family);
  }

  function exportMarkdown() {
    if (family === null) {
      return;
    }
    downloadTextFile(
      Families.familyToMarkdown(family),
      `${Families.familyFileStem(family)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (family === null) {
      return;
    }
    await downloadTextPdf(
      Families.familyDisplayName(family),
      Families.familyToText(family),
      `${Families.familyFileStem(family)}.pdf`,
    );
  }

  /** The tree, which `getFamilyTreeSVG` has drawn all along and nothing ever offered to keep. */
  function exportTree() {
    if (family === null) {
      return;
    }
    downloadTextFile(familyTreeSVG, `${Families.familyFileStem(family)}-tree.svg`, 'image/svg+xml');
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Fantasy Family Generator">
  {#snippet description()}
    <p>
      This generator creates a family across several generations. Each iteration adds one, and the
      later ones are slower: the last few of the ten allowed can take a while.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <NumberField
    id="iterations"
    label="Iterations"
    bind:value={generations}
    min={1}
    max={Families.FAMILY_MAX_GENERATIONS}
  />

  <SelectField
    id="species"
    label="Species"
    bind:value={selectedSpecies}
    options={[Families.FAMILY_ANY_SPECIES, ...availableSpecies.map((s) => s.name)]}
  />

  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Name from a saved culture in this project"
    selectLabel="Culture"
    bind:enabled={useReferencedCulture}
    bind:value={referencedCulture}
    bind:reference={cultureReference}
  />

  <SelectField
    id="name-source"
    label="Names"
    bind:value={nameSource}
    options={[
      { value: NAMES_FROM_SPECIES, label: 'From the species' },
      ...(cultureLoaded ? [{ value: NAMES_FROM_CULTURE, label: 'From the saved culture' }] : []),
      ...nameSetNames.map((name) => ({ value: name, label: name })),
    ]}
  />

  <SelectField
    id="last-name-tradition"
    label="Last name tradition (gender)"
    bind:value={lastNameTradition}
    options={['male', 'female']}
  />

  <div class="input-group">
    <label for="min-members">Min Children/Couple</label>
    <input type="number" id="min-members" bind:value={minMembersPerGeneration} min="0" max="15" />
    <label for="max-members">Max Children/Couple</label>
    <input type="number" id="max-members" bind:value={maxMembersPerGeneration} min="0" max="15" />
  </div>

  <div class="input-group">
    <label for="fertility-chance">Fertility Chance</label>
    <input
      type="number"
      id="fertility-chance"
      bind:value={fertilityChance}
      min="0"
      max="1"
      step="0.01"
    />
    <label for="infant-mortality">Infant Mortality</label>
    <input
      type="number"
      id="infant-mortality"
      bind:value={infantMortalityChance}
      min="0"
      max="1"
      step="0.01"
    />
  </div>

  <!-- Each chance field is labelled, which the old page left to the checkbox beside it: a number
       box with no accessible name is the 6.2 failure. -->
  <div class="input-group">
    <CheckboxField id="allow-adoption" label="Allow Adoption" bind:checked={allowAdoption} />
    <label for="adoption-chance">Adoption Chance</label>
    <input
      type="number"
      id="adoption-chance"
      bind:value={adoptionChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowAdoption}
    />
  </div>

  <div class="input-group">
    <CheckboxField
      id="allow-illegitimate"
      label="Allow Illegitimate Children"
      bind:checked={allowIllegitimateChildren}
    />
    <label for="illegitimate-chance">Illegitimate Child Chance</label>
    <input
      type="number"
      id="illegitimate-chance"
      bind:value={illegitimateChildChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowIllegitimateChildren}
    />
  </div>

  <div class="input-group">
    <CheckboxField
      id="allow-multiple-marriages"
      label="Allow Multiple Marriages"
      bind:checked={allowMultipleMarriages}
    />
    <label for="multiple-marriage-chance">Multiple Marriage Chance</label>
    <input
      type="number"
      id="multiple-marriage-chance"
      bind:value={multipleMarriageChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowMultipleMarriages}
    />
  </div>

  <div class="input-group">
    <CheckboxField
      id="allow-same-gender"
      label="Allow Same Gender Marriage"
      bind:checked={allowSameGenderMarriage}
    />
    <label for="same-gender-chance">Same Gender Marriage Chance</label>
    <input
      type="number"
      id="same-gender-chance"
      bind:value={sameGenderMarriageChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowSameGenderMarriage}
    />
  </div>

  <div class="input-group">
    <CheckboxField
      id="allow-cross-species"
      label="Allow Cross Species Marriage"
      bind:checked={allowCrossSpeciesMarriages}
    />
    <label for="cross-species-chance">Cross Species Marriage Chance</label>
    <input
      type="number"
      id="cross-species-chance"
      bind:value={crossSpeciesMarriageChance}
      min="0"
      max="1"
      step="0.01"
      disabled={!allowCrossSpeciesMarriages}
    />
  </div>

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={Families.FAMILY_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={familySnapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
    {references}
  />

  {#if family}
    <div class="family-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
      <BaseButton onclick={exportTree}>Download Tree (SVG)</BaseButton>
    </div>

    <div class="family">
      <h2>{Families.familyDisplayName(family)}</h2>

      <h3>Family Tree</h3>
      <!-- Scrolls sideways on purpose; see `DELIBERATE_SCROLLER` in e2e/mobile_layout.ts. -->
      <div class="family-tree" data-scroll-x>
        <!-- Renders app-generated markup (no external or user-supplied input). -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html familyTreeSVG}
      </div>

      {#each family.members as member (member.id)}
        {@const mate = Families.familyMateOf(family, member)}
        {@const children = Families.familyChildrenOf(family, member)}
        {@const parents = Families.familyParentsOf(family, member)}
        <div class="member">
          <h3>
            {Families.familyMemberName(member)}
            <span class="gender-symbol" title={member.gender.name}>
              {Families.familyGenderSymbol(member.gender.name)}
            </span>
          </h3>
          <p>{Families.familyMemberSummary(member)}</p>
          <p>{member.description}</p>
          {#if mate}
            <Stat label="Mate">
              {Families.familyMemberName(mate)}
              <span class="gender-symbol" title={mate.gender.name}>
                {Families.familyGenderSymbol(mate.gender.name)}
              </span>
            </Stat>
          {/if}
          {#if children.length > 0}
            <h4>Children</h4>
            <ul>
              {#each children as child (child.id)}
                <li>
                  {Families.familyMemberName(child)}
                  <span class="gender-symbol" title={child.gender.name}>
                    {Families.familyGenderSymbol(child.gender.name)}
                  </span>
                  {#if child.tags.includes('adopted')}(Adopted){/if}
                  {#if child.tags.includes('illegitimate')}(Illegitimate){/if}
                </li>
              {/each}
            </ul>
          {/if}
          {#if parents.length > 0}
            <h4>Parents</h4>
            <ul>
              {#each parents as parent (parent.id)}
                <li>
                  {Families.familyMemberName(parent)}
                  <span class="gender-symbol" title={parent.gender.name}>
                    {Families.familyGenderSymbol(parent.gender.name)}
                  </span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</GeneratorPage>

<style>
  .family-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .family-tree {
    overflow-x: auto;
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 2rem;
    background-color: white;
  }

  .gender-symbol {
    font-size: 1.5em;
    color: #666;
    margin-left: 0.5rem;
  }
</style>
