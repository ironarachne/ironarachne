# Session log

What the tools have rolled since the page was loaded, so a result the user did not keep is not lost
the moment the next one replaces it. Designed in [docs/session-log.md](../../../docs/session-log.md).

A generator overwrites itself: press Generate and what was on screen is gone. By the RNG contract a
run is fully determined by its seed and its configuration, so everything needed to get any roll back
is small, cheap, and — until this library — discarded. The log stops discarding it.

## What it is not

- **Not the vault.** `/vault` and the project view list what was _kept_. This lists what was not.
- **Not provenance.** `ArtifactProvenance` records how a saved artifact was first made, and the
  payload is the truth there. A log entry has no payload to be the truth of, which is why replaying
  one destroys nothing.
- **Not undo.** Replaying an entry is a fresh run that happens to be identical, not a restoration.

## Usage

A tool reports at the end of its `generate()`, with the seed it rolled from and the settings it
rolled **with** — not the ones in its controls now:

```ts
import { recordGeneration } from '$lib/session_log';

recordGeneration({
  toolPath: '/fantasy/settlement',
  summary: settlement.name,
  seed,
  config: rolledConfig,
});
```

Reporting is opt-in per tool, and a tool that cannot honour a replay does not report: an entry that
cannot bring its result back is a list item that looks like a way back and is not.

A surface reads and follows the log the way the project view follows the artifact store:

```ts
import { clearSessionLog, listSessionLog, onSessionLogChanged } from '$lib/session_log';

onMount(() => {
  refresh();
  return onSessionLogChanged(refresh);
});
```

## In memory, and it says so

Module state, cleared by a reload. Not `localStorage`, not `sessionStorage`, not the
`ProjectWorkspace` record — so there is no persisted shape, no version field, no migration chain,
and nothing new in a vault file. It is also what makes replay safe without versioning: a config
recorded by this build can only ever be replayed into this build's tool.

The obligation that comes with it is on whatever renders the log: **say that nothing here is
stored**, and that Save is what keeps a result. A list that looks like saved things but empties on
refresh is exactly the trap [the storage disclosure](../../../docs/storage-disclosure.md) exists to
prevent.

## Two behaviours worth knowing

- **Identical runs move rather than duplicate.** A run whose tool, seed, and config match an entry
  already in the log moves that entry to the top and gives it the new time, keeping its id. Without
  this, replaying an entry would log a copy every time — the replay causes a real generation run,
  and a tool reports every run it makes. Comparison is `sessionRunKey`, a canonical string over the
  path, the seed, and the config with its object keys sorted at every depth.
- **The cap is 50, newest kept.** Not a storage limit. A bound on an array that somebody holding
  down Generate would otherwise grow without limit.

A recorded config is a canonical deep copy rather than the object it was handed. Several generators
mutate their config in place between rolls, and a value handed over from a Svelte component is a
deep proxy; copying is what keeps an entry a record of what the run actually used.
