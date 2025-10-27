import type { Charge } from "../../charge-types.js";
import foxSejantSVG from "./fox-sejant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const foxSejant: Charge = {
  name: "fox sejant",
  pluralName: "foxes sejant",
  SVG: foxSejantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "fox", "cunning"],
};
