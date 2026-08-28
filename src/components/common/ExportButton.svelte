<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import RoundIconButton from '$components/common/RoundIconButton.svelte';
  import icon from '$lib/assets/icons/set1/download.svg?raw';

  type Props = Omit<HTMLButtonAttributes, 'class'> & {
    /** The accessible name. Defaults to "Export"; name what is being acted on wherever there is
     *  more than one of these on a page, since the glyph names the verb and not the object. */
    label?: string;
    class?: string;
    element?: HTMLButtonElement;
  };

  let { label = 'Export', element = $bindable(), ...rest }: Props = $props();
</script>

<RoundIconButton {icon} {label} bind:element {...rest} />
