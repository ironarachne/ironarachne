import { afterEach, describe, expect, it } from 'vitest';

import {
  modalState,
  resetModalStateForTests,
  resolveActiveAlertModal,
  resolveActiveConfirmModal,
  showAlertModal,
  showConfirmModal,
} from './modal_state.svelte';

afterEach(() => {
  resetModalStateForTests();
});

describe('modal_state', () => {
  it('opens an alert modal and resolves on OK', async () => {
    const promise = showAlertModal({ message: 'Hello', style: 'message' });
    expect(modalState.open).toBe(true);
    expect(modalState.current?.kind).toBe('alert');
    if (modalState.current?.kind === 'alert') {
      expect(modalState.current.message).toBe('Hello');
      expect(modalState.current.style).toBe('message');
    }

    resolveActiveAlertModal();
    await expect(promise).resolves.toBeUndefined();
    expect(modalState.open).toBe(false);
    expect(modalState.current).toBeNull();
  });

  it('defaults alert style to message', () => {
    showAlertModal({ message: 'Neutral' });
    expect(modalState.current?.kind).toBe('alert');
    if (modalState.current?.kind === 'alert') {
      expect(modalState.current.style).toBe('message');
    }
  });

  it('opens a confirm modal and resolves true on OK', async () => {
    const promise = showConfirmModal({ message: 'Continue?' });
    expect(modalState.current?.kind).toBe('confirm');
    if (modalState.current?.kind === 'confirm') {
      expect(modalState.current.okLabel).toBe('OK');
      expect(modalState.current.cancelLabel).toBe('Cancel');
    }

    resolveActiveConfirmModal(true);
    await expect(promise).resolves.toBe(true);
  });

  it('resolves confirm as false on cancel', async () => {
    const promise = showConfirmModal({
      message: 'Delete?',
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
    resolveActiveConfirmModal(false);
    await expect(promise).resolves.toBe(false);
  });

  it('queues modals FIFO while one is open', async () => {
    const first = showAlertModal({ message: 'First' });
    const second = showAlertModal({ message: 'Second', style: 'error' });

    expect(modalState.current?.kind).toBe('alert');
    if (modalState.current?.kind === 'alert') {
      expect(modalState.current.message).toBe('First');
    }

    resolveActiveAlertModal();
    await first;

    expect(modalState.open).toBe(true);
    if (modalState.current?.kind === 'alert') {
      expect(modalState.current.message).toBe('Second');
      expect(modalState.current.style).toBe('error');
    }

    resolveActiveAlertModal();
    await second;
    expect(modalState.open).toBe(false);
  });
});
