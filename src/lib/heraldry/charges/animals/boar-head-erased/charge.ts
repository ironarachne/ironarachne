import type { Charge } from "../../charge-types.js";
import boarHeadErasedSVG from "./boar-head-erased.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const boarHeadErased: Charge = {
  name: "boar head erased",
  pluralName: "boar heads erased",
  SVG: boarHeadErasedSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["animal", "boar", "heraldry"],
};
