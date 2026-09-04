# Combat System

**Compatibility facade.** The normalized combat model is now owned by
`$lib/rulesets/ironarachne`. Existing imports from `$lib/combat_system` remain stable during the
migration described by issues #210, #209, and #213; new code imports the Iron Arachne ruleset
package directly.

This implements the legacy combat system for Iron Arachne. It can still be used by itself, but it
is not a lossless common representation for published game systems.

## Core Concepts

The system uses a normalized 0-100 scale for most statistics, where 50 represents an average competent human baseline.

### Combat Profile

- **Attack**: Accuracy and skill in offensive actions.
- **Defense**: Ability to avoid being hit (dodge, parry, etc.).
- **Power**: Raw damage potential.
- **Resilience**: Ability to withstand damage (armor, toughness).
- **Speed**: Initiative and movement speed.
- **Health**: Overall durability and hit points.

## Legacy converters

The package retains the existing 5e-shaped presentation converter for compatibility. New
published-system mechanics belong to their own ruleset package rather than passing through it.

### Dungeons & Dragons 5e

- **Ability Scores**: 50 maps to 10, with every 5 points representing a +1 increase.
- **Armor Class**: Derived from Defense.
- **To Hit**: Derived from Attack.
