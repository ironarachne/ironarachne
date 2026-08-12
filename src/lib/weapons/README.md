# Weapons

This library generates a **weapon**: a model name, its damage type, its cosmetic details and its
effects, and a description assembled from them. It is aimed at science-fiction settings, where a
weapon is a manufacturer's product line rather than a named artifact.

Names come from the model-number generator, so output reads like a catalog entry ("KX-9 pulse
rifle") rather than a legend.

## Features

- **Types** — `Weapon` (`name`, `maker`, `damage`, `cosmetics`, `effects`, `description`),
  `WeaponType`, `WeaponComponent`, and `WeaponEffect`.
- **Generation** — `generate(config)`, with `getDefaultConfig(rng)`.
- **Description** — `describe`, plus `randomCosmetics` and `randomEffects` for the parts.
- **`scifi.all`** — the science-fiction weapon-type table.

## Usage

`getDefaultConfig` supplies the `RNG` and an **empty** `weaponTypes` list, so a caller must say what
kinds of weapon may be generated — there is no implicit default table:

```typescript
import { generate, getDefaultConfig } from '$lib/weapons';
import { all } from '$lib/weapons/scifi';

const config = getDefaultConfig(rng);
config.weaponTypes = all;

const weapon = generate(config);

weapon.name;
weapon.description;
```

Narrow that list to constrain the run:

```typescript
config.weaponTypes = all.filter((type) => type.name === 'pistol');

const pistol = generate(config);
```

A weapon's `maker` is left empty here — [`$lib/arms_manufacturer`](../arms_manufacturer/README.md)
is what generates a company and fills in its product line.
