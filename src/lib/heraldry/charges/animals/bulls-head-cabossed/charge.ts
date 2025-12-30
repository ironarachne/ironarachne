import type { Charge } from "../../charge-types.js";
import bullsHeadCabossedSVG from "./bulls-head-cabossed.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const bullsHeadCabossed: Charge = {
  name: "bulls head cabossed",
  pluralName: "bullses head cabossed",
  SVG: bullsHeadCabossedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["cabossed", "bulls", "head", "animals"],
};
