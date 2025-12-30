import type { Charge } from "../../charge-types.js";
import wyvernPassantSVG from "./wyvern-passant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const wyvernPassant: Charge = {
  name: "wyvern passant",
  pluralName: "wyverns passant",
  SVG: wyvernPassantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["monsters", "passant", "wyvern"],
};
