<script lang="ts">
  type Props = {
    id: string;
    label: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
  };

  let { id, label, value = $bindable(0), min, max, step }: Props = $props();
</script>

<div class="input-group">
  <label for={id}>{label}</label>
  <input type="number" {id} bind:value {min} {max} {step} />
</div>
