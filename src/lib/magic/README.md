# Magic System

**Compatibility facade.** The normalized magic model is now owned by
`$lib/rulesets/ironarachne`. Existing imports from `$lib/magic` remain stable during the migration;
new code imports the Iron Arachne ruleset package directly.

This is the legacy Iron Arachne magic taxonomy. It is not a lossless common representation for
published systems; system-native magic belongs in each ruleset package.

## Core Concepts

The system is built around abstract concepts rather than specific game mechanics:

- **Elements**: The fundamental building blocks of the spell (e.g., Fire, Void, Time, Blood).
- **Spheres**: The domain of reality the spell affects (e.g., Physical, Mental, Spiritual).
- **Intent**: What the spell tries to achieve (e.g., Create, Destroy, Alter).
- **Magnitude**: A 1-100 scale representing the raw power or complexity of the spell.
- **Difficulty**: A 1-100 scale representing how hard it is to cast.

## Structure

- `types.ts`: Definitions for Spells, Elements, Spheres, Intents, Costs, and other core data structures.
- `converter.ts`: Interface for converting external magic systems to and from this common format.
- `utils.ts`: Helper functions for working with spells (summaries, component checks, formatting).

## Usage

Existing generators may continue using this taxonomy until their payloads migrate in #209. New
published-system work must not convert through it for storage or cross-system compatibility.
