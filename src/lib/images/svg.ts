import { convert } from "xmlbuilder2";

export function renderSVGAsPNG(
  svg: string,
  width: number,
  height: number,
  outputId: string,
) {
  if (typeof document === "undefined") {
    return;
  }

  let output = document.getElementById(outputId);

  // This is a hack to get around the fact that the first time this runs, the output element is null
  if (output === null) {
    setTimeout(() => {
      renderSVGAsPNG(svg, width, height, outputId);
    }, 50);
    return;
  }

  if (!(output instanceof HTMLImageElement)) {
    throw new Error(
      `element with id "${outputId}" is not an HTMLImageElement`,
    );
  }

  let blob = new Blob([svg], { type: "image/svg+xml" });
  let blobURL = window.URL.createObjectURL(blob);

  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext("2d");

  if (ctx === null) {
    throw new Error("failed to get canvas 2D context");
  }

  let outputImage = new Image();

  outputImage.onload = function () {
    ctx.drawImage(outputImage, 0, 0);
    let pngDataUrl = canvas.toDataURL("image/png");
    output.src = pngDataUrl;
  };

  outputImage.src = blobURL;
}

export function convertXmlToSVGObject(xml: string): SVGElement {
  const xmlObject = convert(xml, { format: "object" }) as any;

  if (!Object.hasOwn(xmlObject, "svg")) {
    throw new Error(`invalid charge SVG: missing <svg> root element: (${xml})`);
  }

  return xmlObject;
}
