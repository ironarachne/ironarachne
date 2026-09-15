# Star Nation composition

**Status:** implemented

Closes #253 (accept a saved `star-system` artifact as the home system) and #262 (accept a saved
`planet` artifact as the homeworld). Both are workshop requirement 5.1: a generator must accept a
referenced artifact for an input it would otherwise generate, when that artifact kind exists.

## Problem

The Star Nation tool generates a home system and a homeworld inside it, but cannot accept saved
artifacts for either input even though both `star-system` and `planet` kinds are now registered and
Release-ready. The existing documentation (`civilizations/README.md`, `tool_catalog.ts` comments,
`readiness-factions.md`) explicitly records this as a known gap waiting on the kinds' arrival.

Two inputs, two issues, one interaction: when both a saved system and a saved planet are supplied,
the planet must end up inside the system. The three cases — system only, planet only, both — need
a single coherent model.

## Design

### The four cases

1. **No references.** The current behavior: roll a system, pick a planet from it, embed both.
2. **Saved system only.** The rolled nation uses the saved system as its home system. The
   homeworld is chosen from the saved system's planets (by index, seeded from the RNG). The
   system is **not** embedded in the payload — it lives on the artifact's reference list.
3. **Saved planet only.** The rolled nation generates its own system, but the saved planet
   replaces one of the system's rolled planets (the same placement rule as
   `withReferencedPlanet` in `star_system_roll.ts`: outermost slot, re-sorted by orbital
   distance). The homeworld is the saved planet. The planet is **not** embedded — it lives on
   the reference list.
4. **Both saved system and saved planet.** The saved planet is placed into the saved system
   (same `withReferencedPlanet` placement). The homeworld is the saved planet. Both are
   references, neither is embedded.

In every case with references, the referenced payload is **linked, not copied** (workshop rule 2).
The snapshot excludes what a reference points at.

### Precedence and compatibility

When a saved system is supplied, the system's own planets are available for homeworld selection.
When a saved planet is also supplied, it is placed into the system and becomes the homeworld
unconditionally — the user who supplied both made an unambiguous choice.

When only a saved planet is supplied, the generated system still needs a `homePlanetIndex`. The
placed planet takes the outermost slot; after re-sort, its index is whatever position its orbital
distance resolves to. That index is recorded as `homePlanetIndex`.

### What the live value carries

`StarNation` gains two boolean flags and keeps `homeSystem` always populated:

```typescript
export type StarNation = {
  civilization: Civilization;
  homeSystem: StarSystem;
  homePlanetIndex: number;
  regionsOfControl: RegionOfControl[];
  homeSystemPopulatedPlanets: number;
  systemsControlled: number;
  populatedPlanets: number;
  /** True when the home system was supplied as a reference, not generated. */
  homeSystemIsReferenced: boolean;
  /** True when the homeworld was supplied as a reference, not generated. */
  homePlanetIsReferenced: boolean;
};
```

The live value always has `homeSystem` — the page needs it for rendering, the preview needs it,
and the helpers (`homePlanetOf`, `starNationHomeSystemParagraph`) read from it. The boolean flags
tell the snapshot codec what to exclude and the presentation layer what to annotate.

### What the snapshot stores

`homeSystem` becomes optional in the snapshot. When the system was referenced, it is `undefined`
here — the link lives on the artifact's reference list instead.

```typescript
export type StarNationSnapshot = {
  name: string;
  description: string;
  population: number;
  technologyLevel: number;
  governmentType: GovernmentType;
  economyType: EconomyType;
  military: Military;
  regionsOfControl: RegionOfControl[];
  homeSystem: StoredStarSystem | undefined;
  homePlanetIndex: number;
  homeSystemPopulatedPlanets: number;
  systemsControlled: number;
  populatedPlanets: number;
};
```

The reference list on the artifact records what was linked:

- `role: 'star-system'` when a saved system was used.
- `role: 'planet'` when a saved planet was used.
- Both roles present when both were used.

A nation saved without references looks exactly as it does today (payload version 1 shape, with
`homeSystem` defined).

### The roll module

`rollStarNation` gains an optional parameter for referenced artifacts:

```typescript
export type StarNationReferencedArtifacts = {
  starSystem?: StarSystem;
  planet?: PlanetSnapshot;
};

export function rollStarNation(
  seed: string,
  config: StarNationGeneratorConfigRecord = {},
  referenced: StarNationReferencedArtifacts = {},
): StarNation;
```

The logic:

1. Generate the civilization (unchanged).
2. If `referenced.starSystem` is provided, use it as the home system. Otherwise generate one
   (unchanged). If `config.planetCount` is set and a system was referenced, the config is
   ignored — the saved system's planet count stands.
3. If `referenced.planet` is provided, convert it via `planetBodyFromSnapshot` and place it
   into the home system via `withReferencedPlanet`. The `homePlanetIndex` is the placed body's
   index after sorting. Otherwise pick `homePlanetIndex` randomly from the system's planets.
4. Name the system region from the home system's name (unchanged). Name the planet region from
   the placed/saved planet's name, or from `homeSystem.planets[homePlanetIndex].name` if none.
5. Set `homeSystemIsReferenced` and `homePlanetIsReferenced` from what was supplied.
6. Return the nation with `homeSystem` always populated.

### The snapshot codec

`toStarNationSnapshot` sets `homeSystem: undefined` when `homeSystemIsReferenced` is true.
Otherwise it copies the system as before.

