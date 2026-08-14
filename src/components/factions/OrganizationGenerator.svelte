<script lang="ts">
  import {
    getOrganizationKindsForRegistry,
    generateOrganization,
    type OrganizationSizeInput,
    FantasyOrganizations,
  } from '$lib/organizations';
  import type {
    Organization,
    OrganizationProfile,
    OrganizationWorldContextPreset,
  } from '$lib/organizations';
  import { RNG } from '@ironarachne/rng';
  import * as Characters from '$lib/characters';
  import * as Names from '$lib/names';
  import { onMount } from 'svelte';
  import { renderSVGAsPNG } from '$lib/images';
  import {
    isDiscEmblem,
    isHeraldryEmblem,
    isMerchantMarkEmblem,
    isPatternLatticeEmblem,
  } from '$lib/visual_identity';
  import { renderDiscEmblemSvg } from '$lib/disc_emblem';
  import type { Arms } from '$lib/heraldry';
  import { renderMerchantMarkSvg } from '$lib/merchant_marks';
  import { renderPatternLatticeSvg } from '$lib/pattern_lattice';
  import { showHeraldryPersistenceModal } from '$lib/ui';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import HeraldryEmblemButton from '$components/heraldry/HeraldryEmblemButton.svelte';

  const rng = new RNG(Date.now().toString());
  let seed: string = $state(rng.randomString(13));
  let lockSeed = $state(false);
  $effect(() => {
    rng.setSeed(seed);
  });

  let genreFilter = $state<'any' | 'fantasy' | 'science_fiction'>('fantasy');
  let organizationKindId = $state('any');
  let nameSetName = $state('any');
  const nameSets = Names.getAllFantasyNameGeneratorSets(rng);
  let nameSet: Names.NameGeneratorSet = rng.item(nameSets);
  let sizePreset = $state<'any' | 'small' | 'medium' | 'large'>('any');
  let worldContextPreset = $state<'none' | OrganizationWorldContextPreset>('none');
  const worldPresetChoices: { value: 'none' | OrganizationWorldContextPreset; label: string }[] = [
    { value: 'none', label: 'No preset (no extra environment paragraph)' },
    { value: 'desert_route', label: 'Desert / arid trade routes' },
    { value: 'coastal', label: 'Coastal' },
    { value: 'mountain_pass', label: 'Mountain pass' },
    { value: 'river_trade', label: 'River trade' },
    { value: 'tundra', label: 'Tundra / cold' },
    { value: 'jungle_march', label: 'Jungle / seasonal mud' },
    { value: 'void_ledger', label: 'SF: void / transfer points' },
    { value: 'rim_wilderness', label: 'SF: rim habs' },
    { value: 'dome_sprawl', label: 'SF: dome / sealed habitats' },
  ];

  function matchKinds() {
    const all = getOrganizationKindsForRegistry(rng);
    if (genreFilter === 'any') {
      return all;
    }
    return all.filter((k) => k.genre === genreFilter);
  }

  function buildCharacterConfig() {
    const c = FantasyOrganizations.getDefaultOrganizationCharacterConfig(seed);
    c.familyNameGenerator = nameSet.family;
    c.femaleFirstNameGenerator = nameSet.female;
    c.maleFirstNameGenerator = nameSet.male;
    return c;
  }

  function orgFromGenerate(): Organization {
    const sizeArg: OrganizationSizeInput | undefined =
      sizePreset === 'any' ? undefined : { kind: 'preset', value: sizePreset };
    const worldContext =
      worldContextPreset === 'none'
        ? undefined
        : { kind: 'preset' as const, preset: worldContextPreset };
    return generateOrganization({
      rng,
      characterConfig: buildCharacterConfig(),
      genre: genreFilter === 'any' ? 'any' : genreFilter,
      kindId: organizationKindId === 'any' ? 'any' : organizationKindId,
      size: sizeArg,
      seedPrefix: 'page',
      worldContext,
    });
  }

  let org = $state(orgFromGenerate());
  let name = $state(org.name);
  let orgDescription = $state(org.description);
  let profile = $state<OrganizationProfile>(org.profile);
  let leaderLine = $state(org.leader.description);
  let notableMembers = $state(org.notableMembers);
  let relationships = $state(org.relationships);
  let motto = $state(org.visualIdentity.motto);

  const heraldryWidth = 200;
  const heraldryHeight = 220;

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

  function replaceOrganizationHeraldry(arms: Arms) {
    org = {
      ...org,
      visualIdentity: {
        ...org.visualIdentity,
        emblem: { kind: 'heraldry', arms },
      },
    };
  }

  function renderArmsForOrg(o: Organization) {
    const emblem = o.visualIdentity.emblem;
    if (isHeraldryEmblem(emblem)) {
      return;
    } else if (isMerchantMarkEmblem(emblem)) {
      const w = 200;
      const h = 200;
      const svg = renderMerchantMarkSvg(emblem.mark, w, h);
      renderSVGAsPNG(svg, w, h, 'org-arms');
    } else if (isPatternLatticeEmblem(emblem)) {
      const w = 200;
      const h = 200;
      const svg = renderPatternLatticeSvg(emblem.lattice, w, h);
      renderSVGAsPNG(svg, w, h, 'org-arms');
    } else if (isDiscEmblem(emblem)) {
      const w = 200;
      const h = 200;
      const svg = renderDiscEmblemSvg(emblem.disc, w, h);
      renderSVGAsPNG(svg, w, h, 'org-arms');
    }
  }

  function runGenerate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    if (nameSetName === 'any') {
      nameSet = rng.item(nameSets);
    } else {
      const found = nameSets.find((s) => s.name === nameSetName);
      if (found) {
        nameSet = found;
      }
    }
    org = orgFromGenerate();
    name = org.name;
    orgDescription = org.description;
    profile = org.profile;
    leaderLine = org.leader.description;
    notableMembers = org.notableMembers;
    relationships = org.relationships;
    motto = org.visualIdentity.motto;
    renderArmsForOrg(org);
  }

  onMount(() => {
    runGenerate();
  });
