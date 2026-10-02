# Region generation, storage and rendering costs (#350)

**Status:** completed audit, 2026-10-02. Before: `69e75a3a` (the #327 pre-pass
baseline). After: `00df0d2e` (#343 map facts, #344 exports and #346 inspection included).
No production optimization was needed to meet the review budgets below. This audit adds a
reproducible measurement script and preserves all stored evidence and deterministic output.

## Method and reproduction

Run on Apple M4, Node 22.20.0, Playwright Chromium 148.0.7778.96. Both revisions use the
same installed dependencies, rather than reinstalling the historical dependency tree.
Small byte differences from the [original audit](regions-workflow-audit.md) are therefore
expected. The named RNG streams intentionally changed generated geography and inhabitants:
this compares representative workloads with the same seeds, not identical regions.

The page-default map is 40 × 30 units. Eight seeds cover the five current contrasting
[fixtures](../test_fixtures/region_seeds.ts) and the three additional original audit examples.
Each library measurement is the median of five runs after a warm-up; raw samples and maxima
are retained in [before.json](region_performance_350/before.json) and
[after.json](region_performance_350/after.json). Generation includes conversion to the plain
snapshot. SVG, Markdown, stringify, parse plus full validation, real IndexedDB save, artifact
export, import into another project and validated read are timed separately. Imports must add
exactly one artifact without quarantine and retain the complete payload. Repeated snapshots
and SVGs must match exactly; imported payloads are compared by canonical JSON because exports
sort object keys.

Library timings run through Vite development modules in a disposable browser context; module
loading is outside the timings. UI timings run against the **production build**, with one
roll per fixture at each width. Generate measures the real click handler through Svelte's
update, map image decoding and the next animation frame. Zoom measures the click through two
animation frames. UI save includes the fingerprint, SVG preview blob, validation and storage,
ending at the confirmation. These are warm interaction measurements, not initial page load,
network speed, real phone hardware, PDF pagination or statistical tail-latency claims.
The 390px and 320px runs apply Chromium's 4× CPU slowdown; desktop uses normal CPU speed.

```bash
# Build before starting development: builds/syncs can trigger Vite page reloads.
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# In another terminal:
npm run dev -- --host 127.0.0.1 --port 5173
# In a third terminal; keep the machine idle during measurement:
REGION_BENCH_UI_URL=http://127.0.0.1:4173 \
  npx tsx scripts/benchmark_regions.ts > /tmp/region-after.json
```

For the before comparison, archive `69e75a3a` into a disposable directory outside the working
checkout, provide that revision with the same dependencies, and serve it on port 5174.
Run the **current** script with
`REGION_BENCH_URL=http://127.0.0.1:5174 REGION_BENCH_SKIP_UI=1`.
Do not share an active dependency optimizer cache between two development servers: stop the
current development server before starting the archived one. Run benchmarks sequentially,
without tests/builds in parallel. The script's isolated browser cannot access the user's
browser data; its generated projects and vault disappear when its context closes.

## Generation and output

Times are milliseconds; sizes are decimal kB (1,000 UTF-8 bytes), before → after.
The map is included in payload size, and facts are included too; neither is an extra copy
outside that payload.

| Seed          | Generate snapshot ms |      SVG ms |     Payload kB |        SVG kB | Markdown kB |
| ------------- | -------------------: | ----------: | -------------: | ------------: | ----------: |
| alpha         |          60.5 → 70.6 | 41.9 → 42.4 | 555.3 → 1069.2 | 106.7 → 125.3 | 4.9 → 347.0 |
| bravo         |          57.2 → 94.5 | 38.4 → 35.8 | 563.8 → 1253.7 | 117.5 → 149.6 | 5.0 → 431.2 |
| foxtrot       |          34.7 → 82.0 | 40.3 → 38.2 | 527.3 → 1145.8 |  92.3 → 146.9 | 4.6 → 389.1 |
| charlie       |          58.7 → 51.0 | 39.3 → 44.7 |  547.9 → 931.4 | 154.8 → 112.4 | 6.1 → 275.3 |
| 5pkjdquccl04i |          48.8 → 82.5 | 46.7 → 40.5 | 541.3 → 1207.6 | 120.5 → 130.4 | 5.1 → 405.7 |
| audit-0       |          56.4 → 76.9 | 27.9 → 34.7 | 572.3 → 1222.5 | 113.0 → 146.9 | 4.9 → 425.4 |
| audit-4       |          55.2 → 78.0 | 36.1 → 39.5 | 535.3 → 1120.6 |  99.0 → 125.5 | 4.4 → 364.4 |
| audit-6       |          51.1 → 81.8 | 42.8 → 35.7 | 541.2 → 1154.9 | 126.3 → 139.6 | 4.6 → 369.0 |

Current maps remain 203–214 nodes, 601–630 edges and 399–417 corners. Their JSON is
425–448 kB. Facts contribute 430–705 kB, explaining most of the 1.7–2.2× total payload
growth. SVGs contain 747–1,253 elements; the fact overlays have not multiplied the underlying
graph. The renderer still consumes saved plain data, and inspection zoom changes image width
without regenerating geography or adding SVG nodes.

Markdown has grown much more than the payload: exports now include the full supporting
facts and observations, not just the former short gazetteer. This is the requested #344
content, and its generation remains 1.0–1.6 ms median. Do not truncate evidence or deduplicate
persisted observations just to restore the old size. The 431 kB maximum is a useful review
signal for further expansion, especially before promising short PDF output.

## Save, import and storage

Median milliseconds, before → after. Library save excludes preview assets; UI save below
includes them. Export is the JSON artifact export, not a binary asset bundle.

| Seed          | Parse + validate |        Save |      Export |      Import | Read + validate |
| ------------- | ---------------: | ----------: | ----------: | ----------: | --------------: |
| alpha         |       1.1 → 52.3 |  5.7 → 59.4 | 13.1 → 22.4 |  9.3 → 60.0 |      1.5 → 46.0 |
| bravo         |      1.2 → 123.2 | 5.6 → 131.4 | 13.2 → 25.9 | 9.1 → 120.4 |     1.5 → 104.1 |
| foxtrot       |      1.0 → 106.9 | 5.1 → 113.6 | 12.3 → 23.3 | 8.7 → 109.1 |      1.4 → 91.7 |
| charlie       |       1.1 → 36.9 |  5.4 → 43.8 | 12.9 → 19.9 |  9.0 → 46.8 |      1.5 → 34.0 |
| 5pkjdquccl04i |      1.0 → 121.4 | 5.3 → 128.6 | 12.5 → 25.0 | 8.8 → 122.8 |     1.5 → 106.6 |
| audit-0       |       1.2 → 77.8 |  5.5 → 86.5 | 13.5 → 26.0 |  9.4 → 84.6 |      1.5 → 67.5 |
| audit-4       |       1.1 → 62.0 |  5.3 → 70.0 | 12.7 → 23.3 |  9.3 → 68.8 |      1.5 → 54.6 |
| audit-6       |       1.0 → 74.2 |  5.4 → 82.9 | 12.8 → 24.3 |  8.9 → 82.7 |      1.5 → 65.8 |

The validation increase is material: facts now require semantic, evidence, accessibility and
dependency checks. Current parse/stringify alone is only a few milliseconds; validation is
the cost to profile first if larger regions make saves too slow. Disabling validation would
lose the corruption protections that make round trips trustworthy. The worst observed
single import was 147 ms; every measured import/read retained the complete payload.

After 15 production UI saves, IndexedDB contained exactly 15 payload records, 15 summaries,
15 asset metadata records and 15 preview blobs. Payload-record JSON totaled 16,823,740 bytes,
and SVG blobs totaled 1,993,767 bytes, plus about 11 kB of metadata/project JSON. There were
no quarantined records. Local storage held only the active-project pointer (77 characters),
with no region JSON or SVG. Thus a typical region plus preview is roughly 1.04–1.40 MB of
logical content. A hundred such regions suggests roughly 104–140 MB before database overhead.

Chromium reported 5,391,905 bytes of origin usage for those 15 saves, with about 4.3 GB quota.
That estimate is browser-dependent physical usage, not the logical UTF-8 sum or a portable
capacity promise. Retain the existing advisory import headroom multiplier (1.5) and the
transactional quota-failure handling; do not derive a universal region count from this quota.

## Desktop and phone-width interactions

Ranges across the five current fixtures, milliseconds. All document widths exactly matched
their viewports after saving. Each zoom was returned to Fit map before the next roll.

| Width  | CPU slowdown | Generate through decoded map/paint | Save including SVG asset | Zoom through paint |
| ------ | -----------: | ---------------------------------: | -----------------------: | -----------------: |
| 1280px |           1× |                            130–197 |                  103–184 |              13–27 |
| 390px  |           4× |                            521–739 |                  395–716 |              15–25 |
| 320px  |           4× |                            513–740 |                  391–714 |              11–33 |

Generation is synchronous, so a phone can pause for most of a second while the complete
region and sourcebook are replaced. Ordinary inspection remains fast. The measured work
fits the budgets below; a worker or changed persistence model is not justified by this audit.

## Review limits and boundedness

These are manual investigation triggers for **default generated regions**, not rejection
limits for existing saves, hard caps on authored text, or flaky CI timing assertions:

- Payload JSON ≤2 MiB; SVG ≤256 KiB and ≤2,000 elements; complete Markdown ≤512 KiB.
- Warm desktop median snapshot generation ≤150 ms, SVG ≤100 ms, and individual
  save/export/import/read ≤250 ms. Production Generate and save ≤1 second at 4× slowdown.
- Ordinary zoom/pan controls should respond within 100 ms and never overflow the page at 320px.
  Larger datasets, colder loads and slower hardware require their own measurements.

All measured fixtures fit. Existing selection bounds remain important: four major connected
habitat zones (plus aggregate habitat facts), four geological provinces, three deposits per
province, bounded ecology selection, six ecological relationships, twelve product facts,
up to fourteen daily-life facts and three supply needs per settlement, and four notable
places. Observation lists scale with finite map membership; the page's map dimensions and
settlement counts remain fixed. Candidate-removal loops shrink their pools; graph searches
track visited nodes. Settlement placement has a finite fallback sequence, not a retry-until-
success loop. This change introduces no new generation pass, retry, cache or output layer.

The large evidence appendix and increased validation work deserve tracking, but removing
evidence, changing seeded selections, or adding a persisted SVG to the snapshot would make
the system less correct without resolving a measured usability failure. No such fixes were
made. Future changes crossing a review limit should reproduce the affected seed and profile
that operation before optimizing it.

## Verification

The browser audit completed 40 save/export/import/read round trips per revision with matching
payloads and deterministic repeated snapshots/SVGs, plus 15 production UI generation, zoom
and preview-save runs. The existing Chromium region workflow suite passed all 12 tests,
including save/reopen/edit, narrow-panel inspection, export and seeded reproduction.
The required verification gate passed 6,777 unit tests and coverage for all 99 libraries.
No routes, components or renderer implementation changed in this issue.
