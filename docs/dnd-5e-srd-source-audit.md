# D&D 5e SRD rules-data source audit

**Status:** Implemented for `dnd-5e@srd-5.1-cc` on 2026-09-05

## Decision

The registered D&D 5e package is pinned to the Creative Commons release of _System Reference
Document 5.1_, published by Wizards of the Coast LLC on 27 January 2023. The official
[SRD page](https://www.dndbeyond.com/srd) continues to list 5.1 separately from the newer 5.2
series, and the
[versioned PDF](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf) licenses its
contents under Creative Commons Attribution 4.0 International.

The PDF's required attribution statement is recorded exactly in
`src/lib/rulesets/dnd_5e/source_manifest.ts` and reproduced in `THIRD_PARTY_NOTICES.md`. The package
uses that CC grant rather than OGL 1.0a.

This release does not float. SRD 5.2 and 5.2.1 describe the revised 2024/5.5e rules and require a
separate `RulesetRef`, source audit, and compatibility decision. Likewise, the 5.1 grant does not
admit material found only in non-SRD rulebooks, adventures, settings, named characters, or other
Wizards product lines.

## Production data admitted by this audit

| Capability       | Shipped content                                                                  | Source policy                                                     |
| ---------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `actor`          | Typed AC, hit points, proficiency bonus, and six saving throws; version-1 codec  | Independently structured schema; qualified values cite SRD 5.1    |
| `item`           | Typed valuable, weapon, and armor mechanics; version-1 codec                     | Uses SRD terms without copying an equipment or magic-item catalog |
| `currency`       | CP, SP, EP, GP, and PP relationships in copper-piece units; 50 coins per pound   | Every row cites `dnd-srd.5.1-cc-by-4.0`                           |
| `equipment`      | Validation and presentation of registered item payloads                          | No equipment catalog is bundled                                   |
| `treasure-items` | Deterministic qualification of a caller-supplied table result and value interval | The future hoard generator owns selection                         |

Potion, spell, and hoard payloads are intentionally unsupported in this release. Although SRD 5.1
contains examples of each, the first consumers do not need those package services and the
descriptor must not imply otherwise.

## Data and derivation boundary

The only copied production catalog rows are the five currency relationships on SRD 5.1 page 61.
Each row directly names the approved source. Actor and item schemas, validators, presentation text,
and tests are Iron Arachne code. Their fixtures are minimal constructions rather than copied SRD
creatures, equipment rows, treasure tables, or magic-item descriptions.

Treasure derivation does not select from an SRD table. Its caller supplies the already-selected
valuable, weapon, or armor result and a value interval; the package uses the caller's `RNG` to
choose the final copper-piece value, validates the complete payload, and attaches the pinned ruleset
and source. The shared registry rejects an existing target variant before calling the package, so
derivation cannot replace saved or user-edited mechanics.

Tests enforce the pinned release and source, exact CC attribution, source ids on every production
row and generated value, codec validation, unsupported capabilities, and fixed-seed derivation.
This is an engineering source policy, not legal advice.
