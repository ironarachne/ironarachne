import type { Charge } from "../../charge-types.js";
import falconRisingSVG from "./falcon-rising.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const falconRising: Charge = {
  name: "falcon rising",
  pluralName: "falcons rising",
  SVG: falconRisingSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["rising", "falcon", "animals"],
};
