import type { Charge } from "../../charge-types.js";
import crownSVG from "./crown.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const crown: Charge = {
  name: "crown",
  pluralName: "crowns",
  SVG: crownSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["crown", "objects"],
};
