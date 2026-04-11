<script lang="ts">
  import '$lib/styles/main.css';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  import UserContextProvider from '$lib/components/user_context_provider.svelte';

  import type { LayoutData } from './$types';

  interface Props {
    data: LayoutData;
    children?: import('svelte').Snippet;
  }

  let { data, children }: Props = $props();
</script>

<UserContextProvider user={data.user}>
  <Header />
  {@render children?.()}
  <Footer />
</UserContextProvider>
