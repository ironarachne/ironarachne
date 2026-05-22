<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Regions from '$lib/regions/regions.js';
  import * as Words from '@ironarachne/words';
  import * as Characters from '$lib/characters';
  import * as Names from '$lib/names';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry/renderers/svg';
  import type { Arms } from '$lib/heraldry/arms';
  import { showHeraldryPersistenceModal } from '$lib/ui/modal';
  import { type Culture, loadSavedCultures } from '$lib/culture';
  let savedCultures = $state<Culture[]>([]);

  onMount(() => {
    savedCultures = loadSavedCultures();
  });

  let savedCulture: string | undefined = $state();
  let useSavedCulture: boolean = $state(false);
  let culture: Culture | undefined = $state();

  let rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let nameSetName = $state('any');
  let nameSets = Names.getAllFantasyNameGeneratorSets(rng);
  let nameSet = rng.item(nameSets);

  let config = Regions.getDefaultConfig();
  config.rng = rng;
  config.nameGeneratorSet = nameSet;

  let region = $state(Regions.generate(config));
  let ruler = $derived(region.authority);

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    config.dominantCulture = null;
    if (useSavedCulture) {
      loadSavedCulture();
      if (culture !== undefined) {
        config.dominantCulture = culture;
        nameSet = culture.nameGenerators;
      }
    } else {
      if (nameSetName === 'any') {
        nameSet = rng.item(nameSets);
      } else {
        for (const element of nameSets) {
          if (element.name === nameSetName) {
            nameSet = element;
          }
        }
      }
    }

    config.nameGeneratorSet = nameSet;

    region = Regions.generate(config);
    ruler = region.authority;
  }

  function loadSavedCulture() {
    for (let i = 0; i < savedCultures.length; i++) {
      if (savedCultures[i].name === savedCulture) {
        culture = savedCultures[i];
      }
    }
  }

  async function openHeraldryModal(
    arms: Arms,
    title: string,
    applyReplacement: (arms: Arms) => void,
  ) {
    const result = await showHeraldryPersistenceModal({ arms, seed, title });
    if (result.action === 'replaced') {
      applyReplacement(result.arms);
    }
  }

  function replaceRulerHeraldry(arms: Arms) {
    region = {
      ...region,
      authority: {
        ...region.authority,
        heraldry: arms,
      },
    };
  }

  function replaceRealmHeraldry(realmIndex: number, arms: Arms) {
    region = {
      ...region,
      realms: region.realms.map((realm, index) =>
        index === realmIndex ? { ...realm, heraldry: arms } : realm,
      ),
    };
  }
</script>

