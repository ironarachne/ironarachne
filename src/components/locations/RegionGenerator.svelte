<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import { Regions } from '$lib/regions';
  import type { Region } from '$lib/regions';
  import * as Words from '@ironarachne/words';
  import * as Characters from '$lib/characters';
  import type { Character } from '$lib/characters';
  import * as Names from '$lib/names';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry';
  import { showHeraldryPersistenceModal } from '$lib/ui';
  import type { Arms } from '$lib/heraldry';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import HeraldryEmblemButton from '$components/heraldry/HeraldryEmblemButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  onMount(() => {
    generate();
  });

  // Filled in by the picker: the culture the user chose, rebuilt by its own kind. Undefined until
  // they choose one, and while the offer stands unaccepted.
  let useSavedCulture: boolean = $state(false);
  let culture: Culture | undefined = $state();

  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let nameSetName = $state('any');
  const nameSets = Names.getAllFantasyNameGeneratorSets(rng);
  let nameSet = rng.item(nameSets);

  const config = Regions.getDefaultConfig();
  config.rng = rng;
  config.nameGeneratorSet = nameSet;

  let region = $state<Region | null>(null);
  let ruler = $derived<Character | undefined>(region?.authority);

  const nameSetOptions = $derived(['any', ...nameSets.map((n) => n.name)]);

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

    config.dominantCulture = null;
    if (useSavedCulture && culture !== undefined) {
      config.dominantCulture = culture;
      nameSet = culture.nameGenerators;
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
    if (!region) return;
    region = {
      ...region,
      authority: {
        ...region.authority,
        heraldry: arms,
      },
    };
  }

  function replaceRealmHeraldry(realmIndex: number, arms: Arms) {
    if (!region) return;
    region = {
      ...region,
      realms: region.realms.map((realm, index) =>
        index === realmIndex ? { ...realm, heraldry: arms } : realm,
      ),
    };
  }
</script>

<GeneratorPage toolPath="/region" theme="fantasy" title="Region Generator">
  {#snippet description()}
    <p>Generate fantasy regions.</p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <SelectField id="nameSet" label="Name Set" bind:value={nameSetName} options={nameSetOptions} />

  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Use a saved culture for naming?"
    bind:enabled={useSavedCulture}
    bind:value={culture}
  />

  <BaseButton onclick={generate}>Generate</BaseButton>

  {#if region}
    <h2>{Words.capitalize(region.name)}</h2>

    <p>{region.description}</p>

    {#if region.dominantCulture.name !== undefined}
      <p>The dominant culture here is the {region.dominantCulture.name}.</p>
    {/if}

    {#if region.realms[region.mainRealm].parent != -1}
      <div class="parent-realm">
        <p>
          {Words.title(region.name)} is part of {region.realms[
            region.realms[region.mainRealm].parent
          ].name}
          <button
            type="button"
            class="heraldry-inline-target"
            aria-label="View heraldry for {region.realms[region.realms[region.mainRealm].parent]
              .name}"
            onclick={() =>
              openHeraldryModal(
                region!.realms[region!.realms[region!.mainRealm].parent].heraldry,
                region!.realms[region!.realms[region!.mainRealm].parent].name,
                (arms) => replaceRealmHeraldry(region!.realms[region!.mainRealm].parent, arms),
              )}
          >
            <!-- Renders app-generated markup (no external or user-supplied input). -->
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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

    {#if ruler}
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
        <HeraldryEmblemButton
          arms={ruler.heraldry}
          title="{ruler.firstName} {ruler.lastName}"
          width={200}
          height={220}
          {rng}
          onclick={() =>
            openHeraldryModal(
              ruler!.heraldry!,
              `${ruler!.firstName} ${ruler!.lastName}`,
              replaceRulerHeraldry,
            )}
        />
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
    {/if}

    <h3>Nearby Sovereignties</h3>

    {#each region.realms as neighbor, index}
      {#if index != region.mainRealm && neighbor.parent == -1}
        <div class="neighbor">
          <HeraldryEmblemButton
            arms={neighbor.heraldry}
            title={neighbor.name}
            width={80}
            height={88}
            {rng}
            onclick={() =>
              openHeraldryModal(neighbor.heraldry, neighbor.name, (arms) =>
                replaceRealmHeraldry(index, arms),
              )}
          />
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
          <HeraldryEmblemButton
            arms={neighbor.heraldry}
            title={neighbor.name}
            width={80}
            height={88}
            {rng}
            onclick={() =>
              openHeraldryModal(neighbor.heraldry, neighbor.name, (arms) =>
                replaceRealmHeraldry(index, arms),
              )}
          />
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
                    region!.realms[neighbor.parent].heraldry,
                    region!.realms[neighbor.parent].name,
                    (arms) => replaceRealmHeraldry(neighbor.parent, arms),
                  )}
              >
                <!-- Renders app-generated markup (no external or user-supplied input). -->
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
  {/if}
</GeneratorPage>

<style>
  div.ruler {
    display: grid;
    column-gap: 1rem;
    margin-bottom: 1rem;
    grid-template-columns: 210px auto;
  }

  button.heraldry-inline-target {
    /* A wrapper around an image, not a plate: it opts out of the fill and the keyline, and out of
       the corner cut with them, which would otherwise clip the emblem's corners. */
    border: none;
    background: none;
    box-shadow: none;
    clip-path: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font: inherit;
  }

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
</style>
