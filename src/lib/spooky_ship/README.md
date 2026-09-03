# Spooky ship

Procedural one-paragraph "derelict ship in space" descriptions for the Spooky Ship route: a size, a
ship type, an intro, an origin and a twist, assembled from five phrase tables.

Still the only tool on the site carrying two genres, and the only one carrying `horror`.

## Usage

```ts
import * as SpookyShip from '$lib/spooky_ship';

const ship = SpookyShip.rollSpookyShip('some seed');

ship.text;
```

`generate(rng)` returns the bare paragraph and is unchanged; `generateSpookyShip(rng)` wraps it in
the library's one type, which is what a snapshot, an editor and an export hold.

## The `spooky-ship` artifact kind

A derelict is a durable artifact (#71), and the payload is `{ text }` — decision 4 of
[docs/tool-readiness.md](../../../docs/tool-readiness.md): a prose generator's artifact is the
prose.

**Its own kind rather than a `starship` shared with `/swn/starship`**, which #71 asks to be settled
deliberately. Decision 6 of [docs/readiness-objects.md](../../../docs/readiness-objects.md) settles
it: the two are the same noun from opposite directions and nothing else. A `StarshipSWN` is a hull
with a mass, power and hardpoint budget; this is a sentence about something adrift. Sharing a kind
would put a fittings editor in front of a paragraph, and a vault listing could not keep a haunted
freighter apart from a corvette a player is flying.

- **`spooky_ship_types.ts`** and **`spooky_ship_generation.ts`** — the split CODE_STYLE.md asks for
  (8.3). This library was a single `index.ts` holding both.
- **`spooky_ship_roll.ts`** — the one path from a seed. There is no config record: the page has one
  control and it is the seed.
- **`spooky_ship_snapshot.ts`** — the codec, which is the identity function and is tested as one.
- **`spooky_ship_editing.ts`** — one setter, because a textarea over the paragraph is the whole of
  requirement 4.1 here.
- **`spooky_ship_presentation.ts`** — the Markdown and PDF. A derelict whose text has been emptied
  exports its heading and no blank paragraph beneath it (6.4).
