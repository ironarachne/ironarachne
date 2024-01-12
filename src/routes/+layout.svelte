<script lang="ts">
  import "$lib/styles/reset.scss";
  import "$lib/styles/main.scss";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  import type { LayoutData } from './$types';

  export let data: LayoutData;

  const user = writable();
  $: user.set(data.user);

  // TODO: try implementing a workspace for cultures within the user object

  setContext('user', user);
</script>

<Header />
<slot />
<Footer />
