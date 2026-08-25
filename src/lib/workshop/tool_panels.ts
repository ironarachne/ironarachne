import type { RouteId } from '$app/types';
import type { ToolPanelLoader, ToolPanelRegistry } from './workshop_types';

/**
 * Which component renders each tool, keyed by the tool's catalog path.
 *
 * The imports are static strings because a bundler can only split a dynamic import it can see;
 * a computed specifier would either fail or drag the whole site into one chunk. The route pages
 * mount these same components, so a tool looks and behaves the same in a workshop panel as it
 * does on its own page.
 */
export const TOOL_PANELS: ToolPanelRegistry = {
  // Characters & People
  '/fantasy/adnd/character/build': () =>
    import('$components/characters/AdndCharacterBuilder.svelte'),
  '/character': () => import('$components/characters/CharacterGenerator.svelte'),
  '/fantasy/adnd/character': () => import('$components/characters/AdndCharacterGenerator.svelte'),
  '/fantasy/dcc/character': () => import('$components/characters/DccCharacterGenerator.svelte'),
  '/swn/character': () => import('$components/characters/SwnCharacterGenerator.svelte'),
  '/unchartedworlds/character': () =>
    import('$components/characters/UnchartedWorldsCharacterGenerator.svelte'),
  '/heraldry': () => import('$components/heraldry/HeraldryGenerator.svelte'),
  '/velgarth-gifts': () => import('$components/characters/VelgarthGiftsGenerator.svelte'),

  // Factions & Groups
  '/arms-manufacturer': () => import('$components/factions/ArmsManufacturerGenerator.svelte'),
  '/culture': () => import('$components/factions/CultureGenerator.svelte'),
  '/fantasy/encounter': () => import('$components/factions/EncounterGenerator.svelte'),
  '/fantasy/family': () => import('$components/factions/FamilyGenerator.svelte'),
  '/fantasy/organization': () => import('$components/factions/OrganizationGenerator.svelte'),
  '/fantasy/religion': () => import('$components/factions/ReligionGenerator.svelte'),
  '/star-nation': () => import('$components/factions/StarNationGenerator.svelte'),

  // Locations & Places
  '/chop-shop': () => import('$components/locations/ChopShopGenerator.svelte'),
  '/fantasy/dungeon': () => import('$components/locations/DungeonGenerator.svelte'),
  '/environment': () => import('$components/locations/EnvironmentGenerator.svelte'),
  '/planet': () => import('$components/locations/PlanetGenerator.svelte'),
  '/region': () => import('$components/locations/RegionGenerator.svelte'),
  '/fantasy/settlement': () => import('$components/locations/SettlementGenerator.svelte'),
  '/star-system': () => import('$components/locations/StarSystemGenerator.svelte'),

  // Objects & Items
  '/drug': () => import('$components/objects/DrugGenerator.svelte'),
  '/fantasy/equipment': () => import('$components/objects/EquipmentPriceLists.svelte'),
  '/fantasy/equipment-generator': () => import('$components/objects/EquipmentGenerator.svelte'),
  '/fantasy/merchant': () => import('$components/objects/MerchantGenerator.svelte'),
  '/fantasy/potion-generator': () => import('$components/objects/PotionGenerator.svelte'),
  '/fantasy/weapon': () => import('$components/objects/WeaponGenerator.svelte'),
  '/fantasy/treasure-hoard': () => import('$components/objects/TreasureHoardGenerator.svelte'),
  '/spooky-ship': () => import('$components/objects/SpookyShipGenerator.svelte'),
  '/swn/starship': () => import('$components/objects/SwnStarshipGenerator.svelte'),

  // Utilities & Reference
  '/language': () => import('$components/utilities/LanguageGenerator.svelte'),
  '/species-stats': () => import('$components/utilities/SpeciesStatsCalculator.svelte'),
  '/word-generator-cheat-sheet': () =>
    import('$components/utilities/WordGeneratorCheatSheet.svelte'),
};

/**
 * Every tool in the catalog has a panel, with no exceptions. There used to be one — the workshop
 * itself, which cannot be mounted inside its own bench — and it stopped being an exception when it
 * stopped being a tool (decision 9 in docs/workshop.md). What replaced the exemption list is the
 * stronger statement: "no panel" and "we forgot the panel" are told apart by there being no such
 * thing as a tool without one.
 */

/** The loader for a tool's panel, or undefined when no component is registered for it. */
export function toolPanelLoader(path: RouteId): ToolPanelLoader | undefined {
  return TOOL_PANELS[path];
}

export function hasToolPanel(path: RouteId): boolean {
  return toolPanelLoader(path) !== undefined;
}

/** Every path with a panel, in registry order. */
export function pathsWithToolPanels(): RouteId[] {
  return Object.keys(TOOL_PANELS) as RouteId[];
}
