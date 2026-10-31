# Road-network reading review (#448)

Reviewed on 2026-10-31 against the approved [road reading design](region-road-reading.md).
This review compares saved source evidence with the shared page/export reading document. Browser
verification is recorded in the design document after the full suite completes.

## Provenance

The historical specimen is `test_fixtures/region_445_belvorn.json.gz`: default seed
`5wyedz5q272fz` at `1ffabf08`, region payload version 14. It was migrated and explicitly given a new
editorial plan using RNG seed `448`, without rerolling its facts, settlements or geometry. Its
source fact JSON remains identical after composition. This is different from fresh generation
using the same seed in the current implementation.

The current specimens use default `rollRegionSnapshot` options and seeds `5wyedz5q272fz`, `alpha`,
`bravo` and `charlie`. Small constructed fixtures in `region_road_reading.test.ts` isolate shared
paths, river meetings, coast, freezing country, hot/dry country, disconnected networks, parallel
routes and authored overrides. Tests preserve source observations independently of mutable paths.

## Historical Belvorn

The opening says:

> Revilun is the region's most connected saved road hub, with routes linking it to 7 other settlements.

Travel retains all seven saved identities and their paths:

- Revilun to Ilistair's Folly
- Revilun to Linkthoeair
- Revilun to Maenas
- Revilun to Bree
- Revilun to Pelirgir
- Revilun to Carauth
- Revilun to Cilaamir

Each is a directory row with a stable route anchor and inspection ID. None needs an additional
woodland paragraph or compulsory adventure hook. The opening already establishes woodland; these
routes have no recorded river crossings that would distinguish their travel detail. The source
records, including their old descriptions and hooks, remain available for inspection/raw export.
The separate winter exposure suggestion belongs to its notable place, not to each road.

The summary explains seven endpoint relationships without implying seven independent physical
spokes, shortest paths, traffic, trade, road quality or safety. The directory makes destinations
immediately comparable, and the historical source prose is not rewritten to achieve it.

## Contrasting generated readings

| Specimen                                           | Saved road routes | Reading result                                                                                                                                                                                                                                                        |
| -------------------------------------------------- | ----------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current `5wyedz5q272fz`, the Grasslands of Belvorn |                 7 | Kimorr is the saved-route hub. The seven destinations remain visible; two supported coastal journeys earn detail. Ordinary intervening country and route hooks are omitted.                                                                                           |
| `alpha`, the Choir of Velaven                      |                 6 | Debegch's Hollows is the saved-route hub. One coastal journey earns detail; five ordinary rows need no paragraph.                                                                                                                                                     |
| `bravo`, Kelvane Lands                             |                 5 | Pfzaundor is the saved-route hub. One coastal journey earns detail. A route sharing the supported road–river meeting links to the separately saved suggestion at Approach to Akrasal. No second suggestion is written for the road.                                   |
| `charlie`, the Duchy of Elúria                     |                 5 | White Rivers is the saved-route hub. Three distinct supported freezing stretches earn route-specific exposure detail within the shared Travel budget. Other destinations remain present without filler; the passage suggestion stays at Approach to Gaarim's Barrows. |

The current same-seed geography and settlement names differ from the historical capture. Tests and
this review keep that distinction explicit instead of assuming an unchanged world from its seed.
The remaining repeated exposure wording names separate supported journeys; it is not generated
for all roads merely because the regional climate can have a cold winter.

## Small fixtures and edits

- A saved itinerary through another settlement remains one endpoint relationship, with its full
  traced path. It does not create an extra direct road or every reachable settlement pair.
- A shared river edge earns one selected road detail. Another itinerary references the selected
  owner. Removing that owner or the river evidence removes the link and retains stale records for
  review; it does not move the old words to a different route.
- Distinct coast, freezing-country and hot/dry evidence on a single itinerary can all earn space.
  Removing its cold evidence leaves its coastal detail current. A concern supported on every
  eligible route can instead be saved as one network sentence; an added route invalidates “all”.
- Two road-bearing groups are described as groups of saved routes. Settlements with no eligible
  route are counted separately, without claiming that no physical journey between them exists.
- Referenced endpoints use explicit caller-provided names consistently across reading formats.
  Without that context they remain neutrally labelled and outside embedded-settlement rankings.
- Authored route names, prose, embedded hooks and deliberate blanks survive with one directory
  entry. New source descriptions stay empty; generated reading text is stored in the gazetteer.

No new distance, bridge, ford, navigability, traffic, trade, control or safety claim was needed.

## Determinism audit

No new RNG-contract violation was found. The inspected path is `rollRegion` → region generation →
`generateRegionGazetteer` → road candidates and directory metadata → the common narrative composer.
The existing caller-owned RNG supplies the token for the documented selection/wording child streams;
new road adapters do not seed another RNG, use the clock or draw while reading. Canonically ordered
route/settlement identities settle equivalent input order before selection. Saved path observations
copy endpoints and anchor arrays so later edits cannot rewrite the evidence they are checked against.

`npm run test -- src/lib/regions/region_road_reading.test.ts` verifies repeated seeds, canonical input
permutations, no RNG calls during display/export, evidence immutability and payload round-trips.
Existing editorial tests additionally verify variation across seeds and bounded selection. Runtime
shell dates and artifact timestamps are outside generated road prose and unchanged by this work.
