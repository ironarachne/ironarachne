<script lang="ts">
  import HeraldryPersistenceModalContent from '$components/heraldry/HeraldryPersistenceModalContent.svelte';
  import LoadSnapshotContent from '$components/common/LoadSnapshotContent.svelte';
  import ModalDialog from '$components/common/ModalDialog.svelte';
  import { TONE_CLASS, type Tone } from '$components/common/Notice.svelte';
  import StorageFailureModalContent from '$components/common/StorageFailureModalContent.svelte';
  import {
    modalState,
    resolveActiveAlertModal,
    resolveActiveConfirmModal,
    resolveActiveHeraldryPersistenceModal,
    resolveActiveLoadSnapshotModal,
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
    if (current.kind === 'confirm' || current.kind === 'heraldry' || current.kind === 'snapshot') {
      return 'message';
    }
    // A write that did not happen is an error, and looks like one.
    if (current.kind === 'storage') {
      return 'error';
    }
    return current.style;
  });

  /* The three `AlertModalStyle` names map onto tones without changing their spelling: `message` is
     plain, because a dialog is already the most interruptive thing the app does — top layer,
     scrim, focus taken — and does not need a coloured edge on top of that. Every dialog used to be
     gold-edged, which made gold the colour of "a dialog" rather than of "attention"; a tone every
     instance wears is not a tone. Colour is spent on the two outcomes that differ. */
  const tone = $derived.by((): Tone => {
    switch (panelStyle) {
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      default:
        return 'plain';
    }
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
    if (modalState.current?.kind === 'snapshot') {
      resolveActiveLoadSnapshotModal({ action: 'dismiss' });
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

<!-- A dialog is a raised panel that happens to be in the top layer: the same liner, keyline, notch
     and padding ramp as every other surface. It wears the panel classes directly rather than
     holding a `Panel`, because a `<dialog>` is already a labelled thing with its own
     `aria-labelledby` — a `<section aria-label>` inside it would give one object two accessible
     names and two landmarks, and a screen reader would read the wrapper before the message.

     This is the app's only `<dialog>`, which `tokens.test.ts` holds. It briefly needed a
     `modal-host` class to tell it apart from a second one mounted inside a bench panel; #143
     removed the second dialog instead, so `dialog` identifies this element again. -->
<dialog
  bind:this={dialogEl}
  class="panel {TONE_CLASS[tone]}"
  role={isAlertDialog ? 'alertdialog' : 'dialog'}
  aria-labelledby={modalState.current?.kind === 'heraldry' ||
  modalState.current?.kind === 'snapshot' ||
  modalState.current?.kind === 'storage' ||
  modalState.current?.title
    ? 'modal-dialog-title'
    : undefined}
  aria-describedby={modalState.current?.kind === 'heraldry' ||
  modalState.current?.kind === 'snapshot' ||
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
  {:else if modalState.current?.kind === 'snapshot'}
    <LoadSnapshotContent
      title={modalState.current.title}
      items={modalState.current.items}
      emptyMessage={modalState.current.emptyMessage}
      onLoad={(choice) => resolveActiveLoadSnapshotModal({ action: 'load', choice })}
      onDismiss={() => resolveActiveLoadSnapshotModal({ action: 'dismiss' })}
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
