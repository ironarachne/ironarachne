import type { Charge } from "../../charge-types.js";
import dragonRegardantSVG from "./dragon-regardant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const dragonRegardant: Charge = {
  name: "dragon regardant",
  pluralName: "dragons regardant",
  SVG: dragonRegardantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "regardant", "dragon"],
};
