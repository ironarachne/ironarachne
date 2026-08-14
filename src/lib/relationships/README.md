# Relationships Library

This library provides tools for managing and generating relationships between entities (characters, factions, etc.) in the Iron Arachne world building tools. It includes a definition of various relationship types, methods to filter them, and utilities to generate descriptive text.

## Features

- **Predefined Relationship Types**: A collection of common relationship types (e.g., friend, enemy, spouse, mentor) with associated metadata like tags and compatibility.
- **Filtering**: deeply filter relationship types based on allowed and disallowed tags.
- **Description Generation**: Generate human-readable descriptions for relationships using templates.
- **Reciprocity**: Determine the inverse side of a relationship (e.g., Commander -> Subordinate).

## Usage

### Importing

```typescript
import {
  relationshipTypes,
  filterRelationshipTypes,
  generateRelationshipDescription,
  getInverseRelationshipType,
} from '$lib/relationships';
```

### Filtering Relationship Types

You can retrieve a subset of relationship types by specifying allowed and disallowed tags.

```typescript
// Get only positive, social relationships
const positiveSocial = filterRelationshipTypes(['positive', 'social'], []);

// Get relationships that are NOT familial
const nonFamilial = filterRelationshipTypes([], ['familial']);
```

### Generating Descriptions

To generate a text description, you need a random number generator (RNG) instance that implements the `RNG` interface (like `@ironarachne/rng`).

```typescript
import { IronRng } from '@ironarachne/rng';

const rng = new IronRng();
const friendType = relationshipTypes.find((t) => t.name === 'friend');

const description = generateRelationshipDescription(rng, 'Alice', 'Bob', friendType);
// Output Example: "Alice is friends with Bob"
```

### Finding Inverse Relationships

You can find the reciprocal nature of a relationship type.

```typescript
const commanderType = relationshipTypes.find((t) => t.name === 'commander');
const inverse = getInverseRelationshipType(commanderType);

console.log(inverse.name); // "subordinate"
```

## Data Structure

Relationship types are defined with the following structure:

- `name`: Unique identifier for the relationship.
- `reciprocalName`: The name of the inverse relationship type.
- `tags`: Categories this relationship belongs to (e.g., "positive", "familial").
- `incompatibleWithTypes`: List of relationship types that cannot coexist with this one.
- `isOneSided`: Whether the relationship is felt only by the originator (e.g., "desire", "envy").
