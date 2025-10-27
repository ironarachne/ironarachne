import type { Charge } from "../../charge-types.js";
import hareSVG from "./hare.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const hare: Charge = {
  name: "hare",
  pluralName: "hares",
  SVG: hareSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "hare", "fertility"],
};
