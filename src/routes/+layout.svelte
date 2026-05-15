<script lang="ts">
  import '$lib/styles/main.css';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<Header />
{@render children?.()}
<Footer />
