import type { Charge } from "../../charge-types.js";
import compassSVG from "./compass.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const compass: Charge = {
  name: "compass",
  pluralName: "compasses",
  SVG: compassSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["compass", "objects"],
};
