<script lang="ts">
  import {
    getSpeciesBadgeSvgForName,
    pickSpeciesBadgeInitialsStyle,
    pickSpeciesBadgePalette,
    speciesNameToBadgeInitials,
  } from '$lib/species_badges';

  type Props = {
    speciesName: string;
    size?: 'sm' | 'md' | 'lg';
  };

  const { speciesName, size = 'sm' }: Props = $props();

  const palette = $derived(pickSpeciesBadgePalette(speciesName));
  const initials = $derived(speciesNameToBadgeInitials(speciesName));
  const initialsStyle = $derived(pickSpeciesBadgeInitialsStyle(palette));
  const svg = $derived(getSpeciesBadgeSvgForName(speciesName));

  const sizePx = $derived(size === 'lg' ? 36 : size === 'md' ? 28 : 20);
  const fontSizePx = $derived(size === 'lg' ? 14 : size === 'md' ? 11 : 8);
</script>

{#key speciesName}
  <span
    class="species-badge species-badge--{size}"
    role="img"
    aria-label={speciesName}
    title={speciesName}
    style:--badge-size="{sizePx}px"
    style:--badge-font-size="{fontSizePx}px"
    style:--badge-primary={palette.primary}
    style:--badge-secondary={palette.secondary}
    style:--badge-accent={palette.accent}
    style:--badge-text={initialsStyle.text}
    style:--badge-text-scrim={initialsStyle.scrim ?? 'transparent'}
  >
    {#if svg}
      <!-- Renders app-generated markup (no external or user-supplied input). -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <span class="species-badge__svg">{@html svg}</span>
    {:else}
      <span
        class="species-badge__initials"
        class:species-badge__initials--scrim={!!initialsStyle.scrim}>{initials}</span
      >
    {/if}
  </span>
{/key}

<style>
  .species-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--badge-size);
    height: var(--badge-size);
    border: 1px solid var(--badge-primary);
    border-radius: 2px;
    overflow: hidden;
    vertical-align: middle;
    background: conic-gradient(
      var(--badge-primary) 0deg 120deg,
      var(--badge-secondary) 120deg 240deg,
      var(--badge-accent) 240deg 360deg
    );
  }

  .species-badge__initials {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--badge-text);
    background: var(--badge-text-scrim);
    font-size: var(--badge-font-size);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.35);
  }

  .species-badge__initials--scrim {
    text-shadow: none;
  }

  .species-badge__svg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--badge-primary);
  }

  .species-badge__svg :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
