import type { Charge } from "../../charge-types.js";
import harePassantSVG from "./hare-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const harePassant: Charge = {
  name: "hare passant",
  pluralName: "hares passant",
  SVG: harePassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["hare", "passant", "animals"],
};
