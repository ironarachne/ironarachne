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

{#if inline}
  <div class="input-group">
    <label for="seed">{label}</label>
    <input type="text" bind:value={seed} id="seed" name="seed" class={inputClass} />
    <label class="inline-label">
      <input type="checkbox" bind:checked={lockSeed} id="lockSeed" name="lockSeed" />
      {lockLabel}
    </label>
  </div>
{:else}
  <div class="input-group">
    <label for="seed">{label}</label>
    <input type="text" bind:value={seed} id="seed" name="seed" class={inputClass} />
    <input type="checkbox" bind:checked={lockSeed} id="lockSeed" name="lockSeed" /> {lockLabel}
  </div>
{/if}
