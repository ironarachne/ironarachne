import type { Charge } from "../../charge-types.js";
import oxRampantSVG from "./ox-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const oxRampant: Charge = {
  name: "ox rampant",
  pluralName: "oxes rampant",
  SVG: oxRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["ox", "rampant", "animals"],
};
