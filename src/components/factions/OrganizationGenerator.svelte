<script lang="ts">
  import { onMount } from 'svelte';
  import { RNG } from '@ironarachne/rng';
  import * as Organizations from '$lib/organizations';
  import type {
    Organization,
    OrganizationGeneratorConfigRecord,
    OrganizationGenreFilter,
    OrganizationSizePreset,
    OrganizationWorldContextPreset,
  } from '$lib/organizations';
  import * as Characters from '$lib/characters';
  import type { ArtifactReference } from '$lib/artifacts';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import { downloadTextFile } from '$lib/download';
  import { HERALDRY_ARTIFACT_KIND, type Arms, type RestoredHeraldry } from '$lib/heraldry';
  import { getFantasyNameGeneratorSetNames } from '$lib/names';
  import { downloadTextPdf } from '$lib/pdf';
  import { showHeraldryModal } from '$lib/ui';
  import { isHeraldryEmblem } from '$lib/visual_identity';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import SelectField from '$components/common/SelectField.svelte';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import HeraldryEmblemButton from '$components/heraldry/HeraldryEmblemButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const TOOL_PATH = '/fantasy/organization';
  const ANY = Organizations.ORGANIZATION_ANY;
  /** The value of the name-set select that means the culture the picker loaded. */
  const NAMES_FROM_CULTURE = 'culture';

  /**
   * The page's own RNG, which is what a new seed is drawn from.
   *
   * Seeded from the clock once, at mount, and never again. It used to also be the generator's RNG,
   * reseeded from the seed box on every press, and the kind list and the name set were drawn from
   * it before the reseed — so what "any" gave you depended on how many times you had pressed
   * Generate. `organization_roll.ts` draws all of that from the seed now.
   */
  const rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  let lockSeed = $state(false);

  let genreFilter = $state<OrganizationGenreFilter>('fantasy');
  let organizationKindId = $state<string>(ANY);
  let nameSetName = $state<string>(ANY);
  let sizePreset = $state<OrganizationSizePreset | typeof ANY>(ANY);
  let worldContextPreset = $state<'none' | OrganizationWorldContextPreset>('none');
  const nameSetNames = getFantasyNameGeneratorSetNames();
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

  /**
   * The kinds the genre filter offers.
   *
   * Built from a fixed RNG: the registry takes one because each kind draws a heraldry template
   * from it, but the *list* of kinds does not vary and the dropdown must not either.
   */
  const kindChoices = $derived(
    Organizations.organizationKindsForGenre(genreFilter, new RNG('organization-kind-list')).map(
      (kind) => ({ value: kind.id, label: kind.typeLabel }),
    ),
  );

  /** Filled in by the culture picker: a saved culture to name the people from (5.1). */
  let useReferencedCulture = $state(false);
  let referencedCulture = $state<Culture | undefined>();
  let cultureReference = $state<ArtifactReference | undefined>();
  const cultureLoaded = $derived(useReferencedCulture && referencedCulture !== undefined);

  /** Filled in by the arms picker: a saved coat of arms to bear instead of rolling an emblem. */
  let useReferencedArms = $state(false);
  let referencedArms = $state<RestoredHeraldry | undefined>();
  let armsReference = $state<ArtifactReference | undefined>();
  const wearingReferencedArms = $derived(useReferencedArms && referencedArms !== undefined);

  /**
   * Follow the culture into and out of the name-set select, keyed on the culture arriving or
   * leaving rather than on the select, so the user's own choice stands in between.
   */
  $effect(() => {
    if (cultureLoaded) {
      nameSetName = NAMES_FROM_CULTURE;
    } else if (nameSetName === NAMES_FROM_CULTURE) {
      nameSetName = ANY;
    }
  });

  /**
   * The rolled organization.
   *
   * `$state.raw`, and not as a preference. Deep-reactive `$state` wraps every object in the value
   * in a Proxy, and `structuredClone` — what IndexedDB stores with — refuses a Proxy outright, so
   * saving fails with `could not be cloned`. The same trap is written up in `$lib/workshop`'s
   * README beside `saveToolArtifact`.
   */
  let organization = $state.raw<Organization | null>(null);
  /** The settings the organization on screen was actually rolled with. Raw, for the same reason. */
  let rolledConfig = $state.raw<OrganizationGeneratorConfigRecord>({});
  /** The culture link, recorded only when the organization on screen was named from it. */
  let rolledCultureReference = $state.raw<ArtifactReference | undefined>();

  /**
   * The organization as shown: wearing the referenced arms when the picker says so.
   *
   * Composed over the rolled one rather than written into it, so unticking the picker gives the
   * rolled emblem back without a re-roll.
   */
  const shown = $derived<Organization | null>(
    organization === null
      ? null
      : wearingReferencedArms && referencedArms !== undefined
        ? {
            ...organization,
            visualIdentity: {
              ...organization.visualIdentity,
              emblem: { kind: 'heraldry', arms: referencedArms.arms },
            },
          }
        : organization,
  );

  const snapshot = $derived(
    shown === null ? null : Organizations.toOrganizationSnapshot(shown, wearingReferencedArms),
  );
  const defaultArtifactName = $derived(
    shown === null ? '' : Organizations.organizationDisplayName(shown),
  );
  const references = $derived(
    [rolledCultureReference, wearingReferencedArms ? armsReference : undefined].filter(
      (entry): entry is ArtifactReference => entry !== undefined,
    ),
  );

  /** The emblem drawn from its parameters, for every kind but a heraldic one, which has a button. */
  const emblemSvg = $derived(
    snapshot === null || snapshot.visualIdentity.emblem.kind === 'heraldry'
      ? null
      : Organizations.renderOrganizationEmblemSvg(snapshot.visualIdentity.emblem, new RNG(seed)),
  );

  function requestedNameSet(): string | undefined {
    if (nameSetName === NAMES_FROM_CULTURE) {
      return cultureLoaded ? referencedCulture?.nameGenerators.name : undefined;
    }
    return nameSetName === ANY ? undefined : nameSetName;
  }

  /** The settings a roll takes, and the ones provenance records (3.6). */
  function currentConfig(): OrganizationGeneratorConfigRecord {
    const nameGeneratorSet = requestedNameSet();
    return {
      genre: genreFilter,
      kindId: organizationKindId,
      ...(sizePreset === ANY ? {} : { size: sizePreset }),
      ...(nameGeneratorSet === undefined ? {} : { nameGeneratorSet }),
      ...(worldContextPreset === 'none' ? {} : { worldContextPreset }),
    };
  }

  function runGenerate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    const config = currentConfig();
    const rolled = Organizations.rollOrganization(seed, config);
    organization = rolled.organization;
    // The resolved kind and set, not the requested ones: "any" or a kind this build has since
    // dropped would otherwise be recorded as provenance a re-roll could not honour.
    rolledConfig = {
      ...config,
      kindId: rolled.organization.kindId,
      nameGeneratorSet: rolled.nameGeneratorSet,
    };
    rolledCultureReference =
      nameSetName === NAMES_FROM_CULTURE && cultureLoaded ? cultureReference : undefined;
  }

  async function openHeraldryModal(arms: Arms) {
    if (organization === null) {
      return;
    }
    const result = await showHeraldryModal({ arms, seed, title: organization.name });
    if (result.action === 'replaced') {
      // A replacement is the organization's own arms, whatever it was bearing before.
      useReferencedArms = false;
      organization = {
        ...organization,
        visualIdentity: {
          ...organization.visualIdentity,
          emblem: { kind: 'heraldry', arms: result.arms },
        },
      };
    }
  }

  function exportMarkdown() {
    if (snapshot === null) {
      return;
    }
    downloadTextFile(
      Organizations.organizationToMarkdown(snapshot),
      `${Organizations.organizationFileStem(snapshot)}.md`,
      'text/markdown',
    );
  }

  async function exportPdf() {
    if (snapshot === null) {
      return;
    }
    await downloadTextPdf(
      Organizations.organizationDisplayName(snapshot),
      Organizations.organizationToText(snapshot),
      `${Organizations.organizationFileStem(snapshot)}.pdf`,
    );
  }

  /**
   * The emblem as SVG, drawn from its parameters — the referenced arms included, since the page
   * is the holder of that reference and has them.
   */
  function exportEmblem() {
    if (shown === null) {
      return;
    }
    const svg = Organizations.renderOrganizationEmblemSvg(
      Organizations.toStoredOrganization(shown).visualIdentity.emblem,
      new RNG(seed),
    );
    if (svg === null) {
      return;
    }
    downloadTextFile(
      svg,
      `${Organizations.organizationFileStem(shown)}-emblem.svg`,
      'image/svg+xml',
    );
  }

  onMount(() => {
    runGenerate();
  });
