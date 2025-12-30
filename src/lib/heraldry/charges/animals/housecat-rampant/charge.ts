import type { Charge } from "../../charge-types.js";
import housecatRampantSVG from "./housecat-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const housecatRampant: Charge = {
  name: "housecat rampant",
  pluralName: "housecats rampant",
  SVG: housecatRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["housecat", "rampant", "animals"],
};
