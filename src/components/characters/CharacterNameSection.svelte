<script lang="ts">
  import { onMount } from 'svelte';
  import { loadSavedCultures, type Culture } from '$lib/culture';
  import { getAllFantasyNameGeneratorSets } from '$lib/names';
  import { RNG } from '@ironarachne/rng';
  import CharacterNameControls from '$components/characters/CharacterNameControls.svelte';

  type NameSourceKind = 'default' | 'preset' | 'saved_culture';

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
  }: Props = $props();

  let savedCultures = $state<Culture[]>([]);
  let nameSetNames = $state<string[]>([]);

  onMount(() => {
    savedCultures = loadSavedCultures();
    nameSetNames = getAllFantasyNameGeneratorSets(new RNG(seed)).map((set) => set.name);
    if (savedCultures.length > 0) {
      savedCultureName = savedCultures[0]!.name;
    }
  });
</script>

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
  {showGenderPicker}
  {onGenerateName}
/>
