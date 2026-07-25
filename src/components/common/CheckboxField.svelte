<script lang="ts">
  type Props = {
    id: string;
    label: string;
    checked?: boolean;
  };

  let { id, label, checked = $bindable(false) }: Props = $props();
</script>

<div class="input-group">
  <input type="checkbox" {id} bind:checked />
  <label for={id}>{label}</label>
</div>
