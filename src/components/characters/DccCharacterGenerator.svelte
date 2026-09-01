<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { RNG } from '@ironarachne/rng';
  import {
    buildCharacterNameSource,
    dccOccupationToNameSetHint,
    nameGeneratorSetForSource,
    rollCharacterNameForSource,
    loadCulturesForNaming,
  } from '$lib/characters';
  import type { ArtifactReference } from '$lib/artifacts';
  import type { Culture } from '$lib/culture';
  import Download from '$lib/download';
  import * as DCC from '$lib/dcc';
  import type { DccAncestry, DCCCharacter, DccCharacterGeneratorConfigRecord } from '$lib/dcc';
  import { onMount } from 'svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/fantasy/dcc/character';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. That is the whole of requirement 2.2's
   * fix here: the clock decides where the sequence of seeds *starts*, and everything after it is a
   * pure function of the seed on screen. This page used to draw three separate values off an RNG it
   * reseeded from the seed box each press, so the seed described only part of what it produced.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let allowDwarves = $state(true);
  let allowElves = $state(true);
  let allowHalflings = $state(true);
  let allowHumans = $state(true);

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
   * The link, recorded only when the character on screen was actually named from that culture.
   *
   * Gated on the roll rather than on the picker, as the AD&D generator gates its own: a reference is
   * a record of what the tool was handed, and one written for a character whose names came from
   * somewhere else would claim an input that was never used.
   */
  let rolledCultureReference = $state.raw<ArtifactReference | undefined>();

  /**
   * The rolled character.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array and object in
   * the character in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy
   * outright, so saving fails with `could not be cloned`. The same trap is written up in
   * `$lib/workshop`'s README beside `saveToolArtifact`.
   */
  let character = $state.raw<DCCCharacter | null>(null);
  /** The settings the character on screen was actually rolled with. Raw, for the same reason. */
  let rolledConfig = $state.raw<Record<string, unknown>>({});
  let downloadingPdf = $state(false);

  const allowedOccupations = $derived<DccAncestry[]>(
    [
      allowDwarves ? ('dwarf' as const) : undefined,
      allowElves ? ('elf' as const) : undefined,
      allowHalflings ? ('halfling' as const) : undefined,
      allowHumans ? ('human' as const) : undefined,
    ].filter((entry): entry is DccAncestry => entry !== undefined),
  );

  /**
   * Every table switched off is a setting the generator cannot honour — it would be drawing an
   * occupation from an empty list — so Generate is disabled rather than left to fail.
   */
  const noTablesChosen = $derived(allowedOccupations.length === 0);

  /** The character with the names the page is showing, which is what the sheet and exports want. */
  const namedCharacter = $derived<DCCCharacter | null>(
    character === null ? null : { ...character, firstName, lastName },
  );

  const characterSnapshot = $derived(
    namedCharacter === null ? null : DCC.toDccCharacterSnapshot(namedCharacter),
  );

  const defaultArtifactName = $derived(`${firstName} ${lastName}`.trim());

  const spellsKnown = $derived(
    namedCharacter === null ? '' : DCC.formatDccSpellsKnown(namedCharacter.spellsKnown),
  );

  /** The settings a roll takes, and the ones provenance records. */
  function currentConfig(): DccCharacterGeneratorConfigRecord {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
    const nameGeneratorSet = nameGeneratorSetForSource(source);
    return {
      allowedOccupations,
      ...(nameGeneratorSet === '' ? {} : { nameGeneratorSet }),
    };
  }

  function generate() {
    if (noTablesChosen) {
      return;
    }
    if (!lockSeed) {
      seed = rng.randomString(13);
    }

    const lockedFirstName = firstName;
    const lockedLastName = lastName;

    const config = currentConfig();
    const rolled = DCC.rollDccCharacter(seed, config);
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
    if (lockName || character === null) {
      return;
    }
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
    const generated = rollCharacterNameForSource(
      new RNG(`${Date.now()}-dcc-name`),
      source,
      dccOccupationToNameSetHint(character.occupation.name),
      'random',
      character.gender,
    );
    firstName = generated.firstName;
    lastName = generated.lastName;
  }

  async function downloadPdf() {
    if (downloadingPdf || namedCharacter === null) {
      return;
    }

    downloadingPdf = true;
    try {
      await DCC.downloadDccCharacterPdf(namedCharacter);
    } finally {
      downloadingPdf = false;
    }
  }

  function exportMarkdown() {
    if (namedCharacter === null) {
      return;
    }
    const markdown = DCC.dccCharacterToMarkdown(namedCharacter);
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${DCC.dccCharacterFileStem(namedCharacter)}.md`);
    URL.revokeObjectURL(url);
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

<GeneratorPage toolPath={TOOL_PATH} title="Dungeon Crawl Classics Character Generator">
  {#snippet description()}
    <p>This is a DCC 0-level character generator.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <CheckboxField id="allowDwarves" label="Allow Dwarves" bind:checked={allowDwarves} />

  <CheckboxField id="allowElves" label="Allow Elves" bind:checked={allowElves} />

  <CheckboxField id="allowHalflings" label="Allow Halflings" bind:checked={allowHalflings} />

  <CheckboxField id="allowHumans" label="Allow Humans" bind:checked={allowHumans} />

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
    seed="dcc-name-sets"
    onGenerateName={generateNameOnly}
  />

  <BaseButton onclick={generate} disabled={noTablesChosen}>Generate</BaseButton>

  {#if noTablesChosen}
    <p class="dcc-no-tables">
      Allow at least one kind of occupation. With all four switched off there is no table to roll a
      villager from.
    </p>
  {/if}

  <SaveArtifactButton
    kind={DCC.DCC_CHARACTER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={characterSnapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
    references={rolledCultureReference === undefined ? [] : [rolledCultureReference]}
  />

  {#if namedCharacter}
    <h2>{namedCharacter.firstName} {namedCharacter.lastName}</h2>

    <p>A level {namedCharacter.level} {namedCharacter.occupation.name}</p>

    <div class="dcc-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf} />
    </div>

    <StatBlock>
      <Stat label="XP">{namedCharacter.xp}</Stat>
      <Stat label="HP">{namedCharacter.hp}</Stat>
      <Stat label="AC">{namedCharacter.armorClass}</Stat>
      <Stat label="Currency">{DCC.formatDccCurrency(namedCharacter.currency)}</Stat>
      <Stat label="Alignment">{namedCharacter.alignment}</Stat>
      <Stat label="Gender">{namedCharacter.gender}</Stat>
      <Stat label="Speed">{namedCharacter.speed}'</Stat>
    </StatBlock>

    <h3>Attributes</h3>

    <Stat label="Strength">
      {namedCharacter.strength.value} ({DCC.formatDccModifier(namedCharacter.strength.modifier)})
    </Stat>
    <Stat label="Agility">
      {namedCharacter.agility.value} ({DCC.formatDccModifier(namedCharacter.agility.modifier)})
    </Stat>
    <Stat label="Stamina">
      {namedCharacter.stamina.value} ({DCC.formatDccModifier(namedCharacter.stamina.modifier)})
    </Stat>
    <Stat label="Personality">
      {namedCharacter.personality.value} ({DCC.formatDccModifier(
        namedCharacter.personality.modifier,
      )})
    </Stat>
    <Stat label="Intelligence">
      {namedCharacter.intelligence.value} ({DCC.formatDccModifier(
        namedCharacter.intelligence.modifier,
      )})
    </Stat>
    <Stat label="Luck">
      {namedCharacter.luck.value} ({DCC.formatDccModifier(namedCharacter.luck.modifier)})
    </Stat>

    <h3>Other Stats</h3>

    <Stat label="Lucky Roll">
      {DCC.formatDccLuckySign(namedCharacter.luckyRoll)}
    </Stat>

    <h3>Saving Throws</h3>

    <StatBlock>
      <Stat label="Fortitude">{DCC.formatDccModifier(namedCharacter.fortitudeSave)}</Stat>
      <Stat label="Reflex">{DCC.formatDccModifier(namedCharacter.reflexSave)}</Stat>
      <Stat label="Willpower">{DCC.formatDccModifier(namedCharacter.willpowerSave)}</Stat>
    </StatBlock>

    <h3>Spellcasting</h3>

    <StatBlock>
      <Stat label="Spells Known">{spellsKnown}</Stat>
      <Stat label="Wizard Max Spell Level">{namedCharacter.wizardMaxSpellLevel}</Stat>
      <Stat label="Cleric Max Spell Level">{namedCharacter.clericMaxSpellLevel}</Stat>
    </StatBlock>

    <h3>Weapons</h3>

    <ul>
      {#each namedCharacter.weapons as weapon}
        <li>{weapon.name}: {weapon.damage} dmg, {weapon.range} range</li>
      {/each}
    </ul>

    <h3>Languages</h3>

    <ul>
      {#each namedCharacter.languages as language}
        <li>{language}</li>
      {/each}
    </ul>

    <h3>Equipment</h3>

    <ul>
      {#each namedCharacter.equipment as item}
        <li>{item.name}</li>
      {/each}
    </ul>

    <h3>Special Rules</h3>

    <ul>
      {#each namedCharacter.specialRules as rule}
        <li>{rule}</li>
      {/each}
    </ul>
  {/if}
</GeneratorPage>

<style>
  .dcc-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .dcc-no-tables {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
