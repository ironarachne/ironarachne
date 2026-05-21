<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import * as Names from '$lib/names';
  import { getCharacterGenerationConfigForNameSet } from '$lib/characters/character_generation';
  import { type Culture, loadSavedCultures } from '$lib/culture';
  import * as Settlements from '$lib/settlements';
  import type { Settlement, SettlementGeneratorConfig } from '$lib/settlements';
  import { onMount } from 'svelte';

  let savedCultures = $state<Culture[]>([]);
  let useSavedCulture = $state(false);
  let savedCulture = $state<string | undefined>(undefined);
  let culture: Culture | undefined = $state();

  let rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let nameSetName = $state('any');
  const nameSetsInitial = Names.getAllFantasyNameGeneratorSets(rng);
  let nameSets = $state(nameSetsInitial);
  let nameSet = $state(rng.item(nameSetsInitial));

  let sizeClass = $state<'any' | 'small' | 'medium' | 'large'>('any');
  let includeTrade = $state(false);
  let includeProblems = $state(false);
  let includeOrganizations = $state(false);
  let includeNotables = $state(false);

  let settlement = $state<Settlement | null>(null);

  function loadSavedCulture() {
    for (const c of savedCultures) {
      if (c.name === savedCulture) {
        culture = c;
        return;
      }
    }
    if (savedCultures[0]) {
      culture = savedCultures[0];
      savedCulture = savedCultures[0].name;
    }
  }

  function resolveNameSetForGeneration(): void {
    if (useSavedCulture) {
      loadSavedCulture();
      if (culture !== undefined) {
        nameSet = culture.nameGenerators;
      }
    } else {
      if (nameSetName === 'any') {
        nameSet = rng.item(nameSets);
      } else {
        const found = nameSets.find((s) => s.name === nameSetName);
        if (found) {
          nameSet = found;
        }
      }
    }
  }

  function buildConfig(): SettlementGeneratorConfig {
    resolveNameSetForGeneration();
    const config = Settlements.getDefaultConfig(rng);
    config.size = sizeClass;
    config.nameGenerator = nameSet.town;

    const anyEnrichment =
      includeTrade || includeProblems || includeOrganizations || includeNotables;
    if (anyEnrichment) {
      config.enrichment = {
        seedPrefix: 'fantasy-settlement-page',
        includeTrade: includeTrade,
        includeProblems: includeProblems,
        includeOrganizations: includeOrganizations,
        genre: "fantasy",
        importantCharacterCount: includeNotables ? { min: 1, max: 2 } : undefined,
        characterConfig: getCharacterGenerationConfigForNameSet(
          `${seed}-settlement-vip`,
          nameSet,
        ),
      };
    } else {
      config.enrichment = undefined;
    }
    return config;
  }

  function runGenerate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    nameSets = Names.getAllFantasyNameGeneratorSets(rng);
    settlement = Settlements.generate(buildConfig());
  }

  onMount(() => {
    savedCultures = loadSavedCultures();
    if (savedCultures.length > 0) {
      savedCulture = savedCultures[0]!.name;
    }
    runGenerate();
  });
</script>

