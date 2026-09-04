# Currency

**Compatibility facade.** Currency types, predefined systems, and helpers are now owned by
`$lib/rulesets/ironarachne`. Existing `$lib/currency` imports remain stable while consumers migrate;
new code imports the compatibility package or a published ruleset package directly.

These helpers handle several fictional and historical denomination sets. A denomination set is
not assumed to be the currency of every fantasy ruleset.

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
