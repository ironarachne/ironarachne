# Visual identity library

This library models **how an entity presents itself visually** in world-building: emblem (or lack of one), optional **colors**, and an optional **motto**. It is meant for noble houses, companies, wizard schools, realms, guilds, and similar factions.

The **[heraldry](../heraldry/)** library remains separate: it owns coats of arms (`Arms`), generation, and SVG rendering. **Visual identity** may **reference** heraldry when `VisualEmblem` is `{ kind: 'heraldry', arms }`. Other emblem styles (mon, flag, badge, …) can be added later as new `kind` variants without changing heraldry.

## Features

- **`VisualIdentity`** — `emblem` (required), optional `colors` (`VisualColorPalette`), optional `motto`.
- **`VisualEmblem`** — discriminated union: `none` or `heraldry` (with `Arms`). Prefer switching on `kind` when handling emblems.
- **Helpers** — `createEmptyVisualIdentity()`, `withHeraldryEmblem(identity, arms)`, `isHeraldryEmblem(emblem)` for narrowing.

## What is out of scope

Rendering (SVG, PNG), typography, layout, and asset URLs are not handled here. The heraldry module continues to render shields when you have a `heraldry` emblem.

## Usage

### Importing

```typescript
import {
  createEmptyVisualIdentity,
  withHeraldryEmblem,
  isHeraldryEmblem,
  type VisualIdentity,
} from '$lib/visual_identity';
```

### Building an identity

```typescript
let identity = createEmptyVisualIdentity();
identity = {
  ...identity,
  colors: { primary: '#1a3a5c', accent: '#c9a227' },
  motto: 'Through storm and stone',
};
identity = withHeraldryEmblem(identity, arms);

if (isHeraldryEmblem(identity.emblem)) {
  // identity.emblem.arms is Arms
}
```

### Extending emblems

Add new variants to `VisualEmblem` in `visual_identity_types.ts` (e.g. `{ kind: 'flag'; … }`) and teach consumers to branch on `kind`. Keep **heraldry** importing this library only if you introduce shared types the other direction; today **visual identity** may import `Arms` from heraldry, not the reverse.

## Data shapes (types)

- **`VisualColorPalette`** — `primary` plus optional `secondary`, `accent` (strings, typically hex).
- **`VisualEmblem`** — `none` or `heraldry` with `Arms`.
- **`VisualIdentity`** — bundles emblem and optional colors/motto.
