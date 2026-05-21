<script lang="ts">
  import '$lib/styles/main.css';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  import ModalHost from '$lib/components/modal_host.svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<Header />
{@render children?.()}
<Footer />
<ModalHost />
