import { getBiologicalHabitatRules } from '$lib/environment';
import { biologicalSourceSpecs } from './raw_biological_data';
import type {
  BiologicalSourceDefinition,
  ManagedProductionRule,
  RawResourceDefinition,
  RawResourceSnapshot,
} from './raw_source_types';

const lexical = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function getBiologicalRawResources(): RawResourceDefinition[] {
  const entries = biologicalSourceSpecs.map(
    ([id, , , name, , , , , major_type, minor_type, uses, keys]) => ({
      id,
      resource: {
        name,
        description: `Raw ${name}; acquisition and processing require qualified sources.`,
        major_type,
        minor_type,
        is_refineable: true,
        properties: [],
        commonality: 3,
      },
      uses: [...uses],
      food:
        keys === null
          ? { kind: 'not-food' as const }
          : {
              kind: 'food' as const,
              preparation: keys.length ? ('recipe-required' as const) : ('ordinary' as const),
              productKeys: [...keys],
            },
    }),
  );
  return [...new Map(entries.map((entry) => [entry.id, entry])).values()].sort(lexical);
}

export function snapshotRawResource(entry: RawResourceDefinition): RawResourceSnapshot {
  return {
    id: entry.id,
    name: entry.resource.name,
    majorType: entry.resource.major_type,
    minorType: entry.resource.minor_type,
    uses: [...entry.uses],
    food: structuredClone(entry.food),
  };
}

export function getBiologicalSourceDefinitions(): BiologicalSourceDefinition[] {
  return biologicalSourceSpecs
    .map(
      ([rawResourceId, kind, producerId, , part, profile, mode, method, , , , , reviewRefs]) => ({
        id: `fantasy:source:${rawResourceId}:${producerId}:${mode}:v1`,
        rawResourceId,
        producer:
          kind === 'plant' ? { kind, plantId: producerId } : { kind, speciesName: producerId },
        mode,
        wildOccurrenceForm:
          mode === 'wild'
            ? producerId === 'honeybee'
              ? ('colony' as const)
              : ('population' as const)
            : null,
        part,
        method,
        requirements: acquisitionRequirements(rawResourceId, method, mode),
        habitats: getBiologicalHabitatRules(profile),
        reviewRefs: [...reviewRefs],
        reviewNote:
          'Reviewed qualitative source opportunity; no yield, season, purity or processing capability is implied.',
      }),
    )
    .sort(lexical);
}

function acquisitionRequirements(
  rawId: string,
  method: BiologicalSourceDefinition['method'],
  mode: BiologicalSourceDefinition['mode'],
): string[] {
  const requirements = {
    gathering: ['collection containers'],
    cutting: ['cutting tools'],
    hunting: ['hunting and butchery tools'],
    fishing: ['shore fishing gear and handling equipment'],
    'shellfish-collection': ['shore collection gear and handling equipment'],
    shearing: ['shears and handling area'],
    milking: ['milking containers and appropriate handling'],
    'egg-collection': ['nesting provision and collection containers'],
    'colony-harvest': ['protective gear and collection vessels'],
    slaughtering: ['butchery tools and handling equipment'],
    quarrying: ['quarrying tools'],
    mining: ['mining tools'],
    drilling: ['drilling equipment'],
  }[method];
  const extra = ['madder-root', 'carrot-root', 'turnip-root', 'onion-bulb'].includes(rawId)
    ? ['digging tools']
    : rawId === 'maritime-pine-resin'
      ? ['tapping tools']
      : rawId === 'nettle-stems'
        ? ['protective handling equipment']
        : [];
  return [...requirements, ...extra, ...(mode === 'apiary' ? ['hive provision'] : [])];
}

export function getManagedProductionRules(): ManagedProductionRule[] {
  const rules = getBiologicalSourceDefinitions()
    .filter((entry) => entry.mode !== 'wild')
    .map(
      (entry): ManagedProductionRule => ({
        id: `fantasy:production:${entry.producer.kind === 'plant' ? entry.producer.plantId : entry.producer.speciesName}:${entry.mode}:v1`,
        producer: structuredClone(entry.producer),
        mode: entry.mode as ManagedProductionRule['mode'],
        habitats: structuredClone(entry.habitats),
        soilTypes: entry.mode === 'cultivation' ? ['loam', 'silt'] : [],
        supportRequirements:
          entry.mode === 'cultivation'
            ? ['cultivable-ground', 'freshwater']
            : entry.mode === 'apiary'
              ? ['freshwater', 'flowering-forage']
              : ['freshwater', 'grazing'],
        reviewRefs: [...entry.reviewRefs],
        reviewNote: entry.reviewNote,
      }),
    );
  return [...new Map(rules.map((rule) => [rule.id, rule])).values()].sort(lexical);
}