</script>

<GeneratorPage toolPath={TOOL_PATH} title="Organization Generator">
  {#snippet description()}
    <p>
      Generate organizations with hierarchy, visual identity, and member roles. Fantasy and science
      fiction kinds are available.
    </p>
    <p>
      If you choose the Name Set &quot;any,&quot; the seed picks a name set. Otherwise, names will
      follow the selected name set, or the saved culture you pick below.
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
    onchange={() => (organizationKindId = ANY)}
  />

  <SelectField
    id="type"
    label="Organization kind"
    bind:value={organizationKindId}
    options={[{ value: ANY, label: 'any' }, ...kindChoices]}
  />

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

  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Name from a saved culture in this project"
    selectLabel="Culture"
    bind:enabled={useReferencedCulture}
    bind:value={referencedCulture}
    bind:reference={cultureReference}
  />

  <SelectField
    id="nameSet"
    label="Name Set"
    bind:value={nameSetName}
    options={[
      { value: ANY, label: 'any' },
      ...(cultureLoaded ? [{ value: NAMES_FROM_CULTURE, label: 'From the saved culture' }] : []),
      ...nameSetNames.map((name) => ({ value: name, label: name })),
    ]}
  />

  <SavedArtifactPicker
    kind={HERALDRY_ARTIFACT_KIND}
    role="arms"
    checkboxLabel="Give this organization a saved coat of arms"
    selectLabel="Coat of arms"
    bind:enabled={useReferencedArms}
    bind:value={referencedArms}
    bind:reference={armsReference}
  />

  <SelectField
    id="world"
    label="World context (optional)"
    bind:value={worldContextPreset}
    options={worldPresetChoices.map((c) => ({ value: c.value, label: c.label }))}
  />

  <BaseButton onclick={runGenerate}>Generate</BaseButton>

  <SaveArtifactButton
    kind={Organizations.ORGANIZATION_ARTIFACT_KIND}
    toolPath={TOOL_PATH}
    {snapshot}
    {seed}
    config={rolledConfig}
    defaultName={defaultArtifactName}
    {references}
  />

  {#if shown && snapshot}
    <div class="organization-exports">
      <BaseButton onclick={exportMarkdown}>Download Markdown</BaseButton>
      <BaseButton onclick={exportPdf}>Download PDF</BaseButton>
      {#if shown.visualIdentity.emblem.kind !== 'none'}
        <BaseButton onclick={exportEmblem}>Download Emblem (SVG)</BaseButton>
      {/if}
    </div>

    <div class="organization">
      <h2>{shown.name}</h2>

      <div class="org-arms">
        {#if isHeraldryEmblem(shown.visualIdentity.emblem)}
          {@const arms = shown.visualIdentity.emblem.arms}
          <HeraldryEmblemButton
            {arms}
            title={shown.name}
            width={Organizations.ORGANIZATION_EMBLEM_WIDTH}
            height={Organizations.ORGANIZATION_EMBLEM_HEIGHT}
            rng={new RNG(seed)}
            onclick={() => void openHeraldryModal(arms)}
          />
        {:else if emblemSvg !== null}
          <!-- Drawn from the emblem's parameters, which is what the payload stores. -->
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html emblemSvg}
        {/if}
      </div>

      {#if shown.visualIdentity.motto}
        <p class="motto">"{shown.visualIdentity.motto}"</p>
      {/if}

      <p>{shown.description}</p>

      <h3>Profile</h3>
      <ul class="org-profile">
        <li>
          <strong>Traits</strong>
          {shown.profile.personalityTraits.map((t) => t.label).join(' · ')}
        </li>
        <li><strong>Goal</strong> {shown.profile.goal.label}</li>
        <li><strong>Weakness</strong> {shown.profile.weakness.label}</li>
        <li><strong>Public standing</strong> {shown.profile.publicStanding.label}</li>
        {#if shown.profile.environmentNarrative}
          <li>
            <strong>Environment</strong>
            {shown.profile.environmentNarrative.shortLabel}
          </li>
        {/if}
      </ul>
      <p class="org-hook"><strong>Hook</strong> {shown.profile.hook}</p>

      <p>{shown.leader.description}</p>

      {#if shown.relationships.length > 0}
        <h3>Relationships</h3>
        <ul>
          {#each shown.relationships as r}
            <li>{r.kind} → {r.relatedOrganizationId}</li>
          {/each}
        </ul>
      {/if}

      <h3>Notable Members</h3>

      {#each shown.notableMembers as member (member.id)}
        {@const honorific = Characters.getHonorific(
          member.gender.name,
          Characters.getHighestPrecedenceTitle(member.titles || []),
          member.gender.pronouns,
        )}
        <p class="member">
          <strong>
            {honorific}
            {member.firstName}
            {member.lastName}{#if honorific === ''}
              ({Characters.getTitle(member)}){/if}:
          </strong>
          {member.description}
        </p>
      {/each}
    </div>
  {/if}
</GeneratorPage>

<style>
  .organization-exports {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

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