`starNationFromSnapshot` handles `homeSystem: undefined` by returning a nation with
`homeSystemIsReferenced: true` and a synthetic empty system placeholder. However, this path is
only used by the artifact editor's rehydration; the primary path for a referenced system is
through the roller (which always provides the system). The empty placeholder is:

```typescript
{ name: '', stars: [], planets: [], planet_count: 0, seed: '' }
```

This keeps the type satisfied without inventing data. The presentation layer detects
`homeSystemIsReferenced` and shows the reference note instead of system details.

### Migration

Payload version bumps from 1 to 2.

- Version 1 → 2: no field changes. A v1 snapshot's `homeSystem` is always defined; it is
  already valid as a v2 snapshot with no references. The version bump records that the codec
  now tolerates `homeSystem: undefined`, so an old codec encountering a v2 snapshot with
  `homeSystem: undefined` knows to refuse rather than crash.

### Presentation

`starNationHomeSystemParagraph` and `starNationHomeSystemHeading` work from the live value's
`homeSystem`, which is always populated. They need no change for the live-value path.

`starNationToMarkdown` / `starNationToText` / `starNationToDocument` work from the snapshot.
When `homeSystem` is `undefined` (referenced), the system section of the output is replaced with
a note that the home system is a referenced artifact. The planet section similarly notes a
referenced homeworld when the snapshot's `homeSystem` is undefined and the homeworld was
referenced. The region of control still carries the name in either case.

### The config record

`StarNationGeneratorConfigRecord` is unchanged. The referenced artifacts are not provenance —
they are recorded on the artifact's reference list, not in the config. The config remains
`{ planetCount?: number }`.

When a saved system is supplied, `planetCount` is ignored (the saved system's planet count
stands). When only a saved planet is supplied, `planetCount` still governs the generated system.

### The component

`StarNationGenerator.svelte` gains two `SavedArtifactPicker`s, following the pattern in
`StarSystemGenerator.svelte`:

```svelte
<SavedArtifactPicker
  kind={Bodies.STAR_SYSTEM_ARTIFACT_KIND}
  role="star-system"
  checkboxLabel="Use a saved star system as the home system"
  selectLabel="Star System"
  bind:enabled={useReferencedStarSystem}
  bind:value={referencedStarSystem}
  bind:reference={starSystemReference}
/>

<SavedArtifactPicker
  kind={Bodies.PLANET_ARTIFACT_KIND}
  role="planet"
  checkboxLabel="Use a saved planet as the homeworld"
  selectLabel="Planet"
  bind:enabled={useReferencedPlanet}
  bind:value={referencedPlanet}
  bind:reference={planetReference}
/>
```

The `generate()` function passes the referenced artifacts to `rollStarNation`. The `references`
array passed to `SaveArtifactButton` collects whichever of `starSystemReference` and
`planetReference` are defined.

The snapshot derivation excludes `homeSystem` when `homeSystemIsReferenced` is true, and excludes
the placed planet from the system's planet list when `homePlanetIsReferenced` is true (same
filtering pattern as `StarSystemGenerator.svelte`).

A note paragraph is shown when any reference was used, matching the star-system pattern.

## Domain model

```mermaid
classDiagram
    class StarNation {
        +Civilization civilization
        +StarSystem homeSystem
        +number homePlanetIndex
        +RegionOfControl[] regionsOfControl
        +number homeSystemPopulatedPlanets
        +number systemsControlled
        +number populatedPlanets
        +boolean homeSystemIsReferenced
        +boolean homePlanetIsReferenced
    }
    class StarNationSnapshot {
        +string name
        +string description
        +number population
        +number technologyLevel
        +GovernmentType governmentType
        +EconomyType economyType
        +Military military
        +RegionOfControl[] regionsOfControl
        +StoredStarSystem|undefined homeSystem
        +number homePlanetIndex
        +number homeSystemPopulatedPlanets
        +number systemsControlled
        +number populatedPlanets
    }
    class ArtifactReference {
        +string artifactId
        +string role
    }
    StarNation "1" --> "1" StarSystem : homeSystem
    StarNationSnapshot "1" ..> "0..1" ArtifactReference : home system (role: star-system)
    StarNationSnapshot "1" ..> "0..1" ArtifactReference : homeworld (role: planet)
```

## Implementation plan

1. **Types** — update `StarNation` (add `homeSystemIsReferenced`, `homePlanetIsReferenced`),
   update `StarNationSnapshot` (`homeSystem` becomes `StoredStarSystem | undefined`).
2. **Roll module** — add `StarNationReferencedArtifacts`, thread it through `rollStarNation`.
   Add `planetBodyFromSnapshot` import. Use `withReferencedPlanet` for planet placement.
3. **Snapshot codec** — update `toStarNationSnapshot` to set `homeSystem: undefined` when
   `homeSystemIsReferenced`. Update `starNationFromSnapshot` to handle `homeSystem: undefined`.
   Bump payload version to 2, add migration.
4. **Presentation** — update `starNationToMarkdown`, `starNationToText`, `starNationToDocument`
   to handle the referenced case (note about reference instead of system details).
5. **Editing** — `setStarNationHomePlanet` and `setStarNationHomeSystemName` need to handle
   the case where the snapshot has `homeSystem: undefined` (they become no-ops with a clear
   guard).
6. **Component** — add two `SavedArtifactPicker`s, wire `generate()` to pass references,
   derive `references` array, add note paragraph.
7. **Documentation** — update `civilizations/README.md`, remove stale comments from
   `tool_catalog.ts`, update `readiness-factions.md`.
8. **Tests** — cover the four cases (no refs, system only, planet only, both), migration v1→v2,
   snapshot exclusion, presentation with references.
