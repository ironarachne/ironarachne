# Region narrative exports

**Status:** implemented for #345 within the accepted [Regions release contract](regions-release-contract.md).

The sourcebook entry introduced by #344 deliberately selects representative generated livelihoods.
The page and narrative exports omit supporting-explanation links, disclosures and evidence
appendices because they add bulk without adding useful narrative. Saved supporting facts remain
in the snapshot for editing, validation and structured transfer.

`regionToDocument` remains the concise reading entry. `regionToExportDocument` uses that same
entry without an appendix. Markdown and standalone PDF text both consume this narrative document.
Project PDF publication consumes the same Markdown. Authored narrative descriptions, unnamed
narrative facts and stale-explanation review notices
remain present; stale evidence is not presented as current. No persisted types, payload versions
or generation rules change.

## UI entry headings

`regionToUiDocument` adds a UI-only projection from the same saved fields. Each gazetteer section
uses an h3 and its named entries use h4 headings followed by descriptive paragraphs. Stored
notable adventure hooks use qualified h5 subheadings. Names and prose are read separately from
the snapshot, so colons inside either are preserved rather than treated as parsing delimiters.

Qualifiers reflect the entry's kind and context: a saved capital city reads “The Capital City of
Shadowreach,” while a town retains its town category. Capital identity follows the saved role,
with the same legacy fallback as the map. Settlement roles, livelihoods, realms,
landmarks, routes, hazards and organizations receive their own qualifiers. Route headings retain
endpoint names. Repeated heading text is disambiguated with a visible entry ordinal, without
exposing fact IDs. The snapshot and existing Markdown/PDF document remain unchanged.

Under #395, Flora and fauna is a single unheaded paragraph drawn from the saved
`claim:ecology-summary`, replacing population subheadings and the separate Inhabitants section.
The page and exports use identical saved words and retain stale-explanation warnings. Older
snapshots use a bounded paragraph of saved supported relationship wording without random
composition. See [regional ecology paragraph](region-ecology-paragraph.md).

## Printing and maps

A fixed one- or two-page layout is not feasible for the narrative document. The entry
has variable-length settlements, realms and authored prose.
The existing PDF writer wraps text and adds pages until all content has been written. There is no
page cap or reduced font size to force a page count. The long-content regression
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
SVG. They also check every exported narrative section and line in project PDF publication. A
migrated version 2 region has a separate project round-trip test, retaining an empty legacy facts
container and its saved map and prose.
