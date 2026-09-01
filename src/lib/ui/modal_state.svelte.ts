import type { Arms } from '$lib/heraldry';

export type AlertModalStyle = 'message' | 'error' | 'success';

export type ShowAlertModalOptions = {
  message: string;
  title?: string;
  style?: AlertModalStyle;
};

export type ShowConfirmModalOptions = {
  message: string;
  title?: string;
  okLabel?: string;
  cancelLabel?: string;
  dangerous?: boolean;
};

/**
 * What the user chose to do about a write the browser had no room for.
 *
 * `retry` exists because the fix — freeing space, in another tab or another application — happens
 * outside this page, and the whole point of keeping the value on screen is that it can still be
 * saved afterwards. Dismissing does not throw anything away: the artifact is still in the editor.
 */
export type StorageFailureModalResult = { action: 'retry' } | { action: 'dismiss' };

/**
 * A write that failed for want of room, and the one thing the user can do that needs no storage.
 *
 * `onDownload` is handed in rather than a payload, because what is downloadable differs by caller:
 * a generator has a snapshot that never reached the vault, and an editor has one that did. Both
 * can produce a file; neither can be described here without this library knowing about artifacts.
 */
export type ShowStorageFailureModalOptions = {
  /** What failed, in the user's terms. Not a reason code. */
  message: string;
  title?: string;
  /**
   * Saves the work to a file. Reports false when the browser would not take the download, so the
   * dialog can say so rather than looking as though it worked.
   */
  onDownload: () => boolean | Promise<boolean>;
  /** Exports the whole vault. Absent when there is nothing stored worth offering it for. */
  onExportVault?: () => boolean | Promise<boolean>;
  /** What the download is called, so the dialog can name it before and after. */
  downloadLabel?: string;
};

/** One saved thing offered for loading. Named and seeded, which is all a list row shows. */
export type SnapshotChoice = { name: string; seed: string };

export type LoadSnapshotModalResult =
  | { action: 'dismiss' }
  | { action: 'load'; choice: SnapshotChoice };

/**
 * Offer a list of saved things and report which one was picked.
 *
 * Deliberately knows nothing about what a snapshot *is*: the caller holds the real records and
 * matches the returned choice back to one. That is what lets the heraldry generator restore a
 * whole set of generator options from a pick without this library learning about heraldry.
 */
export type ShowLoadSnapshotModalOptions = {
  title: string;
  items: SnapshotChoice[];
  /** Said when there is nothing saved yet. */
  emptyMessage?: string;
};

/**
 * A coat of arms shown at a size worth looking at, closed again, or swapped for another.
 *
 * "Replaced" carries the arms the user picked instead. Where that list comes from changed with
 * #51 — it was the heraldry generator's own `localStorage` scope, and it is the coats of arms
 * saved in the open project now — but the answer this modal gives back did not.
 */
export type HeraldryModalResult = { action: 'dismiss' } | { action: 'replaced'; arms: Arms };

export type ShowHeraldryModalOptions = {
  arms: Arms;
  seed: string;
  title?: string;
};

type AlertModalRequest = {
  kind: 'alert';
  id: number;
  message: string;
  title?: string;
  style: AlertModalStyle;
  resolve: () => void;
};

type ConfirmModalRequest = {
  kind: 'confirm';
  id: number;
  message: string;
  title?: string;
  okLabel: string;
  cancelLabel: string;
  dangerous: boolean;
  resolve: (confirmed: boolean) => void;
};

type HeraldryModalRequest = {
  kind: 'heraldry';
  id: number;
  arms: Arms;
  seed: string;
  title?: string;
  resolve: (result: HeraldryModalResult) => void;
};

type LoadSnapshotModalRequest = {
  kind: 'snapshot';
  id: number;
  title: string;
  items: SnapshotChoice[];
  emptyMessage: string;
  resolve: (result: LoadSnapshotModalResult) => void;
};

type StorageFailureModalRequest = {
  kind: 'storage';
  id: number;
  message: string;
  title?: string;
  onDownload: () => boolean | Promise<boolean>;
  onExportVault?: () => boolean | Promise<boolean>;
  downloadLabel: string;
  resolve: (result: StorageFailureModalResult) => void;
};

export type ModalRequest =
  | AlertModalRequest
  | ConfirmModalRequest
  | HeraldryModalRequest
  | LoadSnapshotModalRequest
  | StorageFailureModalRequest;

