import type { Charge } from "../../charge-types.js";
import moonSVG from "./moon.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const moon: Charge = {
  name: "moon",
  pluralName: "moons",
  SVG: moonSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["moon", "symbols"],
};
