import type { Charge } from "../../charge-types.js";
import stagStatantSVG from "./stag-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const stagStatant: Charge = {
  name: "stag statant",
  pluralName: "stags statant",
  SVG: stagStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "stag", "watchfulness"],
};
