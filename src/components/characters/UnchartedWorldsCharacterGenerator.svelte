<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import * as UW from '$lib/unchartedworlds';
  import type { UWCharacter } from '$lib/unchartedworlds';
  import { RNG } from '@ironarachne/rng';
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

  const TOOL_PATH = '/unchartedworlds/character';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. That is the whole of requirement 2.2's
   * fix here: the clock decides where the sequence of seeds *starts*, and everything after it is a
   * pure function of the seed on screen. The names in particular used to come from
   * `` `${Date.now()}-uw-name` ``, so a locked seed reproduced a career and an origin belonging to
   * somebody with a different name every time.
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
   * Gated on the roll rather than on the picker, as the other character generators gate their own:
   * a reference is a record of what the tool was handed, and one written for a character whose
   * names came from somewhere else would claim an input that was never used.
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
  let character = $state.raw<UWCharacter | null>(null);
  /** The settings the character on screen was actually rolled with. Raw, for the same reason. */
  let rolledConfig = $state.raw<Record<string, unknown>>({});
  let downloadingPdf = $state(false);

  /** The character with the names the page is showing, which is what the sheet and exports want. */
  const namedCharacter = $derived<UWCharacter | null>(
    character === null ? null : { ...character, firstName, lastName },
  );

  const characterSnapshot = $derived(
    namedCharacter === null ? null : UW.toUwCharacterSnapshot(namedCharacter),
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
  function currentConfig(): UW.UwCharacterGeneratorConfigRecord {
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
    const rolled = UW.rollUwCharacter(seed, config);
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
      new RNG(`${Date.now()}-uw-name`),
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
      await UW.downloadUwCharacterPdf(namedCharacter);
    } finally {
      downloadingPdf = false;
    }
  }

  function exportMarkdown() {
    if (namedCharacter === null) {
      return;
    }
    const markdown = UW.uwCharacterToMarkdown(namedCharacter);
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }));
    Download(url, `${UW.uwCharacterFileStem(namedCharacter)}.md`);
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

<GeneratorPage toolPath={TOOL_PATH} title="Uncharted Worlds Character Generator">
  {#snippet description()}
    <p>Generate starting characters for Uncharted Worlds.</p>
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
    seed="uw-name-sets"
    onGenerateName={generateNameOnly}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={UW.UW_CHARACTER_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={characterSnapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
    references={rolledCultureReference === undefined ? [] : [rolledCultureReference]}
  />

  {#if namedCharacter}
    <h2>{UW.uwCharacterDisplayName(namedCharacter)}</h2>

    <div class="uw-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf} />
    </div>

    <h3>Statistics</h3>

    <StatBlock>
      <Stat label="Physique">{UW.formatUwStat(namedCharacter.stats.physique)}</Stat>
      <Stat label="Mettle">{UW.formatUwStat(namedCharacter.stats.mettle)}</Stat>
      <Stat label="Expertise">{UW.formatUwStat(namedCharacter.stats.expertise)}</Stat>
      <Stat label="Influence">{UW.formatUwStat(namedCharacter.stats.influence)}</Stat>
      <Stat label="Interface">{UW.formatUwStat(namedCharacter.stats.interface)}</Stat>
    </StatBlock>

    <h2>Careers</h2>

    {#each namedCharacter.careers as career}
      <div>{career.name}</div>
    {/each}

    <h2>Origin</h2>

    <p>{namedCharacter.origin.name}</p>

    <h2>Descriptors</h2>

    <p>{namedCharacter.descriptors}</p>

    <h2>Skills</h2>

    <ul class="skills">
      {#each namedCharacter.skills as skill}
        <li class="skill">
          <p class="skill-name"><strong>{skill.name}</strong></p>
          {#each UW.parseSkillDescription(skill.description) as block}
            {#if block.kind === 'options'}
              <ul class="skill-options">
                {#each block.items as item}
                  <li>{item}</li>
                {/each}
              </ul>
            {:else}
              <p class="skill-line">{block.text}</p>
            {/if}
          {/each}
        </li>
      {/each}
    </ul>

    <h2>Advancement</h2>

    <p>{namedCharacter.advancement}</p>

    <h2>Assets</h2>

    <div class="asset">
      <h4>Workspace: {namedCharacter.workspace.name}</h4>
      <p>{namedCharacter.workspace.description}</p>
    </div>

    {#each namedCharacter.assets as asset}
      <div>
        <h4>{asset.name}</h4>
        <p>{asset.description}</p>
        {#if asset.upgrades.length > 0}
          <ul>
            {#each asset.upgrades as upgrade}
              <li>
                <strong>{upgrade.name}:</strong>
                {upgrade.description}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  {/if}
</GeneratorPage>

<style>
  .uw-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  ul.skills > li.skill {
    list-style-type: none;
    margin-left: 0;
    margin-bottom: 1.25rem;
  }

  p.skill-name,
  p.skill-line {
    margin: 0 0 0.35rem;
  }

  ul.skill-options {
    margin: 0 0 0.35rem;
  }

  ul.skill-options > li {
    list-style-type: disc;
    margin-left: 1.5rem;
  }
</style>
