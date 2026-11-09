# 0003. Separate common facts from ruleset mechanics

**Status:** Accepted

## Context

Tools share generated entities such as equipment and creatures, while game systems assign
different mechanics to the same subjects. Treating one system's rules as universal would make
reuse or cross-system transformation depend on assumptions from that system. See the
[rules system decisions](../rules-system.md#decisions-taken-here).

## Decision

Keep common facts on the entity and attach ruleset-qualified mechanics. Support more than one
mechanics variant where the model calls for it. Transformations are explicit, deterministic, and
additive, preserving the existing variant.

## Consequences

Callers that need mechanical values select the appropriate ruleset variant. A project's default
affects future work. Stored payloads retain their own mechanics and provenance. Contributors
adding a ruleset must track source and licensing and preserve compatibility with existing
payloads. See [the ruleset API](../../src/lib/rulesets/README.md) and
[compatibility policy](../rules-system.md#compatibility-and-migration).
