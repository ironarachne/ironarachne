<script lang="ts">
  import * as AgeCategories from "../modules/age/agecategories";

  let maximumAge = 100;
  let femaleHeightModifier = 100;
  let femaleWeightModifier = 100;
  let maleHeightModifier = 100;
  let maleWeightModifier = 100;
  let femaleCategories = [];
  let maleCategories = [];
  let ingenium = {
    adultAge: '',
    femaleHeight: '',
    maleHeight: '',
    femaleWeight: '',
    maleWeight: ''
  };

  function calculate() {
    let ageScale = maximumAge / 100;

    femaleCategories = AgeCategories.getHumanVariant(ageScale, femaleWeightModifier / 100, femaleHeightModifier / 100, 'female');
    maleCategories = AgeCategories.getHumanVariant(ageScale, maleWeightModifier / 100, maleHeightModifier / 100, 'male');

    getIngenium();
  }

  function getIngenium() {
    for (let i=0;i<femaleCategories.length;i++) {
      if (femaleCategories[i].name == "adult") {
        ingenium.femaleHeight = femaleCategories[i].getHeightRange();
        ingenium.femaleWeight = femaleCategories[i].getWeightRange();
        ingenium.adultAge = femaleCategories[i].minAge;
      }
    }

    for (let i=0;i<maleCategories.length;i++) {
      if (maleCategories[i].name == "adult") {
        ingenium.maleHeight = maleCategories[i].getHeightRange();
        ingenium.maleWeight = maleCategories[i].getWeightRange();
      }
    }
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

  <p>All numbers use modern human as a base.</p>

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

  <p>This is for Ingenium Second Edition heritages.</p>

  <p><strong>Female Height:</strong> { ingenium.femaleHeight }</p>
  <p><strong>Male Height:</strong> { ingenium.maleHeight }</p>
  <p><strong>Female Weight:</strong> { ingenium.femaleWeight }</p>
  <p><strong>Male Weight:</strong> { ingenium.maleWeight }</p>
  <p><strong>Adult Age:</strong> { ingenium.adultAge }</p>
  <p><strong>Maximum Lifespan:</strong> { maximumAge }</p>
</section>
