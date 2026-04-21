<script lang="ts">
  import { getContext } from 'svelte';
  import * as Names from '$lib/names';
  import * as RNG from '@ironarachne/rng';
  import * as CommonSpecies from '$lib/species/common.js';
  import * as ReligionCategories from '$lib/religion/categories';
  import type Species from '$lib/species/species';
  import type { Culture } from '$lib/culture/culture_types';
  import type UserData from '$lib/user_data';
  import {
    ALL_RELIGION_DIMENSION_IDS,
    type PolytheisticStandingMode,
    type ReligionDimensionId,
    type SpiritCosmologyDepthMode,
    generateReligion,
    getDefaultReligionGenerationConfig,
  } from '$lib/religion';
  import { listDomains } from '$lib/religion/domains';

  const dimensionSectionTitles: Record<ReligionDimensionId, string> = {
    ritual: 'Ritual',
    experiential: 'Experiential',
    mythological: 'Mythological',
    doctrinal: 'Doctrinal',
    ethical: 'Ethical',
    institutional: 'Institutional',
    material: 'Material',
  };

  const userSession = getContext<{ get value(): UserData }>('user');
  let savedCulture: string | undefined = $state();
  let useSavedCulture: boolean = $state(false);
  let culture: Culture;

  let rng = new RNG.RNG(Date.now().toString());
  const initialSeed = rng.randomString(13);
  let seed = $state(initialSeed);
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let humanNameGenSet = Names.getFantasyNameGeneratorSet('human', rng);
  let genConfig = getDefaultReligionGenerationConfig();

  let allSpeciesNames: string[] = [];
  const allSpecies = CommonSpecies.sentient();
  const allReligionCategories = ReligionCategories.all();
  let allReligionCategoriesNames: string[] = [];

  for (let i = 0; i < allSpecies.length; i++) {
    allSpeciesNames.push(allSpecies[i].name);
  }

  for (let i = 0; i < allReligionCategories.length; i++) {
    allReligionCategoriesNames.push(allReligionCategories[i].name);
  }

  let selectedSpecies: string[] = $state(['human']);
  let selectedCategories: string[] = $state(['polytheism']);
  genConfig.categories = [ReligionCategories.byName('polytheism', allReligionCategories)];

  let polytheisticStanding: PolytheisticStandingMode = $state('random');
  let spiritCosmologyDepth: SpiritCosmologyDepthMode = $state('random');

  let religion = $state(generateReligion(`${initialSeed}-religion`, genConfig));

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    if (humanNameGenSet.family === null) {
      throw new Error('Name set does not have a family name generator.');
    }
    if (humanNameGenSet.female === null) {
      throw new Error('Name set does not have a female name generator.');
    }
    if (humanNameGenSet.male === null) {
      throw new Error('Name set does not have a male name generator.');
    }
    let speciesOptions: Species[] = [];
    for (let i = 0; i < selectedSpecies.length; i++) {
      speciesOptions.push(CommonSpecies.byName(selectedSpecies[i], allSpecies));
    }

    let categoryOptions = [];
    for (let i = 0; i < selectedCategories.length; i++) {
      categoryOptions.push(ReligionCategories.byName(selectedCategories[i], allReligionCategories));
    }

    genConfig.deitySpeciesOptions = speciesOptions;
    genConfig.categories = categoryOptions;
    genConfig.polytheisticStanding = polytheisticStanding;
    genConfig.spiritCosmologyDepth = spiritCosmologyDepth;
    genConfig.nameGenerator = humanNameGenSet.family;
    genConfig.femaleNameGenerator = humanNameGenSet.female;
    genConfig.maleNameGenerator = humanNameGenSet.male;

    if (useSavedCulture) {
      loadSavedCulture();

      if (culture.nameGenerators.family !== null) {
        genConfig.nameGenerator = culture.nameGenerators.family;
      }
      if (culture.nameGenerators.female !== null) {
        genConfig.femaleNameGenerator = culture.nameGenerators.female;
      }
      if (culture.nameGenerators.male !== null) {
        genConfig.maleNameGenerator = culture.nameGenerators.male;
      }
    } else {
      genConfig.nameGenerator = humanNameGenSet.family;
      genConfig.femaleNameGenerator = humanNameGenSet.female;
      genConfig.maleNameGenerator = humanNameGenSet.male;
    }

    religion = generateReligion(seed, genConfig);
  }

  function loadSavedCulture() {
    for (let i = 0; i < userSession.value.savedCultures.length; i++) {
      if (userSession.value.savedCultures[i].name === savedCulture) {
        culture = userSession.value.savedCultures[i];
      }
    }
  }
</script>

