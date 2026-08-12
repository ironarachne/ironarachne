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
