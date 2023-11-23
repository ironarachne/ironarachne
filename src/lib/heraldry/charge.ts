import type Tincture from "./tincture.js";

export default interface Charge {
  name: string;
  pluralName: string;
  chargeType: string;
  tincture: Tincture;
  SVG: string;
  tags: string[];
}
