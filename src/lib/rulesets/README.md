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

The full contract, dependency rules, and migration plan are in
[`docs/rules-system.md`](../../../docs/rules-system.md).
