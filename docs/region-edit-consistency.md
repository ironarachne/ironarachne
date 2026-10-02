# Region regeneration and edit consistency

**Status:** implemented for #347 using the accepted Regions release model. No new persisted fields,
types or payload version are introduced.

## Decision

Only whole-region regeneration is supported. Named RNG streams isolate random draws, but do not
make downstream stages independent of their inputs. Replaying one section safely would need a
contract for retained authored facts, removed inputs, placement, negative supply assessments and
the overview. The current generator has no such contract. Partial regeneration is therefore
explicitly unavailable on `/region`, in its workshop panel and in the saved region editor.

Generate replaces the displayed result, including heraldry edits. Save first to keep it. Saved
artifact Roll again uses the original seed and configuration and requires the existing destructive
confirmation before replacing all contents, including saved and unsaved edits. The editor names
the affected sections: map, environment, realms, settlements, organizations, regional facts and
descriptions. A repeated seed is reproducible; it is not a request to preserve hand edits.

## Dependencies and editing

The full generation order and evidence contract are recorded in
[generation passes](region-generation-passes.md). Geography supports habitats and geology; habitats
support inhabitants and resources; geography and resources support habitation; site roles,
ecological uses and raw inputs support processing, daily life and supply; routes and localized
hazards support notable places; the overview draws on those saved facts.

Saved field edits never invoke generation. Identity and geometry remain stable:

- Region and realm text and organization edits change only their selected field. The editor always
  asks the user to review the overview and other prose, because these strings may contain copied
  names or assertions with no machine-readable dependency. Authored prose is never reconciled
  automatically.
- Changing the seat changes only `mainRealm`. It does not replace the stored ruler, move the capital
  marker or rewrite descriptions; the editor states this explicitly.
- Settlement name or description edits retain the local settlement ID, map node and all other
  fields. Map labels render the edited name. Recorded site, route, ecological use, product,
  livelihood and supply reasons involving that settlement become stale, as do transitive fact
  dependents. Negative supply assessments are conservatively invalidated because they depend on
  inventory membership, not just listed positive sources. An unchanged value does nothing.
- Direct dependencies include area and habitat IDs, notable route endpoints, ecological relation
  targets, processing inputs, deposits and causal subjects, as well as recorded reason sources.
- Settlement removal removes generated direct dependents and their direct dependency closure,
  stales retained reason dependents and blocks removal if authored dependencies would be damaged.
  The settlement marker disappears. Existing road geometry remains; removal does not redraw roads.
- Semantic resource text edits retain the authored text and flag supporting/dependent reasons.
  These existing editing functions use the same dependency traversal.

Recorded stale facts are listed by name in the editor and in Markdown/PDF text exports, with an
explicit statement that supporting information changed and saved text was not recomputed. The
existing `FactReason.status` persists this warning across save/reopen. Facts with no recorded reason
and free prose need manual review, which the editor also states; absent legacy evidence is not
fabricated. Clearing a warning by recomputing would require another generation, so no automatic
repair button is offered.

## Domain model

This uses the accepted [Regions domain model](regions-release-contract.md#domain-model), specifically
`RegionSnapshot`, stable `RegionSettlement.id`, semantic fact references and `FactReason.status`.
The implementation changes their editing behavior without changing their shape.

## Verification

Unit tests cover field isolation, unchanged values, settlement dependency invalidation, transitive
authored claims, immutable inputs, validation and JSON round trips, map name updates and exported
review warnings. Existing removal tests cover generated dependency closure and authored protection.
