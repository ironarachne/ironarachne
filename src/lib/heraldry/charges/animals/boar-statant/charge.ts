import type { Charge } from "../../charge-types.js";
import boarStatantSVG from "./boar-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const boarStatant: Charge = {
  name: "boar statant",
  pluralName: "boars statant",
  SVG: boarStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["boar", "statant", "animals"],
};
