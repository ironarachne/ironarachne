# Resources

This is a core system meant to model resources for both trade and refinement into other objects.

This includes, but is not limited to, the following concepts:

- Food
- Armor
- Weapons
- Tools
- Clothing
- Building materials
- Medicine

Resources can be raw materials, refined materials, components, or finished objects.

## Geological raw resources

`getGeologicalResources()` returns raw-resource definitions with category, compatible host rocks,
processes and extraction methods. `supportsGeologicalResource(setting, definition)` checks a saved
setting before procedural selection. Region deposits record the resulting fictional occurrence;
catalog presence or commonality alone never proves regional supply.

Occurrence rules currently cover iron, copper, tin, lead, zinc, gold and silver ores; quartz,
amethyst, garnet, beryl, ruby, sapphire and diamond; granite, basalt, limestone, sandstone, slate,
marble, quartzite and obsidian; clay, sand, gravel, salt, gypsum and coal; crude oil and natural gas.
Other existing metal entries (aluminum, platinum, titanium, nickel, tungsten, molybdenum, chromium, vanadium,
tantalum, zirconium, hafnium, rhenium, bismuth and indium) have no regional occurrence rules yet.
The ore table's physical properties describe the metal rather than ore mineralogy, so they must
not be interpreted as deposit grade, composition or extraction economics.

Building materials still mix timber with processed blocks, tiles, plaster and thatch. The geological
catalog adds raw stone and mineral inputs; representative processing chains are implemented under #339. Plant edibility,
broader plant fiber catalogs, population density and sustainable yield remain metadata gaps.
See [regional resource generation](../../../docs/region-resources.md).

## Qualitative processing recipes

`getPlantProducts(plantName)` supplies typed raw stems for reeds, papyrus and flax. Unknown plants
return no products. `getProcessingRecipes()` defines twelve versioned steps across timber, matting,
linen, iron, preserved provisions and stone. Each declares an output key, technique, assumed tools
or facilities and required inputs with material/fuel/water roles. Inputs match raw `Resource`
classification and optional exact catalog names, or a previous product's stable key.
`matchesProcessingInput(selector, input)` shares that compatibility rule with future item consumers.

These recipes describe possible transformations without inventing numeric yields, duration or
technology levels. They complement the existing quantitative `RefinementProcess` model. Regions
adds supply/access evidence and stores complete chains; the shared catalog itself imports no
regional types. For example, iron tools require bloomery iron, charcoal fuel and wood for handles;
linen requires prepared flax and spinning, including freshwater for fiber preparation.

The catalog is representative rather than exhaustive. Additional fantasy raw inputs and finished
goods are tracked in [#364](https://github.com/ironarachne/ironarachne/issues/364) and
[#365](https://github.com/ironarachne/ironarachne/issues/365).

## Catalogs versus regional occurrences

This library defines reusable possibilities and matching rules. `$lib/regions` establishes saved
local support: geological provinces and deposits, qualified raw-resource facts, complete possible
product chains, settlement daily life and supply assessments. Catalog presence is not evidence of
local occurrence, access, an existing workshop or a trade flow. Match stable catalog identities and
product keys, never user-editable regional names.

Generated processing needs current usable sources reachable through the saved dry-land graph and
records the accessible workable/rich deposit subset. It uses a shared fantasy technique policy and
complete input closure, including intermediates, fuel and water. Missing inputs cause omission;
authored imported inputs retain explicit explanations. Supply assesses possible chains before
representative selection, so a product omitted by the display cap does not prove scarcity.

Regions saves recipe IDs, keys, techniques, requirements and source links. Reopening resolves the
saved chain without applying today's recipes to old data. A new recipe inside existing types needs
a versioned rule ID and matching/chain tests; a new persisted variant needs an approved model,
validation and migration. Shared catalogs must not import regional types or presentation code.

See the [accepted Regions contract](../../../docs/regions-release-contract.md),
[processing design](../../../docs/region-processing.md) and
[resource-chain extension guide](../../../docs/region-authoring.md#add-a-resource-chain).
