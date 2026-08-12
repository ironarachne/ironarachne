import type { Resource } from './resource_types';

/**
 * The metal ore table.
 *
 * Shared and read-only: nothing in the library writes to a resource, and callers that keep one
 * should copy it rather than hold a reference into this array.
 */
export const METAL_ORES: Resource[] = [
  {
    name: 'iron ore',
    description: 'A common metal known for its strength and versatility.',
    major_type: 'metal',
    minor_type: 'ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of iron to conduct electricity.',
        value: 10.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which iron melts.',
        value: 1538,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of iron.',
        value: 7874, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of iron on the Mohs scale.',
        value: 4,
      },
    ],
    commonality: 5,
  },
  {
    name: 'copper ore',
    description: 'A ductile metal with high thermal and electrical conductivity.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of copper to conduct electricity.',
        value: 58.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which copper melts.',
        value: 1085,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of copper.',
        value: 8960, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of copper on the Mohs scale.',
        value: 3,
      },
    ],
    commonality: 4,
  },
  {
    name: 'aluminum ore',
    description: 'A lightweight, corrosion-resistant metal used in various applications.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of aluminum to conduct electricity.',
        value: 37.7, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which aluminum melts.',
        value: 660.3,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of aluminum.',
        value: 2700, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of aluminum on the Mohs scale.',
        value: 2.75,
      },
    ],
    commonality: 3,
  },
  {
    name: 'gold ore',
    description: 'A precious metal known for its rarity and value.',
    major_type: 'metal',
    minor_type: 'noble',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of gold to conduct electricity.',
        value: 45.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which gold melts.',
        value: 1064,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of gold.',
        value: 19300, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of gold on the Mohs scale.',
        value: 2.5,
      },
    ],
    commonality: 2,
  },
  {
    name: 'silver ore',
    description: 'A precious metal with high conductivity and luster.',
    major_type: 'metal',
    minor_type: 'noble',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of silver to conduct electricity.',
        value: 63.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which silver melts.',
        value: 961.8,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of silver.',
        value: 10500, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of silver on the Mohs scale.',
        value: 2.5,
      },
    ],
    commonality: 1,
  },
  {
    name: 'platinum ore',
    description: 'A rare, precious metal known for its resistance to corrosion.',
    major_type: 'metal',
    minor_type: 'noble',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of platinum to conduct electricity.',
        value: 9.4, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which platinum melts.',
        value: 1768,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of platinum.',
        value: 21400, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of platinum on the Mohs scale.',
        value: 4.3,
      },
    ],
    commonality: 1,
  },
  {
    name: 'titanium ore',
    description: 'A strong, lightweight metal known for its corrosion resistance.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of titanium to conduct electricity.',
        value: 7.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which titanium melts.',
        value: 1668,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of titanium.',
        value: 4500, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of titanium on the Mohs scale.',
        value: 6,
      },
    ],
    commonality: 2,
  },
  {
    name: 'nickel ore',
    description: 'A strong, corrosion-resistant metal often used in alloys.',
    major_type: 'metal',
    minor_type: 'ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of nickel to conduct electricity.',
        value: 14.3, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which nickel melts.',
        value: 1455,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of nickel.',
        value: 8900, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of nickel on the Mohs scale.',
        value: 4,
      },
    ],
    commonality: 3,
  },
  {
    name: 'zinc ore',
    description: 'A metal used primarily for galvanization and alloying.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of zinc to conduct electricity.',
        value: 16.6, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which zinc melts.',
        value: 419.5,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of zinc.',
        value: 7135, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of zinc on the Mohs scale.',
        value: 2.5,
      },
    ],
    commonality: 4,
  },
  {
    name: 'lead ore',
    description: 'A heavy metal known for its high density and malleability.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of lead to conduct electricity.',
        value: 4.8, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which lead melts.',
        value: 327.5,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of lead.',
        value: 11340, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of lead on the Mohs scale.',
        value: 1.5,
      },
    ],
    commonality: 3,
  },
  {
    name: 'tin ore',
    description: 'A soft, malleable metal often used in alloys and coatings.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of tin to conduct electricity.',
        value: 9.2, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which tin melts.',
        value: 231.9,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of tin.',
        value: 7310, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of tin on the Mohs scale.',
        value: 1.5,
      },
    ],
    commonality: 4,
  },
  {
    name: 'tungsten ore',
    description: 'A dense metal with the highest melting point of all elements.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of tungsten to conduct electricity.',
        value: 18.2, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which tungsten melts.',
        value: 3422,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of tungsten.',
        value: 19300, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of tungsten on the Mohs scale.',
        value: 7.5,
      },
    ],
    commonality: 1,
  },
  {
    name: 'molybdenum ore',
    description: 'A strong metal with a high melting point, used in steel alloys.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of molybdenum to conduct electricity.',
        value: 20.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which molybdenum melts.',
        value: 2623,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of molybdenum.',
        value: 10220, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of molybdenum on the Mohs scale.',
        value: 5.5,
      },
    ],
    commonality: 1,
  },
  {
    name: 'chromium ore',
    description: 'A hard, brittle metal used in stainless steel and alloys.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of chromium to conduct electricity.',
        value: 6.9, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which chromium melts.',
        value: 1907,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of chromium.',
        value: 7190, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of chromium on the Mohs scale.',
        value: 8.5,
      },
    ],
    commonality: 2,
  },
  {
    name: 'vanadium ore',
    description: 'A strong metal used in steel alloys and catalysts.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of vanadium to conduct electricity.',
        value: 5.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which vanadium melts.',
        value: 1910,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of vanadium.',
        value: 6100, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of vanadium on the Mohs scale.',
        value: 7,
      },
    ],
    commonality: 2,
  },
  {
    name: 'tantalum ore',
    description: 'A rare, corrosion-resistant metal used in electronics and medical devices.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of tantalum to conduct electricity.',
        value: 7.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which tantalum melts.',
        value: 3017,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of tantalum.',
        value: 16650, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of tantalum on the Mohs scale.',
        value: 6.5,
      },
    ],
    commonality: 1,
  },
  {
    name: 'zirconium ore',
    description:
      'A strong, corrosion-resistant metal used in nuclear reactors and chemical processing.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of zirconium to conduct electricity.',
        value: 6.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which zirconium melts.',
        value: 1855,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of zirconium.',
        value: 6550, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of zirconium on the Mohs scale.',
        value: 5,
      },
    ],
    commonality: 2,
  },
  {
    name: 'hafnium ore',
    description: 'A dense, corrosion-resistant metal used in nuclear reactors and electronics.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of hafnium to conduct electricity.',
        value: 5.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which hafnium melts.',
        value: 2233,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of hafnium.',
        value: 13150, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of hafnium on the Mohs scale.',
        value: 5.5,
      },
    ],
    commonality: 1,
  },
  {
    name: 'rhenium ore',
    description:
      'A rare, dense metal with a high melting point, used in high-temperature applications.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of rhenium to conduct electricity.',
        value: 1.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which rhenium melts.',
        value: 3186,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of rhenium.',
        value: 21020, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of rhenium on the Mohs scale.',
        value: 7,
      },
    ],
    commonality: 1,
  },
  {
    name: 'bismuth ore',
    description:
      'A brittle metal with low thermal conductivity, often used in cosmetics and pharmaceuticals.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of bismuth to conduct electricity.',
        value: 0.97, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which bismuth melts.',
        value: 271.4,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of bismuth.',
        value: 9800, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of bismuth on the Mohs scale.',
        value: 2.25,
      },
    ],
    commonality: 3,
  },
  {
    name: 'indium ore',
    description: 'A soft, malleable metal used in electronics and alloys.',
    major_type: 'metal',
    minor_type: 'non-ferrous',
    is_refineable: true,
    properties: [
      {
        name: 'conductivity',
        description: 'The ability of indium to conduct electricity.',
        value: 3.0, // S/m
      },
      {
        name: 'melting_point',
        description: 'The temperature at which indium melts.',
        value: 156.6,
      },
      {
        name: 'density',
        description: 'The mass per unit volume of indium.',
        value: 7300, // kg/m³
      },
      {
        name: 'hardness',
        description: 'The hardness of indium on the Mohs scale.',
        value: 1.2,
      },
    ],
    commonality: 2,
  },
];
