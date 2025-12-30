import type { Charge } from "../../charge-types.js";
import leopardSalientSVG from "./leopard-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const leopardSalient: Charge = {
  name: "leopard salient",
  pluralName: "leopards salient",
  SVG: leopardSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["salient", "leopard", "animals"],
};
