import { afterEach, describe, expect, it, vi } from 'vitest';

import { announceVaultTab, otherVaultTabsOpen, stopAnnouncingVaultTab } from './vault_tabs';

afterEach(() => {
  stopAnnouncingVaultTab();
  vi.unstubAllGlobals();
});

/**
 * A second tab, as a second tab actually looks from here: a channel of its own that answers pings
 * under an id that is not this one's. `announceVaultTab` cannot stand in for it — in one process
 * it shares this tab's id, which is the whole point of there being an id.
 */
function otherTab(): BroadcastChannel {
  const channel = new BroadcastChannel('ironarachne.vault.tabs');
  channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
    if (event.data?.type === 'ping') {
      channel.postMessage({ type: 'pong', from: 'another-tab' });
    }
  };
  return channel;
}

describe('otherVaultTabsOpen', () => {
  it('is false when nothing else is listening', async () => {
    expect(await otherVaultTabsOpen(50)).toBe(false);
  });

  it('is true once another tab answers', async () => {
    const other = otherTab();
    try {
      expect(await otherVaultTabsOpen(500)).toBe(true);
    } finally {
      other.close();
    }
  });

  it('is false again once that tab has gone', async () => {
    otherTab().close();
    expect(await otherVaultTabsOpen(50)).toBe(false);
  });

  it('does not hear itself, however many tabs are really open', async () => {
    // `BroadcastChannel` delivers to every other channel object, including ones in this same tab —
    // so a tab answering its own ping would warn every single-tab browser about a tab that is not
    // there, and a warning that always fires is one nobody reads.
    announceVaultTab();
    expect(await otherVaultTabsOpen(200)).toBe(false);
  });

  it('answers only one ping per tab, however many times announcing is asked for', () => {
    const first = announceVaultTab();
    const second = announceVaultTab();
    // The second call adds no second listener: two listeners would answer one ping twice, which
    // would report a second tab to a browser that has one.
    expect(first).toBe(second);
  });

  it('is false where the browser has no BroadcastChannel, rather than blocking the user', async () => {
    vi.stubGlobal('BroadcastChannel', undefined);
    expect(await otherVaultTabsOpen(50)).toBe(false);
    expect(announceVaultTab()).toBeTypeOf('function');
  });

  it('is false where the constructor refuses, which some privacy modes do', async () => {
    vi.stubGlobal(
      'BroadcastChannel',
      class {
        constructor() {
          throw new Error('blocked');
        }
      },
    );
    expect(await otherVaultTabsOpen(50)).toBe(false);
    // And announcing fails just as quietly: a tab that cannot answer is a tab nobody hears from,
    // which is the same as not being there.
    expect(announceVaultTab()).toBeTypeOf('function');
  });
});