</script>

<GeneratorPage theme="fantasy" title="Organization Generator">
  {#snippet description()}
    <p>
      Generate organizations with hierarchy, visual identity, and member roles. Fantasy and science
      fiction kinds are available.
    </p>
    <p>
      If you choose the Name Set &quot;any,&quot; names will follow the default species-driven
      generators. Otherwise, names will follow the selected name set.
    </p>
  {/snippet}

  <SeedControls bind:seed bind:lockSeed />

  <SelectField
    id="genre"
    label="Genre"
    bind:value={genreFilter}
    options={[
      { value: 'any', label: 'any' },
      { value: 'fantasy', label: 'Fantasy' },
      { value: 'science_fiction', label: 'Science fiction' },
    ]}
    onchange={() => (organizationKindId = 'any')}
  />

  <div class="input-group">
    <label for="type">Organization kind</label>
    <select name="type" id="type" bind:value={organizationKindId}>
      <option value="any">any</option>
      {#each matchKinds() as k}
        <option value={k.id}>{k.typeLabel}</option>
      {/each}
    </select>
  </div>

  <SelectField
    id="size"
    label="Size"
    bind:value={sizePreset}
    options={[
      { value: 'any', label: 'any (kind defaults)' },
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ]}
  />

  <SelectField
    id="nameSet"
    label="Name Set"
    bind:value={nameSetName}
    options={['any', ...nameSets.map((ns) => ns.name)]}
  />

  <SelectField
    id="world"
    label="World context (optional)"
    bind:value={worldContextPreset}
    options={worldPresetChoices.map((c) => ({ value: c.value, label: c.label }))}
  />

  <button onclick={runGenerate}>Generate</button>

  <h2>{name}</h2>

  <div class="org-arms">
    {#if isHeraldryEmblem(org.visualIdentity.emblem)}
      <HeraldryEmblemButton
        arms={org.visualIdentity.emblem.arms}
        title={name}
        width={heraldryWidth}
        height={heraldryHeight}
        {rng}
        onclick={() => {
          const emblem = org.visualIdentity.emblem;
          if (isHeraldryEmblem(emblem)) {
            void openHeraldryModal(emblem.arms, name, replaceOrganizationHeraldry);
          }
        }}
      />
    {:else}
      <img alt="" id="org-arms" />
    {/if}
  </div>

  {#if motto}
    <p class="motto">"{motto}"</p>
  {/if}

  <p>{orgDescription}</p>

  <h3>Profile</h3>
  <ul class="org-profile">
    <li>
      <strong>Traits</strong>
      {profile.personalityTraits.map((t) => t.label).join(' · ')}
    </li>
    <li><strong>Goal</strong> {profile.goal.label}</li>
    <li><strong>Weakness</strong> {profile.weakness.label}</li>
    <li><strong>Public standing</strong> {profile.publicStanding.label}</li>
    {#if profile.environmentNarrative}
      <li>
        <strong>Environment</strong>
        {profile.environmentNarrative.shortLabel}
      </li>
    {/if}
  </ul>
  <p class="org-hook"><strong>Hook</strong> {profile.hook}</p>

  <p>{leaderLine}</p>

  {#if relationships.length > 0}
    <h3>Relationships</h3>
    <ul>
      {#each relationships as r}
        <li>{r.kind} → {r.relatedOrganizationId}</li>
      {/each}
    </ul>
  {/if}

  <h3>Notable Members</h3>

  {#each notableMembers as member}
    <p>
      <strong>
        {Characters.getHonorific(
          member.gender.name,
          Characters.getHighestPrecedenceTitle(member.titles || []),
          member.gender.pronouns,
        )}
        {member.firstName}
        {member.lastName}{#if Characters.getHonorific(member.gender.name, Characters.getHighestPrecedenceTitle(member.titles || []), member.gender.pronouns) == ''}
          ({Characters.getTitle(member)}){/if}:
      </strong>
      {member.description}
    </p>
  {/each}
</GeneratorPage>

<style>
  div.org-arms {
    width: 200px;
    height: 220px;
    margin: 0 auto;
  }

  .motto {
    font-style: italic;
    text-align: center;
  }
  ul.org-profile {
    max-width: 40rem;
    margin: 0 auto 1rem;
    text-align: left;
  }
  .org-hook {
    max-width: 40rem;
    margin: 0 auto 1rem;
  }
</style>
