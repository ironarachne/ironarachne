# DCC

This library implements character generation for **Dungeon Crawl Classics**, whose signature is the
level-0 funnel: a player brings several ordinary people with an occupation, whatever that occupation
left them carrying, and a lucky sign, and most of them do not survive to level 1.

## Features

- **Generation** — `generateRandomDCCCharacter` with `getDefaultDCCCharacterGeneratorConfig(seed)`.
- **Types** — `DCCCharacter`, `DCCCharacterGeneratorConfig`, `DCCOccupation`, `DCCLuckyRoll`,
  `DCCItem`, `DCCAttribute`, and friends.
- **Derived statistics** — `getAttributeModifier`, `getSpellsKnown`, and `getMaxSpellLevel`.
- **Formatting** — the `formatDcc*` helpers (modifiers, currency, starting funds, weapon lines,
  lucky sign, notes) and `slugifyDccCharacterFilename`.
- **PDF** — `buildDccCharacterPdf` returns a `Blob`; `downloadDccCharacterPdf` saves it.

## Usage

```typescript
import { generateRandomDCCCharacter, getDefaultDCCCharacterGeneratorConfig } from '$lib/dcc';

const seed = 'some seed';
const character = generateRandomDCCCharacter(seed, getDefaultDCCCharacterGeneratorConfig(seed));

character.occupation.name;
character.luckyRoll.name;
```

The config's `allowedOccupations` names the ancestries a run may draw from (`'dwarf'`, `'elf'`,
`'halfling'`, `'human'`) — narrow it to funnel a party of one people. `generateRandomDCCCharacter`
also takes an optional `NameGeneratorSet` when the names should come from a culture rather than the
default fantasy patterns.

## Internal tables

The occupation tables (one module per ancestry, each exporting `all()`), the language lists
(`getHuman`, `getDwarf`, `getElf`, `getHalfling`), and the birth-augur `lucky_rolls` table are
**not** re-exported from the index — generation consumes them internally. Import them by path if you
need the raw data:

```typescript
import { HumanOccupations } from '$lib/dcc';

const occupations = HumanOccupations.all();
```

The two large tables — human occupations and the lucky signs — live in `human_occupation_data.ts`,
`halfling_occupation_data.ts` and `lucky_roll_data.ts`, and their `all()` hands out the shared
constant rather than rebuilding it. **Treat what `all()` returns as read-only.** Generation writes
to rows it draws — the human farmer's `apply` rewrites its own `name` with the crop it rolled, and
each character's Luck modifier is stamped onto its lucky sign — so `randomOccupation` and
`randomLuckyRoll` copy the single row they select. Copy per row, not per table; cloning a whole
table to use one row of it is far slower and buys nothing.

Export a sheet:

```typescript
import { downloadDccCharacterPdf } from '$lib/dcc';

await downloadDccCharacterPdf(character);
```

Occupation `apply` handlers take an `rng` parameter whether or not they use it. When one does not,
the parameter is named `_rng` rather than dropped, so the shared contract stays visible.
