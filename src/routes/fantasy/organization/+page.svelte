<script lang="ts">
  import * as FantasyOrganizations from "$lib/organizations/fantasy";
  import * as Organizations from "$lib/organizations/organizations";
  import * as RND from "@ironarachne/rng";
  import * as Characters from "$lib/characters/characters";
  import * as MUN from "@ironarachne/made-up-names";
  import { onMount } from 'svelte';
  import { renderSVGAsPNG } from "$lib/images/svg";
  import random from "random";
  import seedrandom from "seedrandom";
  import HeraldryGenerator from "$lib/heraldry/generator";
  import HeraldrySVGRenderer from "$lib/heraldry/renderers/svg";

  let seed: string = RND.randomString(13);
  let lockSeed = false;
  let organizationTypeName = "any";
  let nameSetName = 'any';
  let nameSet: MUN.GeneratorSet = RND.item(MUN.cultureSets());
  let nameSets = MUN.cultureSets();
  let genConfig = FantasyOrganizations.getDefaultConfig();
  genConfig.characterConfig.familyNameGenerator = nameSet.family;
  genConfig.characterConfig.femaleNameGenerator = nameSet.female;
  genConfig.characterConfig.maleNameGenerator = nameSet.male;
  let org = Organizations.generate(genConfig);
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
    if (!lockSeed) {
      seed = RND.randomString(13);
    }
    random.use(seedrandom(seed));
    if (organizationTypeName !== "any") {
      genConfig.organizationTypes = [Organizations.getTypeByName(organizationTypeName, FantasyOrganizations.getTypes())];
    } else {
      genConfig.organizationTypes = FantasyOrganizations.getTypes();
    }
    if (nameSetName == 'any') {
      nameSet = RND.item(MUN.cultureSets());
      genConfig.characterConfig.useAdaptiveNames = true;
    } else {
      MUN.cultureSets().forEach(element => {
        if (element.name === nameSetName) {
          nameSet = element;
        }
      });
      genConfig.characterConfig.useAdaptiveNames = false;
    }
    genConfig.characterConfig.familyNameGenerator = nameSet.family;
    genConfig.characterConfig.femaleNameGenerator = nameSet.female;
    genConfig.characterConfig.maleNameGenerator = nameSet.male;

    let org = Organizations.generate(genConfig);
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

  onMount(() => {
    generate();
  });
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
  <p>If you choose the Name Set "any," it will generate names according to the race of each character. Otherwise, the names will adhere to whichever name set you choose.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed"/> Lock Seed
  </div>

  <div class="input-group">
    <label for="type">Organization Type</label>
    <select name="type" bind:value={organizationTypeName} id="type">
      <option>any</option>
      {#each genConfig.organizationTypes as type}
        <option>{type.name}</option>
      {/each}
    </select>
  </div>

  <div class="input-group">
    <label for="names">Name Set</label>
    <select name="names" bind:value={nameSetName} id="nameSet">
      <option>any</option>
      {#each nameSets as nameSet}
        <option>{nameSet.name}</option>
      {/each}
    </select>
  </div>

  <button on:click={generate}>Generate</button>

  <h2>{name}</h2>

  <div class="org-arms"><img alt="" id="org-arms"/></div>

  <p>{description}</p>

  <p>{leadership}</p>

  <h3>Notable Members</h3>

  {#each notableMembers as member}
    <p>
      <strong>
        {Characters.getHonorific(member)}
        {member.firstName}
        {member.lastName}{#if Characters.getHonorific(member) == ""} ({Characters.getTitle(member)}){/if}:
      </strong>
      {member.description}
    </p>
  {/each}
</section>
