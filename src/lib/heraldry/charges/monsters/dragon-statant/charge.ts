import type { Charge } from "../../charge-types.js";
import dragonStatantSVG from "./dragon-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const dragonStatant: Charge = {
  name: "dragon statant",
  pluralName: "dragons statant",
  SVG: dragonStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "statant", "dragon"],
};
