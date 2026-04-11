<script lang="ts">
  import { setContext } from 'svelte';
  import type UserData from '$lib/user_data';

  type Props = {
    user: UserData;
    children: import('svelte').Snippet;
  };

  let { user, children }: Props = $props();

  /** Read `user` via getter so `setContext` does not close over a one-time prop snapshot. */
  setContext('user', {
    get value(): UserData {
      return user;
    },
  });
</script>

{@render children()}
