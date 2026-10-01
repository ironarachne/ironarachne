import type { Resource } from './resource_types';
import type {
  ProcessingRecipe,
  RecipeInput,
  RecipeInputSelector,
  ProcessingInputRole,
} from './processing_types';

const raw = (
  majorType: string,
  minorTypes: string[] = [],
  resourceNames: string[] = [],
  role: ProcessingInputRole = 'material',
): RecipeInput => ({ role, selector: { kind: 'raw', majorType, minorTypes, resourceNames } });
const product = (productKey: string, role: ProcessingInputRole = 'material'): RecipeInput => ({
  role,
  selector: { kind: 'product', productKey },
});
function recipe(
  family: string,
  outputKey: string,
  outputName: string,
  technique: string,
  requirements: string[],
  inputs: RecipeInput[],
): ProcessingRecipe {
  return {
    id: `fantasy:processing:${outputKey}:v1`,
    family,
    outputKey,
    outputName,
    technique,
    requirements,
    inputs,
  };
}
/** Qualitative recipes: no invented time, yield, temperature or numeric technology level. */
export function getProcessingRecipes(): ProcessingRecipe[] {
  return [
    recipe(
      'timber',
      'sawn-timber',
      'Sawn timber',
      'woodworking',
      ['saw and woodworking tools'],
      [raw('wood')],
    ),
    recipe(
      'timber',
      'construction-components',
      'Construction components',
      'woodworking',
      ['joinery tools'],
      [product('sawn-timber')],
    ),
    recipe(
      'fiber',
      'woven-mats',
      'Woven fiber mats',
      'weaving',
      ['hand weaving tools'],
      [raw('plant-fiber', ['reed', 'papyrus'])],
    ),
    recipe(
      'textile',
      'prepared-flax',
      'Prepared flax fiber',
      'fiber preparation',
      ['retting and fiber preparation tools'],
      [raw('plant-fiber', ['textile'], ['flax stems']), raw('water', [], [], 'water')],
    ),
    recipe(
      'textile',
      'flax-yarn',
      'Flax yarn',
      'spinning',
      ['spindle'],
      [product('prepared-flax')],
    ),
    recipe('textile', 'linen', 'Linen cloth', 'weaving', ['loom'], [product('flax-yarn')]),
    recipe(
      'iron',
      'charcoal',
      'Charcoal',
      'charcoal making',
      ['controlled charcoal-making hearth'],
      [raw('wood')],
    ),
    recipe(
      'iron',
      'bloomery-iron',
      'Bloomery iron',
      'bloomery smelting',
      ['bloomery furnace and bellows'],
      [raw('metal', [], ['iron ore']), product('charcoal', 'fuel')],
    ),
    recipe(
      'iron',
      'iron-tools',
      'Simple iron tools',
      'forging',
      ['forge, hammer and anvil'],
      [product('bloomery-iron'), product('charcoal', 'fuel'), raw('wood')],
    ),
    recipe(
      'food',
      'smoked-provisions',
      'Smoked provisions',
      'smoking',
      ['smoking hearth and racks'],
      [
        raw('organic', ['red_meat', 'reptile_meat', 'poultry', 'insect_meat', 'fish']),
        raw('wood', [], [], 'fuel'),
      ],
    ),
    recipe(
      'food',
      'dried-provisions',
      'Dried provisions',
      'drying',
      ['covered drying racks'],
      [raw('organic', ['red_meat', 'reptile_meat', 'poultry', 'insect_meat', 'fish'])],
    ),
    recipe(
      'stone',
      'dressed-stone',
      'Dressed stone',
      'stone dressing',
      ['stoneworking tools'],
      [raw('stone')],
    ),
  ];
}
export function matchesProcessingInput(
  selector: RecipeInputSelector,
  input: Resource | { productKey: string },
): boolean {
  if (selector.kind === 'product')
    return 'productKey' in input && selector.productKey === input.productKey;
  return (
    'major_type' in input &&
    input.major_type === selector.majorType &&
    (!selector.minorTypes.length || selector.minorTypes.includes(input.minor_type)) &&
    (!selector.resourceNames.length || selector.resourceNames.includes(input.name))
  );
}
