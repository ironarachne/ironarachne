/**
 * Whether this browser has the site open somewhere else.
 *
 * Two tabs writing the vault clobber each other, and a restore in one tab under a workshop open in
 * another is the worst version of it: the second tab holds a hydrated index of records that no
 * longer exist and will happily write them back. docs/workshop.md asks for this to be detected and
 * warned about *before* importing, which is the only moment it can still be acted on.
 *
 * It is a warning, never a lock. A tab that has crashed, a browser that does not implement
 * `BroadcastChannel`, and a tab that is simply slow to answer all look the same from here, and
 * refusing the import in any of those cases would block a user from restoring their own backup.
 */

const VAULT_TAB_CHANNEL = 'ironarachne.vault.tabs';

/**
 * This tab's own id, so a tab does not report itself as another one.
 *
 * `BroadcastChannel` does not deliver a message back to the channel object that posted it — but it
 * *does* deliver to every other channel object, **including ones in the same tab**. The listener a
 * tab registers to answer other tabs would otherwise answer its own ping, and every single-tab
 * browser would be warned about a second tab that does not exist. A warning that always fires is a
 * warning nobody reads.
 */
const TAB_ID = globalThis.crypto?.randomUUID?.() ?? `tab-${Math.random().toString(36).slice(2)}`;

type TabMessage = { type: 'ping' | 'pong'; from: string };

function openChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  try {
    return new BroadcastChannel(VAULT_TAB_CHANNEL);
  } catch {
    // Some privacy modes expose the constructor and refuse to build one.
    return null;
  }
}

let announcing: BroadcastChannel | null = null;

/**
 * Start answering "is anyone else there?" for as long as this tab is open.
 *
 * Called explicitly by the root layout rather than run as an import side effect, for the reason the
 * kind registry gives for being assembled statically: a tab that only answers once some module
 * happens to have loaded is a tab that is invisible exactly when a restore is about to run.
 *
 * Returns the function that stops answering. Calling it twice is harmless — the second call
 * replaces nothing, because a second listener would answer the same ping twice.
 */
export function announceVaultTab(): () => void {
  if (announcing !== null) {
    return stopAnnouncingVaultTab;
  }
  const channel = openChannel();
  if (channel === null) {
    return () => {};
  }
  channel.onmessage = (event: MessageEvent<TabMessage>) => {
    if (event.data?.type === 'ping' && event.data.from !== TAB_ID) {
      channel.postMessage({ type: 'pong', from: TAB_ID } satisfies TabMessage);
    }
  };
  announcing = channel;
  return stopAnnouncingVaultTab;
}

export function stopAnnouncingVaultTab(): void {
  announcing?.close();
  announcing = null;
}

/** How long another tab is given to answer. Long enough for a busy tab, short enough to not stall. */
const PING_TIMEOUT_MS = 250;

/**
 * True when another tab answered a ping inside {@link PING_TIMEOUT_MS}.
 *
 * **False means "nobody answered", not "nobody is there."** Every failure mode — no
 * `BroadcastChannel`, a wedged tab, a slow one — resolves false, so this can only ever add a
 * warning and never withhold one that would have stopped a user working.
 */
export function otherVaultTabsOpen(timeoutMs: number = PING_TIMEOUT_MS): Promise<boolean> {
  const channel = openChannel();
  if (channel === null) {
    return Promise.resolve(false);
  }
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (answered: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      channel.close();
      resolve(answered);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    channel.onmessage = (event: MessageEvent<TabMessage>) => {
      if (event.data?.type === 'pong' && event.data.from !== TAB_ID) {
        finish(true);
      }
    };
    channel.postMessage({ type: 'ping', from: TAB_ID } satisfies TabMessage);
  });
}
