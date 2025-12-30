import type { Charge } from "../../charge-types.js";
import goatSalientSVG from "./goat-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const goatSalient: Charge = {
  name: "goat salient",
  pluralName: "goats salient",
  SVG: goatSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["salient", "goat", "animals"],
};
