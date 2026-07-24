<script lang="ts">
  import type { Culture } from '$lib/culture';

  type Props = {
    cultures: Culture[];
    useSavedCulture?: boolean;
    savedCulture?: string;
    checkboxLabel?: string;
    selectLabel?: string;
  };

  let {
    cultures,
    useSavedCulture = $bindable(false),
    savedCulture = $bindable(),
    checkboxLabel = 'Use a saved culture for naming?',
    selectLabel = 'Select a saved culture to load',
  }: Props = $props();
</script>

{#if cultures.length > 0}
  <div class="input-group">
    <label for="useSavedCulture">{checkboxLabel}</label>
    <input type="checkbox" bind:checked={useSavedCulture} id="useSavedCulture" />
  </div>
  <div class="input-group">
    <label for="savedCulture">{selectLabel}</label>
    <select bind:value={savedCulture} id="savedCulture" disabled={!useSavedCulture}>
      {#each cultures as c}
        <option value={c.name}>{c.name}</option>
      {/each}
    </select>
  </div>
{/if}
