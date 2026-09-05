# DCC

This library implements character generation for **Dungeon Crawl Classics**, whose signature is the
level-0 funnel: a player brings several ordinary people with an occupation, whatever that occupation
left them carrying, and a lucky sign, and most of them do not survive to level 1.

`rollDccCharacter(seed, config)` is the single path from a seed to a character; prefer it over
calling `generateRandomDCCCharacter` directly, because it is where the settings a re-roll reads back
are defined.

## Which edition, and what is deliberately absent

This legacy library represents **Dungeon Crawl Classics core-rulebook material**, and only the part
of it a zero-level character needs: the six attributes, the birth augur (lucky sign), the occupation
tables for the four ancestries, starting equipment and coin, languages, and the four saves. Its rows
predate source-level provenance and are not admitted into the production ruleset package; see
[`docs/dcc-source-audit.md`](../../../docs/dcc-source-audit.md).

What is **not** here, and is out of scope rather than missing:

- **Levelled advancement.** Every character this library makes is level 0. There are no classes, no
  class tables, no Mighty Deeds, no crit or fumble tables, and no spell lists — a zero-level
  character has none of them, and a character who survives the funnel picks a class at a table
  rather than in a generator.
- **The published attribute-modifier table.** `getAttributeModifier` is the d20-style
  `floor((value - 10) / 2)`, which differs from DCC's own table at the extremes. It is what this
  library has always used and what every saved character was rolled with; changing it is a change
  to the generator, not to the sheet.
- **Anything from the third-party or licensed material.** Occupations, lucky signs and languages
  come from the core tables only.

Iron Arachne is unaffiliated with Goodman Games.

## Features

- **Generation** — `generateRandomDCCCharacter` with `getDefaultDCCCharacterGeneratorConfig(seed)`.
- **Types** — `DCCCharacter`, `DCCCharacterGeneratorConfig`, `DCCOccupation`, `DCCLuckyRoll`,
  `DCCItem`, `DCCAttribute`, and friends.
- **Derived statistics** — `getAttributeModifier`, `getSpellsKnown`, and `getMaxSpellLevel`.
- **Formatting** — the `formatDcc*` helpers (modifiers, currency, starting funds, weapon lines,
  lucky sign, notes) and `slugifyDccCharacterFilename`.
- **PDF** — `buildDccCharacterPdf` returns a `Blob`; `downloadDccCharacterPdf` saves it.
- **Rolling** — `rollDccCharacter` and `rollDccCharacterSnapshot`, with
  `DccCharacterGeneratorConfigRecord` and `readDccCharacterGeneratorConfig` — the typed boundary
  where an artifact's untyped provenance becomes settings a roll can take.
- **Storing** — `toDccCharacterSnapshot` and `dccCharacterFromSnapshot`. The occupation and the
  lucky sign travel as the rows the character drew, minus their `apply` handler, which is put back
  by name on read; `isUnknownDccOccupationName` and `isUnknownDccLuckyRollName` say when it could
  not be.
- **The artifact kind** — `dccCharacterArtifactKind`, `DCC_CHARACTER_ARTIFACT_KIND`
  (`character.dcc`), `validateDccCharacterSnapshot`, `migrateDccCharacterSnapshot`. One artifact is
  one character: a funnel saves several.
- **Editing a saved character** — `dcc_character_editing.ts`: one function per field, each taking a
  snapshot and returning a new one. Nothing recomputes anything; `dccDerivedFromAttributes` offers
  the arithmetic as an explicit command.
- **Presentation** — `dccCharacterToDocument`, `dccCharacterToMarkdown`, `dccCharacterFileStem`,
  for the Markdown export beside the drawn PDF sheet.

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
