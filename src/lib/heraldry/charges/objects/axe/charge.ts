import type { Charge } from "../../charge-types.js";
import axeSVG from "./axe.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const axe: Charge = {
  name: "axe",
  pluralName: "axes",
  SVG: axeSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["axe", "objects"],
};
