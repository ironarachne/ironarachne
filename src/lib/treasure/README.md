# Treasure Generation

This library provides the ability to generate treasure for tabletop role-playing games. It doesn't adhere to any particular system, but takes cues from Dungeons & Dragons (5th Edition style currencies and values).

It can be used on its own, but is designed to be used primarily with the dungeon generator or other content generation tools.

## Capabilities

The library is split into several modules, each handling a specific type of treasure or functionality.

### Coin Piles (`coin_piles.ts`)

Handles the creation and manipulation of currency.

- **Denominations**: Supports Copper (cp), Silver (sp), Electrum (ep), Gold (gp), and Platinum (pp).
- **Generation**: Create piles of coins with specific denominations and quantities.
- **Distribution**:
  - `getDenominationProportionsUpToDenomination`: Deterministically calculates proportions of lower denominations relative to a target denomination.
  - `getSetOfCoinsForValue`: Converts a total monetary value into a set of coin piles and containers, distributing the value according to proportions.
- **Manipulation**:
  - `decreaseValueOfPileOfCoins` / `increaseValueOfPileOfCoins`: Adjust the value of existing piles.
  - `splitPileOfCoins`: Break large piles into smaller ones.
  - `getMaxDenominationForValue`: Determine the most appropriate high-value coin for a given amount.

### Art Objects (`art_objects/art_objects.ts`)

Manages valuable artistic items often found in hoards.

- **Types**: Includes paintings, sculptures, tapestries, statues, and mosaics.
- **Generation**:
  - `generateArtObject`: Creates unique art objects with descriptions and artist names.
  - `getArtObjectsForValue`: Generates a collection of art objects that sum up to a target value using a greedy algorithm.
  - `getArtObjectOfMaxValue(seed, maxValue)`: Selects a single art object within a specific price limit, seeded so the same seed always yields the same object.

### Gems (`gems.ts`)

Handles precious stones and gems.

- **Types**: A wide variety of gems including Agate, Diamond, Ruby, Sapphire, etc., each with base values.
- **Generation**:
  - `generateGem`: Creates gem instances, marking them as cut or raw.
  - `getGemsForValue`: Generates a collection of gems that sum up to a target value.
  - `getGemTypesUpToValue`: Filters available gem types based on a maximum value.

### Treasure Hoard (`treasure_hoard.ts`)

The high-level orchestrator for generating complete treasure drops.

- **`getTreasureHoardForValue`**: This is the main entry point. It takes a total value and a set of proportions (e.g., `{ coins: 1, artObjects: 1, gems: 1 }`) and generates a complete list of items.
  - It intelligently splits the total value among coins, art, and gems.
  - It delegates to the specific modules to generate the actual items.
  - It returns a unified list of `Item` objects (including containers for coins).

## The `treasure-hoard` artifact kind

A hoard is a durable artifact (#70), and it is **one artifact holding the whole pile rather than
forty** — decision 3 of [docs/readiness-objects.md](../../../docs/readiness-objects.md). A hoard is
read out at a table as a unit, its contents are not things a user names individually, and forty
artifacts per hoard is a vault nobody can browse.

- **`treasure_hoard_snapshot.ts`** — `TreasureHoardSnapshot` and the codec. A hoard item is an item
  **plus what its own kind adds**: `ItemSnapshot` drops `contents`, `containerId` and the capacity
  fields because for a lone item the container is not part of the artifact — and here it is. The
  subtype fields go too, or "12 gems" replaces the "12 cushion-cut emeralds" that was rolled.
- **`treasure_hoard_artifact_kind.ts`** — the kind, its version, and a validator that normalises
  rather than refuses. An item with no id is the one thing dropped: the id is what a container's
  `contents` points at, so an item that has lost it would appear twice.
- **`treasure_hoard_roll.ts`** — the one path from a seed, and the page's twelve controls as a
  provenance record. The value is recorded in gold, as the page's field is, and converted to copper
  in one place.
- **`treasure_hoard_editing.ts`** — the setters. Removing an item also takes it out of whatever
  chest held it; nothing recomputes, and `targetValue` is what the hoard was _rolled for_, which
  stays true however much of it the party carries off.
- **`treasure_hoard_presentation.ts`** — the sheet, and the Markdown and PDF written from it. The
  gem tally lives here: below twelve they are listed one by one, up to twenty-four they are grouped
  by name, and beyond that they are one assorted line. That rule was three untested branches in the
  component.
