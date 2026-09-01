<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Measurements from '$lib/measurements';
  import {
    buildCharacterNameSource,
    characterFileStem,
    characterTitleLine,
    characterToMarkdown,
    characterToPlainText,
    CHARACTER_ANY,
    CHARACTER_ARTIFACT_KIND,
    formatCharacterDisplayName,
    nameGeneratorSetForSource,
    rollCharacter,
    rollCharacterNameForSource,
    toCharacterSnapshot,
    type Character,
    type CharacterGeneratorConfigRecord,
    loadCulturesForNaming,
  } from '$lib/characters';
  import type { ArtifactReference } from '$lib/artifacts';
  import Download from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import {
    HERALDRY_ARTIFACT_KIND,
    renderDeviceBlazon,
    renderHeraldryDeviceSvg,
    type Arms,
    type RestoredHeraldry,
  } from '$lib/heraldry';
  import { showHeraldryModal } from '$lib/ui';
  import type { Culture } from '$lib/culture';
  import { sentientSpeciesList } from '$lib/species_sentients';
  import { getAllFantasyArchetypes } from '$lib/archetypes';
  import { getCategoryList } from '$lib/age';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/character';

  const heraldryWidth = 200;
  const heraldryHeight = 220;

  const speciesList = sentientSpeciesList;
  const archetypeOptions = getAllFantasyArchetypes().sort((a, b) => a.name.localeCompare(b.name));
  const ageCategories = getCategoryList();
  const genderOptions = [CHARACTER_ANY, 'Male', 'Female'];

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. That is the whole of requirement 2.2's
   * fix here: the clock decides where the sequence of seeds *starts*, and everything after it is a
   * pure function of the seed on screen. This used to reseed from `Date.now()` inside every roll,
   * so a locked seed reproduced nothing.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  /**
   * The rolled character.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array and object in
   * the character in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy
   * outright, so saving fails with `could not be cloned`. The same trap is written up in
   * `$lib/workshop`'s README beside `saveToolArtifact`, and the AD&D generator hit it first.
   */
  let character = $state.raw<Character | null>(null);
  /** The settings the character on screen was actually rolled with. Raw, for the same reason. */
  let rolledConfig = $state.raw<Record<string, unknown>>({});

  let savedCultures = $state<Culture[]>([]);
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture' | 'referenced_culture'>(
    'default',
  );
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);
  /** The culture the picker loaded, and the link to record for it. */
  let referencedCulture = $state<Culture | undefined>();
  let cultureReference = $state<ArtifactReference | undefined>();
  /**
   * The culture link, recorded only when the character on screen was actually named from it.
   *
   * Gated on the roll rather than on the picker, as the AD&D generator gates its own: a reference
   * is a record of what the tool was handed, and one written for a character whose names came from
   * somewhere else would claim an input that was never used.
   */
  let rolledCultureReference = $state.raw<ArtifactReference | undefined>();

  /** Filled in by the arms picker: a saved coat of arms to wear instead of rolling one. */
  let useReferencedArms = $state(false);
  let referencedArms = $state<RestoredHeraldry | undefined>();
  let armsReference = $state<ArtifactReference | undefined>();
  let armsProblem = $state<string | null>(null);

  let selectedSpeciesName = $state('human');
  let selectedArchetypeName = $state<string>(CHARACTER_ANY);
  let selectedGenderName = $state<string>(CHARACTER_ANY);
  let selectedAgeCategoryName = $state<string>(CHARACTER_ANY);

  /**
   * Whether the character on screen is wearing a referenced coat of arms.
   *
   * Gated on the picker having actually loaded one, not on the checkbox: a ticked box whose
   * artifact has not arrived would otherwise store `heraldry: null` beside no reference at all,
   * which is a character with a hole where their arms were.
   */
  const wearingReferencedArms = $derived(useReferencedArms && referencedArms !== undefined);

  /** The arms to show: the character's own, or the saved ones standing in for them. */
  const shownArms = $derived<Arms | null>(
    wearingReferencedArms ? (referencedArms?.arms ?? null) : (character?.heraldry ?? null),
  );

  /**
   * The character with the names the page is showing, which is what the sheet and the exports want.
   *
   * They differ from the roll's whenever the user has typed a name or locked one, and the display
   * below already renders it this way. Saving the roll's name instead would keep something the user
   * can see is not what they asked for.
   */
  const namedCharacter = $derived<Character | null>(
    character === null
      ? null
      : {
          ...character,
          firstName,
          lastName,
          name: formatCharacterDisplayName(firstName, lastName),
          ...(wearingReferencedArms && referencedArms !== undefined
            ? { heraldry: referencedArms.arms }
            : {}),
        },
  );

  /**
   * What a project stores. The generator owns the conversion — it is the `toSnapshot` half of its
   * own kind — so what reaches the save button is already the payload.
   *
   * The referenced-arms flag is passed through because only this page knows whether the arms on
   * screen came from a picker. Stored as `null` plus a reference, they stay one record that someone
   * may edit later, rather than a copy forked at the moment of saving.
   */
  const characterSnapshot = $derived(
    namedCharacter === null ? null : toCharacterSnapshot(namedCharacter, wearingReferencedArms),
  );

  const references = $derived(
    [rolledCultureReference, wearingReferencedArms ? armsReference : undefined].filter(
      (entry): entry is ArtifactReference => entry !== undefined,
    ),
  );

  const defaultArtifactName = $derived(formatCharacterDisplayName(firstName, lastName));

  /** The settings a roll takes, and the ones provenance records. */
  function currentConfig(): CharacterGeneratorConfigRecord {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
    const nameGeneratorSet = nameGeneratorSetForSource(source);
    return {
      speciesName: selectedSpeciesName,
      archetypeName: selectedArchetypeName,
      genderName: selectedGenderName,
      ageCategoryName: selectedAgeCategoryName,
      ...(nameGeneratorSet === '' ? {} : { nameGeneratorSet }),
      namingGender: 'random',
    };
  }

  function generateCharacter() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }

    const lockedFirstName = firstName;
    const lockedLastName = lastName;

    const config = currentConfig();
    const rolled = rollCharacter(seed, config);
    character = rolled.character;
    // The resolved set, not the requested one: a set this build has since dropped would otherwise
    // be recorded as provenance a re-roll could not honour.
    rolledConfig = { ...config, nameGeneratorSet: rolled.nameGeneratorSet };
    rolledCultureReference =
      nameSourceKind === 'referenced_culture' && referencedCulture !== undefined
        ? cultureReference
        : undefined;

    if (lockName) {
      firstName = lockedFirstName;
      lastName = lockedLastName;
    } else {
      firstName = rolled.character.firstName;
      lastName = rolled.character.lastName;
    }
  }

  /**
   * Another name for the character already on screen.
   *
   * An **edit**, not a generation, and so a fresh draw that does not touch the recorded seed:
   * requirement 4.2 says the payload is what the user kept, and a name they asked for is not
   * something a seed reproduces. The character itself is untouched — it is raw state, and every
   * reader already composes the shown names over it.
   */
  function generateNameOnly() {
    if (lockName) {
      return;
    }
    const speciesName = character?.species.name ?? selectedSpeciesName;
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
    const generated = rollCharacterNameForSource(
      new RNG(`${Date.now()}-character-name`),
      source,
      speciesName,
      'random',
      character?.gender.name,
    );
    firstName = generated.firstName;
    lastName = generated.lastName;
  }

  async function openHeraldryModal(arms: Arms, title: string) {
    const result = await showHeraldryModal({ arms, seed, title });
    if (result.action === 'replaced' && character !== null) {
      // A replacement is the character's own arms, whatever they were wearing before: the user has
      // just made a coat of arms for this person, so the reference is no longer what they are
      // showing.
      useReferencedArms = false;
      character = { ...character, heraldry: result.arms };
    }
  }

  function exportMarkdown() {
    if (namedCharacter === null) {
      return;
    }
    const markdown = characterToMarkdown(namedCharacter);
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${characterFileStem(namedCharacter)}.md`);
    URL.revokeObjectURL(url);
  }

  let downloadingPdf = $state(false);

  async function exportPdf() {
    if (namedCharacter === null || downloadingPdf) {
      return;
    }
    downloadingPdf = true;
    try {
      await downloadTextPdf(
        namedCharacter.name,
        characterToPlainText(namedCharacter),
        `${characterFileStem(namedCharacter)}.pdf`,
      );
    } finally {
      downloadingPdf = false;
    }
  }

  onMount(() => {
    // Not awaited: the cultures come from the vault database, and a character worth looking at
    // should be on screen before a naming dropdown has finished filling in.
    void loadCulturesForNaming().then((cultures) => {
      savedCultures = cultures;
      if (savedCultures.length > 0) {
        savedCultureName = savedCultures[0]!.name;
      }
    });
    generateCharacter();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Character">
  {#snippet description()}
    <p>This generator creates random characters.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <div class="input-group">
    <label for="species">Species</label>
    <select bind:value={selectedSpeciesName} id="species">
      {#each speciesList as species}
        <option value={species.name}>{species.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="archetype">Archetype</label>
    <select bind:value={selectedArchetypeName} id="archetype">
      <option value={CHARACTER_ANY}>{CHARACTER_ANY}</option>
      {#each archetypeOptions as archetype}
        <option value={archetype.name}>{archetype.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="gender">Gender</label>
    <select bind:value={selectedGenderName} id="gender">
      {#each genderOptions as gender}
        <option value={gender}>{gender}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="age">Age</label>
    <select bind:value={selectedAgeCategoryName} id="age">
      <option value={CHARACTER_ANY}>{CHARACTER_ANY}</option>
      {#each ageCategories as age}
        <option value={age}>{age}</option>
      {/each}
    </select>
  </div>

  <CharacterNameSection
    offerReferencedCulture
    bind:referencedCulture
    bind:cultureReference
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    seed="character-name-sets"
    onGenerateName={generateNameOnly}
  />

  <SavedArtifactPicker
    kind={HERALDRY_ARTIFACT_KIND}
    role="arms"
    checkboxLabel="Give this character a saved coat of arms"
    selectLabel="Coat of arms"
    bind:enabled={useReferencedArms}
    bind:value={referencedArms}
    bind:reference={armsReference}
    bind:problem={armsProblem}
  />

  <BaseButton onclick={generateCharacter}>Generate</BaseButton>

  <SaveArtifactButton
    kind={CHARACTER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={characterSnapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
    {references}
  />

  {#if namedCharacter}
    <h2>{namedCharacter.name}</h2>

    <div class="character-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <DownloadPdfButton onclick={exportPdf} downloading={downloadingPdf} />
    </div>

    {#if namedCharacter.titles && namedCharacter.titles.length > 0}
      <h3>Titles</h3>
      <ul>
        {#each namedCharacter.titles as title}
          <li>{characterTitleLine(title, namedCharacter.gender.name)}</li>
        {/each}
      </ul>
    {/if}
    <StatBlock>
      <Stat label="Description">{namedCharacter.description}</Stat>
      <Stat label="Gender">{namedCharacter.gender.name}</Stat>
      <Stat label="Species">{namedCharacter.species.name}</Stat>
      {#if namedCharacter.creatureTypes.length > 0}
        <Stat label="Type">{namedCharacter.creatureTypes.join(', ')}</Stat>
      {/if}
      {#if namedCharacter.archetype}
        <Stat label="Archetype">{namedCharacter.archetype.name}</Stat>
      {/if}
      <Stat label="Age">{namedCharacter.age} years ({namedCharacter.ageCategory.name})</Stat>
    </StatBlock>
    <Stat label="Height">
      {Measurements.inchesToFeetExpression(Measurements.cmToInches(namedCharacter.height))}
    </Stat>
    {#if namedCharacter.length > 0}
      <Stat label="Length">
        {Measurements.inchesToFeetExpression(Measurements.cmToInches(namedCharacter.length))}
      </Stat>
    {/if}
    <StatBlock>
      <Stat label="Weight">{Measurements.kgToPounds(namedCharacter.weight)} lbs.</Stat>
    </StatBlock>

    {#if namedCharacter.physicalTraits.length > 0}
      <h3>Physical Traits</h3>
      <ul>
        {#each namedCharacter.physicalTraits as trait}
          <li><strong>{trait.name}:</strong> {trait.description}</li>
        {/each}
      </ul>
    {/if}

    {#if namedCharacter.personalityTraits.length > 0}
      <h3>Personality</h3>
      <p>{namedCharacter.personalityTraits.join(', ')}</p>
    {/if}

    {#if shownArms}
      <h3>Heraldry</h3>
      {#if wearingReferencedArms}
        <!-- Named as borrowed, because it is: the character stores a link, not a copy, so editing
             those arms changes what this character bears. -->
        <p class="character-referenced-arms">From a saved coat of arms.</p>
      {/if}
      <button
        type="button"
        class="character-heraldry heraldry-block-target"
        aria-label="View heraldry for {namedCharacter.name}"
        onclick={() => {
          const arms = shownArms;
          if (arms !== null) {
            void openHeraldryModal(arms, namedCharacter.name);
          }
        }}
      >
        <!-- Renders app-generated markup (no external or user-supplied input). -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html renderHeraldryDeviceSvg(shownArms.device, heraldryWidth, heraldryHeight, rng)}
      </button>
      <p>{renderDeviceBlazon(shownArms.device)}</p>
    {/if}

    {#if namedCharacter.abilities.length > 0}
      <h3>Abilities</h3>
      <ul>
        {#each namedCharacter.abilities as ability}
          <li><strong>{ability.name}:</strong> {ability.description}</li>
        {/each}
      </ul>
    {/if}

    {#if namedCharacter.carried.length > 0}
      <h3>Equipment</h3>
      <ul>
        {#each namedCharacter.carried as item}
          <li>{item.name}</li>
        {/each}
      </ul>
    {/if}
  {/if}
</GeneratorPage>

<style>
  .character-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .character-referenced-arms {
    font-style: italic;
    opacity: 0.9;
  }

  button.character-heraldry {
    width: 200px;
    height: 220px;
    margin-bottom: 0.5rem;
  }

  button.heraldry-block-target {
    /* A wrapper around an image, not a plate: it opts out of the fill and the keyline, and out of
       the corner cut with them, which would otherwise clip the emblem's corners. */
    border: none;
    background: none;
    box-shadow: none;
    clip-path: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }

  button.heraldry-block-target:hover {
    opacity: 0.85;
  }
</style>
