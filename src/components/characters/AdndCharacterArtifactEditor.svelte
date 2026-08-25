<script lang="ts">
  import AdndCharacterBuilder from '$components/characters/AdndCharacterBuilder.svelte';
  import { validateAdndCharacterSnapshot, type AdndCharacterSnapshot } from '$lib/adnd';

  /**
   * The editing view for a saved AD&D 2E character.
   *
   * It mounts the builder rather than being a second editor written beside it, which is the whole
   * reason #45 and #47 were designed together: the builder already asks every question that makes
   * a character, so wiring it here is what makes requirement 4.1 affordable. What this component
   * adds is only the adapter between the framework's snapshot-in, snapshot-out contract and the
   * builder's own shape.
   *
   * The builder is what decides whether an edit patches the saved character or re-derives it —
   * see `adnd_character_build.ts`. Nothing about that lives here.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  /**
   * The snapshot as this kind's own validator accepts it, or nothing.
   *
   * The prop is `unknown` because the framework holds payloads of every kind. Narrowing through
   * `validate` rather than a cast is what stops a character editor rendering fields over
   * something that is not a character.
   */
  const accepted = $derived(validateAdndCharacterSnapshot(snapshot));
  const character = $derived<AdndCharacterSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );
</script>

{#if character === undefined}
  <p class="artifact-editor-problem">
    This artifact is stored as an AD&D 2E character but this build cannot read it:
    {accepted.ok ? '' : accepted.message}
  </p>
{:else}
  <AdndCharacterBuilder editing={character} {onChange} />
{/if}

<style>
  .artifact-editor-problem {
    color: var(--color-text-muted, inherit);
  }
</style>
