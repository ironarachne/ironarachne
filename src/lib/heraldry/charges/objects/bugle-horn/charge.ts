import type { Charge } from "../../charge-types.js";
import bugleHornSVG from "./bugle-horn.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const bugleHorn: Charge = {
  name: "bugle horn",
  pluralName: "bugles horn",
  SVG: bugleHornSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["horn", "bugle", "objects"],
};
