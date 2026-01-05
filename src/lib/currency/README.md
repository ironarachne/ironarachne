# Currency

This library presents types and methods for handling various currency systems. It is designed to be robust enough to handle conversions and transactions in any common fictional currency system, whether it's D&D's coin system, Star Wars credits, or even real-world historical currency systems.

## Features

- **Generic Currency Systems**: Define any currency system with custom denominations, values, and weights.
- **Conversion**: Convert values between denominations and format them as strings.
- **Transactions**: (Planned) Handle transactions between different currency amounts.
- **Standard Systems**: Includes predefined systems like Standard Fantasy (D&D 5e), Imperial Credits, and Historical British.

## Usage

```typescript
import { valueToString, convert, STANDARD_FANTASY } from '$lib/currency';

// Convert value to string
const value = 1234; // in base unit (e.g., copper pieces)
const string = valueToString(value, STANDARD_FANTASY); // "12 gp 3 sp 4 cp"

// Convert between denominations
const gold = convert(10, 'silver', 'gold', STANDARD_FANTASY); // 1
```
