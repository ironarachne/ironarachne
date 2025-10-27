import type { Charge } from "../../charge-types.js";
import stagLodgedSVG from "./stag-lodged.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const stagLodged: Charge = {
  name: "stag lodged",
  pluralName: "stags lodged",
  SVG: stagLodgedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "stag", "strength"],
};
