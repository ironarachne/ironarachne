import type { Charge } from "../../charge-types.js";
import twoAxesInSaltireSVG from "./two-axes-in-saltire.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const twoAxesInSaltire: Charge = {
  name: "two axes in saltire",
  pluralName: "twos axes in saltire",
  SVG: twoAxesInSaltireSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["in", "axes", "two", "objects", "saltire"],
};
