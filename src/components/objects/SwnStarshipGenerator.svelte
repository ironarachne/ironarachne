<script lang="ts">
  import { onMount } from 'svelte';
  import * as RNG from '@ironarachne/rng';
  import { starships as Gen } from '$lib/swn';
  import type { SWNStarship } from '$lib/swn';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';

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

<GeneratorPage theme="scifi" title="Stars Without Number Starship Generator">
  <SeedControls bind:seed bind:lockSeed />

  <button onclick={generate}>Generate</button>
  <button onclick={save}>Save</button>

  {#if starship}
    <h2>{starship.name}</h2>

    <p><strong>Owner Type:</strong> {starship.ownerType.name}</p>
    <p><strong>Manufacturer:</strong> {starship.manufacturer}</p>
    <p><strong>Model:</strong> {starship.className}</p>
    <p><strong>Hull Type:</strong> {starship.hullType.name}</p>
    <p><strong>Hull Class:</strong> {starship.hullType.hullClassName}</p>
    <p><strong>Drive:</strong> {starship.drive.name}</p>
    <p>
      <strong>Mass:</strong>
      {starship.usedMass}/{starship.hullType.mass}
      ({starship.hullType.mass - starship.usedMass} free)
    </p>
    <p>
      <strong>Power:</strong>
      {starship.usedPower}/{starship.hullType.power}
      ({starship.hullType.power - starship.usedPower} free)
    </p>
    <p>
      <strong>Hardpoints:</strong>
      {starship.usedHardPoints}/{starship.hullType.hardPoints}
      ({starship.hullType.hardPoints - starship.usedHardPoints} free)
    </p>
    <p><strong>Speed:</strong> {starship.hullType.speed}</p>
    <p><strong>Armor:</strong> {starship.hullType.armor}</p>
    <p><strong>AC:</strong> {starship.hullType.ac}</p>
    <p><strong>HP:</strong> {starship.hullType.hp}</p>
    <p><strong>Minimum Crew:</strong> {starship.hullType.crewMinimum}</p>
    <p><strong>Maximum Crew:</strong> {starship.hullType.crewMaximum}</p>
    <p><strong>Current Crew:</strong> {starship.currentCrew}</p>
    <p>
      <strong>Total Ship Value:</strong>
      {new Intl.NumberFormat('en-US').format(starship.totalCost)} credits
    </p>
    <p>
      <strong>Total Crew Cost:</strong>
      {new Intl.NumberFormat('en-US').format(starship.currentCrew * 43800)}
      credits per year
    </p>
    <p><strong>Crew Skill:</strong> {starship.hullType.crewSkill}</p>
    <p><strong>Cargo Space:</strong> {starship.tonsOfCargo} tons</p>

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
