# Format

- **`text`**: `list` and `header` helpers for plain-text lists (e.g. Stars Without Number / Uncharted Worlds character output).
- **`numbers`**: `formatNumber` using `Intl.NumberFormat` for route UI (planet stats, treasure hoards).

## Usage

```ts
import { formatNumber, list, header } from '$lib/format';
```

Direct imports from `$lib/format/text` are equivalent if you only need the text helpers.
