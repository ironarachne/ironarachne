<script lang="ts">
  import * as AgeCategories from "../modules/age/agecategories";

  let maximumAge = 100;
  let femaleHeightModifier = 100;
  let femaleWeightModifier = 100;
  let maleHeightModifier = 110;
  let maleWeightModifier = 120;
  let femaleCategories = [];
  let maleCategories = [];
  let ingeniumDescription = '';

  function calculate() {
    let ageScale = maximumAge / 100;

    femaleCategories = AgeCategories.getHumanVariant(ageScale, femaleWeightModifier / 100, femaleHeightModifier / 100, 'female');
    maleCategories = AgeCategories.getHumanVariant(ageScale, maleWeightModifier / 100, maleHeightModifier / 100, 'male');

    getIngenium();
  }

  function getIngenium() {
    let description = '';
    let adultAge = '';

    for (let i=0;i<femaleCategories.length;i++) {
      if (femaleCategories[i].name == "adult") {
        description += '\\textbf{Female Height:} ' + femaleCategories[i].getHeightRange() + '\n\n';
        description += '\\textbf{Female Weight:} ' + femaleCategories[i].getWeightRange() + '\n\n';

        adultAge = '\\textbf{Adulthood Age:} ' + femaleCategories[i].minAge + '\n\n';
      }
    }

    for (let i=0;i<maleCategories.length;i++) {
      if (maleCategories[i].name == "adult") {
        description += '\\textbf{Male Height:} ' + maleCategories[i].getHeightRange() + '\n\n';
        description += '\\textbf{Male Weight:} ' + maleCategories[i].getWeightRange() + '\n\n';
      }
    }

    description += adultAge;

    description += '\\textbf{Average Maximum Lifespan:} ' + maximumAge;

    ingeniumDescription = description;
  }

  calculate();
  </script>

<svelte:head>
  <title>Species Stats Tool | Iron Arachne</title>
</svelte:head>

<section class="main default">
  <h1>Species Stats Tool</h1>
  <p>This tool helps in the construction of non-human species. I built it to help me input standard
    fantasy species. To use it, just enter the percentage of human size you want to use for height and weight.</p>

  <p>All numbers use modern human female as a base.</p>

  <h2>Settings</h2>

  <div class="input-group">
    <label for="maxAge">Maximum Age (Years)</label>
    <input type="number" name="maxAge" on:change={calculate} bind:value={maximumAge} id="maxAge">
  </div>

  <h3>Female</h3>

  <div class="input-group">
    <label for="female-height">% of Base Height</label>
    <input type="number" name="female-height" on:change={calculate} bind:value={femaleHeightModifier} id="height">
  </div>

  <div class="input-group">
    <label for="female-weight">% of Base Weight</label>
    <input type="number" name="female-weight" on:change={calculate} bind:value={femaleWeightModifier} id="weight">
  </div>

  <h3>Male</h3>

  <div class="input-group">
    <label for="male-height">% of Base Height</label>
    <input type="number" name="male-height" on:change={calculate} bind:value={maleHeightModifier} id="height">
  </div>

  <div class="input-group">
    <label for="male-weight">% of Base Weight</label>
    <input type="number" name="male-weight" on:change={calculate} bind:value={maleWeightModifier} id="weight">
  </div>

  <h2>Calculated Stats</h2>

  <div style="display:flex">
    <div class="half-column">
      <h3>Female</h3>
      {#each femaleCategories as category}
      <div>
        <h5>{ category.name }</h5>
        <p><strong>Age Range:</strong> { category.minAge } to { category.maxAge } years</p>
        <p><strong>Female Height:</strong> { category.getHeightRange() }</p>
        <p><strong>Female Weight:</strong> { category.getWeightRange() }</p>
      </div>
      {/each}
    </div>
    <div class="half-column">
      <h3>Male</h3>
      {#each maleCategories as category}
      <div>
        <h5>{ category.name }</h5>
        <p><strong>Age Range:</strong> { category.minAge } to { category.maxAge } years</p>
        <p><strong>Male Height:</strong> { category.getHeightRange() }</p>
        <p><strong>Male Weight:</strong> { category.getWeightRange() }</p>
      </div>
      {/each}
    </div>
  </div>

  <h2>For Ingenium Second Edition</h2>

  <p>This is specifically for the manuscript for Ingenium Second Edition bloodline stats.</p>

  <pre>{ ingeniumDescription }</pre>
</section>
