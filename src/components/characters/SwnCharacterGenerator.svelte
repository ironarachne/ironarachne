<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { RNG } from '@ironarachne/rng';
  import * as SWN from '$lib/swn';
  import type { SWNCharacter } from '$lib/swn';
  import {
    buildCharacterNameSource,
    nameGeneratorSetForSource,
    rollCharacterNameForSource,
    loadCulturesForNaming,
  } from '$lib/characters';
  import type { ArtifactReference } from '$lib/artifacts';
  import type { Culture } from '$lib/culture';
  import Download from '$lib/download';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/swn/character';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. That is the whole of requirement 2.2's
   * fix here: the clock decides where the sequence of seeds *starts*, and everything after it is a
   * pure function of the seed on screen. The names in particular used to come from
   * `` `${Date.now()}-swn-name` ``, so the same seed reproduced a body and never the person.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

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
   * Gated on the roll rather than on the picker, as the AD&D and DCC generators gate their own: a
   * reference is a record of what the tool was handed, and one written for a character whose names
   * came from somewhere else would claim an input that was never used.
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
  let character = $state.raw<SWNCharacter | null>(null);
  /** The settings the character on screen was actually rolled with. Raw, for the same reason. */
  let rolledConfig = $state.raw<Record<string, unknown>>({});
  let downloadingPdf = $state(false);

  /** The character with the names the page is showing, which is what the sheet and exports want. */
  const namedCharacter = $derived<SWNCharacter | null>(
    character === null ? null : { ...character, firstName, lastName },
  );

  const characterSnapshot = $derived(
    namedCharacter === null ? null : SWN.toSwnCharacterSnapshot(namedCharacter),
  );

  const defaultArtifactName = $derived(`${firstName} ${lastName}`.trim());

  function currentNameSource() {
    return buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
    );
  }

  /** The settings a roll takes, and the ones provenance records. */
  function currentConfig(): SWN.SwnCharacterGeneratorConfigRecord {
    const nameGeneratorSet = nameGeneratorSetForSource(currentNameSource());
    return {
      namingGender,
      ...(nameGeneratorSet === '' ? {} : { nameGeneratorSet }),
    };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }

    const lockedFirstName = firstName;
    const lockedLastName = lastName;

    const config = currentConfig();
    const rolled = SWN.rollSwnCharacter(seed, config);
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
   * something a seed reproduces. This is also the one path that names from a chosen culture's own
   * generators rather than from the pattern set recorded beside it.
   */
  function generateNameOnly() {
    if (lockName || character === null) {
      return;
    }
    const generated = rollCharacterNameForSource(
      new RNG(`${Date.now()}-swn-name`),
      currentNameSource(),
      'human',
      namingGender,
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
      await SWN.downloadSwnCharacterPdf(namedCharacter);
    } finally {
      downloadingPdf = false;
    }
  }

  function exportMarkdown() {
    if (namedCharacter === null) {
      return;
    }
    const markdown = SWN.swnCharacterToMarkdown(namedCharacter);
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${SWN.swnCharacterFileStem(namedCharacter)}.md`);
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

<GeneratorPage toolPath={TOOL_PATH} title="Stars Without Number Character Generator">
  {#snippet description()}
    <p>This is a first-level Stars Without Number character generator.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

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
    seed="swn-name-sets"
    onGenerateName={generateNameOnly}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={SWN.SWN_CHARACTER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={characterSnapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
    references={rolledCultureReference === undefined ? [] : [rolledCultureReference]}
  />

  {#if namedCharacter}
    <h2>{SWN.swnCharacterDisplayName(namedCharacter)}</h2>

    <p>A {namedCharacter.background.name} {namedCharacter.characterClass.name}</p>

    <div class="swn-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf} />
    </div>

    <StatBlock>
      <Stat label="Background">{namedCharacter.background.name}</Stat>
      <Stat label="Class">{namedCharacter.characterClass.name}</Stat>
      <Stat label="Hit Points">{namedCharacter.hitPoints}</Stat>
      {#if namedCharacter.effort > 0}
        <Stat label="Effort">{namedCharacter.effort}</Stat>
      {/if}
      <Stat label="Base Attack Bonus">{SWN.formatSwnModifier(namedCharacter.attackBonus)}</Stat>
      <Stat label="Armor Class">{namedCharacter.armorClassEquipped}</Stat>
      <Stat label="Credits">{namedCharacter.credits}</Stat>
    </StatBlock>

    <h3>Saving Throws</h3>

    <StatBlock>
      <Stat label="Evasion">{namedCharacter.savingThrowEvasion}</Stat>
      <Stat label="Mental">{namedCharacter.savingThrowMental}</Stat>
      <Stat label="Physical">{namedCharacter.savingThrowPhysical}</Stat>
    </StatBlock>

    <h3>Focuses</h3>

    {#each namedCharacter.focuses as focus}
      <div>
        <strong>{focus.name}</strong>, Level {focus.currentLevel}
      </div>
    {/each}

    <h3>Stats</h3>

    <div class="stats">
      {#each namedCharacter.stats as stat}
        <div>
          <strong>{stat.abbreviation}:</strong>
          <span>{stat.score} ({SWN.formatSwnModifier(stat.modifier)})</span>
        </div>
      {/each}
    </div>

    <h3>Skills</h3>

    <div class="skills">
      {#each namedCharacter.skills as skill}
        <div>
          {SWN.formatSwnSkill(skill)}
        </div>
      {/each}
    </div>

    <h3>Abilities</h3>

    <div class="abilities">
      {#each namedCharacter.abilities as ability}
        <div>
          {ability.description}
        </div>
      {/each}
    </div>

    <h3>Weapons</h3>

    <div class="weapons">
      {#each namedCharacter.rangedWeapons as weapon}
        <div>
          {SWN.formatSwnWeaponLine(weapon, namedCharacter.rangedAttackBonus)}
        </div>
      {/each}
      {#each namedCharacter.meleeWeapons as weapon}
        <div>
          {SWN.formatSwnWeaponLine(weapon, namedCharacter.meleeAttackBonus)}
        </div>
      {/each}
    </div>

    <h3>Armor</h3>

    <div class="armor">
      {#each namedCharacter.armor as item}
        <div>{item.name}: AC {item.ac}</div>
      {/each}
    </div>

    <h3>Equipment</h3>

    <div class="equipment">
      {#each namedCharacter.equipment as item}
        <div>{item.name}</div>
      {/each}
    </div>
  {/if}
</GeneratorPage>

<style>
  .swn-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .stats,
  .skills,
  .abilities,
  .weapons,
  .armor,
  .equipment {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }
</style>
