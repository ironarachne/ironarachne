<script lang="ts">
  import * as AgeCategories from "$lib/age/age_categories";
  import type AgeCategory from "$lib/age/age_category";
  import * as Sizes from "$lib/size/sizes";
  import type { SizeMatrix, SizeAgeSummary } from "$lib/size/size_matrix";
  import { convertMatrixToSummary } from "$lib/size/size_matrix";

  let maximumAge = $state(100);
  let femaleHeightModifier = $state(100);
  let femaleWeightModifier = $state(100);
  let maleHeightModifier = $state(100);
  let maleWeightModifier = $state(100);
  let femaleAgeCategories: AgeCategory[] = [];
  let maleAgeCategories: AgeCategory[] = [];
  let femaleSizeMatrix: SizeMatrix;
  let maleSizeMatrix: SizeMatrix;

  let femaleData: SizeAgeSummary[] = $state([]);
  let maleData: SizeAgeSummary[] = $state([]);

  let ingenium = $state({
    adultAge: 0,
    femaleHeight: '',
    maleHeight: '',
    femaleWeight: '',
    maleWeight: ''
  });

  function calculate() {
    let ageScale = maximumAge / 100;

    femaleAgeCategories = AgeCategories.getHumanVariant(ageScale);
    maleAgeCategories = AgeCategories.getHumanVariant(ageScale);

    femaleSizeMatrix = Sizes.getHumanVariant(femaleWeightModifier / 100, femaleHeightModifier / 100);
    maleSizeMatrix = Sizes.getHumanVariant(maleWeightModifier / 100, maleHeightModifier / 100);

    femaleData = convertMatrixToSummary(femaleSizeMatrix, femaleAgeCategories, "female");
    maleData = convertMatrixToSummary(maleSizeMatrix, maleAgeCategories, "male");

    getIngenium();
  }

  function getIngenium() {
    for (let i=0;i<femaleData.length;i++) {
      if (femaleData[i].ageCategoryName == "adult") {
        ingenium.femaleHeight = femaleData[i].heightRange;
        ingenium.femaleWeight = femaleData[i].weightRange;
        ingenium.adultAge = femaleData[i].minAge;
      }
    }

    for (let i=0;i<maleData.length;i++) {
      if (maleData[i].ageCategoryName == "adult") {
        ingenium.maleHeight = maleData[i].heightRange;
        ingenium.maleWeight = maleData[i].weightRange;
      }
    }
  }

  calculate();
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
</style>

<svelte:head>
  <title>Species Stats Tool | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h1>Species Stats Tool</h1>
  <p>This tool helps in the construction of non-human species. I built it to help me input standard
    fantasy species. To use it, just enter the percentage of human size you want to use for height and weight.</p>

  <p>All numbers use modern human as a base.</p>

  <h2>Settings</h2>

  <div class="input-group">
    <label for="maxAge">Maximum Age (Years)</label>
    <input type="number" name="maxAge" onchange={calculate} bind:value={maximumAge} id="maxAge">
  </div>

  <h3>Female</h3>

  <div class="input-group">
    <label for="female-height">% of Base Height</label>
    <input type="number" name="female-height" onchange={calculate} bind:value={femaleHeightModifier} id="height">
  </div>

  <div class="input-group">
    <label for="female-weight">% of Base Weight</label>
    <input type="number" name="female-weight" onchange={calculate} bind:value={femaleWeightModifier} id="weight">
  </div>

  <h3>Male</h3>

  <div class="input-group">
    <label for="male-height">% of Base Height</label>
    <input type="number" name="male-height" onchange={calculate} bind:value={maleHeightModifier} id="height">
  </div>

  <div class="input-group">
    <label for="male-weight">% of Base Weight</label>
    <input type="number" name="male-weight" onchange={calculate} bind:value={maleWeightModifier} id="weight">
  </div>

  <h2>Calculated Stats</h2>

  <div style="display:flex">
    <div class="half-column">
      <h3>Female</h3>
      {#each femaleData as entry}
        <div>
          <h5>{ entry.ageCategoryName }</h5>
          <p><strong>Age Range:</strong> { entry.minAge } to { entry.maxAge } years</p>
          <p><strong>Female Height:</strong> { entry.heightRange }</p>
          <p><strong>Female Weight:</strong> { entry.weightRange }</p>
        </div>
      {/each}
    </div>
    <div class="half-column">
      <h3>Male</h3>
      {#each maleData as entry}
        <div>
          <h5>{ entry.ageCategoryName }</h5>
          <p><strong>Age Range:</strong> { entry.minAge } to { entry.maxAge } years</p>
          <p><strong>Female Height:</strong> { entry.heightRange }</p>
          <p><strong>Female Weight:</strong> { entry.weightRange }</p>
        </div>
      {/each}
    </div>
  </div>

  <h2>For Ingenium Second Edition</h2>

  <p>This is for Ingenium Second Edition heritages.</p>

  <p><strong>Female Height:</strong> { ingenium.femaleHeight }</p>
  <p><strong>Male Height:</strong> { ingenium.maleHeight }</p>
  <p><strong>Female Weight:</strong> { ingenium.femaleWeight }</p>
  <p><strong>Male Weight:</strong> { ingenium.maleWeight }</p>
  <p><strong>Adult Age:</strong> { ingenium.adultAge }</p>
  <p><strong>Maximum Lifespan:</strong> { maximumAge }</p>
</section>
