import type { Charge } from "../../charge-types.js";
import antelopeSalientSVG from "./antelope-salient.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const antelopeSalient: Charge = {
  name: "antelope salient",
  pluralName: "antelopes salient",
  SVG: antelopeSalientSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["antelope", "salient", "animals"],
};
