import type { Title } from '$lib/characters/character_types.js';
import type { SettlementCategory } from './settlement_types.js';

/**
 * A civic or community role for important local NPCs. Titles and archetype names align with
 * `getAllFantasyArchetypes` (we avoid `noble` so generation does not add standard noble land titles).
 */
export type SettlementNotableRoleDefinition = {
  id: string;
  /**
   * Title fields for the role (civic precedence 18–40; lower = higher rank in `getTitle`).
   */
  title: Pick<
    Title,
    'femaleTitle' | 'maleTitle' | 'femaleHonorific' | 'maleHonorific' | 'hasLands' | 'landName' | 'precedence'
  >;
  /** Archetype `name` values; the first that exists in the registry is used. */
  archetypeNames: string[];
  /** "Why" this person is prominent; "{settlement}" and "{characterPossessive}" are replaced. */
  importanceTemplate: string;
  /** If set, `category.name` must be in this set. */
  allowedCategoryNames?: string[];
  /** If set, `population` must be &gt;= this. */
  minPopulation?: number;
  /** If set, `settlement.settlementTags` must include this tag. */
  requiresTag?: string;
};

function civicTitle(
  n: string,
  precedence: number,
): Pick<
  Title,
  'femaleTitle' | 'maleTitle' | 'femaleHonorific' | 'maleHonorific' | 'hasLands' | 'landName' | 'precedence'
> {
  return {
    femaleTitle: n,
    maleTitle: n,
    femaleHonorific: n,
    maleHonorific: n,
    hasLands: false,
    landName: '',
    precedence,
  };
}

export const SETTLEMENT_NOTABLE_ROLES: readonly SettlementNotableRoleDefinition[] = [
  {
    id: 'mayor',
    title: civicTitle('Mayor', 18),
    archetypeNames: ['merchant'],
    importanceTemplate:
      'Presides over the common council, keeps records, and speaks for {settlement} in dealings with the wider region.',
    allowedCategoryNames: ['town', 'borough', 'city', 'metropolis'],
    minPopulation: 2000,
  },
  {
    id: 'reeve',
    title: civicTitle('Reeve', 30),
    archetypeNames: ['peasant', 'fighter'],
    importanceTemplate:
      "Oversees common fields, petty disputes, and the seasonal duties of the hamlets tied to {settlement}'s charter.",
    allowedCategoryNames: ['hamlet', 'village'],
  },
  {
    id: 'watch_captain',
    title: civicTitle('Captain of the Watch', 22),
    archetypeNames: ['fighter', 'rogue'],
    importanceTemplate:
      "Commands the garrison, gate watches, and night patrols; {characterPossessive} word carries when steel is bared in {settlement}.",
    minPopulation: 200,
  },
  {
    id: 'temple_warden',
    title: civicTitle('High Warden of the Shrine', 20),
    archetypeNames: ['cleric', 'mage'],
    importanceTemplate:
      'Rings the most souls for services, burials, and oaths, and is first called when the divine must speak for {settlement}.',
    minPopulation: 800,
  },
  {
    id: 'guildmaster',
    title: civicTitle('Guildmaster', 20),
    archetypeNames: ['merchant', 'rogue'],
    importanceTemplate:
      'Leads the dominant craft or trade body that steadies prices, apprentices, and reputation for wares from {settlement}.',
    minPopulation: 4000,
  },
  {
    id: 'harbor_master',
    title: civicTitle('Harbor Master', 24),
    archetypeNames: ['merchant', 'fighter'],
    importanceTemplate:
      "Sets dock and river fees, lading order, and who may berth first when storms crowd {settlement}'s waterfront.",
    minPopulation: 500,
    requiresTag: 'coastal',
  },
  {
    id: 'market_warden',
    title: civicTitle('Market Warden', 25),
    archetypeNames: ['merchant', 'fighter'],
    importanceTemplate:
      "Oversees fair measures, the square, and the charter under which {settlement}'s day trade runs.",
    minPopulation: 600,
  },
  {
    id: 'road_warden',
    title: civicTitle('Road Warden', 28),
    archetypeNames: ['fighter', 'druid', 'mage'],
    importanceTemplate:
      'Holds a crown or charter to roads, woodlots, and toll posts within reach of {settlement}.',
  },
  {
    id: 'hostler',
    title: civicTitle('Hostler', 32),
    archetypeNames: ['merchant', 'rogue', 'peasant'],
    importanceTemplate:
      "Runs the largest inn, stable, and hearsay in {settlement}, and is often the first to know a stranger's business.",
  },
  {
    id: 'cunning_person',
    title: civicTitle('Cunning Person', 35),
    archetypeNames: ['cleric', 'mage', 'druid', 'cultist'],
    importanceTemplate:
      'Cures, curses, and small miracles follow this name; half the ridings will ride to {settlement} for that counsel alone.',
  },
];

function categoryMatches(role: SettlementNotableRoleDefinition, category: SettlementCategory): boolean {
  if (role.allowedCategoryNames == null) {
    return true;
  }
  return role.allowedCategoryNames.includes(category.name);
}

/**
 * Returns role definitions that fit the given settlement (population, category, optional tags).
 */
export function getSettlementNotableRolePool(input: {
  population: number;
  category: SettlementCategory;
  settlementTags: string[];
}): SettlementNotableRoleDefinition[] {
  return SETTLEMENT_NOTABLE_ROLES.filter((r) => {
    if (r.minPopulation != null && input.population < r.minPopulation) {
      return false;
    }
    if (!categoryMatches(r, input.category)) {
      return false;
    }
    if (r.requiresTag != null && !input.settlementTags.includes(r.requiresTag)) {
      return false;
    }
    return true;
  });
}
