# Magic System

This directory contains the core magic system for Iron Arachne. It is designed to be a "common tongue" for magic, allowing for conversion between different magic systems (like D&D, Pathfinder, or custom systems) and a standardized internal representation.

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

This system is primarily used as an intermediate layer. When generating content that involves magic, convert specific system rules into this common format for storage or cross-system compatibility, and then convert back to specific rules when displaying to the user if necessary.
