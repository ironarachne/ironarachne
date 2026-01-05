# Combat System

This implements a common combat system for Iron Arachne. It is meant to present a common system that can be used either by itself or to convert from other systems.

## Core Concepts

The system uses a normalized 0-100 scale for most statistics, where 50 represents an average competent human baseline.

### Combat Profile

*   **Attack**: Accuracy and skill in offensive actions.
*   **Defense**: Ability to avoid being hit (dodge, parry, etc.).
*   **Power**: Raw damage potential.
*   **Resilience**: Ability to withstand damage (armor, toughness).
*   **Speed**: Initiative and movement speed.
*   **Health**: Overall durability and hit points.

## Converters

The system includes converters to translate these abstract values into specific game system mechanics.

### Dungeons & Dragons 5e

*   **Ability Scores**: 50 maps to 10, with every 5 points representing a +1 increase.
*   **Armor Class**: Derived from Defense.
*   **To Hit**: Derived from Attack.
