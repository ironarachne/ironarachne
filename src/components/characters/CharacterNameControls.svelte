<script lang="ts">
  import type { Culture } from '$lib/culture';

  type NameSourceKind = 'default' | 'preset' | 'saved_culture';

  type Props = {
    nameSourceKind?: NameSourceKind;
    presetSetName?: string;
    savedCultureName?: string;
    savedCultures?: Culture[];
    nameSetNames?: string[];
    namingGender?: 'male' | 'female' | 'random';
    firstName?: string;
    lastName?: string;
    lockName?: boolean;
    showGenderPicker?: boolean;
    onGenerateName?: () => void;
  };

  let {
    nameSourceKind = $bindable('default'),
    presetSetName = $bindable('human'),
    savedCultureName = $bindable(''),
    savedCultures = [],
    nameSetNames = [],
    namingGender = $bindable('random'),
    firstName = $bindable(''),
    lastName = $bindable(''),
    lockName = $bindable(false),
    showGenderPicker = false,
    onGenerateName,
  }: Props = $props();

  const hasSavedCultures = $derived(savedCultures.length > 0);

  $effect(() => {
    if (nameSourceKind === 'saved_culture' && hasSavedCultures && !savedCultureName) {
      savedCultureName = savedCultures[0]!.name;
    }
  });
</script>

<fieldset class="character-name-panel">
  <legend>Character naming</legend>

  <div class="character-name-panel__body">
    <div class="input-group">
      <label for="nameSourceKind">Name source</label>
      <select id="nameSourceKind" bind:value={nameSourceKind}>
        <option value="default">Default</option>
        <option value="preset">Preset name set</option>
        {#if hasSavedCultures}
          <option value="saved_culture">Saved culture</option>
        {/if}
      </select>
    </div>

    {#if nameSourceKind === 'preset'}
      <div class="input-group">
        <label for="presetSetName">Preset name set</label>
        <select id="presetSetName" bind:value={presetSetName}>
          {#each nameSetNames as setName}
            <option value={setName}>{setName}</option>
          {/each}
        </select>
      </div>
    {/if}

    {#if nameSourceKind === 'saved_culture' && hasSavedCultures}
      <div class="input-group">
        <label for="savedCultureName">Saved culture</label>
        <select id="savedCultureName" bind:value={savedCultureName}>
          {#each savedCultures as culture}
            <option value={culture.name}>{culture.name}</option>
          {/each}
        </select>
      </div>
    {/if}

    {#if showGenderPicker}
      <div class="input-group">
        <label for="namingGender">Gender for naming</label>
        <select id="namingGender" bind:value={namingGender}>
          <option value="random">Random</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
    {/if}

    <div class="input-group">
      <label for="characterFirstName">First name</label>
      <input id="characterFirstName" type="text" bind:value={firstName} />
    </div>

    <div class="input-group">
      <label for="characterLastName">Last name</label>
      <input id="characterLastName" type="text" bind:value={lastName} />
    </div>
  </div>

  <div class="character-name-panel__actions">
    <label class="character-name-panel__lock">
      <input type="checkbox" bind:checked={lockName} />
      Lock Name
    </label>
    <button type="button" disabled={lockName} onclick={() => onGenerateName?.()}
      >Generate name</button
    >
  </div>
</fieldset>

<style>
  .character-name-panel {
    border: 1px solid #000;
    margin: 0 0 1rem;
    padding: 0.75rem 1rem 1rem;
  }

  .character-name-panel legend {
    font-weight: 700;
    padding: 0 0.35rem;
  }

  .character-name-panel__body :global(.input-group:last-child) {
    margin-bottom: 0;
  }

  .character-name-panel__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1rem;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #000;
  }

  .character-name-panel__lock {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
  }
</style>
