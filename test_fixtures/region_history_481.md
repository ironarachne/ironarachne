# Regional history upstream baseline (#481)

Captured from `14dfd479` before history implementation using `rollRegionSnapshot(seed, config)`.
`region_history_481.json.gz` contains a JSON array of `{ seed, config, snapshot }` records with
complete payload-version-24 snapshots, including saved gazetteer wording and map geometry.

- `history-foundation-affiliated`: affiliated, neighbors enabled.
- `history-foundation-unaffiliated`: unaffiliated, neighbors disabled.

`src/lib/regions/region_history.test.ts` decompresses these immutable snapshots and compares them
to fresh results after projecting away only the additive `realmIds` and `history` fields. The
same fixtures check migration from payload 24. Do not regenerate this baseline with newer
code to make an upstream regression pass. Future history generation must preserve this comparison.
