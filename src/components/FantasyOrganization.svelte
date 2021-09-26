<script lang="ts">
  import * as Charges from "../modules/heraldry/charges";
  import * as Heraldry from "../modules/heraldry/heraldry";
  import * as Organization from "../modules/organizations/fantasy";
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";

  let seed: string = RND.randomString(13);
  let org = Organization.generate();
  let name = org.name;
  let description = org.description;
  let leadership = org.leadership.description;
  let notableMembers = org.notableMembers;
  let charges = Charges.all();
  let heraldry = Heraldry.generate(charges, 200, 200);

  function generateFantasyOrganization() {
    random.use(seedrandom(seed));
    let org = Organization.generate();
    name = org.name;
    description = org.description;
    leadership = org.leadership.description;
    notableMembers = org.notableMembers;
    heraldry = Heraldry.generate(charges, 200, 220);
  }

  function newSeed() {
    seed = RND.randomString(13);
    generateFantasyOrganization();
  }
</script>

<svelte:head>
  <title>Fantasy Organization Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Organization Generator</h2>

  <p>This generates fantasy organizations.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generateFantasyOrganization}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h3>{name}</h3>

  <div class="org-arms">{@html heraldry.svg}</div>

  <p>{description}</p>

  <p>{leadership}</p>

  <h4>Notable Members</h4>

  {#each notableMembers as member}
    <p>
      <strong
        >{member.getPrimaryTitle()}
        {member.firstName}
        {member.lastName}:</strong
      >
      {member.description}
    </p>
  {/each}
</section>

<style>
  div.org-arms {
    width: 200px;
    height: 220px;
    margin: 0 auto;
  }
</style>
