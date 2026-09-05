# AD&D 2E rules-data source audit

**Status:** Implemented for `adnd-2e@fgag-2.0.1` on 2026-09-05

## Decision

The registered AD&D 2E package is pinned to _For Gold & Glory: The Adventurer's Compendium_
2.0.1, dated 6 June 2016. Its legal appendix designates the entire work as Open Game Content under
the Open Game License 1.0a except for the `For Gold & Glory` and `FG&G` trademarks, artwork not
expressly public domain, and trade dress. The release uses only numerical rules relationships and
independently written TypeScript. It uses no artwork, trade dress, setting material, characters, or
reserved trademark assets, and it makes no compatibility claim under the separate
Compatibility-Statement License.

The checked source is the publisher's free
[DriveThruRPG release](https://www.drivethrurpg.com/en/product/156530/for-gold-glory). The work
identifies itself as version 2.0.1 on its title page, describes itself as an Open Game License
interpretation on page 3, and states the Open Game Content designation and licence terms in
Appendix D. The exact source and required Section 15 notice are recorded in
`src/lib/rulesets/adnd_2e/source_manifest.ts`. A copy of OGL 1.0a and Iron Arachne's Open Game
Content designation is distributed in `static/legal/open-game-license-1.0a.txt`.

This audit follows the narrower policy in `docs/rules-system.md`: an open mechanics reference does
not make TSR/Wizards prose, art, settings, named characters, or trade dress available. The package
name describes its rules-system target; it does not treat the AD&D trademark as Open Game Content.

## Existing data inventory

The pre-registry `src/lib/adnd` library was created without row-level source records. Its character
generation algorithms, ability and saving-throw tables, race and class modules, spells, weapons,
armor, kits, proficiency lists, and descriptive abilities therefore remain legacy data. Similarity
to an open reference is not evidence of which source or version a contributor actually used, so
this audit does not retroactively attach the new source id to those rows.

That decision has two consequences:

- version-1 `character.adnd-2e` artifacts continue to migrate to the top-level
  `adnd-2e@legacy` identity with no `sourceIds` field; and
- newly registered mechanics do not import, wrap, or re-export the old tables.

The old generator stays readable and deterministic. Promoting any of its tables into the
registered package is a later data change that must compare every row against the pinned open
source and add `for-gold-and-glory.2.0.1` directly to every promoted production row.

## Production data admitted by this audit

The first registered release deliberately has a small surface:

| Capability       | Shipped content                                                                  | Source policy                                                                  |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `actor`          | Typed AC, THAC0, hit points, and five saving throws; version-1 codec             | Independently written schema and validation; qualified values cite the source  |
| `item`           | Typed valuable, weapon, and armor mechanics; version-1 codec                     | Independently written schema and validation; qualified values cite the source  |
| `currency`       | CP, SP, EP, GP, and PP relationships in copper-piece units; 50 coins per pound   | Every row carries `for-gold-and-glory.2.0.1`                                   |
| `equipment`      | Validation and presentation of the registered item payloads                      | No equipment catalog is copied or inferred from legacy data                    |
| `treasure-items` | Deterministic qualification of a caller-supplied table result and value interval | The future hoard generator owns table selection; every result cites the source |

Potion, spell, and hoard payloads are intentionally unsupported in this release. A descriptor that
claimed them would fail the package's capability tests.

## Compliance and test fixture policy

The Open Game Content designation is limited to the numerical denomination relationships identified
in the distributed OGL notice. Iron Arachne's code, schemas, validation prose, tests, and derivation
implementation are original project code under the repository licence. Source fixtures are minimal
constructions rather than copied tables.

Tests enforce that:

- the ruleset and source versions never float;
- each production currency row names the approved manifest;
- qualified and derived mechanics name the same source;
- OGL attribution is returned by `rulesetNotices`;
- actor and item codecs reject malformed and unsupported values; and
- a pinned RNG seed produces a pinned treasure-item result without replacing another variant.

This is an engineering source policy, not legal advice. Any future ambiguity disables the affected
production rows until they receive an explicit source review.
