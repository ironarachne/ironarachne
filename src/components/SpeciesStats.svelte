<script lang="ts">
  import * as Age from "../modules/age";
  import * as SpeciesCommon from "../modules/species/common";

  let maximumAge = 100;
  let percentOfHumanHeight = 100;
  let percentOfHumanWeight = 100;
  let ageCategories = [];

  function calculate() {
    let ageScale = maximumAge / 100;
    let heightScale = percentOfHumanHeight / 100;
    let weightScale = percentOfHumanWeight / 100;

    let categories = Age.categories();

    for (let i = 0; i < categories.length; i++) {
      categories[i].minAge = Math.ceil(categories[i].minAge * ageScale);
      categories[i].maxAge = Math.ceil(categories[i].maxAge * ageScale);
      categories[i].femaleHeightMetric = SpeciesCommon.getHeightMetric(heightScale, categories[i], "female");
      categories[i].femaleHeightImperial = SpeciesCommon.getHeightImperial(heightScale, categories[i], "female");
      categories[i].maleHeightMetric = SpeciesCommon.getHeightMetric(heightScale, categories[i], "male");
      categories[i].maleHeightImperial = SpeciesCommon.getHeightImperial(heightScale, categories[i], "male");
      categories[i].femaleWeightMetric = SpeciesCommon.getWeightMetric(weightScale, categories[i], "female");
      categories[i].femaleWeightImperial = SpeciesCommon.getWeightImperial(weightScale, categories[i], "female");
      categories[i].maleWeightMetric = SpeciesCommon.getWeightMetric(weightScale, categories[i], "male");
      categories[i].maleWeightImperial = SpeciesCommon.getWeightImperial(weightScale, categories[i], "male");
    }

    ageCategories = categories;
  }

  calculate();
  </script>

<svelte:head>
  <title>Species Stats Tool | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h2>Species Stats Tool</h2>
  <p>This tool helps in the construction of non-human species. I built it to help me input standard
    fantasy species. To use it, just enter the percentage of human size you want to use for height and weight.</p>
  <p>For now, male/female size ratios are locked to the human standard. This will change in a future update.</p>

  <div class="input-group">
    <label for="maxAge">Maximum Age (Years)</label>
    <input type="number" name="maxAge" on:change={calculate} bind:value={maximumAge} id="maxAge">
  </div>

  <div class="input-group">
    <label for="height">% of Human Height</label>
    <input type="number" name="height" on:change={calculate} bind:value={percentOfHumanHeight} id="height">
  </div>

  <div class="input-group">
    <label for="weight">% of Human Weight</label>
    <input type="number" name="weight" on:change={calculate} bind:value={percentOfHumanWeight} id="weight">
  </div>

  <h3>Calculated Stats</h3>

  {#each ageCategories as category}
  <div>
    <h4>{ category.name }</h4>
    <p><strong>Age Range:</strong> { category.minAge } to { category.maxAge }</p>
    <p><strong>Female Height:</strong> { category.femaleHeightMetric } cm ({ category.femaleHeightImperial } in.)
    </p>
    <p><strong>Female Weight:</strong> { category.femaleWeightMetric } kg ({ category.femaleWeightImperial } lbs.)
    </p>
    <p><strong>Male Height:</strong> { category.maleHeightMetric } cm ({ category.maleHeightImperial } in.)</p>
    <p><strong>Male Weight:</strong> { category.maleWeightMetric } kg ({ category.maleWeightImperial } lbs.)</p>
  </div>
  {/each}
</section>
