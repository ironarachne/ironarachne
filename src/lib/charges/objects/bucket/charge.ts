import type { ChargeGlyph } from '../../charge-types.js';
import bucketSVG from './bucket.svg?raw';

export const bucket: ChargeGlyph = {
  name: 'bucket',
  pluralName: 'buckets',
  SVG: bucketSVG,
  chargeType: 'regular',
  tags: ['bucket', 'objects'],
};
