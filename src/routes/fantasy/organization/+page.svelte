<script lang="ts">
  import * as Organization from "$lib/organizations/fantasy";
  import * as RND from "@ironarachne/rng";
  import * as Characters from "$lib/characters/characters";
  import { renderSVGAsPNG } from "$lib/images/svg";
  import random from "random";
  import seedrandom from "seedrandom";
  import HeraldryGenerator from "$lib/heraldry/generator";
  import HeraldrySVGRenderer from "$lib/heraldry/renderers/svg";

  let seed: string = RND.randomString(13);
  let org = Organization.generate();
  let name = org.name;
  let description = org.description;
  let leadership = org.leadership.description;
  let notableMembers = org.notableMembers;
  let heraldryConfig = org.organizationType.heraldryConfig;
  heraldryConfig.width = 200;
  heraldryConfig.height = 200;
  let hGen = new HeraldryGenerator();
  hGen.config = heraldryConfig;
  let heraldry = hGen.generate();
  let svgRenderer = new HeraldrySVGRenderer();

  function generate() {
    random.use(seedrandom(seed));
    let org = Organization.generate();
    name = org.name;
    description = org.description;
    leadership = org.leadership.description;
    notableMembers = org.notableMembers;
    heraldryConfig = org.organizationType.heraldryConfig;
    heraldryConfig.width = 200;
    heraldryConfig.height = 220;
    hGen.config = heraldryConfig;
    heraldry = hGen.generate();

    let svg = svgRenderer.render(heraldry.device, 200, 220);
    renderSVGAsPNG(svg, 200, 220, "org-arms");
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/fantasy.scss';

  div.org-arms {
    width: 200px;
    height: 220px;
    margin: 0 auto;
  }
</style>

<svelte:head>
  <title>Fantasy Organization Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Organization Generator</h1>

  <p>This generates fantasy organizations.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h2>{name}</h2>

  <div class="org-arms"><img alt="" id="org-arms"/></div>

  <p>{description}</p>

  <p>{leadership}</p>

  <h3>Notable Members</h3>

  {#each notableMembers as member}
    <p>
      <strong
        >{Characters.getHonorific(member)}
        {member.firstName}
        {member.lastName}:</strong
      >
      {member.description}
    </p>
  {/each}
</section>
