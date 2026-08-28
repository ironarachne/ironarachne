<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { resolve } from '$app/paths';
  import AdndCharacterSheet from '$components/characters/AdndCharacterSheet.svelte';
  import {
    ADND_CHARACTER_ARTIFACT_KIND,
    downloadAdndCharacterPdf,
    rollAdndCharacter,
    toAdndCharacterSnapshot,
  } from '$lib/adnd';
  import type { ADNDCharacter, AdndCharacterGeneratorConfigRecord } from '$lib/adnd';
  import {
    buildCharacterNameSource,
    isCustomCharacterNameSource,
    nameGeneratorSetForSource,
    restoreLockedCharacterName,
    rollCharacterNameForSource,
    loadCulturesForNaming,
  } from '$lib/characters';
  import type { ArtifactReference } from '$lib/artifacts';
  import type { Culture } from '$lib/culture';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/fantasy/adnd/character';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let includeProficiencies = $state(false);
  let includeKits = $state(false);
  /**
   * The rolled character.
   *
   * `$state.raw`, and this is not a preference. Deep-reactive `$state` wraps every array and
   * object inside the character in a Proxy, and `structuredClone` — what IndexedDB stores with —
   * refuses a Proxy outright. Saving failed with
   * `[object Array] could not be cloned` and kept failing until an end-to-end test tried it: no
   * unit test touches Svelte state, so nothing below the browser could see it. The same trap is
   * written up in `$lib/workshop`'s README beside `saveToolArtifact`, and guarding the config
   * alone was not enough — the payload goes to the same place.
   */
  let character = $state.raw<ADNDCharacter | undefined>();
  let downloadingPdf = $state(false);
  /**
   * The settings the character on screen was actually rolled with.
   *
   * `$state.raw` rather than `$state`, and that is not a style choice: IndexedDB serialises with
   * `structuredClone`, which refuses a Proxy, so a deep-reactive config fails the write with
   * `could not be cloned`. A roll replaces the whole record rather than mutating it. The same trap
   * is written up in `$lib/workshop`'s README beside `saveToolArtifact`.
   */
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
  let namingGender = $state<'male' | 'female' | 'random'>('random');
  /** The culture the picker loaded, and the link to record for it. */
  let referencedCulture = $state<Culture | undefined>();
  let cultureReference = $state<ArtifactReference | undefined>();
  /**
   * The link, recorded only when the character on screen was actually named from that culture.
   *
   * Gated on the roll rather than on the picker, for the reason the settlement generator gates
   * its own: a reference is a record of what the tool was handed, and one written for a character
   * whose names came from somewhere else would claim an input that was never used.
   */
  let rolledCultureReference = $state.raw<ArtifactReference | undefined>();

  /** The character with the names the page is showing, which is what the sheet and the PDF want. */
  const namedCharacter = $derived(
    character === undefined ? undefined : { ...character, firstName, lastName },
  );

  /**
   * What gets stored, with the names the page is showing rather than the ones the roll produced.
   *
   * The two differ whenever the user has typed a name or locked one, and the sheet below already
   * renders the character that way. Saving the roll's name instead would keep something the user
   * can see is not what they asked for.
   */
  const characterSnapshot = $derived(
    namedCharacter === undefined ? null : toAdndCharacterSnapshot(namedCharacter),
  );

  const defaultArtifactName = $derived(`${firstName} ${lastName}`.trim());

  /**
   * Names for the current source, from a stream the seed decides.
   *
   * `nameSeed` is what makes requirement 2.2 true here. This used to draw from
   * `new RNG(\`${Date.now()}-adnd-name\`)`, so a locked seed reproduced the character's body and
   * a different name every time — the tool was not in fact deterministic. The one caller that
   * still wants a fresh draw is the "generate a name" button, which passes its own value because
   * asking for another name is a deliberate act rather than part of the roll.
   */
  function rollNamesForCurrentSource(defaultHint: string, nameSeed: string) {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
    const nameRng = new RNG.RNG(nameSeed);
    return rollCharacterNameForSource(nameRng, source, defaultHint, namingGender);
  }

  function applyGeneratedNamesFromSource(target: ADNDCharacter, defaultHint: string) {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
    if (!isCustomCharacterNameSource(source)) {
      target.firstName = '';
      target.lastName = '';
      firstName = '';
      lastName = '';
      return;
    }

    const generated = rollNamesForCurrentSource(defaultHint, `${seed}-adnd-name`);
    target.firstName = generated.firstName;
    target.lastName = generated.lastName;
    firstName = generated.firstName;
    lastName = generated.lastName;
  }

  /**
   * The settings a roll takes, and the ones provenance records.
   *
   * `nameGeneratorSet` is the preset set only. A character named from a saved culture takes its
   * names from that culture's own generators, which are not one of the build's named sets — that
   * link is an artifact reference, and recording it is composition's job rather than this step's.
   */
  /**
   * The settings a roll takes, and the ones provenance records.
   *
   * `nameGeneratorSet` comes from whichever source is chosen: a preset records its own name, and a
   * culture records the pattern set its generators carry. That second case is what lets a re-roll
   * produce names of the same tongue without reaching back into the store for an artifact it has
   * no way to ask for — the bargain `$lib/settlements` and `$lib/religion` already make.
   */
  function currentConfig(): AdndCharacterGeneratorConfigRecord {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
    const nameGeneratorSet = nameGeneratorSetForSource(source);
    return {
      ...(nameGeneratorSet === '' ? {} : { nameGeneratorSet }),
      namingGender,
      includeProficiencies,
      includeKits,
    };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }

    const lockedFirstName = firstName;
    const lockedLastName = lastName;

    const config = currentConfig();
    const rolled = rollAdndCharacter(seed, config);
    character = rolled.character;
    // The resolved set, not the requested one: a set this build has since dropped would otherwise
    // be recorded as provenance that a re-roll could not honour.
    rolledConfig = { ...config, nameGeneratorSet: rolled.nameGeneratorSet };
    rolledCultureReference =
      nameSourceKind === 'referenced_culture' && referencedCulture !== undefined
        ? cultureReference
        : undefined;

    if (lockName) {
      restoreLockedCharacterName(character, lockedFirstName, lockedLastName);
    } else if (nameSourceKind === 'preset' || nameSourceKind === 'referenced_culture') {
      // Already named by the roll, from the seed. Mirror it into the fields the page shows.
      firstName = character.firstName;
      lastName = character.lastName;
    } else {
      applyGeneratedNamesFromSource(character, character.race.name);
    }
  }

  function generateNameOnly() {
    if (lockName) {
      return;
    }
    const defaultHint = character?.race.name ?? 'human';
    // A fresh stream, deliberately: asking for another name is the one place a clock-driven draw
    // is right, because the user is asking for something different rather than for this roll.
    const generated = rollNamesForCurrentSource(defaultHint, `${Date.now()}-adnd-name`);
    firstName = generated.firstName;
    lastName = generated.lastName;
    // The character is not touched: it is raw state, and every reader already composes the names
    // the page is showing over it.
  }

  async function downloadPdf() {
    const sheet = namedCharacter;
    if (downloadingPdf || sheet === undefined) {
      return;
    }

    downloadingPdf = true;
    try {
      await downloadAdndCharacterPdf(sheet);
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
    generate();
  });
</script>

<GeneratorPage
  toolPath="/fantasy/adnd/character"
  theme="fantasy"
  title="AD&D 2e Character Generator"
>
  {#snippet description()}
    <p>This is an AD&D 2e character generator.</p>

    <p>
      <a href={resolve('/fantasy/adnd/character/build')}>User-directed character builder</a> (dice for
      attributes only).
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <div class="input-group">
    <input
      type="checkbox"
      name="includeProficiencies"
      bind:checked={includeProficiencies}
      id="includeProficiencies"
    />
    <label for="includeProficiencies">Include proficiencies (weapon and nonweapon)</label>
  </div>

  <div class="input-group">
    <input type="checkbox" name="includeKits" bind:checked={includeKits} id="includeKits" />
    <label for="includeKits">Include character kit (optional sub-archetype)</label>
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
    bind:namingGender
    showGenderPicker={true}
    seed="adnd-name-sets"
    onGenerateName={generateNameOnly}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>
  <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf || !character} />

  <SaveArtifactButton
    kind={ADND_CHARACTER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={characterSnapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
    references={rolledCultureReference === undefined ? [] : [rolledCultureReference]}
  />

  {#if character}
    <AdndCharacterSheet character={namedCharacter!} />
  {/if}
</GeneratorPage>
