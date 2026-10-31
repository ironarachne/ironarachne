# Architecture

Shared, serializable architectural facts for settlement text, settlement illustrations, and dungeon
interiors. The approved model and ownership decisions are in
[`docs/architectural-styles.md`](../../../docs/architectural-styles.md).

`generateArchitecturalStyle` requires a seed, an existing `Biome`, explicit resource knowledge,
structured site evidence, requested contexts, and optional cultural preferences. It returns a
`complete`, `partial`, `unavailable`, or `invalid` result. Empty known resources are different from
unknown resources. Neither permits invented timber, glass, metal roofing, or finished stone products.

```typescript
import {
  generateArchitectureState,
  architectureResourcesFromCatalog,
  UNKNOWN_ARCHITECTURAL_SITE,
} from '$lib/architecture';

const architecture = generateArchitectureState(
  {
    seed: 'riverport',
    biome: environment.biome,
    climate: environment.climate,
    resources: architectureResourcesFromCatalog(selectedBuildingMaterials),
    site: UNKNOWN_ARCHITECTURAL_SITE,
    contexts: [
      {
        id: 'houses',
        construction: 'built',
        exposure: 'exposed',
        purpose: 'residential',
        density: 'medium',
        exteriorWindowsAllowed: true,
      },
    ],
    culturalPreferences: [],
  },
  12,
);
```

The state contains a saved style, up to twelve building examples, diagnostics, and final prose.
Both illustration compositions must reuse these saved facts; rendering never rolls another roof or
material. The settlement image renderer itself is follow-up work in #250.

A style has context profiles, each with one to four compatible variants. Instances reference a
profile/variant rather than copying a complete style into every room. `instantiateArchitecture`
accepts a stable subject ID, purpose, shape, actual width/depth ratio, explicit condition and placement
evidence, and existing connection IDs. It never generates layout, places a door, or changes its state.

Construction (`built`, `rock_cut`, `natural`) is independent of exposure (`exposed`, `sheltered`,
`buried`). Buried rooms have no exterior roof or facade window scheme. Rock-cut spaces require an
explicit native host-rock resource. Natural spaces can retain unknown substrate without pretending
to be manufactured buildings. A mixed complex requests multiple contexts and assigns rooms to them.

Material inputs carry stable IDs, actual `Resource` records, typed forms, availability, origin, and
evidence IDs. `architectureResourcesFromCatalog` accepts only a caller-selected subset; provide
explicit ID/form mappings for custom resources. It does not discover regional materials or execute
processing recipes. Region adapters project current structured construction evidence instead of
parsing narrative descriptions. Unrecognized forms remain unsupported.

Use `architectureNarrativeSubject` with `$lib/narrative` for factual, budgeted prose. Instance prose
never claims unplaced supports or additions. Owners persist the composed text once and preserve user
edits on reads and exports. `generateArchitectureState` provides the generation-time composition
helper; `legacyArchitectureState` represents older results without regeneration.

All random operations use versioned tuple seeds through `architectureOperationSeed`. Profile and
instance operations own their RNG and thread it through helpers. Connection and door-leaf child
operations use stable connection IDs so opposite rooms agree about one door. Inputs are ordered by stable IDs;
provenance uses a canonical 64-bit fingerprint. It is a change detector, not a security hash.

`validateArchitecturalStyle`, `validateArchitecturalInstance`, and `validateArchitectureState` check
runtime/saved boundaries. `validation.ts` is the synchronous, catalog-free entry for artifact
metadata; normal consumers import `$lib/architecture`. Schema and generator versions are separate.
Legacy helpers remain exported as `generateLegacyArchitecturalStyle`, `LegacyArchitecturalStyle`,
`LegacyGenerateArchitecturalStyleConfig`, `describeArchitecturalStyle`, and
`fragmentsForArchitecturalStyle`; they do not convert old strings into new supported material facts.

Preview a supported surface palette:

```sh
npm run arch:style -- --seed demo --biome 'temperate deciduous forest' --materials 'oak timber,granite ashlar,reed thatch'
npm run arch:style -- --seed cave --biome 'temperate deciduous forest' --context natural --exposure buried --json
```

The CLI requires an explicit seed and biome fixture. Omit `--materials` for unknown knowledge or pass
an empty string for a known empty palette. Aquatic and supernatural construction are unsupported.
The vocabulary does not constitute an engineering or manufacturing simulation.
