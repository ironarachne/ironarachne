import type { Charge } from "../../charge-types.js";
import falconVolantSVG from "./falcon-volant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const falconVolant: Charge = {
  name: "falcon volant",
  pluralName: "falcons volant",
  SVG: falconVolantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["volant", "falcon", "animals"],
};
