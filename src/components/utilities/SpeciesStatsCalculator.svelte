<script lang="ts">
  import { AgeCategories } from '$lib/age';
  import { Sizes, convertMatrixToSummary } from '$lib/size';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import NumberField from '$components/common/NumberField.svelte';

  let maximumAge = $state(100);
  let femaleHeightModifier = $state(100);
  let femaleWeightModifier = $state(100);
  let maleHeightModifier = $state(100);
  let maleWeightModifier = $state(100);

  const ageCategories = $derived(AgeCategories.getHumanVariant(maximumAge / 100));

  const femaleData = $derived(
    convertMatrixToSummary(
      Sizes.getHumanVariant(femaleWeightModifier / 100, femaleHeightModifier / 100),
      ageCategories,
      'female',
    ),
  );

  const maleData = $derived(
    convertMatrixToSummary(
      Sizes.getHumanVariant(maleWeightModifier / 100, maleHeightModifier / 100),
      ageCategories,
      'male',
    ),
  );

  const ingenium = $derived.by(() => {
    const femaleAdult = femaleData.find((entry) => entry.ageCategoryName === 'adult');
    const maleAdult = maleData.find((entry) => entry.ageCategoryName === 'adult');

    return {
      adultAge: femaleAdult?.minAge ?? 0,
      femaleHeight: femaleAdult?.heightRange ?? '',
      maleHeight: maleAdult?.heightRange ?? '',
      femaleWeight: femaleAdult?.weightRange ?? '',
      maleWeight: maleAdult?.weightRange ?? '',
    };
  });
</script>

<GeneratorPage toolPath="/species-stats" theme="default" title="Species Stats Tool">
  {#snippet description()}
    <p>
      This tool helps in the construction of non-human species. I built it to help me input standard
      fantasy species. To use it, just enter the percentage of human size you want to use for height
      and weight.
    </p>
    <p>All numbers use modern human as a base.</p>
  {/snippet}

  <h2>Settings</h2>

  <NumberField id="maxAge" label="Maximum Age (Years)" bind:value={maximumAge} />

  <h3>Female</h3>

  <NumberField id="female-height" label="% of Base Height" bind:value={femaleHeightModifier} />
  <NumberField id="female-weight" label="% of Base Weight" bind:value={femaleWeightModifier} />

  <h3>Male</h3>

  <NumberField id="male-height" label="% of Base Height" bind:value={maleHeightModifier} />
  <NumberField id="male-weight" label="% of Base Weight" bind:value={maleWeightModifier} />

  <h2>Calculated Stats</h2>

  <div style="display:flex">
    <div class="half-column">
      <h3>Female</h3>
      {#each femaleData as entry}
        <div>
          <h5>{entry.ageCategoryName}</h5>
          <p><strong>Age Range:</strong> {entry.minAge} to {entry.maxAge} years</p>
          <p><strong>Female Height:</strong> {entry.heightRange}</p>
          <p><strong>Female Weight:</strong> {entry.weightRange}</p>
        </div>
      {/each}
    </div>
    <div class="half-column">
      <h3>Male</h3>
      {#each maleData as entry}
        <div>
          <h5>{entry.ageCategoryName}</h5>
          <p><strong>Age Range:</strong> {entry.minAge} to {entry.maxAge} years</p>
          <p><strong>Male Height:</strong> {entry.heightRange}</p>
          <p><strong>Male Weight:</strong> {entry.weightRange}</p>
        </div>
      {/each}
    </div>
  </div>

  <h2>For Ingenium Second Edition</h2>

  <p>This is for Ingenium Second Edition heritages.</p>

  <p><strong>Female Height:</strong> {ingenium.femaleHeight}</p>
  <p><strong>Male Height:</strong> {ingenium.maleHeight}</p>
  <p><strong>Female Weight:</strong> {ingenium.femaleWeight}</p>
  <p><strong>Male Weight:</strong> {ingenium.maleWeight}</p>
  <p><strong>Adult Age:</strong> {ingenium.adultAge}</p>
  <p><strong>Maximum Lifespan:</strong> {maximumAge}</p>
</GeneratorPage>
