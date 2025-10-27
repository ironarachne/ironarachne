import type { Charge } from "../../charge-types.js";
import tigerRampantSVG from "./tiger-rampant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const tigerRampant: Charge = {
  name: "tiger rampant",
  pluralName: "tigers rampant",
  SVG: tigerRampantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "tiger", "ferocity"],
};
