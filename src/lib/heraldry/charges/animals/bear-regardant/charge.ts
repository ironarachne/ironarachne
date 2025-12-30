import type { Charge } from "../../charge-types.js";
import bearRegardantSVG from "./bear-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const bearRegardant: Charge = {
  name: "bear regardant",
  pluralName: "bears regardant",
  SVG: bearRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "bear", "animals"],
};