<svelte:head>
  <title>Region Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Region Generator</h1>

  <p>Generate fantasy regions.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
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

  {#if savedCultures.length > 0}
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
        {#each savedCultures as saved}
          <option value={saved.name}>{saved.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <button onclick={generate}>Generate</button>

  <h2>{Words.capitalize(region.name)}</h2>

  <p>{region.description}</p>

  {#if region.dominantCulture.name !== undefined}
    <p>The dominant culture here is the {region.dominantCulture.name}.</p>
  {/if}

  {#if region.realms[region.mainRealm].parent != -1}
    <div class="parent-realm">
      <p>
        {Words.title(region.name)} is part of {region.realms[region.realms[region.mainRealm].parent]
          .name}
        <button
          type="button"
          class="heraldry-inline-target"
          aria-label="View heraldry for {region.realms[region.realms[region.mainRealm].parent]
            .name}"
          onclick={() =>
            openHeraldryModal(
              region.realms[region.realms[region.mainRealm].parent].heraldry,
              region.realms[region.realms[region.mainRealm].parent].name,
              (arms) => replaceRealmHeraldry(region.realms[region.mainRealm].parent, arms),
            )}
        >
          {@html renderHeraldryDeviceSvg(
            region.realms[region.realms[region.mainRealm].parent].heraldry.device,
            20,
            22,
            rng,
          )}
        </button>.
      </p>
    </div>
  {/if}

  <h3>
    Ruler: {Characters.getHonorific(
      ruler.gender.name,
      ruler.titles?.[0] ?? null,
      ruler.gender.pronouns,
    )}
    {ruler.firstName}
    {ruler.lastName}
  </h3>

  <div class="ruler">
    {#if ruler.heraldry}
      <button
        type="button"
        class="ruler-arms heraldry-block-target"
        aria-label="View heraldry for {ruler.firstName} {ruler.lastName}"
        onclick={() =>
          openHeraldryModal(
            ruler.heraldry!,
            `${ruler.firstName} ${ruler.lastName}`,
            replaceRulerHeraldry,
          )}
      >
        {@html renderHeraldryDeviceSvg(ruler.heraldry.device, 200, 220, rng)}
      </button>
    {/if}
    <div>
      <p>
        {Words.capitalize(region.name)} is ruled by {Characters.getHonorific(
          ruler.gender.name,
          ruler.titles?.[0] ?? null,
          ruler.gender.pronouns,
        )}
        {ruler.firstName}
        {ruler.lastName}. {ruler.description}
      </p>
    </div>
  </div>

  <h3>Nearby Sovereignties</h3>

  {#each region.realms as neighbor, index}
    {#if index != region.mainRealm && neighbor.parent == -1}
      <div class="neighbor">
        <button
          type="button"
          class="neighbor-arms heraldry-block-target"
          aria-label="View heraldry for {neighbor.name}"
          onclick={() =>
            openHeraldryModal(neighbor.heraldry, neighbor.name, (arms) =>
              replaceRealmHeraldry(index, arms),
            )}
        >
          {@html renderHeraldryDeviceSvg(neighbor.heraldry.device, 80, 88, rng)}
        </button>
        <div>
          <p><strong>{Words.title(neighbor.name)}</strong></p>
          <p>
            Ruled by {Characters.getHonorific(
              neighbor.authority.gender.name,
              neighbor.authority.titles?.[0] ?? null,
              neighbor.authority.gender.pronouns,
            )}
            {neighbor.authority.name}, {Words.article(neighbor.authority.species.adjective)}
            {neighbor.authority.species.adjective}
            {neighbor.authority.ageCategory.noun}.
          </p>
          {#if region.realms[region.mainRealm].parent == index}
            <p>{Words.title(region.realms[region.mainRealm].name)} is part of this.</p>
          {/if}
        </div>
      </div>
    {/if}
  {/each}

  <h3>Nearby Realms</h3>

  {#each region.realms as neighbor, index}
    {#if index != region.mainRealm && index != region.realms[region.mainRealm].parent && neighbor.parent != -1}
      <div class="neighbor">
        <button
          type="button"
          class="neighbor-arms heraldry-block-target"
          aria-label="View heraldry for {neighbor.name}"
          onclick={() =>
            openHeraldryModal(neighbor.heraldry, neighbor.name, (arms) =>
              replaceRealmHeraldry(index, arms),
            )}
        >
          {@html renderHeraldryDeviceSvg(neighbor.heraldry.device, 80, 88, rng)}
        </button>
        <div>
          <p>
            <strong>{Words.title(neighbor.name)}</strong>, part of {region.realms[neighbor.parent]
              .name}
            <button
              type="button"
              class="heraldry-inline-target"
              aria-label="View heraldry for {region.realms[neighbor.parent].name}"
              onclick={() =>
                openHeraldryModal(
                  region.realms[neighbor.parent].heraldry,
                  region.realms[neighbor.parent].name,
                  (arms) => replaceRealmHeraldry(neighbor.parent, arms),
                )}
            >
              {@html renderHeraldryDeviceSvg(
                region.realms[neighbor.parent].heraldry.device,
                20,
                22,
                rng,
              )}
            </button>.
          </p>
          <p>
            Ruled by {Characters.getHonorific(
              neighbor.authority.gender.name,
              neighbor.authority.titles?.[0] ?? null,
              neighbor.authority.gender.pronouns,
            )}
            {neighbor.authority.name}, {Words.article(neighbor.authority.species.adjective)}
            {neighbor.authority.species.adjective}
            {neighbor.authority.ageCategory.noun}.
          </p>
        </div>
      </div>
    {/if}
  {/each}

  <h3>Notable Settlements in {region.name}</h3>
  {#each region.settlements as settlement}
    <article>
      <h5>{settlement.name}</h5>
      <p>{settlement.description}</p>
    </article>
  {/each}
  <h3>Notable Organizations</h3>
  {#each region.organizations as organization}
    <article>
      <h5>{organization.name}</h5>
      <p>{organization.description}</p>
    </article>
  {/each}
</section>

<style>
  div.ruler {
    display: grid;
    column-gap: 1rem;
    margin-bottom: 1rem;
    grid-template-columns: 210px auto;
  }

  button.ruler-arms {
    align-self: start;
    width: 200px;
    height: 220px;
    margin: 0 auto;
  }

  button.heraldry-block-target,
  button.heraldry-inline-target {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }

  button.heraldry-block-target:hover,
  button.heraldry-inline-target:hover {
    opacity: 0.85;
  }

  button.heraldry-inline-target {
    display: inline;
    vertical-align: middle;
  }

  div.neighbor {
    display: grid;
    column-gap: 1rem;
    margin-bottom: 0.5rem;
    grid-template-columns: 80px auto;
  }

  div.neighbor > div {
    align-self: start;
  }

  div.neighbor > div > p {
    margin: 0;
  }

  button.neighbor-arms {
    justify-self: center;
    width: 80px;
    height: 88px;
    margin: 0 auto;
  }
</style>
