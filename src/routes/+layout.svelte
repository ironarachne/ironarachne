<script lang="ts">
  import '$lib/styles/main.css';
  import Footer from '$components/layout/Footer.svelte';
  import Header from '$components/layout/Header.svelte';
  import ModalHost from '$components/layout/ModalHost.svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  const { children }: Props = $props();
</script>

<Header />
{@render children?.()}
<Footer />
<ModalHost />
