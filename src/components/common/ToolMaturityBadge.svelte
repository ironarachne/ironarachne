<script lang="ts">
  import { maturityDescription, maturityDisplayName, showsMaturityBadge } from '$lib/tools';
  import type { ToolMaturity } from '$lib/tools';

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
</script>

<!-- Nothing at all for a release-ready tool: `showsMaturityBadge` explains why, and rendering no
     element rather than an empty one matters, because every caller that lists these puts them in a
     flex container with a `gap` that an empty span would still open.

     Otherwise: the level is carried by the text, never by the colour alone: the colours say the
     same thing a second time for people who can see them, and nothing is lost if they cannot. -->
{#if showsMaturityBadge(maturity)}
  <span class="maturity maturity--{maturity}" class:maturity--plain={plain}>
    <span class="maturity__level">{maturityDisplayName(maturity)}</span>
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
    gap: 0.4rem;
    min-width: 0;
  }

  .maturity__level {
    flex-shrink: 0;
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--maturity-color);
    border-radius: 999px;
    background: var(--charcoal);
    color: var(--maturity-color);
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    line-height: 1.5;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .maturity--plain .maturity__level {
    padding: 0;
    border: none;
    background: none;
    font-size: 0.75rem;
    letter-spacing: 0;
    text-transform: none;
  }

  .maturity__detail {
    min-width: 0;
    font-size: 0.85rem;
    font-style: italic;
    /* Body text rather than the badge colour: this is the sentence a user reads, and it has to
       stay legible on every theme the badge sits on. */
    color: inherit;
    opacity: 0.85;
  }

  /* Gold for a tool that may change under you, cyan for one that keeps your work but is not
     finished. There is no third colour, because a finished tool says nothing. */
  .maturity--experimental {
    --maturity-color: var(--gold);
  }

  .maturity--beta {
    --maturity-color: var(--cyan);
  }
</style>
