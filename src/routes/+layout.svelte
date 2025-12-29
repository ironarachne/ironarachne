<script lang="ts">
import "$lib/styles/main.scss";
import Footer from "$lib/components/Footer.svelte";
import Header from "$lib/components/Header.svelte";
import { setContext } from "svelte";

import type { LayoutData } from "./$types";

interface Props {
  data: LayoutData;
  children?: import("svelte").Snippet;
}

let { data, children }: Props = $props();

const user = $state(data.user);

// TODO: try implementing a workspace for cultures within the user object

setContext("user", user);
</script>

<Header />
{@render children?.()}
<Footer />
