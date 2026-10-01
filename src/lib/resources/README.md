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
catalog adds raw stone and mineral inputs; processing chains belong to #339. Plant edibility,
raw plant fiber catalogs, population density and sustainable yield remain metadata gaps.
See [regional resource generation](../../../docs/region-resources.md).
