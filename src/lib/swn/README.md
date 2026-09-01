# SWN

This library implements generation for **Stars Without Number**: characters — backgrounds, classes,
foci, stats, skills, and the equipment that follows — and starships, from hull and owner type
through drives, fittings, defenses, and cargo.

Characters and starships are namespaced rather than starred (`characters.generate`,
`starships.generate`) because both modules export `generate`, `Weapon`, and `formatAsText`. The
components consume them the same way: `import { characters as CharGen } from '$lib/swn'`.

## The edition, and what is not here

The character generator implements **Stars Without Number: Revised Edition**, and only what a
first-level character needs: the twenty-one backgrounds and their quick skills, the three classes
and the three adventurer combinations with their abilities, the focus table, the six psychic disciplines with their level-0 and level-1
powers, stats, skills, the equipment package a background hands out, and the numbers derived from
all of it.

Deliberately absent: advancement past level 1, transhuman options, cyberware, factions, and the
maturities and tags that only matter to a campaign in play. A character generated here is a
starting character; a referee who levels one up edits the saved artifact rather than asking the
tool for level 4. This is unofficial and unaffiliated with Sine Nomine Publishing.

## How effects work

Backgrounds, classes, and foci do not write directly into a character. Each contributes an
**effect** — `BonusSkill`, `BonusSkillFromList`, `BonusSkillOfType`, `BonusHP`, `InnateAC`,
`BonusFocus`, `SpecialAbility`, or `EffortAbility` — and `applyCharacterEffect` is what changes the
character. That keeps "what a focus grants" as data next to the focus, rather than as a special case
inside the generator.

`FocusEffect` and `ClassAbility` are the two unions of what a focus and a class may respectively
grant; `CharacterEffect` is either.

## Features

- **Characters** (`characters`) — `generate(rng)`, `createSwnCharacter`, `equipmentList`, the
  `create*` constructors for stats, skills, backgrounds, classes, foci, and effects, plus
  `applyFocus` and `applyCharacterEffect`.
- **Starships** (`starships`) — `generate(rng)`, `createSwnStarship`, and the constructors for hull
  types, owner types, and the drive, cargo, defense, and general fittings.
- **PDF** — `buildSwnCharacterPdf` returns a `Blob`; `downloadSwnCharacterPdf` saves it. The sheet
  is drawn with the sci-fi layout in [`$lib/pdf`](../pdf/README.md).

## Data tables

The larger tables live in their own modules, so the generators read as generation logic rather
than as pages of content. To add or change content, edit these rather than the generator:

- `starship_owner_type_data.ts` — the eight owner types, with the name pools and the naming rules
  each one uses.
- `starship_fitting_data.ts` — every general fitting a ship can carry.
- `psychic_discipline_data.ts` — the level-0 and level-1 power each psychic discipline grants.

These tables are shared, module-level constants: treat them as read-only. A ship copies each
fitting it keeps, so the fittings on its sheet are its own and editing them cannot change what
the next ship is offered. `OWNER_TYPES` is the exception that cannot be copied — its entries carry
naming closures, which `structuredClone` refuses — so an owner type reaching `starship.ownerType`
really is the shared one, and mutating it would affect every later ship.

## Saving a character

The character generator is Release-ready (issue #49), which means everything it produces can be
kept:

- `swn_character_snapshot.ts` — the stored form. It is the identity function, because a
  `SWNCharacter` carries no closures; the module says so explicitly rather than leaving a reader
  to wonder what was stripped.
- `swn_character_artifact_kind.ts` — the `character.swn` kind: validation, the payload version,
  and what to call an artifact whose character was never named.
- `swn_character_roll.ts` — the single path from a seed to a character, names included. Both the
  generator page and a re-roll from the vault go through it.
- `swn_character_editing.ts` — one function per field, each returning a new snapshot. Nothing
  recomputes anything; `swnDerivedFromStats` is the arithmetic offered as an explicit command.
- `swn_presentation.ts` — the character as a document, and the Markdown export written from it.
  Empty sections are dropped here rather than in each renderer.

`psychicPicks` on a character is the decision beside its effect: a discipline resolves into
`abilities` as prose, and prose is not something an editor can offer back as a choice. The foci
need no equivalent — a `Focus` already carries its own name and level, so the row _is_ the pick.

## Usage

```typescript
import { characters, starships, downloadSwnCharacterPdf } from '$lib/swn';

const character = characters.generate(rng);
const ship = starships.generate(rng);

character.skills;
ship.hullType.name;

await downloadSwnCharacterPdf(character);
```

Both generators take an existing `RNG` rather than a seed, so a caller that wants a reproducible
character seeds the `RNG` itself:

```typescript
import { RNG } from '@ironarachne/rng';

const character = characters.generate(new RNG('some seed'));
```
