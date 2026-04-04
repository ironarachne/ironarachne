import { type Tincture } from '../tinctures.js';

export type Charge = {
  name: string;
  pluralName: string;
  chargeType: string;
  tincture: Tincture;
  SVG: string;
  tags: string[];
};
