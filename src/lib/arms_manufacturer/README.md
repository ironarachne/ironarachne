# Arms manufacturer

This library generates a **weapons manufacturer** for science-fiction settings: a corporate name, a
description of its outlook and reputation, and a line of weapon models drawn from
[`$lib/weapons`](../weapons/README.md).

## Features

- **`ArmsManufacturer`** — `name`, `description`, and the `models` (weapons) it produces.
- **`generate`** — build a whole manufacturer from an `RNG`.
- **Parts** — `randomName`, `randomOutlook`, and `randomReputation`, exposed individually for
  callers that want one piece rather than a full company.

## Usage

```typescript
import * as RNG from '@ironarachne/rng';
import { generate } from '$lib/arms_manufacturer';

const rng = new RNG.RNG('some seed');
const manufacturer = generate(rng);

manufacturer.name; // e.g. 'Kestrel Dynamics'
manufacturer.models; // the weapons in its catalog
```

The generator takes an existing `RNG` rather than a seed because it is normally called as part of a
larger generation run that already owns one.

## Saving a manufacturer

The generator is Release-ready (issue #53), which means a rolled company can be kept:

- `arms_manufacturer_snapshot.ts` — the stored form, which is the `ArmsManufacturer` type as it
  stands. **This is the one snapshot in the readiness pass that is genuinely the identity
  function**: a `Weapon` is six plain fields, so the conversion is a deep copy and nothing more.
- `arms_manufacturer_artifact_kind.ts` — the `arms-manufacturer` kind. Its own kind rather than a
  discriminator on `organization`, because the two payloads share nothing but a name; a saved
  manufacturer is named after the company.
- `arms_manufacturer_roll.ts` — the single path from a seed to a manufacturer. The page had no seed
  control at all before, and called `Date.now()` three times.
- `arms_manufacturer_editing.ts` — one function per field, each returning a new snapshot. Renaming
  the company deliberately does not rewrite the description that opens with its old name.
- `arms_manufacturer_presentation.ts` — the manufacturer as a document, and the Markdown and PDF
  exports written from it. This tool had no export of any kind before.

A model's `cosmetics` and `effects` are the parts its description was assembled from. They are
stored, because the snapshot is the value, but the page does not show them and the editor has no
control for them.

This tool implements no game system, so there is no edition to name and nothing deliberately
omitted from one: the weapon types, damage types and corporate suffixes are this library's own.
