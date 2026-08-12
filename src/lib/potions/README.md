# Potions

This library generates a **potion**: what it does, how strong it is and for how long, what it looks,
smells, and tastes like, what it is in, and what it is worth. It works from a catalog of known
potions (the ones players expect to find) and can optionally invent homebrew ones on top.

Value is derived rather than made up: rarity gives a base, magnitude scales it, and the container
adds its own worth, so a legendary potion in a plain flask and a common one in a crystal vial both
price sensibly.

## Features

- **Types** — `Potion` (a `container`, a `liquid`, its `displayName` and optional `canonicalName`,
  `sensory` profile, `effect`, and any `modifications`), `PotionEffect`, `PotionEffectParameters` (a
  discriminated union over
  `healing`, `strength`, `resistance`, `spell`, `bonus`, and `homebrew`), `PotionForm`
  (`'drink' | 'oil' | 'ointment'`), `PotionSensoryProfile`, `PotionSensoryHints`,
  `PotionCatalogEntry`, and `PotionCatalogVariant`.
- **Generation** — `generatePotion(seed, config)` with `getDefaultPotionConfig`, and
  `filterCatalogEntries` for narrowing the catalog by the same rules the generator applies.
- **Description** — `describePotion`, `describeEffect`, and `describeDurationShort`.
- **Value** — `getRarityBaseValue`, `calculateLiquidValue`, `calculateHomebrewLiquidValue`,
  `resolveCatalogValue`, `calculateTotalValue`, and `resolveRarity` (which maps an effect's
  magnitude onto a rarity band).
- **Sensory profile** — the appearance, viscosity, flavour, and scent generators, guided by each
  catalog entry's `PotionSensoryHints` so a healing draught looks like one.

## Usage

```typescript
import { describePotion, generatePotion } from '$lib/potions';

const potion = generatePotion('some seed');

potion.displayName;
potion.effect.name;
potion.sensory.appearance;
potion.container.name;
describePotion(potion);
```

The config narrows what may be generated — catalog ids, rarities, and forms, plus the two switches
that change the character of the output:

```typescript
import { generatePotion, getDefaultPotionConfig } from '$lib/potions';

const config = getDefaultPotionConfig();
config.allowedRarities = ['rare', 'epic'];
config.allowHomebrew = true; // invent effects beyond the catalog
config.allowProceduralNames = true; // and name them procedurally

const potion = generatePotion(seed, config);
```

Both switches default to `false`, so out of the box the generator produces recognizable potions from
the catalog under their usual names.

Containers come from [`$lib/equipment`](../equipment/README.md) via `config.containerConfig`, which
defaults to unlocked, liquid-capable containers.
