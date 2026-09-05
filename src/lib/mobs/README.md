# Mobs

This library defines the **`Mob`** type: the minimum a thing needs to be to take part in combat — an
id, a name, descriptions, a combat profile, and the actions it can take — and **`MobGroup`** for a
band of them.

It is types only; it holds no logic. `Creature` (and therefore `Character`) extends `Mob`, which is
how a generated person can be dropped into an encounter without any conversion step. Encounters are
built from `MobGroup`s.

## Features

- **`Mob`** — a `TaggedItem` with `id`, `name`, `description`, `shortDescription`, `combatProfile`,
  and `actions`.
- **`MobGroup`** — a `TaggedItem` holding `mobs`, with an optional name and description.

## Usage

```typescript
import type { Mob, MobGroup } from '$lib/mobs';

function totalHealth(group: MobGroup): number {
  return group.mobs.reduce((sum, mob) => sum + mob.combatProfile.health, 0);
}
```

Because both are `TaggedItem`s, groups and their members filter with `applyTagFilter` like anything
else. The legacy `CombatProfile` and `CombatAction` types are owned by
[`$lib/rulesets/ironarachne`](../rulesets/README.md); see
[`$lib/encounters`](../encounters/README.md) for what assembles groups.
