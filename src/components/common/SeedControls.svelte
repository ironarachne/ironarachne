<script lang="ts">
  type Props = {
    seed?: string;
    lockSeed?: boolean;
    label?: string;
    lockLabel?: string;
    inline?: boolean;
    inputClass?: string;
  };

  let {
    seed = $bindable(''),
    lockSeed = $bindable(false),
    label = 'Seed',
    lockLabel = 'Lock Seed',
    inline = false,
    inputClass = '',
  }: Props = $props();
</script>

<!-- The field keeps its `#seed` id — that is what the e2e suite pins a generator's seed through —
     and takes its monospace face from `.seed-field` rather than from an id selector in main.css. -->
{#if inline}
  <div class="input-group input-group--inline">
    <label for="seed">{label}</label>
    <input type="text" bind:value={seed} id="seed" name="seed" class="seed-field {inputClass}" />
    <label class="inline-label">
      <input type="checkbox" bind:checked={lockSeed} id="lockSeed" name="lockSeed" />
      {lockLabel}
    </label>
  </div>
{:else}
  <div class="input-group">
    <label for="seed">{label}</label>
    <input type="text" bind:value={seed} id="seed" name="seed" class="seed-field {inputClass}" />
    <label class="inline-label">
      <input type="checkbox" bind:checked={lockSeed} id="lockSeed" name="lockSeed" />
      {lockLabel}
    </label>
  </div>
{/if}
