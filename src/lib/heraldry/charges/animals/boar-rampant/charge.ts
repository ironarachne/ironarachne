import type { Charge } from "../../charge-types.js";
import boarRampantSVG from "./boar-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const boarRampant: Charge = {
  name: "boar rampant",
  pluralName: "boars rampant",
  SVG: boarRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["boar", "rampant", "animals"],
};
