import type { RNG } from '@ironarachne/rng';
import { n, path } from './geometry';
import type {
  PlantGrammar,
  PlantKind,
  PlantPlacement,
  ScenePath,
} from './settlement_illustration_types';
export function plantGrammar(kind: PlantKind): PlantGrammar {
  const replacements: Record<PlantKind, string[]> = {
    broadleaf: ['F[+FX][-FX]FX', 'F[-FX][+FX]X'],
    conifer: ['F[+FF][-FF]FX'],
    tropical: ['F[+FX][-FX][++F]X'],
    grass: ['F[+F][-F]'],
    reed: ['FF[+F]'],
    cactus: ['FF[+F-F][-F+F]F'],
    palm: ['FFF[+FF][++FF][-FF][--FF]'],
    scrub: ['F[+FX][-FX]'],
    none: [''],
  };
  return {
    kind,
    axiom: 'X',
    productions: replacements[kind].map((replacement) => ({ symbol: 'X', replacement, weight: 1 })),
    iterations: ['broadleaf', 'conifer', 'tropical', 'scrub'].includes(kind) ? 3 : 1,
    angle: kind === 'cactus' ? Math.PI / 2 : 0.55,
    stepScale: 0.72,
    symbolLimit: 2048,
  };
}
export function expandPlant(grammar: PlantGrammar, rng: RNG): string {
  let symbols = grammar.axiom;
  for (let i = 0; i < Math.min(4, grammar.iterations); i++) {
    let next = '';
    for (const symbol of symbols) {
      const options = grammar.productions.filter((p) => p.symbol === symbol);
      next += options.length
        ? rng.weighted(options.map((p) => ({ value: p.replacement, commonality: p.weight })))
        : symbol;
      // Keep the last complete generation: truncation could unbalance branches.
      if (next.length > Math.min(2048, grammar.symbolLimit)) return symbols;
    }
    symbols = next;
  }
  return symbols;
}
export function drawPlant(placement: PlantPlacement, rng: RNG): ScenePath[] {
  if (placement.kind === 'none') return [];
  const grammar = plantGrammar(placement.kind);
  const symbols = expandPlant(grammar, rng);
  let state = {
    x: placement.x,
    y: placement.y,
    angle: -Math.PI / 2,
    step: placement.scale * rng.float(2, 3.2),
  };
  const stack: (typeof state)[] = [];
  let d = '';
  let leaves = '';
  for (const symbol of symbols) {
    if (symbol === '[') {
      stack.push({ ...state });
      state.step *= grammar.stepScale;
    } else if (symbol === ']') {
      state = stack.pop() ?? state;
    } else if (symbol === '+' || symbol === '-')
      state.angle += (symbol === '+' ? 1 : -1) * grammar.angle * rng.float(0.8, 1.2);
    else if (symbol === 'F' || symbol === 'X') {
      const x = state.x + Math.cos(state.angle) * state.step;
      const y = state.y + Math.sin(state.angle) * state.step;
      d += `M${n(state.x)},${n(state.y)}L${n(x)},${n(y)}`;
      state.x = x;
      state.y = y;
      if (symbol === 'X' && ['broadleaf', 'tropical', 'scrub'].includes(placement.kind)) {
        const r = state.step * 1.8;
        leaves += `M${n(x - r)},${n(y)}q${n(-r / 2)},${n(-r)} ${n(r)},${n(-r)}q${n(r * 1.7)},0 ${n(r)},${n(r)}q${n(-r)},${n(r)} ${n(-2 * r)},0Z`;
      }
    }
  }
  return [
    path(d, 'none', 'secondary', placement.kind === 'cactus' ? placement.scale * 2 : 0.65),
    ...(leaves ? [path(leaves, 'light', 'secondary', 0.45)] : []),
  ];
}
