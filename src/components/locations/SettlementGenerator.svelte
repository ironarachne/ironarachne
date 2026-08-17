<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import * as Names from '$lib/names';
  import { getCharacterGenerationConfigForNameSet } from '$lib/characters';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import * as Settlements from '$lib/settlements';
  import type { Settlement, SettlementGeneratorConfig } from '$lib/settlements';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import CheckboxField from '$components/common/CheckboxField.svelte';

  // Filled in by the picker: the culture the user chose, rebuilt by its own kind.
  let useSavedCulture = $state(false);
  let culture: Culture | undefined = $state();

  const rng = new RNG(Date.now().toString());
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

  function resolveNameSetForGeneration(): void {
    if (useSavedCulture && culture !== undefined) {
      nameSet = culture.nameGenerators;
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
        genre: 'fantasy',
        importantCharacterCount: includeNotables ? { min: 1, max: 2 } : undefined,
        characterConfig: getCharacterGenerationConfigForNameSet(`${seed}-settlement-vip`, nameSet),
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
    runGenerate();
  });
</script>

<GeneratorPage toolPath="/fantasy/settlement" theme="fantasy" title="Settlement Generator">
  {#snippet description()}
    <p>
      Generate a settlement with derived facets (law, commerce, food security, health) and economic
      role. Optionally add narrative trade, acute/creeping problems, local organizations, and
      important people. Town name, org members, and notables can all use a <strong
        >saved culture</strong
      >
      for naming (as on the region generator) instead of a random fantasy name set. Uses the same pipeline
      as the settlements library <code>generate</code> entry point.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="size"
    label="Size class filter"
    bind:value={sizeClass}
    options={[
      { value: 'any', label: 'Any category' },
      { value: 'small', label: 'Small (hamlet, village)' },
      { value: 'medium', label: 'Medium (town, borough)' },
      { value: 'large', label: 'Large (city, metropolis)' },
    ]}
  />

  <SelectField
    id="nameSet"
    label="Name set (town, people, and orgs when enrichment is on)"
    bind:value={nameSetName}
    options={[
      { value: 'any', label: 'any (random per run)' },
      ...nameSets.map((ns) => ({ value: ns.name, label: ns.name })),
    ]}
    disabled={useSavedCulture}
  />

  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Use a saved culture for all names"
    bind:enabled={useSavedCulture}
    bind:value={culture}
  />

  <h2>Optional enrichment</h2>
  <p>These layers add more details, depending on what you want to see. They are off by default.</p>

  <CheckboxField id="trade" label="Trade (imports / exports / blurb)" bind:checked={includeTrade} />
  <CheckboxField id="problems" label="Acute and creeping problems" bind:checked={includeProblems} />
  <CheckboxField id="orgs" label="Organizations" bind:checked={includeOrganizations} />
  <CheckboxField id="notables" label="Important characters (1–2)" bind:checked={includeNotables} />

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
            {p.character.firstName}
            {p.character.lastName}
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
</GeneratorPage>

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
