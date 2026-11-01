# Regional history acceptance (#485)

**Status:** implementation and editorial evidence recorded; final verification in progress.
Parent: [#470](https://github.com/ironarachne/ironarachne/issues/470).
Design: [regional history](region-history.md), including the approved
[historical-name observation amendment](region-history-actor-name-evidence.md).

## Human editorial review

Ben explicitly accepted all four accounts and their evidence labels on 2026-11-01 in this
implementation session, answering **“Accept the editorial examples”** to the review request for
[test_fixtures/region_history_485.md](../test_fixtures/region_history_485.md).
The reviewed sentences and labels have not changed since that acceptance; the packet's status
line now points here to separate generated specimens from the human decision.

The reviewed scope includes the one-event account “Reedford was founded at its present site,”
the predecessor founding/fall bundle, crowded selection, unaffiliated institutions and conflicting
unpressed claims. Review considered readable causal order, useful Explains labels, the distinction
between invented backstory and compatibility evidence, and absence of unsupported current ownership,
destruction, ongoing war, geography, migration, production, named founders or current inhabitants
acting in the past. No editorial changes were requested. This records a human decision; automated
invariant checks alone are not editorial acceptance.

Reviewed packet SHA-256: `f9da6248d61fbb8d6062f0e1600c8fc0f040e059961ce3a04d0ef8bf4b7e3f75`.
Regeneration uses `npx vite-node scripts/render_region_history_review.ts` with Node 24.22.2 and
explicit saved-present builders. The script prints specimens by default; pass an output path only
when intentionally preparing a new review. A changed reviewed sentence/label needs another human
review; do not regenerate accepted specimens or frozen baselines merely to make a test pass.

## Evidence matrix

| Boundary                                             | Evidence and scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sparse / crowded / unaffiliated / conflicting claims | Shared builders in `test_fixtures/region_history_scenarios.ts`; the original #482 rule tests still exercise their individual constraints. New `region_history_acceptance.test.ts` crosses generation, validation, exact JSON/rehydration round trips and shared document/UI/Markdown/text output, with reviewed wording and labels.                                                                                                                                                                        |
| Positive support and bounded invention               | Existing generation/validation tests cover every enabled family, full predecessor lifecycles, DAG/date checks, conflicting claims, unsupported statuses, missing/stale sites, hazards without damage and culture without migration support. The packet supplies human wording review. No new event family or target count was added.                                                                                                                                                                       |
| Upstream compatibility                               | Frozen `region_history_481.json.gz` from pre-history commit `14dfd479` compares complete affiliated and unaffiliated outputs after removing only additive history/realm identity fields. Existing narrowly documented machine-roundoff allowances remain unchanged; same-runtime seeded comparisons are exact. No baseline was regenerated.                                                                                                                                                                |
| Stream isolation and history-v2 compatibility        | Existing #482 test injects extra history-stream draws and compares all upstream fields, including gazetteer prose. Frozen `region_history_v1.json` from merged #482 verifies that new actor-name observations change no selected actor, ID, order, wording or previous observation.                                                                                                                                                                                                                        |
| Migrations                                           | New matrix invokes all payload 1–24 entry points using minimal historical fact versions, retaining prose/intentional blanks and adopting empty version-1 unrecorded history. Existing historical migration tests cover older semantic field conversions. Payload 25 already had history: #483's lossless migration tests preserve it, rather than satisfy an incorrect blanket interpretation of “all migrations stay unrecorded.” Payload 26 accepts history 1/2; facts 12 and gazetteer 6 are unchanged. |
| Editing, import currentness and persistence          | Existing focused tests cover all source edit types and causal closures. New composed cases cross imported source-name changes, stale authored reading, no-op mutations, authored blanks, source-removal protection, independent retained events and exact save/reopen output. Queries never repair or replenish history.                                                                                                                                                                                   |
| PDF and publication                                  | `src/lib/pdf/region_history_publication.test.ts` exercises the shared Markdown presenter, publication blocks and standalone PDF input/creation; #484 presentation tests compare ordering/text/review policy. No separate export wording is selected.                                                                                                                                                                                                                                                       |
| Browser                                              | #484's standalone generation/save/workshop reopen/edit/inspect/remove/export scenario checks keyboard evidence navigation and all five mobile widths. #485 adds workshop tool generation and source-removal impact cancellation/confirmation, save/reopen, Markdown omission of removed accounts and all mobile widths. The complete route sweep checks standalone/workshop layouts.                                                                                                                       |
| Integration and scope                                | [The query contract](region-history-queries.md) documents saved-only current/review queries, identity scope, authored/read policy and one-way boundaries for #472/#476/#474. Those subsystems and disaster/migration adapters remain out of scope.                                                                                                                                                                                                                                                         |

## Findings and decisions

- Older overview documentation described payload 8/11 and facts 6, and still called editing/reading
  pending. README, authoring, generation-pass, edit-consistency and design documentation now describe
  payload 26, facts 12, gazetteer 6 and history 1/2, with implemented boundaries.
- The existing #481/#482/#483 regression baselines and focused tests already prove upstream
  isolation and version-1 compatibility. Reuse them rather than recapturing expected output.
- Human approval applies to the packet's accounts and labels. The new acceptance suite preserves
  those specimens as review evidence and exercises composition rather than duplicating every rule's
  positive/negative tests.
- No runtime behavior, saved schema, coverage baseline or coverage exclusion changes are required
  by this acceptance work. No release version, deployment or downstream feature is included.

## Verification

Final commands/results will be recorded here after execution. Parent acceptance is not marked
complete until the unit/coverage gate and complete browser suite have passed and this review is
included in the repository PR.
