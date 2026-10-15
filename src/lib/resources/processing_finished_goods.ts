import type { FoodInputUse, FoodProductUse } from './raw_source_types';
import type { ProcessingRecipe, RecipeInput, ProcessingProductUse } from './processing_types';
import { getProcessingTechniques } from './processing_techniques';

const raw = (...rawResourceIds: string[]): RecipeInput => ({
  role: 'material',
  foodUse: 'support',
  selector: { kind: 'raw-resource', rawResourceIds },
});
const product = (productKey: string): RecipeInput => ({
  role: 'material',
  foodUse: 'support',
  selector: { kind: 'product', productKey },
});
const water = (foodUse: FoodInputUse = 'support'): RecipeInput => ({
  role: 'water',
  foodUse,
  selector: { kind: 'settlement-water' },
});
const fuel = (): RecipeInput => ({
  role: 'fuel',
  foodUse: 'support',
  selector: { kind: 'raw', majorType: 'wood', minorTypes: [], resourceNames: [] },
});
const ingredient = (input: RecipeInput): RecipeInput => ({ ...input, foodUse: 'ingredient' });

/** Reviewed coarse routes. Equipment is assumed; consumable materials are always input edges. */
export function finishedGoodsRecipes(): ProcessingRecipe[] {
  const result: ProcessingRecipe[] = [];
  const techniques = new Map(getProcessingTechniques().map((entry) => [entry.technique, entry]));
  const add = (
    key: string,
    name: string,
    family: string,
    technique: string,
    requirements: string[],
    inputs: RecipeInput[],
    uses: ProcessingProductUse[] = [],
    foodUse?: FoodProductUse,
    note = 'Plain unmodified goods under the stated craft assumptions; no additional finish, additive or yield is inferred.',
  ) => {
    const policy = techniques.get(technique)!;
    result.push({
      id: `fantasy:processing:${key}:v1`,
      outputKey: key,
      outputName: name,
      family,
      technique,
      requirements,
      inputs,
      context: { uses, craftLabel: name + ' making' },
      food: foodUse
        ? {
            kind: 'food',
            use: foodUse,
            reviewRuleId: `fantasy:processing:${key}:food:v1`,
            requirements: [...requirements],
          }
        : { kind: 'not-food' },
      reviewRefs: [...policy.reviewRefs],
      reviewNote: note,
    });
  };
  add(
    'clean-wool',
    'Rinsed and sorted wool',
    'textile',
    'wool preparation',
    ['sorting and combing tools', 'rinsing and drying area'],
    [raw('sheep-fleece'), water()],
    [],
    undefined,
    'Water-rinsed, sorted fleece for coarse hand spinning, retaining natural grease; not detergent-scoured or chemically finished wool.',
  );
  result.at(-1)!.reviewRefs = [
    'https://museum.wales/media/60701/Sheep-to-Shop-Fabric-Making-at-the-National-Wool-Museum.pdf',
    'https://www.fao.org/4/x5672e/x5672e05.htm',
  ];
  add(
    'prepared-cotton',
    'Prepared cotton fiber',
    'textile',
    'cotton preparation',
    ['seed separation and carding tools'],
    [raw('cotton-seed-fiber')],
  );
  add(
    'prepared-hemp',
    'Prepared hemp fiber',
    'textile',
    'fiber preparation',
    ['retting, breaking and combing tools', 'retting area'],
    [raw('hemp-stems'), water()],
  );
  for (const [material, prepared] of [
    ['wool', 'clean-wool'],
    ['cotton', 'prepared-cotton'],
    ['hemp', 'prepared-hemp'],
  ]) {
    add(
      `${material}-yarn`,
      `${material} yarn`,
      'textile',
      'spinning',
      ['spindle'],
      [product(prepared)],
    );
    add(
      `${material}-cloth`,
      `Plain ${material} cloth`,
      'textile',
      'weaving',
      ['loom', 'plain weaving and drying area'],
      [product(`${material}-yarn`)],
      ['cloth'],
    );
  }
  for (const material of ['linen', 'wool', 'cotton', 'hemp']) {
    const cloth = material === 'linen' ? 'linen' : `${material}-cloth`;
    const yarn = material === 'linen' ? 'flax-yarn' : `${material}-yarn`;
    add(
      `${material}-thread`,
      `${material} sewing thread`,
      'textile',
      'thread making',
      ['thread twisting tools'],
      [product(yarn)],
      ['thread'],
    );
    add(
      `${material}-clothing`,
      `Plain ${material} clothing`,
      'textile',
      'sewing',
      ['cutting tools and needles'],
      [product(cloth), product(`${material}-thread`)],
    );
    if (material === 'linen' || material === 'hemp') {
      add(
        `${material}-sack`,
        `${material} sack`,
        'textile',
        'sewing',
        ['cutting tools and needles'],
        [product(cloth), product(`${material}-thread`)],
        ['container'],
      );
      add(
        `${material}-tent-cover`,
        `${material} tent cover`,
        'textile',
        'sewing',
        ['cutting tools and needles'],
        [product(cloth), product(`${material}-thread`)],
        [],
        undefined,
        'Sewn tent covering only; no poles, ropes or pitched tent are implied.',
      );
    }
  }
  add(
    'hemp-cordage',
    'Hemp cordage',
    'fiber',
    'cordage making',
    ['fiber twisting tools'],
    [product('prepared-hemp')],
    ['cordage'],
  );
  add(
    'reed-cordage',
    'Reed cordage',
    'fiber',
    'cordage making',
    ['reed preparation and twisting tools'],
    [raw('reed-stems')],
    ['cordage'],
  );
  add(
    'reed-thatch',
    'Bound reed thatch',
    'fiber',
    'thatching',
    ['thatching and binding tools'],
    [raw('reed-stems'), product('reed-cordage')],
    ['roofing'],
  );
  add(
    'wood-shingles',
    'Wood shingles',
    'timber',
    'wood splitting',
    ['shingle splitting tools'],
    [product('sawn-timber')],
    ['roofing'],
  );
  add(
    'slate-roofing',
    'Slate roofing pieces',
    'stone',
    'stone dressing',
    ['slate splitting tools', 'selection of sound cleavable slate'],
    [raw('slate')],
    ['roofing'],
  );
  add(
    'prepared-clay',
    'Prepared clay body',
    'ceramics',
    'clay preparation',
    ['clay sorting and levigation equipment', 'suitable firing clay and sand temper selection'],
    [raw('clay'), raw('generic-sand'), water()],
  );
  for (const [key, name, technique, use] of [
    ['unglazed-pottery', 'Unglazed pottery', 'pottery firing', 'container'],
    ['fired-bricks', 'Fired clay bricks', 'brick firing', 'masonry'],
    ['clay-roof-tiles', 'Clay roofing tiles', 'tile firing', 'roofing'],
  ] as const)
    add(
      key,
      name,
      'ceramics',
      technique,
      ['suitable kiln', 'shaping and molding tools', 'controlled drying and firing'],
      [product('prepared-clay'), fuel()],
      [use],
    );
  add(
    'quicklime',
    'Quicklime',
    'lime',
    'lime burning',
    ['lime kiln', 'suitable limestone selection'],
    [raw('limestone'), fuel()],
  );
  add(
    'slaked-lime',
    'Slaked lime',
    'lime',
    'lime slaking',
    ['slaking vessels and handling equipment'],
    [product('quicklime'), water()],
  );
  add(
    'lime-mortar',
    'Lime mortar',
    'lime',
    'mortar mixing',
    ['mixing tools', 'suitable clean aggregate selection'],
    [product('slaked-lime'), raw('generic-sand'), water()],
    ['masonry'],
  );
  for (const [key, name, use] of [
    ['wood-furniture', 'Plain wooden furniture', 'furniture'],
    ['wood-box', 'Wooden box', 'container'],
  ] as const)
    add(
      key,
      name,
      'timber',
      'woodworking',
      ['joinery tools for fitted wooden pegs and joints'],
      [product('sawn-timber'), product('sawn-timber')],
      [use],
    );
  add(
    'papyrus-sheet',
    'Papyrus writing sheet',
    'fiber',
    'papyrus sheet making',
    ['strip cutting tools', 'pressing and drying equipment'],
    [raw('papyrus-stems'), water()],
    ['writing-material'],
  );
  add(
    'rendered-beeswax',
    'Rendered beeswax',
    'lighting',
    'wax rendering',
    ['rendering vessels', 'wax separation and filtering equipment'],
    [raw('wax-bearing-comb'), water(), fuel()],
  );
  add(
    'industrial-tallow',
    'Industrial tallow',
    'lighting',
    'fat rendering',
    ['rendering and straining equipment'],
    [raw('cow-fat', 'sheep-fat'), fuel()],
  );
  for (const [key, name, wax] of [
    ['beeswax-candle', 'Beeswax candle', 'rendered-beeswax'],
    ['tallow-candle', 'Tallow candle', 'industrial-tallow'],
  ])
    add(
      key,
      name,
      'lighting',
      'candle making',
      ['wax or fat melting vessel', 'candle forming tools'],
      [product(wax), product('linen-thread'), fuel()],
      ['lighting'],
    );
  for (const [key, name, use] of [
    ['iron-knife', 'Simple iron knife', 'hand-tool'],
    ['iron-fittings', 'Iron fittings', null],
    ['iron-cookpot', 'Iron cookpot', 'cookware'],
    ['iron-armor-plates', 'Iron armor plates', 'armor-component'],
  ] as const)
    add(
      key,
      name,
      'iron',
      'forging',
      ['forge, hammer and anvil', 'product-specific forging tools'],
      [
        product('bloomery-iron'),
        { ...product('charcoal'), role: 'fuel' },
        ...(key === 'iron-knife'
          ? [
              {
                role: 'material' as const,
                foodUse: 'support' as const,
                selector: {
                  kind: 'raw' as const,
                  majorType: 'wood',
                  minorTypes: [],
                  resourceNames: [],
                },
              },
            ]
          : []),
      ],
      use ? [use] : [],
    );
  add(
    'bone-ornament',
    'Carved bone ornament',
    'ornament',
    'bone carving',
    ['bone cleaning, carving and dry finishing tools'],
    [raw('cow-bone', 'goat-bone', 'sheep-bone'), water()],
    ['ornament'],
  );
  for (const color of ['red', 'yellow'])
    add(
      `${color}-ochre-pigment`,
      `${color} ochre pigment`,
      'pigment',
      'pigment preparation',
      ['washing, grinding and drying equipment'],
      [raw(`${color}-ochre-earth`), water()],
      ['pigment'],
    );
  for (const grain of ['wheat', 'rye']) {
    add(
      `${grain}-flour`,
      `${grain} flour`,
      'food',
      'grain milling',
      ['grain cleaning tools', 'mill or hand quern'],
      [ingredient(raw(`${grain}-grain`))],
      ['food-ingredient'],
      'ingredient',
    );
    add(
      `${grain}-dough`,
      `${grain} dough`,
      'food',
      'dough preparation',
      ['mixing vessels and tools', 'appropriate food handling'],
      [ingredient(product(`${grain}-flour`)), water('ingredient')],
      ['food-ingredient'],
      'ingredient',
    );
    add(
      `${grain}-bread`,
      `Unleavened ${grain} bread`,
      'food',
      'baking',
      ['baking hearth or griddle', 'appropriate cooking and food handling'],
      [ingredient(product(`${grain}-dough`)), fuel()],
      ['prepared-food'],
      'provision',
    );
  }
  add(
    'prepared-oats',
    'Prepared oat groats',
    'food',
    'grain preparation',
    ['cleaning and dehulling tools'],
    [ingredient(raw('oat-grain'))],
    ['food-ingredient'],
    'ingredient',
  );
  for (const [key, name, input] of [
    ['oat-porridge', 'Oat porridge', product('prepared-oats')],
    ['barley-porridge', 'Barley porridge', raw('barley-grain')],
    ['cooked-lentils', 'Cooked lentils', raw('lentil-seed')],
    ['cooked-peas', 'Cooked peas', raw('pea-seed')],
  ] as const)
    add(
      key,
      name,
      'food',
      'cooking',
      [
        'grain or pulse cleaning and preparation tools',
        'cooking vessels and hearth',
        'appropriate cooking and food handling',
      ],
      [ingredient(input), water('ingredient'), fuel()],
      ['prepared-food'],
      'provision',
    );
  for (const [key, name, source] of [
    ['dried-apple', 'Dried apple', 'apple-fruit'],
    ['dried-pear', 'Dried pear', 'pear-fruit'],
    ['dried-plum', 'Dried plum', 'plum-fruit'],
    ['raisins', 'Raisins', 'grape-fruit'],
    ['dried-carrot', 'Dried carrot', 'carrot-root'],
    ['dried-onion', 'Dried onion', 'onion-bulb'],
  ])
    add(
      key,
      name,
      'food',
      key === 'dried-carrot' || key === 'dried-onion' ? 'vegetable drying' : 'fruit drying',
      [
        'washing and trimming tools',
        'pit removal where applicable',
        'controlled drying racks and suitable drying conditions',
        'dry protected storage and appropriate food handling',
      ],
      [ingredient(raw(source)), water('process-water')],
      ['preserved-food'],
      'provision',
    );
  add(
    'extracted-honey',
    'Extracted honey',
    'food',
    'honey separation',
    ['honey separation and filtering equipment', 'appropriate food handling'],
    [ingredient(raw('honeycomb'))],
    ['food-ingredient'],
    'ingredient',
  );
  add(
    'grape-must',
    'Grape must',
    'food',
    'fruit pressing',
    ['fruit crushing and pressing equipment', 'appropriate food handling'],
    [ingredient(raw('grape-fruit'))],
    ['food-ingredient'],
    'ingredient',
  );
  add(
    'grape-wine',
    'Grape wine',
    'food',
    'fermentation',
    [
      'fermentation vessels',
      'suitable ripe grapes and naturally occurring grape yeasts',
      'controlled fermentation and appropriate food handling',
    ],
    [ingredient(product('grape-must'))],
    ['beverage'],
    'provision',
    'Selected natural grape fermentation; no added sugar, purchased yeast, dilution or fortification.',
  );
  result.at(-1)!.reviewRefs = ['https://www.fao.org/4/x0560E/x0560e09.htm'];
  add(
    'wine-vinegar',
    'Wine vinegar',
    'food',
    'acetification',
    [
      'acetification vessels',
      'naturally occurring acetic acid bacteria and suitable aeration',
      'controlled acetification and appropriate food handling',
    ],
    [ingredient(product('grape-wine'))],
    ['food-ingredient'],
    'ingredient',
  );
  add(
    'fresh-acid-cheese',
    'Fresh acid-coagulated cheese',
    'food',
    'fresh cheese making',
    [
      'heating vessel and hearth',
      'reusable straining cloth and draining equipment',
      'controlled heat and acid coagulation',
      'appropriate fresh-food handling; no storage-life claim',
    ],
    [
      ingredient(raw('cow-milk', 'goat-milk', 'sheep-milk')),
      ingredient(product('wine-vinegar')),
      fuel(),
    ],
    ['prepared-food'],
    'provision',
  );
  return result;
}
