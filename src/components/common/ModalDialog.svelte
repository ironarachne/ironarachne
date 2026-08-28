<script lang="ts">
  import type { AlertModalStyle } from '$lib/ui';

  type Props = {
    kind: 'alert' | 'confirm';
    message: string;
    title?: string;
    style?: AlertModalStyle;
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
    style = 'message',
    okLabel = 'OK',
    cancelLabel = 'Cancel',
    dangerous = false,
    onResolveAlert,
    onResolveConfirm,
  }: Props = $props();

  const panelStyle = $derived(kind === 'confirm' ? 'message' : style);
</script>

<div class="modal-dialog-content modal-dialog-content--{panelStyle}">
  {#if title}
    <h2 id="modal-dialog-title" class="modal-dialog-title">{title}</h2>
  {/if}
  <p id="modal-dialog-message" class="modal-dialog-message">{message}</p>
  <div class="modal-dialog-actions">
    {#if kind === 'confirm'}
      <button type="button" class="btn-quiet" onclick={() => onResolveConfirm?.(false)}>
        {cancelLabel}
      </button>
      <button
        type="button"
        class:btn-destructive={dangerous}
        onclick={() => onResolveConfirm?.(true)}
      >
        {okLabel}
      </button>
    {:else}
      <button type="button" onclick={() => onResolveAlert?.()}>{okLabel}</button>
    {/if}
  </div>
</div>
