<script lang="ts">
  import {
    archetypeNameToBadgeInitials,
    getArchetypeBadgeSvgForName,
    pickArchetypeBadgeInitialsStyle,
    pickArchetypeBadgePalette,
  } from '$lib/archetype_badges';

  type Props = {
    archetypeName: string;
    size?: 'sm' | 'md' | 'lg';
  };

  let { archetypeName, size = 'sm' }: Props = $props();

  const palette = $derived(pickArchetypeBadgePalette(archetypeName));
  const initials = $derived(archetypeNameToBadgeInitials(archetypeName));
  const initialsStyle = $derived(pickArchetypeBadgeInitialsStyle(palette));
  const svg = $derived(getArchetypeBadgeSvgForName(archetypeName));

  const sizePx = $derived(size === 'lg' ? 36 : size === 'md' ? 28 : 20);
  const fontSizePx = $derived(size === 'lg' ? 14 : size === 'md' ? 11 : 8);
</script>

{#key archetypeName}
  <span
    class="archetype-badge archetype-badge--{size}"
    role="img"
    aria-label={archetypeName}
    title={archetypeName}
    style:--badge-size="{sizePx}px"
    style:--badge-font-size="{fontSizePx}px"
    style:--badge-primary={palette.primary}
    style:--badge-secondary={palette.secondary}
    style:--badge-text={initialsStyle.text}
    style:--badge-text-scrim={initialsStyle.scrim ?? 'transparent'}
  >
    {#if svg}
      <span class="archetype-badge__svg">{@html svg}</span>
    {:else}
      <span
        class="archetype-badge__initials"
        class:archetype-badge__initials--scrim={!!initialsStyle.scrim}>{initials}</span
      >
    {/if}
  </span>
{/key}

<style>
  .archetype-badge {
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
      var(--badge-primary) 0deg 180deg,
      var(--badge-secondary) 180deg 360deg
    );
  }

  .archetype-badge__initials {
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
    font-family: system-ui, sans-serif;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.35);
  }

  .archetype-badge__initials--scrim {
    text-shadow: none;
  }

  .archetype-badge__svg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--badge-primary);
  }

  .archetype-badge__svg :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
