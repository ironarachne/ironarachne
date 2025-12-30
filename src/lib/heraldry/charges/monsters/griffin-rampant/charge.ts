import type { Charge } from "../../charge-types.js";
import griffinRampantSVG from "./griffin-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const griffinRampant: Charge = {
  name: "griffin rampant",
  pluralName: "griffins rampant",
  SVG: griffinRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "rampant", "griffin"],
};
