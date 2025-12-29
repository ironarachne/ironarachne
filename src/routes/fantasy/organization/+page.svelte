<script lang="ts">
import * as FantasyOrganizations from "$lib/organizations/fantasy";
import * as Organizations from "$lib/organizations/organizations";
import * as RNG from "@ironarachne/rng";
import * as Characters from "$lib/characters/characters";
import * as Names from "$lib/names";
import { onMount } from "svelte";
import { renderSVGAsPNG } from "$lib/images/svg";

import { generateHeraldry } from "$lib/heraldry/generator";
import HeraldrySVGRenderer from "$lib/heraldry/renderers/svg";

let rng = new RNG.RNG(Date.now().toString());
let seed: string = $state(rng.randomString(13));
let lockSeed = $state(false);
$effect(() => {
  rng.setSeed(seed);
});

let organizationTypeName = $state("any");
let nameSetName = $state("any");
let nameSets = Names.getAllFantasyNameGeneratorSets(rng);
let nameSet: Names.NameGeneratorSet = rng.item(nameSets);
let genConfig = $state(FantasyOrganizations.getDefaultConfig(rng));
genConfig.characterConfig.familyNameGenerator = nameSet.family;
genConfig.characterConfig.femaleNameGenerator = nameSet.female;
genConfig.characterConfig.maleNameGenerator = nameSet.male;
let org = Organizations.generate(genConfig);
let name = $state(org.name);
let description = $state(org.description);
let leadership = $state(org.leadership.description);
let notableMembers = $state(org.notableMembers);
let heraldryConfig = org.organizationType.heraldryConfig;
heraldryConfig.width = 200;
heraldryConfig.height = 200;
let heraldry = generateHeraldry(heraldryConfig);
let svgRenderer = new HeraldrySVGRenderer();

function generate() {
  if (!lockSeed) {
    seed = rng.randomString(13);
  }
  rng.setSeed(seed);
  if (organizationTypeName !== "any") {
    genConfig.organizationTypes = [
      Organizations.getTypeByName(
        organizationTypeName,
        FantasyOrganizations.getTypes(rng),
      ),
    ];
  } else {
    genConfig.organizationTypes = FantasyOrganizations.getTypes(rng);
  }
  if (nameSetName === "any") {
    nameSet = rng.item(nameSets);
    genConfig.characterConfig.useAdaptiveNames = true;
  } else {
    nameSets.forEach((element) => {
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
  heraldry = generateHeraldry(heraldryConfig);

  let svg = svgRenderer.render(heraldry.device, 200, 220);
  renderSVGAsPNG(svg, 200, 220, "org-arms");
}

onMount(() => {
  generate();
});
</script>

<style lang="scss">
  @use '$lib/styles/main.scss';
  @use '$lib/styles/fantasy.scss';

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

  <button onclick={generate}>Generate</button>

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
