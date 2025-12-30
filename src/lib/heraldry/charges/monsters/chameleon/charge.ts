import type { Charge } from "../../charge-types.js";
import chameleonSVG from "./chameleon.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const chameleon: Charge = {
  name: "chameleon",
  pluralName: "chameleons",
  SVG: chameleonSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "chameleon"],
};
