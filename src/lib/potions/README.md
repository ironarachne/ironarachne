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

## The `potion` artifact kind

A potion is a durable artifact (#68), and it is **its own kind rather than a share of `item`** —
decision 2 of [docs/readiness-objects.md](../../../docs/readiness-objects.md). An item editor has no
field for a duration or a flavour, and a potion editor has none for a combat profile; folding the
two together would give one of them an editor that is wrong for half of what it opens.

- **`potion_snapshot.ts`** — `PotionSnapshot` and the codec. `Potion` is plain throughout, so
  nothing is converted; what the snapshot does is **stop storing the same thing twice**.
  `generatePotion` writes the effect, the sensory profile and the display name into the liquid _and_
  onto the potion beside it, so the stored liquid drops all three and they are rebuilt on read.
  There is one place to edit an effect and one answer to what it is.
- **`potion_artifact_kind.ts`** — the kind, its version, and a validator that normalises rather than
  refuses: a missing sensory field reads as empty prose, an unreadable modification is dropped, and
  an effect `parameters` union this build does not know is kept as it is rather than rejected.
- **`potion_roll.ts`** — the one path from a seed, and the page's two checkboxes as a provenance
  record.
- **`potion_editing.ts`** — the setters, none of which recompute. Changing the magnitude does not
  reprice the potion, and `describePotionSnapshot` offers the generated wording as an explicit
  command.
- **`potion_presentation.ts`** — the sheet, and the Markdown and PDF written from it. `potionForm`
  lives here too: the page used to work out whether a potion was a drink, an oil or an ointment by
  sniffing `liquid.properties` three levels of nested ternary deep, where nothing could test it.
