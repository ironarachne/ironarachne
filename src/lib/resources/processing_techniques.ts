import type { ProcessingTechniqueDefinition } from './processing_types';

const groups: [string[], string[]][] = [
  [
    [
      'woodworking',
      'weaving',
      'fiber preparation',
      'spinning',
      'charcoal making',
      'bloomery smelting',
      'forging',
      'smoking',
      'drying',
      'stone dressing',
    ],
    ['https://github.com/ironarachne/ironarachne/issues/339'],
  ],
  [
    [
      'wool preparation',
      'cotton preparation',
      'thread making',
      'sewing',
      'cordage making',
      'thatching',
      'wood splitting',
    ],
    [
      'https://www.fao.org/4/x5672e/x5672e05.htm',
      'https://www.cotton.org/pubs/cottoncounts/story/spun-and-woven.cfm',
      'https://www.cotton.org/pubs/cottoncounts/fieldtofabric/gin.cfm',
      'https://www.fao.org/fileadmin/templates/ess/documents/meetings_and_workshops/faounido/4.d._Defining_AgroIndustry_A_Statistical_Classification_Perspective.pdf',
    ],
  ],
  [
    [
      'clay preparation',
      'pottery firing',
      'brick firing',
      'tile firing',
      'lime burning',
      'lime slaking',
      'mortar mixing',
    ],
    ['https://www.fao.org/4/s1250e/S1250E07.htm'],
  ],
  [
    ['papyrus sheet making'],
    ['https://apps.lib.umich.edu/files/collections/papyrus/exhibits/papyrus_making/slides.html'],
  ],
  [
    ['wax rendering', 'fat rendering', 'candle making', 'honey separation'],
    ['https://www.fao.org/4/w0076e/w0076e13.htm'],
  ],
  [
    ['grain milling', 'grain preparation', 'dough preparation', 'baking', 'cooking'],
    ['https://www.fao.org/4/x5434e/x5434e06.htm'],
  ],
  [
    ['fruit drying', 'vegetable drying', 'fruit pressing', 'fermentation', 'acetification'],
    ['https://www.fao.org/4/x0560E/x0560e10.htm', 'https://www.fao.org/4/t0073e/T0073E06.htm'],
  ],
  [['fresh cheese making'], ['https://www.fao.org/4/t0251e/T0251E12.htm']],
  [['pigment preparation'], ['https://www.britishmuseum.org/collection/object/W_1947-1013-3']],
  [['bone carving'], ['https://www.britishmuseum.org/collection/object/Y_EA68377']],
];
export function getProcessingTechniques(): ProcessingTechniqueDefinition[] {
  return groups.flatMap(([names, refs]) =>
    names.map((technique) => ({
      technique,
      reviewRefs: [...refs],
      reviewNote:
        "Qualitative fantasy craft capability under the recipe's explicit material and equipment requirements; no yield or industrial throughput claim.",
    })),
  );
}
