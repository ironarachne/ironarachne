# Rulesets

`$lib/rulesets` is the shared boundary between system-neutral domain data and rules-owned
mechanics. A `RulesetRef` pins a stable ruleset id and release; a `QualifiedMechanics` envelope
records which package interprets one opaque payload.

The catalog is closed for values authored by this build and tolerant on reads. Unknown ids,
releases, payloads, sources, and versions return a `RulesetResult` failure instead of being guessed
or coerced. A `MechanicsSet` may hold one variant per ruleset release, allowing derivation to add a
new system without replacing existing or user-edited mechanics.

Rules-data licensing is attached to exact `RulesDataSource` records. Production sources must pass
`defineRulesDataSource`, which refuses incomplete metadata, unapproved scopes, and material not
approved for redistribution. A descriptor cites source ids; `rulesetNotices` resolves and
deduplicates the notices required by selected releases.

## Iron Arachne compatibility package

`$lib/rulesets/ironarachne` owns the normalized 0–100 combat profile, generic magic taxonomy, and
existing currency helpers that previously lived in the common `combat_system`, `magic`, and
`currency` libraries. Those old libraries are compatibility facades until #213 removes them.

The package also supplies version-1 actor, item, potion, spell, and hoard payload codecs. Shared
live types may carry a `MechanicsSet`; their legacy fields remain while consumers transition in
#213.

`legacy_migrations.ts` is the one pure compatibility path used by standalone and composed artifact
codecs. It copies saved values into `ironarachne@1` variants, marks old records as `migrated`, and
never recomputes a rule value or changes prose. AD&D and DCC character snapshots instead gain a
top-level `legacy` ruleset ref: their payloads were already system-owned, and the ref deliberately
adds no source ids before each package's separate source/licence audit.

## AD&D 2E package

`$lib/rulesets/adnd_2e` registers `adnd-2e@fgag-2.0.1`, pinned to the openly designated mechanics
in _For Gold & Glory_ 2.0.1. It implements actor and item codecs, AD&D currency, equipment
validation/presentation, and deterministic treasure-item qualification. Potion, spell, and hoard
mechanics remain honest unsupported capabilities.

The pre-existing `$lib/adnd` generator tables remain `adnd-2e@legacy`: they predate row-level
provenance and are not silently relabelled. The detailed source inventory and boundary are recorded
in [`docs/adnd-2e-source-audit.md`](../../../docs/adnd-2e-source-audit.md).

## Dungeon Crawl Classics package

`$lib/rulesets/dcc` registers the existing `dcc@legacy` snapshot identity with zero capabilities
and zero sources. Goodman Games' public third-party programme requires a formal licence and
approval, while the Quick Start Rules' OGL designation does not open the core tables the first
consumers need. The package therefore exposes candidate payload types but no production codec,
currency, equipment, or treasure service.

The pre-existing `$lib/dcc` generator remains readable as legacy data and gains no invented source
history. The evidence, existing-data inventory, and enablement gate are recorded in
[`docs/dcc-source-audit.md`](../../../docs/dcc-source-audit.md).

## D&D 5e package

`$lib/rulesets/dnd_5e` registers `dnd-5e@srd-5.1-cc`, pinned to _System Reference Document 5.1_
under Creative Commons Attribution 4.0. It implements actor and item codecs, SRD 5.1 currency,
equipment validation/presentation, and deterministic treasure-item qualification. Potion, spell,
and hoard mechanics remain honest unsupported capabilities.

SRD 5.2 and later material, non-SRD books, settings, and named characters are outside this release.
The exact attribution, admitted data, and version boundary are recorded in
[`docs/dnd-5e-srd-source-audit.md`](../../../docs/dnd-5e-srd-source-audit.md).

The full contract, dependency rules, and migration plan are in
[`docs/rules-system.md`](../../../docs/rules-system.md).
