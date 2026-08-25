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
    restoreLockedCharacterName,
    rollCharacterNameForSource,
    loadCulturesForNaming,
  } from '$lib/characters';
  import type { Culture } from '$lib/culture';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';

  const TOOL_PATH = '/fantasy/adnd/character';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  let includeProficiencies = $state(false);
  let includeKits = $state(false);
  let character = $state<ADNDCharacter | undefined>();
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
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture'>('default');
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);
  let namingGender = $state<'male' | 'female' | 'random'>('random');

  /**
   * What gets stored, with the names the page is showing rather than the ones the roll produced.
   *
   * The two differ whenever the user has typed a name or locked one, and the sheet below already
   * renders the character that way. Saving the roll's name instead would keep something the user
   * can see is not what they asked for.
   */
  const characterSnapshot = $derived(
    character === undefined ? null : toAdndCharacterSnapshot({ ...character, firstName, lastName }),
  );

  const defaultArtifactName = $derived(`${firstName} ${lastName}`.trim());

  function applyNamesToCharacter(target: ADNDCharacter | undefined) {
    if (!target) {
      return;
    }
    target.firstName = firstName;
    target.lastName = lastName;
  }

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
  function currentConfig(): AdndCharacterGeneratorConfigRecord {
    return {
      ...(nameSourceKind === 'preset' ? { nameGeneratorSet: presetSetName } : {}),
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

    if (lockName) {
      restoreLockedCharacterName(character, lockedFirstName, lockedLastName);
    } else if (nameSourceKind === 'preset') {
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
    if (character) {
      character.firstName = generated.firstName;
      character.lastName = generated.lastName;
    }
  }

  async function downloadPdf() {
    if (downloadingPdf || !character) {
      return;
    }

    applyNamesToCharacter(character);
    downloadingPdf = true;
    try {
      await downloadAdndCharacterPdf(character);
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

  <button onclick={generate}>Generate</button>
  <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf || !character} />

  <SaveArtifactButton
    kind={ADND_CHARACTER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={characterSnapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
  />

  {#if character}
    <AdndCharacterSheet character={{ ...character, firstName, lastName }} />
  {/if}
</GeneratorPage>
