import type { RNG } from '@ironarachne/rng';
import type { Field } from './field.js';

/** Reduces anti-aliasing hairlines between abutting division shapes inside the shield pattern. */
const CRISP = 'shape-rendering="crispEdges"';

/**
 * Per-bend shared edge (0,0)-(600,660): nudge the dexter-base triangle ~2px across the line into
 * the sinister-chief triangle so rasterization does not leave a transparent seam.
 */
const BEND_DEXTER_BASE_OVERLAP =
  '1.4799,-1.3453 601.4799,658.6547 0,660';

/**
 * Per bend sinister: shared edge (600,0)-(0,660); nudge the chief triangle across into the base.
 */
const BEND_SINISTER_CHIEF_OVERLAP =
  '0,0 601.4799,1.3453 1.4799,661.3453';

export function all(): Field[] {
  return [
    {
      name: 'plain',
      blazon: 'variation1',
      variationCount: 1,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><rect x="0" y="0" width="600" height="660" fill="url(#variation1)"/></g></pattern>`,
      commonality: 10,
      variations: [],
    },
    {
      name: 'fess',
      blazon: 'per fess variation1 and variation2',
      variationCount: 2,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><rect x="0" y="0" width="600" height="331" fill="url(#variation1)"/><rect x="0" y="329" width="600" height="331" fill="url(#variation2)"/></g></pattern>`,
      commonality: 5,
      variations: [],
    },
    {
      name: 'pale',
      blazon: 'per pale variation1 and variation2',
      variationCount: 2,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><rect x="0" y="0" width="301" height="660" fill="url(#variation1)"/><rect x="299" y="0" width="301" height="660" fill="url(#variation2)"/></g></pattern>`,
      commonality: 5,
      variations: [],
    },
    {
      name: 'bend',
      blazon: 'per bend variation1 and variation2',
      variationCount: 2,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><polygon points="0,0 600,660 600,0" fill="url(#variation2)"/><polygon points="${BEND_DEXTER_BASE_OVERLAP}" fill="url(#variation1)"/></g></pattern>`,
      commonality: 5,
      variations: [],
    },
    {
      name: 'bend sinister',
      blazon: 'per bend sinister variation1 and variation2',
      variationCount: 2,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><polygon points="600,0 600,660 0,660" fill="url(#variation2)"/><polygon points="${BEND_SINISTER_CHIEF_OVERLAP}" fill="url(#variation1)"/></g></pattern>`,
      commonality: 5,
      variations: [],
    },
    {
      name: 'quarterly',
      blazon: 'quarterly variation1 and variation2',
      variationCount: 2,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><rect x="0" y="0" width="301" height="331" fill="url(#variation1)"/><rect x="299" y="0" width="301" height="331" fill="url(#variation2)"/><rect x="299" y="329" width="301" height="331" fill="url(#variation1)"/><rect x="0" y="329" width="301" height="331" fill="url(#variation2)"/></g></pattern>`,
      commonality: 5,
      variations: [],
    },
    {
      name: 'saltire',
      blazon: 'per saltire variation1 and variation2',
      variationCount: 2,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><polygon points="0,0 600,0 300,330" fill="url(#variation1)"/><polygon points="600,0 600,660 300,330" fill="url(#variation2)"/><polygon points="300,330 600,660 0,660" fill="url(#variation1)"/><polygon points="0,0 300,330 0,660" fill="url(#variation2)"/></g></pattern>`,
      commonality: 2,
      variations: [],
    },
    {
      name: 'chevron',
      blazon: 'per chevron variation1 and variation2',
      variationCount: 2,
      pattern: `<pattern id="Division" x="0" y="0" width="1" height="1"><g ${CRISP}><rect x="0" y="0" width="600" height="660" fill="url(#variation1)"/><polygon points="0,660 300,328 600,660" fill="url(#variation2)"/></g></pattern>`,
      commonality: 2,
      variations: [],
    },
  ];
}

export function random(rng: RNG): Field {
  const options = all();
  return rng.item(options);
}

export function randomFrom(fields: Field[], rng: RNG): Field {
  return rng.item(fields);
}
