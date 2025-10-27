import type { Charge } from "../../charge-types.js";
import beeVolantSVG from "./bee-volant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const beeVolant: Charge = {
  name: "bee volant",
  pluralName: "bees volant",
  SVG: beeVolantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "bee", "diligence"],
};
