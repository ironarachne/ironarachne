import type { Charge } from "../../charge-types.js";
import foxRegardantSVG from "./fox-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const foxRegardant: Charge = {
  name: "fox regardant",
  pluralName: "foxes regardant",
  SVG: foxRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "fox", "animals"],
};
