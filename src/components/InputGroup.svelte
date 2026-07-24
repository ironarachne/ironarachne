<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    id: string;
    label: string;
    children: Snippet;
  };

  let { id, label, children }: Props = $props();
</script>

<div class="input-group">
  <label for={id}>{label}</label>
  {@render children()}
</div>
