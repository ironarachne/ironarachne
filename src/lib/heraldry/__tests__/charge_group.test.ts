import { describe, it, expect } from "vitest";
import {
  renderChargeGroupBlazon,
  renderChargeGroupSVG,
  type ChargeGroup,
} from "../charge_group";

describe("renderChargeGroupBlazon", () => {
  it("renders a blazon for a charge group", () => {
    const group: ChargeGroup = {
      charge: {
        name: "lion",
        pluralName: "lions",
        chargeType: "regular",
        tincture: {
          name: "or",
          hexColor: "#fff",
          pattern: "",
          type: "metal",
          category: "light",
          commonality: 1,
        },
        SVG: "<svg></svg>",
        tags: [],
      },
      numberOfCharges: 1,
      arrangement: {
        name: "default",
        numberOfCharges: 1,
        blazonPattern: "{article} {name}",
        renderSVG: (svg: string) => svg,
      },
    };
    const blazon = renderChargeGroupBlazon(group);
    expect(blazon).toContain("a lion or");
  });
});

describe("renderChargeGroupSVG", () => {
  it("renders SVG for a charge group", () => {
    const group: ChargeGroup = {
      charge: {
        name: "lion",
        pluralName: "lions",
        chargeType: "regular",
        tincture: {
          name: "or",
          hexColor: "#fff",
          pattern: "",
          type: "metal",
          category: "light",
          commonality: 1,
        },
        SVG: '<svg id="lion"></svg>',
        tags: [],
      },
      numberOfCharges: 1,
      arrangement: {
        name: "default",
        numberOfCharges: 1,
        blazonPattern: "{article} {name}",
        renderSVG: (svg: string, w: number, h: number) => `<g>${svg}</g>`,
      },
    };
    const svg = renderChargeGroupSVG(group, 100, 100);
    expect(svg).toContain("<g>");
    expect(svg).toContain("lion");
  });
});
