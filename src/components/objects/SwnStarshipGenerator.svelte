<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';

  import BaseButton from '$components/common/BaseButton.svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  // Deep by necessity: `$lib/swn` also carries the character PDF renderer, which reaches
  // `$lib/characters` and from there the whole species table. Going through the entry point put
  // 19 MB of it on a page that only builds a starship. The four modules below are the starship's
  // own, and none of them reaches the character side.
  import { SWN_STARSHIP_ARTIFACT_KIND, swnStarshipName } from '$lib/swn/swn_starship_artifact_kind';
  import {
    formatSwnCredits,
    formatSwnStarshipFitting,
    formatSwnStarshipWeapon,
    swnStarshipDisplayName,
    swnStarshipFileStem,
    swnStarshipToMarkdown,
    swnStarshipToText,
    SWN_CREW_COST_PER_YEAR,
  } from '$lib/swn/swn_starship_presentation';
  import { rollSwnStarship } from '$lib/swn/swn_starship_roll';
  import { toSwnStarshipSnapshot } from '$lib/swn/swn_starship_snapshot';
  import type { SwnStarshipSnapshot } from '$lib/swn/swn_starship_snapshot';

  const TOOL_PATH = '/swn/starship';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. That is the whole of requirement 2.2's
   * fix here: the page used to reseed this from the seed field inside an `$effect` *and* again
   * inside `generate()`, so the seed of the next press depended on the text of the previous one.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  /**
   * The ship on screen, held as its stored form.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every array and object in a
   * Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so saving
   * fails with `could not be cloned`. The same trap is written up in `$lib/workshop`'s README
   * beside `saveToolArtifact`.
   *
   * The snapshot rather than the live `SWNStarship` because it is what every consumer on this page
   * wants: the save control stores it, and the exports read it. The live form differs only in
   * holding the whole owner type, whose closures nothing here calls.
   */
  let ship = $state.raw<SwnStarshipSnapshot | null>(null);

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    ship = toSwnStarshipSnapshot(rollSwnStarship(seed));
  }

  function exportMarkdown() {
    if (ship === null) return;
    downloadTextFile(
      swnStarshipToMarkdown(ship),
      `${swnStarshipFileStem(ship)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (ship === null) return;
    await downloadTextPdf(
      swnStarshipDisplayName(ship),
      swnStarshipToText(ship),
      `${swnStarshipFileStem(ship)}.pdf`,
    );
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Stars Without Number Starship Generator">
  {#snippet description()}
    <p>
      Generate a starship for Stars Without Number: a hull, a crew, and everything bolted to it.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={SWN_STARSHIP_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    snapshot={ship}
    {seed}
    defaultName={ship === null ? '' : swnStarshipName(ship)}
  />

  {#if ship}
    <h2>{swnStarshipDisplayName(ship)}</h2>

    <div class="ship-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
    </div>

    <StatBlock>
      <Stat label="Owner Type">{ship.ownerTypeName}</Stat>
      <Stat label="Manufacturer">{ship.manufacturer}</Stat>
      <Stat label="Model">{ship.className}</Stat>
      <Stat label="Hull Type">{ship.hullType.name}</Stat>
      <Stat label="Hull Class">{ship.hullType.hullClassName}</Stat>
      <Stat label="Drive">{ship.drive.name}</Stat>
    </StatBlock>
    <Stat label="Mass">
      {ship.usedMass}/{ship.hullType.mass}
      ({ship.hullType.mass - ship.usedMass} free)
    </Stat>
    <Stat label="Power">
      {ship.usedPower}/{ship.hullType.power}
      ({ship.hullType.power - ship.usedPower} free)
    </Stat>
    <Stat label="Hardpoints">
      {ship.usedHardPoints}/{ship.hullType.hardPoints}
      ({ship.hullType.hardPoints - ship.usedHardPoints} free)
    </Stat>
    <StatBlock>
      <Stat label="Speed">{ship.hullType.speed}</Stat>
      <Stat label="Armor">{ship.hullType.armor}</Stat>
      <Stat label="AC">{ship.hullType.ac}</Stat>
      <Stat label="HP">{ship.hullType.hp}</Stat>
      <Stat label="Minimum Crew">{ship.hullType.crewMinimum}</Stat>
      <Stat label="Maximum Crew">{ship.hullType.crewMaximum}</Stat>
      <Stat label="Current Crew">{ship.currentCrew}</Stat>
    </StatBlock>
    <Stat label="Total Ship Value">{formatSwnCredits(ship.totalCost)}</Stat>
    <Stat label="Total Crew Cost">
      {formatSwnCredits(ship.currentCrew * SWN_CREW_COST_PER_YEAR)} per year
    </Stat>
    <StatBlock>
      <Stat label="Crew Skill">{ship.hullType.crewSkill}</Stat>
      <Stat label="Cargo Space">{ship.tonsOfCargo} tons</Stat>
    </StatBlock>

    <!-- 6.4 on screen as well as in the exports: an unarmed free merchant, which is most of what
         this generator rolls, used to show a Weapons heading and a Defenses heading over nothing. -->
    {#if ship.fittings.length > 0}
      <h3>Fittings</h3>

      <ul class="ship-list">
        {#each ship.fittings as fitting, index (index)}
          <li>{formatSwnStarshipFitting(fitting)}</li>
        {/each}
      </ul>
    {/if}

    {#if ship.weapons.length > 0}
      <h3>Weapons</h3>

      <ul class="ship-list">
        {#each ship.weapons as weapon, index (index)}
          <li>{formatSwnStarshipWeapon(weapon)}</li>
        {/each}
      </ul>
    {/if}

    {#if ship.defenses.length > 0}
      <h3>Defenses</h3>

      <ul class="ship-list">
        {#each ship.defenses as defense, index (index)}
          <li>{formatSwnStarshipFitting(defense)}</li>
        {/each}
      </ul>
    {/if}
  {/if}
</GeneratorPage>

<style>
  .ship-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ship-list {
    margin: 0 0 var(--s4);
    padding-left: 1.25rem;
  }
</style>
