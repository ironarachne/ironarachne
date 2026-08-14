import { afterEach, describe, expect, it } from 'vitest';

import { generateHeraldry, getDefaultHeraldryGeneratorConfig } from '$lib/heraldry';
import { RNG } from '@ironarachne/rng';
import {
  modalState,
  resetModalStateForTests,
  resolveActiveAlertModal,
  resolveActiveConfirmModal,
  resolveActiveHeraldryPersistenceModal,
  showAlertModal,
  showConfirmModal,
  showHeraldryPersistenceModal,
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

  it('stores dangerous confirm modals when requested', () => {
    showConfirmModal({
      message: 'Delete this item?',
      okLabel: 'Delete',
      dangerous: true,
    });
    expect(modalState.current?.kind).toBe('confirm');
    if (modalState.current?.kind === 'confirm') {
      expect(modalState.current.dangerous).toBe(true);
    }
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

  it('opens a heraldry persistence modal and resolves on dismiss', async () => {
    const rng = new RNG('heraldry-modal-test');
    const arms = generateHeraldry(getDefaultHeraldryGeneratorConfig(rng));
    const promise = showHeraldryPersistenceModal({
      arms,
      seed: 'test-seed',
      title: 'Test Arms',
    });

    expect(modalState.open).toBe(true);
    expect(modalState.current?.kind).toBe('heraldry');
    if (modalState.current?.kind === 'heraldry') {
      expect(modalState.current.seed).toBe('test-seed');
      expect(modalState.current.title).toBe('Test Arms');
    }

    resolveActiveHeraldryPersistenceModal({ action: 'dismiss' });
    await expect(promise).resolves.toEqual({ action: 'dismiss' });
    expect(modalState.open).toBe(false);
  });

  it('resolves heraldry persistence modal with replaced arms', async () => {
    const rng = new RNG('heraldry-modal-replace-test');
    const originalArms = generateHeraldry(getDefaultHeraldryGeneratorConfig(rng));
    const replacementArms = generateHeraldry(
      getDefaultHeraldryGeneratorConfig(new RNG('replacement')),
    );
    const promise = showHeraldryPersistenceModal({
      arms: originalArms,
      seed: 'seed-a',
    });

    resolveActiveHeraldryPersistenceModal({ action: 'replaced', arms: replacementArms });
    await expect(promise).resolves.toEqual({ action: 'replaced', arms: replacementArms });
  });
});
