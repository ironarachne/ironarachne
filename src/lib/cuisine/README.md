# Cuisine

This library models a **cuisine** — the dishes, seasonings, main components, cooking methods, and
drinks that characterize a culture's food — along with the ingredient tables it draws on.

> **Status:** partly built. The ingredient and drink tables are populated and usable, and
> `generateDish`/`generateDrink` work. The top-level `generate` is a stub that returns an empty
> `Cuisine`, and `getDefaultConfig` returns empty option lists (it still needs wiring to
> `components.ts`). Treat whole-cuisine generation as not yet implemented.

## Features

- **Types** — `Cuisine`, `CuisineGeneratorConfig`, `FoodComponent`, `DrinkType`, and `Drink`.
- **Ingredient tables** — `components.all()`, plus `spices`, `herbs`, `fruits`, `vegetables`,
  `meats`, and `seafood`; `drinkTypes.all()` for drinks. Both are namespaced rather than starred,
  because each exports `all`.
- **Pieces** — `generateDish` and `generateDrink`.
- **Whole cuisine** — `generate` and `getDefaultConfig` (see the status note above).

## Usage

```typescript
import { components, generateDish, generateDrink } from '$lib/cuisine';

const dish = generateDish(rng);
const drink = generateDrink(rng);

components.spices(); // the spice table
components.all(); // every food component
```

## Finishing the generator

The remaining work is to populate `getDefaultConfig` from `components.ts` — seasonings,
complements, main components, cooking methods, and drinks — and to have `generate` assemble a
`Cuisine` from those lists rather than returning empty arrays.
