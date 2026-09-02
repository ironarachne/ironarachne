<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Words from '@ironarachne/words';
  import * as Characters from '$lib/characters';
  import type { Character } from '$lib/characters';
  import { renderHeraldryDeviceSvg } from '$lib/heraldry';
  import type { Arms } from '$lib/heraldry';
  import { showHeraldryModal } from '$lib/ui';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import { SETTLEMENT_ARTIFACT_KIND, type Settlement } from '$lib/settlements';
  import * as Regions from '$lib/regions';
  import type { Region, RegionGeneratorConfigRecord } from '$lib/regions';
  import type { ArtifactReference } from '$lib/artifacts';
  import { downloadTextFile } from '$lib/download';
  import { downloadTextPdf } from '$lib/pdf';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import HeraldryEmblemButton from '$components/heraldry/HeraldryEmblemButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/region';

  /**
   * The page's own RNG, which is what a new seed is drawn from, and what the heraldry previews are
   * drawn with.
   *
   * Seeded from the clock once, at mount, and never again. It used to be the generator's RNG as
   * well, reseeded from the seed box on every press and threaded into a config built at module
   * load; `region_roll.ts` owns the roll now.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let nameSetName = $state(Regions.REGION_ANY_NAME_SET);
  const nameSetOptions = [Regions.REGION_ANY_NAME_SET, ...Regions.regionNameSetNames()];

  /** The saved culture that names this region, when the user has offered one (5.1). */
  let useSavedCulture = $state(false);
  let culture = $state<Culture | undefined>(undefined);
  let cultureReference = $state<ArtifactReference | undefined>(undefined);

  /** The saved settlement to place in this region, when the user has offered one (5.1). */
  let useSavedSettlement = $state(false);
  let savedSettlement = $state<Settlement | undefined>(undefined);
  let settlementReference = $state<ArtifactReference | undefined>(undefined);

  /**
   * The rolled region.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`. A region is the largest composed value on the site.
   */
  let region = $state.raw<Region | null>(null);

  /** What this roll actually used, which is not the same as what the controls say next. */
  let usedCulture = $state(false);
  let usedSettlementName = $state<string | undefined>(undefined);

  const ruler = $derived<Character | undefined>(region?.authority);

  /** What the roll records about itself: the resolved name set, as provenance (3.6). */
  let rolledNameSet = $state<string | undefined>(undefined);
  const generatorConfig = $derived<RegionGeneratorConfigRecord>(
    usedCulture || rolledNameSet === undefined ? {} : { nameSet: rolledNameSet },
  );

  /**
   * What is stored.
   *
   * A referenced culture and a referenced settlement are both left out, per rule 2 of
   * docs/workshop.md: a region holding its own copy of either would show a stale one after somebody
   * edited the original. Which artifact each is lives on the reference beside the payload.
   */
  const snapshot = $derived(
    region === null
      ? null
      : Regions.toRegionSnapshot(region, {
          cultureIsReferenced: usedCulture,
          ...(usedSettlementName === undefined
            ? {}
            : { referencedSettlementName: usedSettlementName }),
        }),
  );

  const mapSrc = $derived(snapshot === null ? '' : Regions.regionMapDataUrl(snapshot));

  const defaultArtifactName = $derived(region === null ? '' : Regions.regionDisplayName(region));

  const references = $derived(
    [
      usedCulture ? cultureReference : undefined,
      usedSettlementName === undefined ? undefined : settlementReference,
    ].filter((reference): reference is ArtifactReference => reference !== undefined),
  );

  /**
   * Puts a saved settlement into the region in place of one it generated.
   *
   * It takes the first slot, which is the one the map marks as the capital, because a referee who
   * attached a particular town to a region wants to be able to find it. Its `mapNodeId` is taken
   * from the settlement it replaces so the map still has somewhere to draw it — the saved
   * settlement was placed on a different map, and its own node id means nothing here.
   */
  function withSavedSettlement(rolled: Region, settlement: Settlement): Region {
    if (rolled.settlements.length === 0) {
      return { ...rolled, settlements: [settlement] };
    }
    const placed = { ...settlement, mapNodeId: rolled.settlements[0].mapNodeId };
    return { ...rolled, settlements: [placed, ...rolled.settlements.slice(1)] };
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }

    const chosen = useSavedCulture && culture !== undefined ? culture : null;
    const config: RegionGeneratorConfigRecord =
      chosen !== null || nameSetName === Regions.REGION_ANY_NAME_SET
        ? {}
        : { nameSet: nameSetName };

    const rolled = Regions.rollRegion(seed, config, chosen);
    usedCulture = chosen !== null;
    rolledNameSet = rolled.nameSet;

    if (useSavedSettlement && savedSettlement !== undefined) {
      region = withSavedSettlement(rolled.region, savedSettlement);
      usedSettlementName = savedSettlement.name;
    } else {
      region = rolled.region;
      usedSettlementName = undefined;
    }
  }

  function exportMarkdown() {
    if (snapshot === null) return;
    downloadTextFile(
      Regions.regionToMarkdown(snapshot),
      `${Regions.regionFileStem(snapshot)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (snapshot === null) return;
    await downloadTextPdf(
      Regions.regionDisplayName(snapshot),
      Regions.regionToText(snapshot),
      `${Regions.regionFileStem(snapshot)}.pdf`,
    );
  }

  /** The map, which is what a region is (6.3). It had neither an export nor a picture until now. */
  function exportMapSvg() {
    if (snapshot === null) return;
    downloadTextFile(
      Regions.regionToMapSvg(snapshot),
      `${Regions.regionFileStem(snapshot)}.svg`,
      'image/svg+xml',
    );
  }

  async function openHeraldryModal(
    arms: Arms,
    title: string,
    applyReplacement: (arms: Arms) => void,
  ) {
    const result = await showHeraldryModal({ arms, seed, title });
    if (result.action === 'replaced') {
      applyReplacement(result.arms);
    }
  }

  function replaceRulerHeraldry(arms: Arms) {
    if (!region) return;
    region = { ...region, authority: { ...region.authority, heraldry: arms } };
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

  onMount(() => {
    generate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Region Generator">
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
    bind:reference={cultureReference}
  />

  <SavedArtifactPicker
    kind={SETTLEMENT_ARTIFACT_KIND}
    role="settlement"
    checkboxLabel="Put a saved settlement in this region"
    selectLabel="Settlement"
    bind:enabled={useSavedSettlement}
    bind:value={savedSettlement}
    bind:reference={settlementReference}
  />

  <div class="actions">
    <BaseButton onclick={generate}>Generate</BaseButton>
    <BaseButton onclick={exportMarkdown} disabled={!region}>Download Markdown</BaseButton>
    <BaseButton onclick={exportPdf} disabled={!region}>Download PDF</BaseButton>
    <BaseButton onclick={exportMapSvg} disabled={!region}>Download Map (SVG)</BaseButton>
  </div>

  <SaveArtifactButton
    kind={Regions.REGION_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    {snapshot}
    {seed}
    config={generatorConfig}
    defaultName={defaultArtifactName}
    {references}
  />

  {#if region}
    <h2>{Words.capitalize(region.name)}</h2>

    <p>{region.description}</p>

    {#if mapSrc}
      <!-- The map, which is the tool's actual output and was never shown. `region_map_svg.ts` had
           existed the whole time with one caller, a CLI script. An `<img>` rather than inline
           markup: the map's paths extend past the viewBox that clips them, so inlining puts
           1,888px-wide elements inside a 320px phone as far as the mobile overflow sweep is
           concerned. -->
      <img class="region-map" src={mapSrc} alt="Map of {region.name}" />
    {/if}

    {#if region.dominantCulture !== null}
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
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .region-map {
    max-width: 100%;
    height: auto;
    display: block;
  }

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
