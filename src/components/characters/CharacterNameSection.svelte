<script lang="ts">
  import { onMount } from 'svelte';
  import { loadCulturesForNaming } from '$lib/characters';
  import type { ArtifactReference } from '$lib/artifacts';
  import { CULTURE_ARTIFACT_KIND, type Culture } from '$lib/culture';
  import SavedArtifactPicker from '$components/common/SavedArtifactPicker.svelte';
  import { getAllFantasyNameGeneratorSets } from '$lib/names';
  import { RNG } from '@ironarachne/rng';
  import CharacterNameControls from '$components/characters/CharacterNameControls.svelte';

  type NameSourceKind = 'default' | 'preset' | 'saved_culture' | 'referenced_culture';

  type Props = {
    nameSourceKind?: NameSourceKind;
    presetSetName?: string;
    savedCultureName?: string;
    firstName?: string;
    lastName?: string;
    lockName?: boolean;
    namingGender?: 'male' | 'female' | 'random';
    showGenderPicker?: boolean;
    onGenerateName?: () => void;
    seed?: string;
    /**
     * Offer a culture from the open project, as an artifact link rather than a copied name set.
     *
     * Off by default, so the four character tools that have not been converted yet render exactly
     * what they always did — the option is not in their dropdown and the picker is not on their
     * page. A tool opts in when its own readiness issue wires the reference and the provenance
     * through; #45 is the first.
     */
    offerReferencedCulture?: boolean;
    /** The culture the picker loaded, for the consumer to name from. */
    referencedCulture?: Culture;
    /** The link to record when the consumer saves. Set only once the culture has loaded. */
    cultureReference?: ArtifactReference;
  };

  let {
    nameSourceKind = $bindable<NameSourceKind>('default'),
    presetSetName = $bindable('human'),
    savedCultureName = $bindable(''),
    firstName = $bindable(''),
    lastName = $bindable(''),
    lockName = $bindable(false),
    namingGender = $bindable<'male' | 'female' | 'random'>('random'),
    showGenderPicker = false,
    onGenerateName,
    seed = 'character-name-sets',
    offerReferencedCulture = false,
    referencedCulture = $bindable(),
    cultureReference = $bindable(),
  }: Props = $props();

  let useReferencedCulture = $state(false);
  let cultureProblem = $state<string | null>(null);

  /**
   * Keep the source kind and the picker's checkbox saying the same thing.
   *
   * They are two controls describing one decision — the checkbox belongs to the picker and the
   * kind belongs to the naming controls — so each has to follow the other or the page can show a
   * culture chosen and a source of "default" at the same time.
   */
  $effect(() => {
    if (useReferencedCulture && nameSourceKind !== 'referenced_culture') {
      nameSourceKind = 'referenced_culture';
    }
  });

  $effect(() => {
    if (!useReferencedCulture && nameSourceKind === 'referenced_culture') {
      nameSourceKind = 'default';
    }
  });

  let savedCultures = $state<Culture[]>([]);
  let nameSetNames = $state<string[]>([]);

  onMount(() => {
    nameSetNames = getAllFantasyNameGeneratorSets(new RNG(seed)).map((set) => set.name);
    // Not awaited: the cultures come from the vault database, and the preset name sets beside
    // them are ready immediately. One list arriving a moment after the other is unremarkable.
    void loadCulturesForNaming().then((cultures) => {
      savedCultures = cultures;
      if (savedCultures.length > 0) {
        savedCultureName = savedCultures[0]!.name;
      }
    });
  });
</script>

{#if offerReferencedCulture}
  <SavedArtifactPicker
    kind={CULTURE_ARTIFACT_KIND}
    role="naming-culture"
    checkboxLabel="Name from a saved culture in this project"
    selectLabel="Culture"
    bind:enabled={useReferencedCulture}
    bind:value={referencedCulture}
    bind:reference={cultureReference}
    bind:problem={cultureProblem}
  />
{/if}

<CharacterNameControls
  bind:nameSourceKind
  bind:presetSetName
  bind:savedCultureName
  bind:firstName
  bind:lastName
  bind:lockName
  bind:namingGender
  {savedCultures}
  {nameSetNames}
  {offerReferencedCulture}
  {showGenderPicker}
  {onGenerateName}
/>
