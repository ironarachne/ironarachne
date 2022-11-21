<script lang="ts">
  import * as RND from "../modules/random";
  import * as Gen from "../modules/swn/starship";

  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let starship = Gen.generate();

  function generate() {
    random.use(seedrandom(seed));
    starship = Gen.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  function save() {
    let starshipDescription = Gen.formatAsText(starship);

    const blob = new Blob([starshipDescription], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "swn-starship.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<svelte:head>
  <title>Stars Without Number Starship Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Stars Without Number Starship Generator</h1>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>
  <button on:click={save}>Save</button>

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
    {new Intl.NumberFormat("en-US").format(starship.totalCost)} credits
  </p>
  <p>
    <strong>Total Crew Cost:</strong>
    {new Intl.NumberFormat("en-US").format(starship.currentCrew * 43800)}
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
      {weapon.name} ({weapon.damage}, {weapon.qualities.join(", ")})
    </div>
  {/each}

  <h4>Defenses</h4>

  {#each starship.defenses as defense}
    <div>
      {defense.name}: {defense.effect}
    </div>
  {/each}
</section>
