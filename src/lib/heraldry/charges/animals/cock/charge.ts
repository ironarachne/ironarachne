import type { Charge } from "../../charge-types.js";
import cockSVG from "./cock.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const cock: Charge = {
  name: "cock",
  pluralName: "cocks",
  SVG: cockSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "cock", "vigilance"],
};
