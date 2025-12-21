# Treasure Generation

This library provides the ability to generate treasure for tabletop role-playing games. It doesn't adhere to any particular system, but takes cues from Dungeons & Dragons (5th Edition style currencies and values).

It can be used on its own, but is designed to be used primarily with the dungeon generator or other content generation tools.

## Capabilities

The library is split into several modules, each handling a specific type of treasure or functionality.

### Coin Piles (`coin_piles.ts`)

Handles the creation and manipulation of currency.

-   **Denominations**: Supports Copper (cp), Silver (sp), Electrum (ep), Gold (gp), and Platinum (pp).
-   **Generation**: Create piles of coins with specific denominations and quantities.
-   **Distribution**:
    -   `getDenominationProportionsUpToDenomination`: Deterministically calculates proportions of lower denominations relative to a target denomination.
    -   `getSetOfCoinsForValue`: Converts a total monetary value into a set of coin piles and containers, distributing the value according to proportions.
-   **Manipulation**:
    -   `decreaseValueOfPileOfCoins` / `increaseValueOfPileOfCoins`: Adjust the value of existing piles.
    -   `splitPileOfCoins`: Break large piles into smaller ones.
    -   `getMaxDenominationForValue`: Determine the most appropriate high-value coin for a given amount.

### Art Objects (`art_objects.ts`)

Manages valuable artistic items often found in hoards.

-   **Types**: Includes paintings, sculptures, tapestries, statues, and mosaics.
-   **Generation**:
    -   `generateArtObject`: Creates unique art objects with descriptions and artist names.
    -   `getArtObjectsForValue`: Generates a collection of art objects that sum up to a target value using a greedy algorithm.
    -   `getArtObjectOfMaxValue`: Selects a single art object within a specific price limit.

### Gems (`gems.ts`)

Handles precious stones and gems.

-   **Types**: A wide variety of gems including Agate, Diamond, Ruby, Sapphire, etc., each with base values.
-   **Generation**:
    -   `generateGem`: Creates gem instances, marking them as cut or raw.
    -   `getGemsForValue`: Generates a collection of gems that sum up to a target value.
    -   `getGemTypesUpToValue`: Filters available gem types based on a maximum value.

### Treasure Hoard (`treasure_hoard.ts`)

The high-level orchestrator for generating complete treasure drops.

-   **`getTreasureHoardForValue`**: This is the main entry point. It takes a total value and a set of proportions (e.g., `{ coins: 1, artObjects: 1, gems: 1 }`) and generates a complete list of items.
    -   It intelligently splits the total value among coins, art, and gems.
    -   It delegates to the specific modules to generate the actual items.
    -   It returns a unified list of `Item` objects (including containers for coins).