<svelte:head>
  <title>Religion Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Fantasy Religion Generator</h1>

  <p>Generate a fictional fantasy religion.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="selected-categories">Allow these religion categories</label>
    {#each allReligionCategoriesNames as categoryName}
      <ul>
        <li>
          <input
            type="checkbox"
            name="selected-categories"
            bind:group={selectedCategories}
            id="selected-categories"
            value={categoryName}
          />
          {categoryName}
        </li>
      </ul>
    {/each}
  </div>

  <div class="input-group complexity-controls">
    <label for="poly-standing">Polytheistic deity standing (when the draw is polytheism)</label>
    <select id="poly-standing" bind:value={polytheisticStanding}>
      <option value="random">Random</option>
      <option value="egalitarian">Egalitarian — coequal high gods</option>
      <option value="hierarchical">Hierarchical — uneven cult and precedence</option>
      <option value="balanced">Balanced — fluid, situational prominence</option>
    </select>
    <p class="field-hint">
      Monotheism ignores this. Egalitarian polytheism avoids elevating one king of the gods.
    </p>

    <label for="spirit-depth">Spirit cosmology depth (when the religion has deities)</label>
    <select id="spirit-depth" bind:value={spiritCosmologyDepth}>
      <option value="random">Random</option>
      <option value="none">None — only the high gods as named</option>
      <option value="shallow">Shallow — one or two extra orders (messengers, ancestors, etc.)</option>
      <option value="moderate">Moderate — several intermediate kinds</option>
      <option value="deep">Deep — many ranks and overlapping jurisdictions</option>
    </select>
    <p class="field-hint">
      Adds structured spirit echelons (messengers, rebels, nature spirits, saints, psychopomps, …) with
      varying rank depth.
    </p>
  </div>

  <div class="input-group">
    <label for="selected-species">Allow deities of these species</label>
    {#each allSpeciesNames as speciesName}
      <ul>
        <li>
          <input
            type="checkbox"
            name="selected-species"
            bind:group={selectedSpecies}
            id="selected-species"
            value={speciesName}
          />
          {speciesName}
        </li>
      </ul>
    {/each}
  </div>

  {#if userSession.value.savedCultures !== undefined && userSession.value.savedCultures.length > 0}
    <div class="input-group">
      <label for="useSavedCulture">Use a saved culture for naming?</label>
      <input
        type="checkbox"
        name="useSavedCulture"
        bind:checked={useSavedCulture}
        id="useSavedCulture"
      />
    </div>

    <div class="input-group">
      <label for="savedCulture">Select a saved culture to load</label>
      <select bind:value={savedCulture}>
        {#each userSession.value.savedCultures as saved}
          <option value={saved.name}>{saved.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <button onclick={generate}>Generate</button>

  <h2>{religion.name}</h2>

  <p>{religion.description}</p>

  {#if religion.cosmology}
    <h3>Spirit cosmology</h3>
    <p>{religion.cosmology.summary}</p>
    <ul class="cosmology-echelons">
      {#each religion.cosmology.echelons as ech}
        <li>
          <strong>{ech.label}</strong>
          (rank depth {ech.rankDepth}):
          {ech.summary}
        </li>
      {/each}
    </ul>
  {/if}

  <h3>Realms</h3>

  {#each religion.realms as realm}
    <div>
      <h4>{realm.name}</h4>
      <p>{realm.description}</p>
    </div>
  {/each}

  {#if religion.pantheon !== null}
    <h3>Deities</h3>

    <p>{religion.pantheon.description}</p>

    {#each religion.pantheon.members as member}
      <div>
        <h4>{member.name}</h4>

        <p>{member.titles?.join(',')}</p>

        <p><strong>Domains:</strong> {listDomains(member.domains)}</p>

        <p><strong>Holy Item:</strong> {member.holyItem}</p>
        <p><strong>Holy Symbol:</strong> {member.holySymbol}</p>

        <p>{member.description}</p>

        {#if member.relationships.length > 0}
          <div>
            <strong>Relationships:</strong>
            <ul>
              {#each member.relationships as relationship}
                <li>{relationship.description}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</section>

<style>
  .input-group {
    ul > li {
      list-style: none;
    }
  }

  .dimensions-intro {
    font-size: 0.95rem;
    opacity: 0.9;
  }

  .dimension-block {
    margin-bottom: 1rem;
  }

  .complexity-controls label {
    display: block;
    margin-top: 0.75rem;
  }

  .complexity-controls select {
    margin-top: 0.25rem;
    max-width: 100%;
  }

  .field-hint {
    font-size: 0.9rem;
    opacity: 0.88;
    margin: 0.25rem 0 0.5rem;
  }

  .cosmology-echelons li {
    margin-bottom: 0.5rem;
  }

  .dimensions-json {
    margin: 0.35rem 0 0;
    padding: 0.75rem;
    font-size: 0.85rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    background: color-mix(in srgb, Canvas 92%, CanvasText 8%);
    border-radius: 4px;
  }
</style>
