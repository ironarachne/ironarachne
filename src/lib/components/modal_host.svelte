<script lang="ts">
  import HeraldryPersistenceModalContent from '$lib/components/heraldry_persistence_modal_content.svelte';
  import ModalDialog from '$lib/components/modal_dialog.svelte';
  import {
    modalState,
    resolveActiveAlertModal,
    resolveActiveConfirmModal,
    resolveActiveHeraldryPersistenceModal,
    type AlertModalStyle,
  } from '$lib/ui/modal';
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
    return current.style;
  });

  const isAlertDialog = $derived(modalState.current?.kind === 'alert' || modalState.current?.kind === 'confirm');

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
  aria-labelledby={modalState.current?.kind === 'heraldry' || modalState.current?.title
    ? 'modal-dialog-title'
    : undefined}
  aria-describedby={modalState.current?.kind === 'heraldry' ? undefined : 'modal-dialog-message'}
  oncancel={onDialogCancel}
>
  {#if modalState.current?.kind === 'heraldry'}
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
      cancelLabel={modalState.current.kind === 'confirm' ? modalState.current.cancelLabel : 'Cancel'}
      dangerous={modalState.current.kind === 'confirm' ? modalState.current.dangerous : false}
      onResolveAlert={resolveActiveAlertModal}
      onResolveConfirm={resolveActiveConfirmModal}
    />
  {/if}
</dialog>
