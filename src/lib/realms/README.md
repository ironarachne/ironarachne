# Realms

This library generates a **realm** — a political territory, its ruler, its arms, and the claims
made on it. A realm knows its type (which decides what its ruler is called), the tiles it holds, and
its parent, so realms nest: a barony inside a duchy inside a kingdom.

## Features

- **`Realm`** — `name` and `adjective`, `description`, `heraldry`, the `authority` who rules it (a
  full `Character`), the `grantedTitle` that authority holds, `tiles`, `claims`, `parent` (an index
  into the containing array, `-1` for none), and `realmType`.
- **`RealmType`** — a kind of realm, its granted title, and its commonality weight.
- **`Claim`** — a claimant's name and id, and the claim's `status` (e.g. `'unpressed'`).
- **Generation** — `generate` from a `RealmGeneratorConfig`, with `getDefaultConfig`;
  `createClaim` builds an empty claim.
- **`realm_types.all()`** — the realm-type table.

## Usage

```typescript
import { generate, getDefaultConfig } from '$lib/realms';

const config = getDefaultConfig();
config.rng = rng;
config.nameGeneratorSet = nameSet; // so the realm is named like its culture

const realm = generate(config);

realm.name; // 'the Duchy of ...'
realm.authority.firstName;
realm.grantedTitle.maleTitle;
```

The realm type is chosen by commonality weight, so restricting `config.realmTypes` is how you force
a particular scale of polity:

```typescript
import { RealmTypes } from '$lib/realms';

config.realmTypes = RealmTypes.all().filter((type) => type.name === 'kingdom');
```

`generate` throws when the config's name generator set has no `country` generator — a realm cannot
be named without one.

Realms hold no geography of their own beyond `tiles`; the map they sit on belongs to
[`$lib/regions`](../regions/README.md), which is what assembles a set of realms into a political
landscape.
