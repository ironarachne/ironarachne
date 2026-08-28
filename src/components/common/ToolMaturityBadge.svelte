<script lang="ts">
  import { maturityDescription, maturityDisplayName, showsMaturityBadge } from '$lib/tools';
  import type { ToolMaturity } from '$lib/tools';
  import Badge, { type BadgeTone } from '$components/common/Badge.svelte';

  type Props = {
    maturity: ToolMaturity;
    /**
     * Whether to spell out what the level promises beside the badge. A tool's own page has room
     * for the sentence and is where the user is about to invest work; a list of thirty tools does
     * not, and shows the level alone.
     */
    detailed?: boolean;
    /**
     * Drops the pill for plain coloured text. For a list, where nearly every row currently reads
     * Experimental: thirty bordered pills stop annotating the names and start shouting over them,
     * and the two rows that differ are what the user is scanning for.
     */
    plain?: boolean;
  };

  const { maturity, detailed = false, plain = false }: Props = $props();

  /* Gold for a tool that may change under you, cyan for one that keeps your work but is not
     finished. There is no third tone, because a finished tool says nothing at all. */
  const TONE: Record<string, BadgeTone> = {
    experimental: 'notice',
    beta: 'info',
  };
</script>

<!-- Nothing at all for a release-ready tool: `showsMaturityBadge` explains why, and rendering no
     element rather than an empty one matters, because every caller that lists these puts them in a
     flex container with a `gap` that an empty span would still open.

     Otherwise: the level is carried by the text, never by the colour alone: the colours say the
     same thing a second time for people who can see them, and nothing is lost if they cannot. -->
{#if showsMaturityBadge(maturity)}
  <span class="maturity">
    <!-- `maturity__level` is not a look: it is the hook the e2e suite finds a level by, and it is the
         caller's to carry rather than `Badge`'s to know about. -->
    <Badge tone={TONE[maturity]} {plain} class="maturity__level"
      >{maturityDisplayName(maturity)}</Badge
    >
    {#if detailed}
      <span class="maturity__detail">{maturityDescription(maturity)}</span>
    {/if}
  </span>
{/if}

<style>
  .maturity {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--s3);
    min-width: 0;
  }

  .maturity__detail {
    min-width: 0;
    font: var(--t-small);
    font-style: italic;
    /* Body text rather than the badge colour: this is the sentence a user reads, and it has to
       stay legible on every surface the badge sits on. */
    color: var(--ink-muted);
  }
</style>
