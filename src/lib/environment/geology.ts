import type { RNG } from '@ironarachne/rng';
import type { GeologicalMakeup } from './terrain/terrain_types';
import type { GeologicalSetting } from './geology_types';

/** Fictional assemblages: compatible rocks permit a setting, never guarantee a deposit. */
const assemblages: GeologicalSetting[] = [
  { hostRocks: ['granite', 'pegmatite'], processes: ['intrusive', 'hydrothermal'] },
  { hostRocks: ['basalt', 'obsidian'], processes: ['volcanic', 'hydrothermal'] },
  { hostRocks: ['basalt', 'kimberlite'], processes: ['volcanic-pipe'] },
  { hostRocks: ['schist', 'gneiss', 'quartzite'], processes: ['metamorphic', 'hydrothermal'] },
  { hostRocks: ['marble', 'slate', 'schist', 'gneiss', 'quartzite'], processes: ['metamorphic'] },
  { hostRocks: ['limestone', 'dolomite'], processes: ['sedimentary', 'hydrothermal'] },
  { hostRocks: ['sandstone', 'shale'], processes: ['sedimentary', 'organic-sedimentary'] },
  { hostRocks: ['limestone', 'dolomite', 'evaporite'], processes: ['sedimentary', 'evaporite'] },
];

export const geologicalProcesses = [
  'intrusive',
  'volcanic',
  'volcanic-pipe',
  'metamorphic',
  'hydrothermal',
  'sedimentary',
  'placer',
  'evaporite',
  'organic-sedimentary',
  'petroleum',
] as const;

/** A setting records a generated assemblage, including associated subsurface rocks. */
export function generateGeologicalSetting(makeup: GeologicalMakeup, rng: RNG): GeologicalSetting {
  const rocks = new Set(makeup.rockTypes);
  const eligible = assemblages.filter((entry) => entry.hostRocks.some((rock) => rocks.has(rock)));
  if (eligible.length === 0) return { hostRocks: [...rocks].sort(), processes: [] };
  const chosen = rng.item(eligible);
  const setting: GeologicalSetting = {
    hostRocks: [...chosen.hostRocks],
    processes: [...chosen.processes],
  };
  if (makeup.soilTypes.includes('gravel')) setting.processes.push('placer');
  if (chosen.hostRocks.includes('shale') && rng.int(1, 3) === 1) {
    setting.hostRocks.push('evaporite');
    setting.processes.push('petroleum');
    setting.petroleum = {
      sourceRock: 'shale',
      reservoirRock: 'sandstone',
      sealRock: 'evaporite',
      maturity: rng.item(['immature', 'oil-window', 'gas-window'] as const),
      trapped: rng.int(1, 4) !== 1,
    };
  }
  return setting;
}
