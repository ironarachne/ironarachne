import type { Resource } from './resource_types';

/**
 * Curated building materials for architecture and trade (timber, stone, earth, roofing).
 * Density values are kg/m³ where given; hardness is Mohs-like relative scale for non-geologic materials.
 */
export function getBuildingMaterialResources(): Resource[] {
  return [
    {
      name: 'oak timber',
      description: 'Dense hardwood used for framing and durable joinery.',
      major_type: 'wood',
      minor_type: 'hardwood',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Typical seasoned density.', value: 720 },
        { name: 'hardness', description: 'Relative workability vs wear.', value: 6 },
      ],
      commonality: 5,
    },
    {
      name: 'pine timber',
      description: 'Light softwood easy to work; common for frames and boards.',
      major_type: 'wood',
      minor_type: 'softwood',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Typical seasoned density.', value: 510 },
        { name: 'hardness', description: 'Relative workability vs wear.', value: 3.5 },
      ],
      commonality: 6,
    },
    {
      name: 'bamboo pole',
      description: 'Hollow grass culms with high strength-to-weight for light structures.',
      major_type: 'bamboo',
      minor_type: 'structural',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Typical air-dry density.', value: 380 },
        { name: 'hardness', description: 'Surface hardness.', value: 4 },
      ],
      commonality: 4,
    },
    {
      name: 'granite ashlar',
      description: 'Hard igneous stone for load-bearing walls and foundations.',
      major_type: 'stone',
      minor_type: 'igneous',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Bulk density.', value: 2690 },
        { name: 'hardness', description: 'Mohs scale.', value: 6.5 },
      ],
      commonality: 4,
    },
    {
      name: 'sandstone block',
      description: 'Sedimentary stone easy to carve; softer than granite.',
      major_type: 'stone',
      minor_type: 'sedimentary',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Bulk density.', value: 2300 },
        { name: 'hardness', description: 'Mohs scale.', value: 4 },
      ],
      commonality: 5,
    },
    {
      name: 'slate tile',
      description: 'Foliated stone splitting into thin strong plates for roofs.',
      major_type: 'stone',
      minor_type: 'metamorphic',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Bulk density.', value: 2850 },
        { name: 'hardness', description: 'Mohs scale.', value: 5.5 },
      ],
      commonality: 3,
    },
    {
      name: 'fired brick',
      description: 'Clay units fired for strength; standard masonry unit.',
      major_type: 'brick',
      minor_type: 'ceramic',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Bulk density.', value: 1920 },
        { name: 'hardness', description: 'Scratch resistance.', value: 4 },
      ],
      commonality: 6,
    },
    {
      name: 'adobe brick',
      description: 'Sun-dried earth blocks; high thermal mass, needs protection from rain.',
      major_type: 'earth',
      minor_type: 'adobe',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Bulk density.', value: 1700 },
        { name: 'hardness', description: 'Surface hardness.', value: 2 },
      ],
      commonality: 5,
    },
    {
      name: 'rammed earth',
      description: 'Compacted layered soil in formwork; monolithic walls.',
      major_type: 'earth',
      minor_type: 'rammed',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Bulk density.', value: 2000 },
        { name: 'hardness', description: 'Surface hardness.', value: 3 },
      ],
      commonality: 3,
    },
    {
      name: 'lime plaster',
      description: 'Breathable finish coat over masonry or lath.',
      major_type: 'lime',
      minor_type: 'plaster',
      is_refineable: true,
      properties: [
        { name: 'density', description: 'Dry coat density.', value: 1600 },
        { name: 'hardness', description: 'Surface hardness.', value: 2.5 },
      ],
      commonality: 5,
    },
    {
      name: 'straw thatch',
      description: 'Thick roof covering from bundled straw; insulates well when steep.',
      major_type: 'thatch',
      minor_type: 'straw',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Packed bundle density.', value: 120 },
        { name: 'hardness', description: 'N/A for bundles.', value: 1 },
      ],
      commonality: 5,
    },
    {
      name: 'reed thatch',
      description: 'Roofing from marsh reeds; durable in wet climates when detailed correctly.',
      major_type: 'thatch',
      minor_type: 'reed',
      is_refineable: false,
      properties: [
        { name: 'density', description: 'Packed bundle density.', value: 150 },
        { name: 'hardness', description: 'N/A for bundles.', value: 1 },
      ],
      commonality: 4,
    },
  ];
}
