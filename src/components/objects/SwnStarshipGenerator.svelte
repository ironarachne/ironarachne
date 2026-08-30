<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import { onMount } from 'svelte';
  import * as RNG from '@ironarachne/rng';
  // Deep by necessity: `$lib/swn` also carries the character PDF renderer, which reaches
  // `$lib/characters` and from there the whole species table. Going through the entry point put
  // 19 MB of it on a page that only builds a starship. The type import below is free — it erases.
  import * as Gen from '$lib/swn/starship';
  import type { SWNStarship } from '$lib/swn';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });
  let starship: SWNStarship | null = $state(null);

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    starship = Gen.generate(rng);
  }

  function save() {
    if (!starship) return;
    const starshipDescription = Gen.formatAsText(starship);

    const blob = new Blob([starshipDescription], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'swn-starship.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath="/swn/starship" title="Stars Without Number Starship Generator">
  <SeedControls bind:seed bind:lockSeed />

  <BaseButton onclick={generate}>Generate</BaseButton>
  <BaseButton onclick={save}>Save</BaseButton>

  {#if starship}
    <h2>{starship.name}</h2>

    <StatBlock>
      <Stat label="Owner Type">{starship.ownerType.name}</Stat>
      <Stat label="Manufacturer">{starship.manufacturer}</Stat>
      <Stat label="Model">{starship.className}</Stat>
      <Stat label="Hull Type">{starship.hullType.name}</Stat>
      <Stat label="Hull Class">{starship.hullType.hullClassName}</Stat>
      <Stat label="Drive">{starship.drive.name}</Stat>
    </StatBlock>
    <Stat label="Mass">
      {starship.usedMass}/{starship.hullType.mass}
      ({starship.hullType.mass - starship.usedMass} free)
    </Stat>
    <Stat label="Power">
      {starship.usedPower}/{starship.hullType.power}
      ({starship.hullType.power - starship.usedPower} free)
    </Stat>
    <Stat label="Hardpoints">
      {starship.usedHardPoints}/{starship.hullType.hardPoints}
      ({starship.hullType.hardPoints - starship.usedHardPoints} free)
    </Stat>
    <StatBlock>
      <Stat label="Speed">{starship.hullType.speed}</Stat>
      <Stat label="Armor">{starship.hullType.armor}</Stat>
      <Stat label="AC">{starship.hullType.ac}</Stat>
      <Stat label="HP">{starship.hullType.hp}</Stat>
      <Stat label="Minimum Crew">{starship.hullType.crewMinimum}</Stat>
      <Stat label="Maximum Crew">{starship.hullType.crewMaximum}</Stat>
      <Stat label="Current Crew">{starship.currentCrew}</Stat>
    </StatBlock>
    <Stat label="Total Ship Value">
      {new Intl.NumberFormat('en-US').format(starship.totalCost)} credits
    </Stat>
    <Stat label="Total Crew Cost">
      {new Intl.NumberFormat('en-US').format(starship.currentCrew * 43800)}
      credits per year
    </Stat>
    <StatBlock>
      <Stat label="Crew Skill">{starship.hullType.crewSkill}</Stat>
      <Stat label="Cargo Space">{starship.tonsOfCargo} tons</Stat>
    </StatBlock>

    <h4>Fittings</h4>

    {#each starship.fittings as fitting}
      <div>
        {fitting.name} - {fitting.effect}
      </div>
    {/each}

    <h4>Weapons</h4>

    {#each starship.weapons as weapon}
      <div>
        {weapon.name} ({weapon.damage}, {weapon.qualities.join(', ')})
      </div>
    {/each}

    <h4>Defenses</h4>

    {#each starship.defenses as defense}
      <div>
        {defense.name}: {defense.effect}
      </div>
    {/each}
  {/if}
</GeneratorPage>
