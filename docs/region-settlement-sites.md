# Geographic settlement sites

**Status:** implemented for #331 under the accepted
[Regions release contract](regions-release-contract.md). Uses the existing `SettlementRoleFact`,
`RouteFact` and `CausalFact` domain model; no payload migration is needed.

The habitation pass classifies the existing suitability-selected sites after roads are generated.
It never moves a town, renames one, changes realm links, or redraws roads. One geographic role per
embedded settlement cites its stable settlement ID and supporting saved observations. Rules choose
in this order:

- River crossing: a road and river share an incident edge with dry land on both sides.
- Coastal port site: a dry coastal cell has an adjacent ocean cell. This establishes coastal access,
  not a sheltered harbor or actual docks.
- Agricultural center: grassland, savanna, plains or prairie at elevation 0–0.4, temperature 5–30 °C
  and moisture 0.3–0.8. This is a coarse fantasy suitability rule, not a soil survey.
- River settlement: an incident river edge provides freshwater access; navigability is not claimed.
- Forest settlement: forest or woodland biome supports access to woodland resources.
- Land settlement: describe a settled foothold, or difficult ground for the placement fallback. Specific geography is never invented to fill a role slot.

Mines and mountain passes are deferred: the graph has no mineral deposits or verified pass data.
All rule IDs are versioned. Evidence uses graph IDs rather than array offsets; incident river
edges are recognized on either side. Classification draws no random values. Narrative variants use the existing named habitation RNG
stream after roles are sorted by stable identity, preserving same-seed output and independence from
settlement-list order. The shared narrative composer carries bounded batch context and prefers unused template/fragment
combinations before repeating the same description.
Prose describes geography and political importance without generation diagnostics or unsupported
claims about docks, navigable rivers, crops or specific institutions. The capital is described as
a center of authority. The page and narrative exports put settlement roles under **Settlement
character**; **Inhabitants** contains living fantastical inhabitants rather than settlement roles.

Road facts trace actual saved road edges through intermediate nodes. A deterministic root in each
connected settlement component links to the other reachable towns. Disconnected settlements gain
no invented route. Endpoints use settlement IDs; causal claims link the site roles and the route.
Routes may overlap, representing shared sections of the road network.

The designated capital also receives `role:capital`, pointing to its settlement ID and geographic
site role. The SVG marker follows that saved target after list reordering. Older snapshots without
site roles retain their existing first-settlement marker behavior. Removing the new capital does
not silently designate another town. Roles and relationships are
stored facts, never recomputed on load; referenced settlements retain the existing artifact-reference
behavior and are not copied into this generation pass. Edit staleness and partial regeneration
remain #347's responsibility.
