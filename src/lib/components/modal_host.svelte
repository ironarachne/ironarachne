<script lang="ts">
  import ModalDialog from '$lib/components/modal_dialog.svelte';
  import {
    modalState,
    resolveActiveAlertModal,
    resolveActiveConfirmModal,
    type AlertModalStyle,
  } from '$lib/ui/modal';

  let dialogEl: HTMLDialogElement | undefined = $state();

  const panelStyle = $derived.by((): AlertModalStyle => {
    const current = modalState.current;
    if (!current) {
      return 'message';
    }
    if (current.kind === 'confirm') {
      return 'message';
    }
    return current.style;
  });

  $effect(() => {
    if (!dialogEl) {
      return;
    }
    if (modalState.open) {
      if (!dialogEl.open) {
        dialogEl.showModal();
      }
      return;
    }
    if (dialogEl.open) {
      dialogEl.close();
    }
  });

  function onDialogCancel(ev: Event): void {
    ev.preventDefault();
    if (modalState.current?.kind === 'confirm') {
      resolveActiveConfirmModal(false);
      return;
    }
    resolveActiveAlertModal();
  }
</script>

<dialog
  bind:this={dialogEl}
  class="ironarachne-modal"
  class:ironarachne-modal--message={panelStyle === 'message'}
  class:ironarachne-modal--error={panelStyle === 'error'}
  class:ironarachne-modal--success={panelStyle === 'success'}
  role="alertdialog"
  aria-labelledby={modalState.current?.title ? 'modal-dialog-title' : undefined}
  aria-describedby="modal-dialog-message"
  oncancel={onDialogCancel}
>
  {#if modalState.current}
    <ModalDialog
      kind={modalState.current.kind}
      message={modalState.current.message}
      title={modalState.current.title}
      style={modalState.current.kind === 'alert' ? modalState.current.style : 'message'}
      okLabel={modalState.current.kind === 'confirm' ? modalState.current.okLabel : 'OK'}
      cancelLabel={modalState.current.kind === 'confirm' ? modalState.current.cancelLabel : 'Cancel'}
      onResolveAlert={resolveActiveAlertModal}
      onResolveConfirm={resolveActiveConfirmModal}
    />
  {/if}
</dialog>
