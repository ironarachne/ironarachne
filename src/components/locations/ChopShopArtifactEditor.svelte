<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import { setChopShopText, validateChopShopSnapshot, type ChopShopSnapshot } from '$lib/chopshop';

  /**
   * The editing view for a saved chop shop: a textarea, which is the honest editing view for prose
   * and satisfies requirement 4.1 completely — the one field displayed is the field. Dirty state,
   * saving, and the destructive re-roll belong to the surface around it.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  const accepted = $derived(validateChopShopSnapshot(snapshot));
  const shop = $derived<ChopShopSnapshot | undefined>(accepted.ok ? accepted.value : undefined);
</script>

{#if shop === undefined}
  <Notice tone="danger">
    These contents are stored as a chop shop but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <!-- "Shop description" rather than "Description": the panel above has fields of its own, and two
       controls with the same accessible name in one region is the 6.2 failure. -->
  <div class="input-group input-group--inline shop-editor">
    <label for="{uid}-text">Shop description</label>
    <textarea
      id="{uid}-text"
      rows="10"
      value={shop.text}
      oninput={(event) => onChange(setChopShopText(shop, event.currentTarget.value))}
    ></textarea>
  </div>
{/if}

<style>
  .shop-editor {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .shop-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }
</style>
