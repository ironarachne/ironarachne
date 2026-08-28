<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import RoundIconButton from '$components/common/RoundIconButton.svelte';
  import icon from '$lib/assets/icons/set1/cross.svg?raw';

  type Props = Omit<HTMLButtonAttributes, 'class'> & {
    /** The accessible name. Defaults to "Close"; name what is being acted on where there is
     *  more than one of these on a page — "Close" alone tells a screen reader nothing about
     *  which panel it closes. */
    label?: string;
    class?: string;
    element?: HTMLButtonElement;
  };

  let { label = 'Close', element = $bindable(), ...rest }: Props = $props();
</script>

<RoundIconButton {icon} {label} bind:element {...rest} />
