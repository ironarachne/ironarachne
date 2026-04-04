# Landforms Library

This library catalogs broad geological landform types (such as plains, hills, mountains, and canyons) and defines their physical characteristics and valid geological constraints. It separates raw mapping taxonomy from the procedural generation pipelines.

## Architectural Principles

- **Data-Driven**: All potential forms are isolated into static dictionary definitions instead of relying on runtime logic structures or OOP.
- **Geological Coupling**: Aligns seamlessly with upstream properties like `GeologicalMakeup` on terrain, allowing filtering features where `canyon` might be exclusive to `sandstone` or `basalt`.

## Core Types

- `LandformType`: Represents a specific classification. Tracks strings such as `name`, `majorType`, and `description`, along with mathematical indicators for `elevationMin`/`elevationMax` and `grade` (the overall steepness of the terrain block). Crucially, arrays for `validSoils` and `validRocks` denote restrictions for downstream validation.

## Main Functions

- `all(): LandformType[]`: Returns the complete static lookup table of all registered `LandformType` definitions. Pure functions inside terrain or environment libraries rely heavily on filtering this list based on their procedurally generated bounds to apply accurate geographical descriptors.
