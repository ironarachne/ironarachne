<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import {
    setSpookyShipText,
    validateSpookyShipSnapshot,
    type SpookyShipSnapshot,
  } from '$lib/spooky_ship';

  /**
   * The editing view for a saved derelict: a textarea, which is the honest editing view for prose
   * and satisfies requirement 4.1 completely — the one field displayed is the field. Dirty state,
   * saving, and the destructive re-roll belong to the surface around it.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  const accepted = $derived(validateSpookyShipSnapshot(snapshot));
  const ship = $derived<SpookyShipSnapshot | undefined>(accepted.ok ? accepted.value : undefined);
</script>

{#if ship === undefined}
  <Notice tone="danger">
    These contents are stored as a spooky ship but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <!-- "Ship description" rather than "Description": the panel above has fields of its own, and two
       controls with the same accessible name in one region is the 6.2 failure. -->
  <div class="input-group input-group--inline ship-editor">
    <label for="{uid}-text">Ship description</label>
    <textarea
      id="{uid}-text"
      rows="10"
      value={ship.text}
      oninput={(event) => onChange(setSpookyShipText(ship, event.currentTarget.value))}
    ></textarea>
  </div>
{/if}

<style>
  .ship-editor {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .ship-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }
</style>
