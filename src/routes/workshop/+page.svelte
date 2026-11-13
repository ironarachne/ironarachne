<script lang="ts">
  import { getContext } from 'svelte';

  import WorkshopPage from '$components/layout/WorkshopPage.svelte';

  const onToolLabelChange = getContext<(label: string | undefined) => void>('setWorkshopToolLabel');
</script>

<svelte:head>
  <title>Workshop | Vastways</title>
</svelte:head>

<WorkshopPage {onToolLabelChange} />
