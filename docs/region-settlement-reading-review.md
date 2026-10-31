# Settlement reading review

**Status:** implementation review for [#449](https://github.com/ironarachne/ironarachne/issues/449),
following the [approved policy](region-settlement-reading.md).

## Reproduction and unchanged evidence

Compared default `rollRegionSnapshot('5wyedz5q272fz')` at the parent checkout against the new
implementation. The complete map and `facts` objects are equal, as are settlement identities and
populations. Description selection, mirrored portrait provenance and gazetteer metadata deliberately
change. The original historical fixture remains untouched and is checked separately; its Maenas
and Cilaamir names do not describe today's settlements.

The parent reading gives every settlement a material/opportunity list, with repeated basalt and
limited-source qualifications. Melegir includes “Stone dressing is plausible household work using
stone dressing”; Terfis includes “Prepared oat groats making”. Their underlying evidence survives
this change, while those descriptions no longer become settlement reading paragraphs.

## Current default-seed entries

The complete eight-entry directory now includes category, population, prosperity and economic role.
The editorial plan selects 22 block sentences and two suggested-adventure sentences, reaching the
existing 24-sentence maximum. It does not grant portraits a separate allowance.

| Settlement | Saved portrait focus                            | Possible work in the reading |
| ---------- | ----------------------------------------------- | ---------------------------- |
| Kimorr     | Ground suitable for cultivation                 | None selected                |
| Coimlyn    | Evening storytelling and the coastal site       | None selected                |
| Melegir    | Neighborhood meeting places and suitable ground | None selected                |
| Terfis     | Identity line only                              | None selected                |
| Kiruth     | Courtyard gatherings and the coastal site       | None selected                |
| Vamuvale   | Identity line only                              | None selected                |
| Sigel      | Identity line only                              | None selected                |
| Iladur     | Winding lanes and suitable ground               | None selected                |

These are capped selections, not a claim that the other settlements lack character or work.
Material relationships remain available through the regional materials reading and evidence
inspection. Repeated suitable-ground/coastal orientation remains truthful and local; routine
basalt and generic food examples do not fill every settlement paragraph. The unused eligible
courtyard/lane/storytelling alternatives do not become extra paragraphs after the cap is reached.

Current dressed-stone chains are associated with established declarations, so they do not receive
another conditional paragraph for the same relationship. Common practices compete with safe
character features at supporting priority rather than forcing every settlement to have the same
stoneworking portrait. The prepared-groats chain remains inspectable; it has no specialized safe
wording adapter in this change. Adding that adapter later requires domain-owned wording and tests,
not automatic verb creation from the product label.

## Historical chains and contrasting work fixture

The unchanged historical snapshot supports:

- Maenas drying bison meat for provisions, conditional on covered drying racks, with limited
  bison-meat supplies.
- Cilaamir dressing basalt into building stone, conditional on stoneworking tools, with limited
  basalt supplies.

Both chains enter the new Possible work reading in the historical regression test. Legacy
settlement descriptions remain verbatim rather than being retroactively rewritten or certified.
The new wording does not grant a workshop, production capacity or sustainable yield.

Default seed `449-opportunity` supplies the complementary rendering case: a selected drying
opportunity retains its actual material and equipment conditions beneath a separate Possible work
heading. `bravo` now omits intermediate sawing opportunities already covered by its established
woodworking chains. Similar supported chains may remain similar; wording variants and explicit
batch context do not allocate fictional crafts to individual settlements.

## Verification evidence

Unit regressions exercise the actual historical chains, limited/access/stale/cyclic support,
explicit imports, authored work, authored portraits and blanks, independent facet invalidation,
identity completeness, sentence roles and budgets, old-payload preservation, reordered candidates,
round trips and UI/Markdown/text-PDF parity without RNG. The existing generation-pass tests continue
to assert unchanged maps, source facts, settlement identities, architecture and downstream realms;
their core comparison now excludes the deliberately mirrored editorial portrait.

Browser coverage includes separate portrait/work rendering, mobile save/reopen equality, Markdown and PDF
downloads, a 375px settlement screenshot, and the existing complete route/mobile suite. PDF pages and
the 375px mobile screenshot were visually inspected: the two-page Letter PDF keeps settlement
statistics beneath their names, work remains explicitly conditional, and no text is clipped or
overlapping. The focused mobile save/reopen/export browser test passes. The saved-editor regression
also checks for browser errors: reading source food metadata must copy its small data union rather
than passing reactive editor proxies to `structuredClone`.
