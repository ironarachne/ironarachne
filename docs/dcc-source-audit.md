# Dungeon Crawl Classics rules-data source audit

**Status:** Production mechanics blocked pending an accepted Goodman Games agreement, reviewed
2026-09-05

## Decision

Iron Arachne does not currently have a redistribution grant that admits Dungeon Crawl Classics
core data into the ruleset registry. The repository therefore registers only the stable
`dcc@legacy` identity used by existing character snapshots. That descriptor has zero capabilities
and zero source ids. It makes old data readable without presenting the pre-audit tables as an
approved production rules package.

Goodman Games describes DCC support as a formal, free third-party publishing programme. Its
[publisher hub](https://goodman-games.com/third-party-publisher-hub/) requires a publisher to seek
the licence and obtain approval; the public descriptions say product quality is a condition. No
accepted Iron Arachne agreement, versioned terms, approval, or permitted-content schedule is
present in this repository. The programme's existence is not itself the grant required by
`docs/rules-system.md`.

The official
[DCC RPG Quick Start Rules](https://goodman-games.com/wp-content/uploads/2020/03/DCC_QSR_Free.pdf)
do include OGL 1.0a, but their designation is deliberately narrow. DCC-specific terms, spell names,
proper nouns, capitalized and italicized terms, artwork, maps, symbols, and illustrations are
Product Identity. Only SRD-derived portions of creature statistics are designated Open Game
Content. That does not authorize copying the occupation, lucky-sign, currency, equipment, or
treasure tables needed by this package.

The machine-readable result is `src/lib/rulesets/dcc/source_manifest.ts`. It is intentionally not a
`RulesDataSource` and is absent from the production source catalog: that type admits only material
already approved for redistribution.

## Existing data inventory

The pre-registry `src/lib/dcc` library contains a zero-level character generator, occupation and
lucky-sign tables, languages, starting currency and equipment, and derived character statistics.
Those rows predate source-level provenance. The code comments identify the core rulebook, but that
is not evidence of an applicable grant or of the particular printing from which each row came.

Consequently:

- existing `character.dcc` snapshots remain `dcc@legacy` and gain no source ids;
- none of the old tables is imported, wrapped, or re-exported by the ruleset package;
- the candidate actor, item, currency, equipment, and treasure-item TypeScript shapes contain no
  copied table data and are not advertised as capabilities; and
- currency conversion, codecs, equipment services, and treasure derivation remain disabled.

## Enablement gate

A later production DCC release needs all of the following before registration:

1. The exact agreement accepted by Goodman Games and Iron Arachne, including its version or date.
2. Its permitted content scope, required attribution and notices, logo/compatibility conditions,
   approval process, and any distribution restrictions.
3. A row-by-row and algorithm-by-algorithm audit of the proposed release against that grant.
4. A redistributable `RulesDataSource` manifest and source ids on every admitted row and generated
   payload.
5. Codec round-trip, attribution, unsupported-capability, and fixed-seed derivation tests.

Until then, requests for DCC treasure derivation return `unsupported-capability`, notices are empty,
and no unapproved source can pass `defineRulesDataSource`. This is an engineering source policy,
not legal advice.
