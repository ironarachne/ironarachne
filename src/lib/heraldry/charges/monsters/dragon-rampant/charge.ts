import type { Charge } from "../../charge-types.js";
import dragonRampantSVG from "./dragon-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const dragonRampant: Charge = {
  name: "dragon rampant",
  pluralName: "dragons rampant",
  SVG: dragonRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monster", "dragon", "strength"],
};
