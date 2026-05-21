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
  resolve: (confirmed: boolean) => void;
};

export type ModalRequest = AlertModalRequest | ConfirmModalRequest;

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
