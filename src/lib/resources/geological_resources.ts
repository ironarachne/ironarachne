import type { GeologicalSetting } from '$lib/environment';
import { getAllMetalOres } from './metal_ores';
import type { Resource } from './resource_types';
import type {
  GeologicalResourceDefinition as Definition,
  GeologicalResourceCategory,
} from './geological_resource_types';

function raw(name: string, category: GeologicalResourceCategory): Resource {
  return {
    name,
    description: `Raw ${name}; extraction and processing depend on the deposit and available technology.`,
    major_type: category,
    minor_type: name,
    is_refineable: true,
    properties: [],
    commonality: 3,
  };
}
function definition(
  name: string,
  category: GeologicalResourceCategory,
  hostRocks: string[],
  processes: Definition['processes'],
  extractionMethods: Definition['extractionMethods'],
): Definition {
  return {
    resource: getAllMetalOres().find((entry) => entry.name === name) ?? raw(name, category),
    category,
    hostRocks,
    processes,
    extractionMethods,
  };
}

/** Curated fictional occurrence rules, not empirical probabilities or reserves. */
export function getGeologicalResources(): Definition[] {
  const metals = [
    ['iron ore', ['basalt', 'shale'], ['volcanic', 'sedimentary']],
    ['copper ore', ['granite', 'basalt'], ['hydrothermal']],
    ['tin ore', ['granite', 'pegmatite'], ['intrusive', 'hydrothermal']],
    ['lead ore', ['limestone', 'dolomite'], ['hydrothermal']],
    ['zinc ore', ['limestone', 'dolomite'], ['hydrothermal']],
    ['gold ore', ['schist', 'gneiss', 'granite'], ['hydrothermal', 'placer']],
    ['silver ore', ['basalt', 'granite'], ['hydrothermal']],
  ] as const;
  const gems = [
    ['quartz', ['granite', 'pegmatite'], ['intrusive', 'hydrothermal']],
    ['amethyst', ['basalt'], ['hydrothermal']],
    ['garnet', ['schist', 'gneiss'], ['metamorphic']],
    ['beryl', ['pegmatite'], ['intrusive']],
    ['ruby', ['marble'], ['metamorphic']],
    ['sapphire', ['schist', 'gneiss'], ['metamorphic']],
    ['diamond', ['kimberlite'], ['volcanic-pipe']],
  ] as const;
  const definitions: Definition[] = [
    ...metals.map(([name, rocks, processes]) =>
      definition(name, 'metal-ore', [...rocks], [...processes], ['mining']),
    ),
    ...gems.map(([name, rocks, processes]) =>
      definition(name, 'gemstone', [...rocks], [...processes], ['mining']),
    ),
    ...[
      'granite',
      'basalt',
      'limestone',
      'sandstone',
      'slate',
      'marble',
      'quartzite',
      'obsidian',
    ].map((name) => definition(name, 'stone', [name], [], ['quarrying'])),
    definition('clay', 'industrial-mineral', ['shale'], ['sedimentary'], ['gathering']),
    definition('sand', 'industrial-mineral', ['sandstone'], ['sedimentary'], ['gathering']),
    definition('gravel', 'industrial-mineral', [], ['placer'], ['gathering']),
    definition('salt', 'industrial-mineral', ['evaporite'], ['evaporite'], ['mining']),
    definition('gypsum', 'industrial-mineral', ['evaporite'], ['evaporite'], ['mining']),
    definition('coal', 'industrial-mineral', ['shale'], ['organic-sedimentary'], ['mining']),
    definition(
      'crude oil',
      'oil',
      ['shale', 'sandstone', 'evaporite'],
      ['petroleum'],
      ['drilling'],
    ),
    definition(
      'natural gas',
      'gas',
      ['shale', 'sandstone', 'evaporite'],
      ['petroleum'],
      ['drilling'],
    ),
  ];
  return definitions.sort((a, b) => a.resource.name.localeCompare(b.resource.name, 'en'));
}

/** Host compatibility permits selection; the saved selected deposit is the presence evidence. */
export function supportsGeologicalResource(setting: GeologicalSetting, entry: Definition): boolean {
  if (entry.hostRocks.length && !entry.hostRocks.some((rock) => setting.hostRocks.includes(rock)))
    return false;
  if (
    entry.processes.length &&
    !entry.processes.some((process) => setting.processes.includes(process))
  )
    return false;
  if (entry.category !== 'oil' && entry.category !== 'gas') return true;
  const petroleum = setting.petroleum;
  return (
    petroleum !== undefined &&
    petroleum.trapped &&
    petroleum.sourceRock === 'shale' &&
    petroleum.reservoirRock === 'sandstone' &&
    petroleum.sealRock === 'evaporite' &&
    [petroleum.sourceRock, petroleum.reservoirRock, petroleum.sealRock].every((rock) =>
      setting.hostRocks.includes(rock),
    ) &&
    (entry.category === 'oil'
      ? petroleum.maturity === 'oil-window'
      : petroleum.maturity === 'gas-window')
  );
}
