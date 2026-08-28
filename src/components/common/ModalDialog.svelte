<script lang="ts">
  import type { AlertModalStyle } from '$lib/ui';
  import BaseButton from '$components/common/BaseButton.svelte';

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
      <BaseButton variant="quiet" onclick={() => onResolveConfirm?.(false)}>
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
