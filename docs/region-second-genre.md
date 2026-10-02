# Second-genre region pilot disposition

**Status:** explicit deferral for
[#351](https://github.com/ironarachne/ironarachne/issues/351), as permitted by its acceptance criteria.
No second-genre prototype or change to fantasy generation is included.

## Decision and reason

Defer selecting and implementing a second regional genre to a follow-on release with a concrete
user workflow. The [accepted release contract](regions-release-contract.md) makes the minimum
release a complete fantasy path and explicitly treats a second genre as an extension point.
Issue #351 asks that a genre be chosen from actual user needs; its current issue and discussion
provide no requested setting or representative campaign workflow. Choosing science fiction or
post-apocalypse solely to fill a milestone would invent that requirement.

This is an evaluated deferral, not a claim that the current pipeline is genre-neutral. The core
data and persistence machinery are reusable; generation still explicitly composes fantasy
realms, culture, settlements and rule catalogs. No fantasy creature, realm or livelihood should
be relabeled as a science-fiction or post-apocalyptic equivalent.

## Reuse assessment

| Existing part                             | Reusable contract                                                               | Genre work still needed                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Saved map graph and physical observations | Nodes/edges, water, terrain and coarse anchors; no implied real-world distances | Decide whether the genre actually uses a terrestrial map. Star-system topology is a different substrate.             |
| Semantic facts                            | Stable fact IDs, areas, habitats, sources and current/stale reasons             | A setting-specific vocabulary and evidence rules; do not reinterpret saved fantasy rule IDs.                         |
| Artifact persistence                      | Reference-by-ID, payload validation/migrations and authored-edit retention      | Decide the pilot payload and generation config before changing stored data.                                          |
| Generation stages                         | Named child seed streams, isolated passes and deterministic ordering            | Select new pass implementations explicitly; bypass fantasy-specific orchestration rather than relabeling its output. |
| Resource and processing chains            | Saved source identity, availability, complete dependencies and qualified access | Supported technology, extraction, tools and facilities; the fantasy recipes cannot imply industrial capability.      |
| Gazetteer and inspection                  | Fact-based presentation, evidence inspection and text/map exports               | Genre-specific prose and labels with honest empty/unsupported sections.                                              |

## Candidate assessment

Science fiction has existing SWN character and star-system generators. Neither by itself defines
what a regional generator should produce: a planetary wilderness, settlement network, orbital
district and sector require different geography and material assumptions. A terrestrial planet
would reuse substantially more of the present map than a sector, but there is no requested
planetary campaign to establish its necessary inhabitants, technology or outputs.

Post-apocalypse could reuse terrestrial areas, anchors and climate. It would need explicit
evidence for ruins, hazards, salvage and settlement technology. Present fantasy landmarks,
resource deposits and raw supply do not establish contamination, salvage inventories or the
remaining infrastructure. The repository has no corresponding approved regional model.

Neither candidate currently has enough user direction to justify a prototype that meaningfully
tests reuse. The explicit deferral avoids claiming that switching a genre flag is a working
second generator.

## Conditions for revisiting

Reopen the pilot or create a follow-on release issue when a user names a genre and one target
workflow, with an example desired output. Start with a terrestrial region if the need supports
it; otherwise document the required new spatial substrate. Record the genre's physical and
technological assumptions, supported sources, representative inputs and deliberate omissions.

Before implementation, write and review the genre-specific domain model under the repository's
design process. A prototype must demonstrate deterministic generation from its own config and
rules, preservation of authored/saved data, evidence-backed semantic facts and separation from
fantasy realms and creatures. Run the existing fantasy deterministic/migration tests alongside
pilot tests to demonstrate that fantasy behavior remains unchanged.

## Acceptance record for #351

The issue expressly allows a working prototype **or explicit deferral**. This document supplies
the deferral and records what the shared core can reuse versus what remains genre-specific.
It introduces no executable changes, persisted types or new implementation issues. Closing
#351 through this documentation change does not promise a second genre in Regions.
