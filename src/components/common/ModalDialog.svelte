<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';

  /**
   * The body of the ordinary dialog: a sentence, and either one action or a choice between two.
   *
   * The frame is `ModalHost`'s `<dialog>`, which wears the panel classes. What this renders is the
   * liner and its contents — the header plate, the body and the footer — so a dialog is the same
   * surface as a panel, differing only in being in the top layer. See docs/visual-design.md,
   * "The message family".
   */

  type Props = {
    kind: 'alert' | 'confirm';
    message: string;
    title?: string;
    okLabel?: string;
    cancelLabel?: string;
    dangerous?: boolean;
    onResolveAlert?: () => void;
    onResolveConfirm?: (confirmed: boolean) => void;
  };

  const {
    kind,
    message,
    title,
    okLabel = 'OK',
    cancelLabel = 'Cancel',
    dangerous = false,
    onResolveAlert,
    onResolveConfirm,
  }: Props = $props();
</script>

<div class="panel__field">
  {#if title}
    <header class="panel__header">
      <div class="panel__header-field">
        <h2 id="modal-dialog-title" class="panel__title">{title}</h2>
      </div>
    </header>
  {/if}

  <div class="panel__body">
    <p id="modal-dialog-message">{message}</p>

    <!-- A dialog is a question, so its answers sit where the eye finishes. -->
    <div class="panel__footer">
      {#if kind === 'confirm'}
        <!-- The base plate rather than `quiet`: these two are peer actions in a dialog that exists to
             ask which one you meant, and a tertiary treatment on one of a pair reads as the pair
             being unequal. Quiet is for an action sitting beside work, not for half of a choice. -->
        <BaseButton onclick={() => onResolveConfirm?.(false)}>
          {cancelLabel}
        </BaseButton>
        <BaseButton
          variant={dangerous ? 'destructive' : 'secondary'}
          onclick={() => onResolveConfirm?.(true)}
        >
          {okLabel}
        </BaseButton>
      {:else}
        <BaseButton onclick={() => onResolveAlert?.()}>{okLabel}</BaseButton>
      {/if}
    </div>
  </div>
</div>

<style>
  /* The tone is the surface, never the sentence: crimson is 2.2:1 on charcoal and emerald 2.65:1,
     so the words are `--ink` whichever tone the dialog around them is wearing. */
  p {
    margin: 0;
    max-width: var(--measure);
  }
</style>
