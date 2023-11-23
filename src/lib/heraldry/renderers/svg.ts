import * as RND from "@ironarachne/rng";
import type Device from "../device.js";

export default class HeraldrySVGRenderer {
  render(device: Device, width: number, height: number): string {
    const shieldWidth = 600;
    const shieldHeight = 660;

    const uid = RND.randomString(4);

    const shieldSVG =
      `<path fill="url(#Division${uid})" stroke="#000000" stroke-width="3" d="M3,3 V260.637C3,369.135,46.339,452.459,99.763,514 C186.238,614.13,300,657,300,657 C300,657,413.762,614.13,500.237,514 C553.661,452.459,597,369.135,597,260.637V3Z"/>`;

    const svgHeader =
      `<svg width="${width}" height="${height}" viewBox="0 0 ${shieldWidth} ${shieldHeight}" xmlns="http://www.w3.org/2000/svg" version="1.1">`;
    let defsSVG = "";

    defsSVG += device.field.pattern
      .replaceAll("variation", `variation${uid}`)
      .replaceAll("Division", `Division${uid}`);

    for (let i = 0; i < device.field.variations.length; i++) {
      for (let j = 0; j < device.field.variations[i].tinctures.length; j++) {
        defsSVG += device.field.variations[i].tinctures[j].pattern;
      }
      let pattern = device.field.variations[i].renderSVGPattern();
      pattern = pattern.replaceAll("variation", `variation${uid}` + (i + 1));
      defsSVG += pattern;
    }

    let chargeGroupsSVG = "";

    for (let i = 0; i < device.chargeGroups.length; i++) {
      chargeGroupsSVG += device.chargeGroups[i].renderSVG(shieldWidth, shieldHeight); // TODO: handle different centerPosition and arrangement
    }

    let svg = svgHeader;

    svg += `<defs>${defsSVG}</defs>`;
    svg += shieldSVG;
    svg += chargeGroupsSVG;
    svg += "</svg>";

    return svg.replace(/<\?xml.*\?>/g, "");
  }
}
