import type { Charge } from "../../charge-types.js";
import dragonPassantSVG from "./dragon-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const dragonPassant: Charge = {
  name: "dragon passant",
  pluralName: "dragons passant",
  SVG: dragonPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "passant", "dragon"],
};
