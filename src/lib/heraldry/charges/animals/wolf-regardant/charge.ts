import type { Charge } from "../../charge-types.js";
import wolfRegardantSVG from "./wolf-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wolfRegardant: Charge = {
  name: "wolf regardant",
  pluralName: "wolves regardant",
  SVG: wolfRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["regardant", "wolf", "animals"],
};
