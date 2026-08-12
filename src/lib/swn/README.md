# SWN

This library implements generation for **Stars Without Number**: characters — backgrounds, classes,
foci, stats, skills, and the equipment that follows — and starships, from hull and owner type
through drives, fittings, defenses, and cargo.

Characters and starships are namespaced rather than starred (`characters.generate`,
`starships.generate`) because both modules export `generate`, `Weapon`, and `formatAsText`. The
components consume them the same way: `import * as CharGen from '$lib/swn/character'`.

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