export type ModalState = {
  open: boolean;
  current: ModalRequest | null;
};

export const modalState = $state<ModalState>({ open: false, current: null });

const queue: ModalRequest[] = [];
let nextId = 0;

function openModal(request: ModalRequest): void {
  modalState.current = request;
  modalState.open = true;
}

function showNextFromQueue(): void {
  const next = queue.shift();
  if (next) {
    openModal(next);
    return;
  }
  modalState.current = null;
  modalState.open = false;
}

function enqueue(request: ModalRequest): void {
  if (modalState.open) {
    queue.push(request);
    return;
  }
  openModal(request);
}

export function resolveActiveAlertModal(): void {
  const current = modalState.current;
  if (!current || current.kind !== 'alert') {
    return;
  }
  current.resolve();
  showNextFromQueue();
}

export function resolveActiveConfirmModal(confirmed: boolean): void {
  const current = modalState.current;
  if (!current || current.kind !== 'confirm') {
    return;
  }
  current.resolve(confirmed);
  showNextFromQueue();
}

export function resolveActiveHeraldryModal(result: HeraldryModalResult): void {
  const current = modalState.current;
  if (!current || current.kind !== 'heraldry') {
    return;
  }
  current.resolve(result);
  showNextFromQueue();
}

export function resolveActiveLoadSnapshotModal(result: LoadSnapshotModalResult): void {
  const current = modalState.current;
  if (!current || current.kind !== 'snapshot') {
    return;
  }
  current.resolve(result);
  showNextFromQueue();
}

export function resolveActiveStorageFailureModal(result: StorageFailureModalResult): void {
  const current = modalState.current;
  if (!current || current.kind !== 'storage') {
    return;
  }
  current.resolve(result);
  showNextFromQueue();
}

/**
 * Offer saved work to load, and report what was picked.
 *
 * Goes through the modal host like everything else, so the app has exactly one `<dialog>`. It had
 * its own before #143, mounted from inside whichever panel opened it — which put a second
 * `dialog.panel` in the DOM and made `.panel` ambiguous as a selector, since #117 made every
 * dialog a panel.
 */
export function showLoadSnapshotModal(
  options: ShowLoadSnapshotModalOptions,
): Promise<LoadSnapshotModalResult> {
  return new Promise((resolve) => {
    enqueue({
      kind: 'snapshot',
      id: nextId++,
      title: options.title,
      items: options.items,
      emptyMessage: options.emptyMessage ?? 'No saved items yet.',
      resolve,
    });
  });
}

/**
 * Block on a write that failed for want of room.
 *
 * Blocking is the point, and it is the only storage condition that gets to be: carrying on working
 * quietly compounds the loss, because every further edit is one more thing the browser cannot keep.
 */
export function showStorageFailureModal(
  options: ShowStorageFailureModalOptions,
): Promise<StorageFailureModalResult> {
  return new Promise((resolve) => {
    enqueue({
      kind: 'storage',
      id: nextId++,
      message: options.message,
      title: options.title,
      onDownload: options.onDownload,
      onExportVault: options.onExportVault,
      downloadLabel: options.downloadLabel ?? 'Download this',
      resolve,
    });
  });
}

export function showAlertModal(options: ShowAlertModalOptions): Promise<void> {
  return new Promise((resolve) => {
    enqueue({
      kind: 'alert',
      id: nextId++,
      message: options.message,
      title: options.title,
      style: options.style ?? 'message',
      resolve,
    });
  });
}

export function showConfirmModal(options: ShowConfirmModalOptions): Promise<boolean> {
  return new Promise((resolve) => {
    enqueue({
      kind: 'confirm',
      id: nextId++,
      message: options.message,
      title: options.title,
      okLabel: options.okLabel ?? 'OK',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      dangerous: options.dangerous ?? false,
      resolve,
    });
  });
}

export function showHeraldryModal(options: ShowHeraldryModalOptions): Promise<HeraldryModalResult> {
  return new Promise((resolve) => {
    enqueue({
      kind: 'heraldry',
      id: nextId++,
      arms: options.arms,
      seed: options.seed,
      title: options.title,
      resolve,
    });
  });
}

/** Drains queue and resets state; for unit tests only. */
export function resetModalStateForTests(): void {
  queue.length = 0;
  modalState.current = null;
  modalState.open = false;
}
