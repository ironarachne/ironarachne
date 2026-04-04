# Dice Library

This library provides a functional approach to handling tabletop RPG dice operations in the Iron Arachne project. It allows for creating, manipulating, analyzing, and rolling dice pools.

## Key Concepts

### DicePool

The core structure is the `DicePool` interface, which represents a collection of polyhedral dice (d4, d6, d8, d10, d12, d20, d100) and a constant modifier.

```typescript
interface DicePool {
  d4: number;
  d6: number;
  d8: number;
  d10: number;
  d12: number;
  d20: number;
  d100: number;
  modifier: number;
  modifierType: string; // '+', '-', or '*'
}
```

## Usage

### Importing

```typescript
import * as Dice from '$lib/dice';
// or
import { toDicePool, roll, getPower } from '$lib/dice';
```

### Creating Dice Pools

You can create a dice pool from a standard dice notation string:

```typescript
const pool = Dice.toDicePool('2d6+4');
// result: { d6: 2, modifier: 4, modifierType: '+', ... }
```

Or create an empty one:

```typescript
const emptyPool = Dice.createDicePool();
```

### Rolling Dice

To simply roll a dice expression string and get a result:

```typescript
const result = Dice.roll('1d20+5');
```

### Analyzing Dice

You can get statistical information about a dice pool:

```typescript
const pool = Dice.toDicePool('2d6');

const min = Dice.getMinResult(pool); // 2
const max = Dice.getMaxResult(pool); // 12
const avg = Dice.getAverageResult(pool); // 7
```

### Power Calculation

The `getPower` function calculates the "power" of a dice pool, defined as the most likely combined result. If there are multiple outcomes with the same highest probability, it returns the highest value among them.

```typescript
const power = Dice.getPower(Dice.toDicePool('3d6')); // 11
```

### formatting

Convert a `DicePool` object back into a string representation:

```typescript
const desc = Dice.describeDice(pool); // "2d6+4"
```
