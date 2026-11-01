# Reading history from other regional features

**Status:** implemented API contract, verified for #485 under the accepted
[regional history design](region-history.md) and [actor-name amendment](region-history-actor-name-evidence.md).
No new stored shapes or downstream subsystem implementation are introduced.

## Query the saved snapshot

Import `getCurrentHistoryEvents`, `getHistoryEventsNeedingReview` and the history types from
`$lib/regions`. Supply the complete validated `RegionSnapshot`, including supporting facts that the
reading gazetteer might omit. Do not build a history context from filtered display paragraphs.
Validate imported payloads through the region codec before querying; queries fail closed on invalid
history, and an empty query result cannot certify that a malformed payload is an empty history.

`getCurrentHistoryEvents(snapshot): HistoryEvent[]` returns events in ascending `time.order` whose
saved observations, fact support and causal/lifecycle prerequisites are still current. It includes
both generated and authored current events, including an authored event with a blank description.
No-op reads allocate a result array without editing the snapshot. Returned event records are the
stored records, not deep copies: treat them as read-only and use the immutable edit helpers to
change work. Never mutate query results or retain them as a cache across snapshot changes.

`getHistoryEventsNeedingReview(snapshot): HistoryEvent[]` returns the complementary review set for
valid histories in saved order. It includes persisted stale reasons and fresh mismatches detected
on read, including direct imports that bypassed an edit helper. Review propagates through explicit
causes and required historical-actor foundings. Sharing a present target alone creates no event
edge. Version-1 events with historical actors lack name witnesses and need review; migration does
not infer their old names from today's actor names.

Neither query calls RNG, chooses words, repairs evidence, fills empty history, fetches artifact
references, reruns current generation rules or persists changed status. `withRegionHistoryEvidence`
can explicitly persist detected review status at an edit boundary; the existing region finalizer
`withRegionOverviewEvidence` already calls it. A stored `reason.status === 'current'` alone is not a
substitute for the query. Requery after any supported edit, import, reference removal or reload.

Event and actor IDs are stable within one region. Consumers outside that artifact need the pair
`(regionArtifactId, event.id)`; names and array positions are not identities. `time.order` is an
ordering slot, can contain gaps after removal, and is not an elapsed duration or calendar year.
Optional `yearsBeforePresent` is relative to this saved region's present, with zero meaning the
present year. A query does not assign an epoch or reconcile different regional calendars.

## Consume meanings, not prose

Filter current events by their typed `outcome`, `participants` and `consequences` to find an
explanation for a present identity. `causedByEventIds` records the supported event links. Present
references use stable realm, organization, settlement or semantic-fact IDs; historical actors are
separate past polities/communities, never the current inhabitants or current ruler by implication.

Words are a saved rendition, not an executable rule or a source to parse for extra facts. Authored
text remains subject to human consistency review; editing it does not create new structured meaning
or certify a claim that was typed into it. Missing evidence is unknown, not negative evidence.
Do not project current production, resources, species, leaders, ownership or hazards into the past.

For reader-facing output, use `regionHistoryReading` / `regionToDocument` (and the existing export
adapters), rather than printing the current query directly. The reader policy intentionally differs
from a support query: omit stale generated sentences but retain a history review notice; show stale
authored text with adjacent warnings and preserve intentional blanks. Inspection may show all stored
events and evidence, explicitly as compatibility records rather than historical proof.

## One-way integration boundaries

| Future owner            | Inputs and optional use of history                                                                                                                                                 | Forbidden feedback                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #472 political tensions | Establish current claims/relationships first. Generate history second. A later political explanation may cite a current event ID as an optional historical cause.                  | A historical explanation cannot create the claim or relationship that made its own event eligible. A claim does not establish uncontested ownership or ongoing war. |
| #476 adventure sites    | Establish typed present site existence, damage, abandonment or recovery first. History may then explain that saved support; later origin/hook prose may reference a current event. | History does not place ruins, destroy a current settlement, generate dungeons, or infer damage from names/hazards.                                                  |
| #474 rumours            | Consume current events and saved evidence through these queries. The rumour subsystem owns GM truth, player-safe disclosure and optional distortions.                              | Rumours cannot become historical support or clear review status. This API is not a player-safe disclosure layer.                                                    |

Keep any future downstream explanatory links outside upstream history evidence. On an event's
removal or loss of currentness, a future owner must invalidate its own dependent explanation using
that owner's approved model; no generic downstream link shape is added here. These features remain
independent of initial history generation and are not prerequisites for it.

Disaster and migration variants have no eligible adapters in this release. Current volcanoes,
rivers, suggestive ruin names, dominant cultures, languages or species do not activate them.
Enabling those families requires separately approved typed evidence and compatibility rules, not a
fallback to fill the six-event allowance.
