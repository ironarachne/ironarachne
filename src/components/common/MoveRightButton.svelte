<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import RoundIconButton from '$components/common/RoundIconButton.svelte';
  import icon from '$lib/assets/icons/controller/triangle-right.svg?raw';

  type Props = Omit<HTMLButtonAttributes, 'class'> & {
    /** The accessible name. Defaults to "Move right"; name what is being acted on where there is
     *  more than one of these on a page — "Move right" alone tells a screen reader nothing about
     *  which panel it moves. */
    label?: string;
    class?: string;
    element?: HTMLButtonElement;
  };

  let { label = 'Move right', element = $bindable(), ...rest }: Props = $props();
</script>

<RoundIconButton {icon} {label} bind:element {...rest} />
