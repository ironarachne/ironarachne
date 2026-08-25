# AD&D

This library implements character generation for **Advanced Dungeons & Dragons (2nd edition)**: the
races, classes, spells, and equipment tables, the rules that decide which combinations are legal,
and the derived statistics that follow from a set of ability scores. It also renders a finished
character to a PDF character sheet.

It is the largest of the game-system libraries, so it is one of the few that keeps its data in
subdirectories (`classes/`, `races/`) rather than a flat file list.

## Features

- **Generation** — `generateCharacter` takes an `ADNDCharacterGeneratorConfig` and returns a
  complete `ADNDCharacter`; `getDefaultConfig` builds a config allowing every race and class.
- **Eligibility** — `getRaceOptions`, `getClassOptions`, `getClassOptionsForRace`, `isWarriorClass`,
  and `assignExceptionalStrength` answer what a partly-built character may still become. Interactive
  builders use these to narrow the choices they offer.
- **Data tables** — `classes.getAll()`, `races.getAll()`, `spells.getAll()`, `getWeapons()`,
  `getArmor()`, `getAmmoTypes`, and `adndKitRows`. The three `getAll` sources are namespaced
  (`classes`, `races`, `spells`) rather than starred, because they share a function name. The
  weapon table lives in `adnd_weapon_data.ts`, and `getWeapons()` hands out that shared constant
  rather than rebuilding it — **treat what it returns as read-only**. The generator copies the
  weapon it picks so a character owns its equipment instead of holding a reference into the table.
- **Proficiencies and kits** — `selectWeaponProficiencyGroups`, `selectNonweaponProficiencies`,
  `getEligibleWeaponGroups`, `filterKitsForCharacter`, and `selectRandomKit`.
- **Thief skills** — `getBaseThiefSkillRows`, `prepareThiefSkillRowsForCharacter`,
  `distributePoints`, `modifyForDexterity`, `modifyForRace`, and the validation helpers used by the
  point-allocation UI.
- **Starting spells** — `getStartingSpellChoiceGroups`, `starterSpellSelectionIsComplete`,
  `startingSpellsFromPicks`, and `assignRandomStartingSpellsForClass`.
- **Derived statistics** — `applyAdndAbilityDerivedFields`, `applyAdndSavingThrows`,
  `recalculateAdndArmorClass`, `rollAdndLevel1Hp`, `rollAdndStartingCopper`, and
  `finalizeAdndCharacterDerivedStats`.
- **Formatting** — the `formatAdnd*` helpers turn a character into the strings a sheet displays
  (signed modifiers, exceptional strength, spell levels, equipment sections).
- **PDF** — `buildAdndCharacterPdf` returns a `Blob`; `downloadAdndCharacterPdf` saves it.

## Usage

```typescript
import { RNG } from '@ironarachne/rng';
import { generateCharacter, getDefaultConfig } from '$lib/adnd';

const config = getDefaultConfig(new RNG('some seed'));
config.includeProficiencies = true;
config.includeKits = true;

const character = generateCharacter(config);
```

Restrict what may be rolled by narrowing the config's tables:

```typescript
import { classes, races, generateCharacter, getDefaultConfig } from '$lib/adnd';

const config = getDefaultConfig(rng);
config.allowedRaces = races.getAll().filter((race) => race.name === 'Dwarf');
config.allowedClasses = classes.getAll().filter((cls) => cls.name === 'Fighter');

const dwarfFighter = generateCharacter(config);
```

The config carries the `RNG` instance, so a whole run is reproducible from one seed. Hand it a
seeded `RNG` rather than replacing the field after the fact.

## Exporting a sheet

```typescript
import { downloadAdndCharacterPdf } from '$lib/adnd';

await downloadAdndCharacterPdf(character);
```

## What edition this is, and what it leaves out

Requirement 8.4 in [the readiness spec](../../../docs/workshop.md#8-documentation) asks a tool
that implements a game system to say which edition and what it deliberately omits. This is
**AD&D 2nd Edition**, from the Player's Handbook.

Everything here is **level 1**. That is the single largest omission and the one every other
follows from: there is no experience progression, no hit dice past the first, no spell progression
table, and no saving-throw improvement. A character is made and then read; it is not advanced.

Also deliberately absent:

- **Multi-classing and dual-classing.** A character has exactly one class. The demihuman
  multi-class combinations are a large part of the PHB and none of them are here.
- **Psionics.** Not modelled at all.
- **Non-weapon proficiency slots and checks.** `selectNonweaponProficiencies` picks a plausible
  list of names. It does not track slot costs, does not spend them against an allowance, and there
  is no proficiency check.
- **The mechanical half of kits.** `adnd_kits_data.ts` is curated narrative features, chosen for
  what they suggest at a table. A kit's real hindrances, weapon restrictions, and benefits are not
  applied to the character.
- **Encumbrance, movement, and combat resolution.** Weight allowance and maximum press are
  computed and shown, but nothing consumes them.
- **Spheres and schools beyond filtering.** A priest's spells are drawn through `SpellFilter`
  rather than by modelling sphere access.

Two rules are implemented in a way worth naming, because they are easy to misread as bugs:

- **Discretionary thief skill points are spent exactly.** `distributePoints` clamps its last award
  to whatever is left of the pool. It did not always: 86% of rolled rogues used to come out above
  their budget, by as much as 27 points on a pool of 60.
- **A roll that qualifies for no class is re-rolled**, up to twenty times. Straight 3d6 down the
  line can produce a character no class will take under any race — the PHB's own answer is to roll
  again, and `generateCharacter` does.

## Storage

An AD&D character is an artifact of kind `character.adnd-2e`, shared by the generator at
`/fantasy/adnd/character` and the builder at `/fantasy/adnd/character/build`. `ADNDRace` and
`ADNDClass` each carry an `apply` function and so are stored by name; everything else on the
character, including every derived number, travels as it is. See
[the design](../../../docs/adnd-character.md) for why the numbers are kept rather than recomputed,
and [subraces](../../../docs/adnd-subraces.md) for why a variety is a field on the character rather
than a rewrite of its race.
