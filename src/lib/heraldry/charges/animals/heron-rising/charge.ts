import type { Charge } from "../../charge-types.js";
import heronRisingSVG from "./heron-rising.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const heronRising: Charge = {
  name: "heron rising",
  pluralName: "herons rising",
  SVG: heronRisingSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rising", "heron", "animals"],
};
