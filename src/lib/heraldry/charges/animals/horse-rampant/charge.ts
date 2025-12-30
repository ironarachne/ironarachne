import type { Charge } from "../../charge-types.js";
import horseRampantSVG from "./horse-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const horseRampant: Charge = {
  name: "horse rampant",
  pluralName: "horses rampant",
  SVG: horseRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["horse", "rampant", "animals"],
};
