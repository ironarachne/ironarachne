import type { Charge } from "../../charge-types.js";
import fleurDeLisSVG from "./fleur-de-lis.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const fleurDeLis: Charge = {
  name: "fleur-de-lis",
  pluralName: "fleur-de-lises",
  SVG: fleurDeLisSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["fleur-de-lis", "plants"],
};
