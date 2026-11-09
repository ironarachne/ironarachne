# Generator design principles

Vastways generators give game masters material they can use at the table, keep for later, or
combine with work from another tool. Judge a design by what a result lets someone do and how
well its details fit together. The [implementation guide](generator-development.md) covers
how to put these choices into code.

## Make a result reproducible

A seed and settings are a compact way to share a roll, revisit an unusual result, and reproduce
a bug. For the same generator and data version they should produce the same result.
The [potion roll](../src/lib/potions/potion_roll.ts) takes explicit settings and can be invoked by
both the tool and an artifact reroll. A saved result has its own lifetime. Keeping the actual
payload preserves a user's edits and protects their work when a later version changes the
algorithm. See the [workshop storage decision](decisions/0001-local-workshop-storage.md).

## Spend variety where it creates meaningful differences

Start with a few decisions that distinguish results. Let those decisions constrain later
choices. In [potions](../src/lib/potions/potion_generation.ts), a catalog entry supplies effect
mechanics. Its variants and permitted modifications provide variety, and the effect and catalog
hints inform the sensory profile. Authored rules and weighted tables are valuable inputs.
A collection of prewritten complete results provides less room for other systems to respond to
the choices inside each result.

Use eligibility rules for hard constraints and weights for plausible preferences. Check
eligibility first, then choose among the valid options. In
[region generation](region-generation-passes.md), later passes consume terrain, water, and other
facts established upstream. This makes neighboring details reinforce each other. Aim for
enough variation that two regions can feel different and enough dependence that either region
can explain why its places ended up where they did.

## Compose through small contracts

Expose the facts that another tool can use. [Treasure hoards](../src/lib/treasure/potion_loot.ts)
use a potion's item values and container relationships. They need no knowledge of the Potion
Generator's controls or description wording. Put shared inputs in the library that owns their
meaning and pass narrowly scoped context to the consumer. This keeps a child usable on its own
and gives the parent control of its own goals and constraints.

Choose stable identities for things that can be referenced, edited, or combined. A display name
can change while a reference still points at the same entity. Model relationships explicitly
when another tool needs to navigate them.

## Keep generated facts separate from their presentation

A structured result can feed a card, map, editor, or export. Keep measurements, identities,
mechanics, and relationships available as data. Format those fields consistently for each
medium. The [potion presentation adapter](../src/lib/potions/potion_presentation.ts) turns a
snapshot into the document shared by its result panel and exports. When prose describes a roll,
compose it from the established facts and keep the wording with the result. See the
[narrative contract](narrative-prose.md).

## Put setting assumptions at the right boundary

A rule that makes a fantasy setting distinctive can be valuable without becoming a universal
worldbuilding assumption. Keep common facts separate from system-qualified mechanics as
described in the [rules system design](rules-system.md). Keep genre-specific evidence and
constraints where they can shape the setting. For example, the
[Regions release contract](regions-release-contract.md#4-core-data-is-neutral-first-rules-are-fantasy-specific)
keeps common facts reusable while defining a concrete fantasy rule set. The
[second-genre assessment](region-second-genre.md) records which parts can be reused and which
need evidence from a real second genre before generalizing.

Before proposing a design, identify the facts a game master can act on, the constraints that
make those facts fit, what the seed must reproduce, and what a second tool would consume.
Use a few contrasting example results to check those choices before committing to a data model.
