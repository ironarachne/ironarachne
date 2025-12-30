import type { Charge } from "../../charge-types.js";
import antelopeCouchantSVG from "./antelope-couchant.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const antelopeCouchant: Charge = {
  name: "antelope couchant",
  pluralName: "antelopes couchant",
  SVG: antelopeCouchantSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["couchant", "antelope", "animals"],
};
