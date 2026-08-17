<script lang="ts">
  import HeraldryPersistenceModalContent from '$components/heraldry/HeraldryPersistenceModalContent.svelte';
  import ModalDialog from '$components/common/ModalDialog.svelte';
  import StorageFailureModalContent from '$components/common/StorageFailureModalContent.svelte';
  import {
    modalState,
    resolveActiveAlertModal,
    resolveActiveConfirmModal,
    resolveActiveHeraldryPersistenceModal,
    resolveActiveStorageFailureModal,
    type AlertModalStyle,
  } from '$lib/ui';
  import { RNG } from '@ironarachne/rng';

  let dialogEl: HTMLDialogElement | undefined = $state();
  const heraldryModalRng = new RNG('heraldry-persistence-modal');

  const panelStyle = $derived.by((): AlertModalStyle => {
    const current = modalState.current;
    if (!current) {
      return 'message';
    }
    if (current.kind === 'confirm' || current.kind === 'heraldry') {
      return 'message';
    }
    // A write that did not happen is an error, and looks like one.
    if (current.kind === 'storage') {
      return 'error';
    }
    return current.style;
  });

  const isAlertDialog = $derived(
    modalState.current?.kind === 'alert' ||
      modalState.current?.kind === 'confirm' ||
      modalState.current?.kind === 'storage',
  );

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
    if (modalState.current?.kind === 'heraldry') {
      resolveActiveHeraldryPersistenceModal({ action: 'dismiss' });
      return;
    }
    if (modalState.current?.kind === 'storage') {
      // Escape dismisses rather than being ignored. The work is still on screen either way, and a
      // dialog that cannot be closed is its own kind of trap.
      resolveActiveStorageFailureModal({ action: 'dismiss' });
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
  role={isAlertDialog ? 'alertdialog' : 'dialog'}
  aria-labelledby={modalState.current?.kind === 'heraldry' ||
  modalState.current?.kind === 'storage' ||
  modalState.current?.title
    ? 'modal-dialog-title'
    : undefined}
  aria-describedby={modalState.current?.kind === 'heraldry' ||
  modalState.current?.kind === 'storage'
    ? undefined
    : 'modal-dialog-message'}
  oncancel={onDialogCancel}
>
  {#if modalState.current?.kind === 'storage'}
    <StorageFailureModalContent
      message={modalState.current.message}
      title={modalState.current.title}
      downloadLabel={modalState.current.downloadLabel}
      onDownload={modalState.current.onDownload}
      onExportVault={modalState.current.onExportVault}
      onRetry={() => resolveActiveStorageFailureModal({ action: 'retry' })}
      onDismiss={() => resolveActiveStorageFailureModal({ action: 'dismiss' })}
    />
  {:else if modalState.current?.kind === 'heraldry'}
    <HeraldryPersistenceModalContent
      arms={modalState.current.arms}
      seed={modalState.current.seed}
      title={modalState.current.title}
      rng={heraldryModalRng}
      onDismiss={() => resolveActiveHeraldryPersistenceModal({ action: 'dismiss' })}
      onReplace={(arms) => resolveActiveHeraldryPersistenceModal({ action: 'replaced', arms })}
    />
  {:else if modalState.current}
    <ModalDialog
      kind={modalState.current.kind}
      message={modalState.current.message}
      title={modalState.current.title}
      style={modalState.current.kind === 'alert' ? modalState.current.style : 'message'}
      okLabel={modalState.current.kind === 'confirm' ? modalState.current.okLabel : 'OK'}
      cancelLabel={modalState.current.kind === 'confirm'
        ? modalState.current.cancelLabel
        : 'Cancel'}
      dangerous={modalState.current.kind === 'confirm' ? modalState.current.dangerous : false}
      onResolveAlert={resolveActiveAlertModal}
      onResolveConfirm={resolveActiveConfirmModal}
    />
  {/if}
</dialog>