<svelte:head>
  <title>Settlement Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Settlement Generator</h1>

  <p>
    Generate a settlement with derived facets (law, commerce, food security, health) and
    economic role. Optionally add narrative trade, acute/creeping problems, local organizations, and
    important people. Town name, org members, and notables can all use a <strong>saved culture</strong>
    for naming (as on the region generator) instead of a random fantasy name set. Uses the same
    pipeline as the settlements library <code>generate</code> entry point.
  </p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock seed
  </div>

  <div class="input-group">
    <label for="size">Size class filter</label>
    <select name="size" id="size" bind:value={sizeClass}>
      <option value="any">Any category</option>
      <option value="small">Small (hamlet, village)</option>
      <option value="medium">Medium (town, borough)</option>
      <option value="large">Large (city, metropolis)</option>
    </select>
  </div>

  <div class="input-group">
    <label for="nameSet">Name set (town, people, and orgs when enrichment is on)</label>
    <select name="nameSet" id="nameSet" bind:value={nameSetName} disabled={useSavedCulture}>
      <option value="any">any (random per run)</option>
      {#each nameSets as ns}
        <option value={ns.name}>{ns.name}</option>
      {/each}
    </select>
  </div>

  {#if savedCultures.length > 0}
    <div class="input-group">
      <label for="useSavedCulture">Use a saved culture for all names</label>
      <input
        type="checkbox"
        name="useSavedCulture"
        id="useSavedCulture"
        bind:checked={useSavedCulture}
      />
    </div>
    <div class="input-group">
      <label for="savedCulture">Saved culture</label>
      <select id="savedCulture" name="savedCulture" bind:value={savedCulture} disabled={!useSavedCulture}>
        {#each savedCultures as s}
          <option value={s.name}>{s.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <h2>Optional enrichment</h2>
  <p>These layers add more details, depending on what you want to see. They are off by default.</p>

  <div class="input-group">
    <input type="checkbox" id="trade" bind:checked={includeTrade} />
    <label for="trade">Trade (imports / exports / blurb)</label>
  </div>
  <div class="input-group">
    <input type="checkbox" id="problems" bind:checked={includeProblems} />
    <label for="problems">Acute and creeping problems</label>
  </div>
  <div class="input-group">
    <input type="checkbox" id="orgs" bind:checked={includeOrganizations} />
    <label for="orgs">Organizations</label>
  </div>
  <div class="input-group">
    <input type="checkbox" id="notables" bind:checked={includeNotables} />
    <label for="notables">Important characters (1–2)</label>
  </div>

  <p><button type="button" onclick={runGenerate}>Generate</button></p>

  {#if settlement}
    {#if useSavedCulture && culture}
      <p class="culture-line">Naming: <strong>{culture.name}</strong> culture</p>
    {/if}
    <h2>{settlement.name}</h2>
    <p class="settlement-meta">
      <strong>{settlement.category.name}</strong> · population {settlement.population.toLocaleString()}
      · prosperity {settlement.prosperity} · <em>{settlement.economicRole}</em>
    </p>
    <p>{settlement.description}</p>

    <h3>Facets</h3>
    <p>These are the key attributes of the settlement. They run from 0-10.</p>
    <ul>
      <li>Law and order: {settlement.lawAndOrder}</li>
      <li>Commerce: {settlement.commerce}</li>
      <li>Food security: {settlement.foodSecurity}</li>
      <li>Public health: {settlement.publicHealth}</li>
    </ul>

    <h3>Environment</h3>
    <p>{settlement.environment.description}</p>

    {#if settlement.primaryImports && settlement.primaryImports.length > 0}
      <h3>Trade</h3>
      <p><strong>Exports:</strong> {settlement.primaryExports?.join(', ')}</p>
      <p><strong>Imports:</strong> {settlement.primaryImports.join(', ')}</p>
      {#if settlement.tradeBlurb}
        <p>{settlement.tradeBlurb}</p>
      {/if}
    {/if}

    {#if settlement.acuteProblems && settlement.acuteProblems.length > 0}
      <h3>Acute problems</h3>
      <ul>
        {#each settlement.acuteProblems as p}
          <li>
            {p.summary}
            {#if p.detail}
              <span class="detail">{p.detail}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if settlement.creepingProblems && settlement.creepingProblems.length > 0}
      <h3>Creeping problems</h3>
      <ul>
        {#each settlement.creepingProblems as p}
          <li>
            {p.summary}
            {#if p.detail}
              <span class="detail">{p.detail}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if settlement.organizations && settlement.organizations.length > 0}
      <h3>Organizations</h3>
      <ul>
        {#each settlement.organizations as o}
          <li><strong>{o.name}</strong>: {o.profile.hook}</li>
        {/each}
      </ul>
    {/if}

    {#if settlement.importantPeople && settlement.importantPeople.length > 0}
      <h3>Important people</h3>
      <ul class="notable-people">
        {#each settlement.importantPeople as p}
          <li>
            <strong>{p.roleDisplay || p.roleId}</strong>:
            {p.character.firstName} {p.character.lastName}
            <p class="importance">{p.importance}</p>
            {#if p.salientPersonality.length}
              <p class="traits-line">
                <span class="label">Notable demeanor:</span>
                {p.salientPersonality.join(' · ')}
              </p>
            {/if}
            {#if p.salientPhysical.length}
              <p class="traits-line">
                <span class="label">Striking look:</span>
                {p.salientPhysical.join(' · ')}
              </p>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</section>

<style>
  .culture-line {
    margin-bottom: 0.5rem;
    font-size: 0.95em;
  }
  .settlement-meta {
    opacity: 0.95;
  }
  .detail {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.95em;
    opacity: 0.9;
  }
  .notable-people {
    list-style: disc;
    padding-left: 1.25rem;
  }
  .notable-people .importance {
    margin: 0.4rem 0 0.35rem;
    font-size: 0.95em;
    line-height: 1.45;
  }
  .notable-people .traits-line {
    margin: 0.25rem 0 0;
    font-size: 0.9em;
    line-height: 1.4;
    opacity: 0.95;
  }
  .notable-people .label {
    font-style: italic;
    margin-right: 0.35rem;
  }
</style>
