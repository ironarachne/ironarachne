<script lang="ts">
  import '$lib/styles/main.css';
  import Footer from '$components/Footer.svelte';
  import Header from '$components/Header.svelte';
  import ModalHost from '$components/ModalHost.svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<Header />
{@render children?.()}
<Footer />
<ModalHost />
