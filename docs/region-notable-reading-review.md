# Notable-place reading review (#447)

**Status:** implementation review, 2026-10-31.

Review by Codex against the approved [GM-facing criteria](region-notable-reading.md): locate the
place, identify the player decision, understand the supported constraint, and distinguish a
suggestion from established history. Samples below use default `rollRegionSnapshot` options from
the #447 implementation, not the historical revision. Unit fixtures separately exercise mineral,
gathering-risk and sparse cases.

## Historical identity reproduction

The captured `region_445_belvorn.json.gz` fixture is documented as seed `5wyedz5q272fz`, default
options, commit `1ffabf08`, payload version 14. Its approach notable cites `role:site:settlement:8`,
which targets Cilaamir, `settlement:8`. Both records use node 17 and edge 35.

Reading now gives **Approach to Cilaamir**, and the anchor resolves to the western region.
The legacy description and explicit hook survive unchanged. Current generation from that seed
instead produces **the Grasslands of Belvorn**; the historical forest identity is not imposed on
today's geography. Forest aliases keep the #446 primary owner rather than acquiring a second
category-prefixed name.

## Reading contrasting generated samples

| Seed            | Place and location                                   | Saved suggested adventure                                                                                                                     | Assessment                                                                                                                                                                                                         |
| --------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `alpha`         | wax-bearing comb source reach; southeastern region   | “Weigh the requirement for protective gear and collection vessels before choosing whether to attempt collection at wax-bearing comb source.”  | A concrete preparation-versus-expedition choice grounded in the saved requirements. It does not promise a yield or introduce a sponsor. Loramirweald receives no generic forest survey prompt.                     |
| `bravo`         | Approach to Akrasal; southern region                 | “Before taking travelers along the approach to Akrasal, assess passage at the road–river meeting and decide whether to proceed or turn back.” | The named destination and point location make this usable at the table. Passage remains a question; no bridge, ford or disaster is asserted. The Forlorn Forest retains its name without forced adventure padding. |
| `charlie`       | Cold travel country; eastern region                  | “Decide whether to prepare for freezing exposure during winter before crossing this country or defer the journey.”                            | The season and exposure constraint give the decision substance without inventing weather or shelter. A second, different passage suggestion belongs to the western approach to Gaarim's Barrows.                   |
| `5wyedz5q272fz` | purple willow bark source reach; northeastern region | “Plan collection at purple willow bark source and decide whether securing cutting tools is worth attempting the expedition.”                  | The tool requirement and located source support an optional collection expedition, not established local harvesting or a trade relationship. The other selected suggestion concerns northern winter exposure.      |

These are short expedition decisions rather than commissioned quests. Their scope follows the
available evidence; richer patrons, rivalries and history require their own approved generation
rules. Repetition across regions is allowed when evidence supports the same constraint, while
each region permits at most two different decision families. The supplied batch context can
prefer a different eligible family without weakening its evidence.

## Contrasts and omission checks

The focused test fixtures give four distinct decisions: a road–river passage, an equipment-limited
mineral collection opportunity, gathering with an explicit recorded dangerous-inhabitant overlap,
and freezing/high-ground travel. Ordinary banks without road evidence and ordinary habitat study
sites yield no prompt. Mere fantastical presence does not become an attack or gathering hazard.
Named forest discoverability does not force a descriptive sentence or a hook.

Renaming an embedded settlement updates the heading and link while preserving IDs. Generated
sentences spelling its old name become stale; they are not rewritten or replaced. Missing or
ambiguous targets use a neutral heading. Explicit artifact-name context resolves a linked target;
without that context the reader never fetches another saved result implicitly. Authored names,
descriptions and hooks bypass generated alternatives, including intentional blank edits.

Regression tests compare the UI, Markdown and PDF text, round-trip the saved plan, reorder inputs
and exported object keys, mutate supporting facts, and reject invented prompt content. The browser
test saves a generated suggestion, reopens it, replaces it with authored words and reopens again.
The full mobile suite checks the same reading layout at all configured widths.
