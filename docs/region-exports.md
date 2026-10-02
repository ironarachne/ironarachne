# Complete region exports

**Status:** implemented for #345 within the accepted [Regions release contract](regions-release-contract.md).

The sourcebook entry introduced by #344 deliberately selects representative generated livelihoods.
Its on-screen disclosure controls expose the remaining saved facts and their supporting evidence.
An export of only the entry lost access to that detail.

`regionToDocument` remains the concise reading entry. `regionToExportDocument` uses that same
entry and appends every saved semantic fact and the explanations used by the page's disclosures.
Markdown and standalone PDF text both consume this complete document. Project PDF publication
consumes the same Markdown. Authored descriptions, unnamed facts and stale-explanation notices
remain present; stale evidence is not presented as current. No persisted types, payload versions
or generation rules change.

## Printing and maps

A fixed one- or two-page layout is not feasible for the complete document. Even the main entry
has variable-length settlements, realms and authored prose; evidence can cite many saved map sites.
The existing PDF writer wraps text and adds pages until all content has been written. There is no
page cap, clipped appendix or reduced font size to force a page count. The long-content regression
test checks that a document exceeds two pages and retains its final saved fact.

The map remains a separate illustrative SVG, as required by the accepted release contract and
workflow audit. Markdown and standalone PDF do not embed it. The SVG renders the same snapshot's
saved names, capital identity, habitats and notable anchors. Project publication may include a
saved preview through its existing asset path. Exporting never rerolls a map or invents missing
facts for a legacy region.

## Structured transfer

Artifact and whole-project JSON exports use the existing vault envelope, which carries the entire
region snapshot and its artifact payload version (currently 8); region facts have their own version
(currently 6). Import validates those structures without reconstructing them from prose.

The region transfer tests cover both export scopes across the pinned seed bank, check the exported
payload and version, and reopen the imported artifact to compare the whole snapshot, Markdown and
SVG. They also check every exported section and appendix line in project PDF publication. A
migrated version 2 region has a separate project round-trip test, retaining an empty legacy facts
container and its saved map and prose.
