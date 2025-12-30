import type { Charge } from "../../charge-types.js";
import bucketSVG from "./bucket.svg?raw";
import * as Tinctures from "../../../tinctures.js";

export const bucket: Charge = {
  name: "bucket",
  pluralName: "buckets",
  SVG: bucketSVG,
  chargeType: "regular",
  tincture: Tinctures.byName("sable"),
  tags: ["bucket", "objects"],
};
