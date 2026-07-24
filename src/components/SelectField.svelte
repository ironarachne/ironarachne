<script lang="ts">
  type Option = { value: string; label: string };

  type Props = {
    id: string;
    label: string;
    value?: string;
    options: (string | Option)[];
    disabled?: boolean;
    onchange?: () => void;
  };

  let { id, label, value = $bindable(''), options, disabled = false, onchange }: Props = $props();

  function normalizeOption(opt: string | Option): Option {
    return typeof opt === 'string' ? { value: opt, label: opt } : opt;
  }

  const normalizedOptions = $derived(options.map(normalizeOption));
</script>

<div class="input-group">
  <label for={id}>{label}</label>
  <select {id} bind:value {onchange} {disabled}>
    {#each normalizedOptions as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
</div>
