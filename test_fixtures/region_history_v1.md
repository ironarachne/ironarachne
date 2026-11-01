# Version-1 history compatibility specimen

`region_history_v1.json` was captured under Node 24.22.2 using the unchanged generator from
`5ee27a2e` (merged #482), against record 0 of `region_history_481.json.gz` migrated from payload 24.
Its seed and source commit are recorded alongside the complete version-1 history.

The #483 tests compare new version-2 output to this fixture after projecting away only the history
version marker and added historical actor name observations. This checks that recording names
consumes no RNG draws and changes no actors, event IDs, ordering, wording or prior evidence.
The frozen region input is read directly, so no cross-runtime map recomputation is involved.
Do not regenerate this fixture with newer generation code to make a regression pass.
