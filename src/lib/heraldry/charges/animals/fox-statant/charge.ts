import type { Charge } from "../../charge-types.js";
import foxStatantSVG from "./fox-statant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const foxStatant: Charge = {
  name: "fox statant",
  pluralName: "foxes statant",
  SVG: foxStatantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["statant", "fox", "animals"],
};
